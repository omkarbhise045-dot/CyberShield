import { Router, Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { generatePDFReport } from '../services/pdfGenerator.js';
import { db } from '../db/store.js';
import { authenticateToken } from './auth.js';

const router = Router();

// POST /api/cases/:id/report
router.post('/case/:id/report', authenticateToken, async (req: Request, res: Response) => {
  try {
    const caseId = req.params.id;
    const caseObj = db.getCaseById(caseId);

    if (!caseObj) {
      res.status(404).json({ error: 'Case not found' });
      return;
    }

    const reportPath = await generatePDFReport(caseId);
    const reports = db.getReportsForCase(caseId);
    const latestReport = reports[reports.length - 1];

    res.json({
      success: true,
      report: latestReport,
      download_url: `/api/reports/${latestReport.id}/download`,
      disclaimer: 'Official CyberShield dossier compiled. Please submit this document to your local cybercrime law enforcement office (e.g., cybercrime.gov.in / 1930 / FBI IC3).'
    });
  } catch (err: any) {
    console.error('PDF Report Generation Error:', err);
    res.status(500).json({ error: err.message || 'Report generation failed' });
  }
});

// GET /api/reports/:id/download
router.get('/:id/download', (req: Request, res: Response) => {
  const reportId = req.params.id;

  // Find report in db or search file
  let reportPath = '';
  for (const c of db['data'].cases) {
    const reps = db.getReportsForCase(c.id);
    const found = reps.find(r => r.id === reportId);
    if (found) {
      reportPath = path.join(process.cwd(), found.file_path);
      break;
    }
  }

  if (!reportPath || !fs.existsSync(reportPath)) {
    // Check fallback latest report file in uploads/reports
    const reportsDir = path.join(process.cwd(), 'uploads', 'reports');
    if (fs.existsSync(reportsDir)) {
      const files = fs.readdirSync(reportsDir);
      if (files.length > 0) {
        reportPath = path.join(reportsDir, files[files.length - 1]);
      }
    }
  }

  if (reportPath && fs.existsSync(reportPath)) {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="CyberShield_Law_Enforcement_Dossier.pdf"`);
    fs.createReadStream(reportPath).pipe(res);
  } else {
    res.status(404).json({ error: 'Report PDF file not found' });
  }
});

export default router;
