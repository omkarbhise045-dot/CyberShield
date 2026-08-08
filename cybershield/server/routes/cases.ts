import { Router, Request, Response } from 'express';
import { db } from '../db/store.js';
import { authenticateToken } from './auth.js';
import { calculateCaseRiskScore } from '../services/riskEngine.js';
import { RiskTrendDataPoint, TimelineItem, RiskScore } from '../../src/types.js';

const router = Router();

// GET /api/cases
router.get('/', authenticateToken, (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const userCases = db.getCasesForUser(userId);

  // Recalculate risk scores dynamically
  const enrichedCases = userCases.map(c => {
    const risk = calculateCaseRiskScore(c.id);
    const evidence = db.getEvidenceForCase(c.id);
    return {
      ...c,
      risk_score: risk,
      evidence_count: evidence.length,
      last_updated: evidence.length > 0 ? evidence[evidence.length - 1].uploaded_at : c.created_at
    };
  });

  res.json({ cases: enrichedCases });
});

// POST /api/cases
router.post('/', authenticateToken, (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { title, description, suspect_handle, target_platform } = req.body;

  if (!title) {
    res.status(400).json({ error: 'Case title is required' });
    return;
  }

  const newCase = db.createCase(userId, title, description, suspect_handle, target_platform);
  res.status(201).json({ case: newCase });
});

// GET /api/cases/:id
router.get('/:id', authenticateToken, (req: Request, res: Response) => {
  const caseId = req.params.id;
  const c = db.getCaseById(caseId);

  if (!c) {
    res.status(404).json({ error: 'Case not found' });
    return;
  }

  const riskScore = calculateCaseRiskScore(caseId);
  const evidence = db.getEvidenceForCase(caseId);
  const analyses = db.getAnalysesForCase(caseId);
  const reports = db.getReportsForCase(caseId);

  res.json({
    case: {
      ...c,
      risk_score: riskScore
    },
    evidence,
    analyses,
    reports
  });
});

// GET /api/cases/:id/timeline
router.get('/:id/timeline', authenticateToken, (req: Request, res: Response) => {
  const caseId = req.params.id;
  const c = db.getCaseById(caseId);

  if (!c) {
    res.status(404).json({ error: 'Case not found' });
    return;
  }

  const evidenceList = db.getEvidenceForCase(caseId);
  const analysesList = db.getAnalysesForCase(caseId);

  // Build timeline items
  const timeline: TimelineItem[] = evidenceList.map((e) => {
    const analysis = analysesList.find(a => a.evidence_id === e.id);
    let riskLevel: RiskScore = 'Low';
    let summary = e.content_preview || `Evidence item uploaded (${e.type})`;

    if (analysis) {
      if (analysis.type === 'threat') {
        const res = analysis.result as any;
        riskLevel = res.risk_score || 'Medium';
        summary = `[Threat Detected] ${res.explanation || summary}`;
      } else if (analysis.type === 'deepfake') {
        const res = analysis.result as any;
        riskLevel = res.manipulation_likelihood > 80 ? 'Critical' : 'High';
        summary = `[Deepfake Media Flagged] ${res.manipulation_likelihood}% manipulation score. ${res.explanation}`;
      } else if (analysis.type === 'fake_profile') {
        const res = analysis.result as any;
        riskLevel = res.impersonation_likelihood > 80 ? 'High' : 'Medium';
        summary = `[Fake Profile Detected] ${res.impersonation_likelihood}% impersonation likelihood.`;
      }
    }

    return {
      id: e.id,
      timestamp: e.uploaded_at,
      sender_handle: e.sender_handle || c.suspect_handle || 'Unknown',
      source_platform: e.source_platform || 'Instagram',
      type: e.type,
      risk_level: riskLevel,
      summary,
      hash: e.hash
    };
  });

  // Sort timeline chronologically
  timeline.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  // Generate Risk Trend chart data points for Recharts
  const riskTrend: RiskTrendDataPoint[] = [];
  let cummulativeIncidents = 0;

  if (timeline.length === 0) {
    riskTrend.push({
      date: new Date().toISOString().split('T')[0],
      riskValue: 1,
      riskLevel: 'Low',
      incidentCount: 0
    });
  } else {
    timeline.forEach((item, index) => {
      cummulativeIncidents++;
      const valMap: Record<RiskScore, number> = { Low: 1, Medium: 2, High: 3, Critical: 4 };
      riskTrend.push({
        date: item.timestamp.split('T')[0],
        riskValue: valMap[item.risk_level] || 2,
        riskLevel: item.risk_level,
        incidentCount: cummulativeIncidents
      });
    });
  }

  res.json({
    case_id: caseId,
    timeline,
    risk_trend: riskTrend,
    total_incidents: timeline.length,
    current_risk_level: c.risk_score
  });
});

export default router;
