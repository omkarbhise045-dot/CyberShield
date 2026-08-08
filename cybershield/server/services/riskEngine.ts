import { db } from '../db/store.js';
import { RiskScore } from '../../src/types.js';

export function calculateCaseRiskScore(caseId: string): RiskScore {
  const c = db.getCaseById(caseId);
  if (!c) return 'Low';

  const evidence = db.getEvidenceForCase(caseId);
  const analyses = db.getAnalysesForCase(caseId);

  let maxThreatScore = 0;
  let criticalThreatFound = false;
  let totalPoints = 0;

  // 1. Check Threat Analyses
  for (const a of analyses) {
    if (a.type === 'threat') {
      const result = a.result as any;
      if (result.risk_score === 'Critical') {
        criticalThreatFound = true;
        totalPoints += 50;
      } else if (result.risk_score === 'High') {
        totalPoints += 30;
      } else if (result.risk_score === 'Medium') {
        totalPoints += 15;
      }
    } else if (a.type === 'deepfake') {
      const result = a.result as any;
      if (result.manipulation_likelihood > 80) {
        totalPoints += 25;
      }
    } else if (a.type === 'fake_profile') {
      const result = a.result as any;
      if (result.impersonation_likelihood > 80) {
        totalPoints += 20;
      }
    }
  }

  // 2. Incident Escalation Frequency (Multiple evidence items over time)
  if (evidence.length >= 4) {
    totalPoints += 25; // Repeated stalking/harassment pattern
  } else if (evidence.length >= 2) {
    totalPoints += 15;
  }

  // Determine Final Risk Score
  let finalRisk: RiskScore = 'Low';
  if (criticalThreatFound || totalPoints >= 60) {
    finalRisk = 'Critical';
  } else if (totalPoints >= 35) {
    finalRisk = 'High';
  } else if (totalPoints >= 15) {
    finalRisk = 'Medium';
  }

  // Update in DB
  db.updateCaseRiskScore(caseId, finalRisk);

  return finalRisk;
}
