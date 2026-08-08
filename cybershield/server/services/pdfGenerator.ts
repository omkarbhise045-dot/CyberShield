import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { db } from '../db/store.js';

const REPORTS_DIR = path.join(process.cwd(), 'uploads', 'reports');
if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

export async function generatePDFReport(caseId: string): Promise<string> {
  const c = db.getCaseById(caseId);
  if (!c) throw new Error('Case not found');

  const user = db.getUserById(c.user_id);
  const evidence = db.getEvidenceForCase(caseId);
  const analyses = db.getAnalysesForCase(caseId);

  const reportId = `CYBERSHIELD-REPORT-${caseId}-${Date.now().toString().slice(-6)}`;
  const fileName = `report_${caseId}_${Date.now()}.pdf`;
  const filePath = path.join(REPORTS_DIR, fileName);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    const writeStream = fs.createWriteStream(filePath);

    doc.pipe(writeStream);

    // Header Branding
    doc
      .rect(0, 0, doc.page.width, 80)
      .fill('#0f172a'); // Dark Slate

    doc
      .fillColor('#38bdf8')
      .fontSize(22)
      .font('Helvetica-Bold')
      .text('CYBERSHIELD', 40, 22);

    doc
      .fillColor('#94a3b8')
      .fontSize(10)
      .font('Helvetica')
      .text('AI Incident Documentation & Law Enforcement Dossier', 40, 48);

    doc
      .fillColor('#ffffff')
      .fontSize(9)
      .font('Helvetica-Bold')
      .text(`DOSSIER ID: ${reportId}`, 360, 25, { align: 'right' })
      .text(`DATE GENERATED: ${new Date().toISOString().split('T')[0]}`, 360, 40, { align: 'right' });

    doc.moveDown(3);

    // Advisory Disclaimer Banner
    doc
      .rect(40, 95, doc.page.width - 80, 40)
      .fillAndStroke('#fff7ed', '#fdba74');

    doc
      .fillColor('#9a3412')
      .fontSize(9)
      .font('Helvetica-Bold')
      .text('ADVISORY NOTICE & CHAIN OF CUSTODY DISCLAIMER', 50, 102);

    doc
      .fillColor('#c2410c')
      .fontSize(8)
      .font('Helvetica')
      .text(
        'CyberShield AI analysis provides automated advisory threat scoring, cryptographic hashing, and evidence compilation. It does not constitute legal or forensic proof. Presented for investigation triage and evidence documentation.',
        50,
        114,
        { width: doc.page.width - 100 }
      );

    // Incident Overview Box
    let y = 150;
    doc
      .fillColor('#1e293b')
      .fontSize(14)
      .font('Helvetica-Bold')
      .text('1. Incident Overview', 40, y);

    y += 20;
    doc
      .rect(40, y, doc.page.width - 80, 85)
      .fillAndStroke('#f8fafc', '#e2e8f0');

    doc
      .fillColor('#334155')
      .fontSize(9)
      .font('Helvetica-Bold')
      .text(`Case Title: `, 50, y + 10)
      .font('Helvetica')
      .text(c.title, 120, y + 10);

    doc
      .font('Helvetica-Bold')
      .text(`Case ID: `, 50, y + 25)
      .font('Helvetica')
      .text(c.id, 120, y + 25);

    doc
      .font('Helvetica-Bold')
      .text(`Platform: `, 280, y + 25)
      .font('Helvetica')
      .text(c.target_platform || 'Instagram / Web', 340, y + 25);

    doc
      .font('Helvetica-Bold')
      .text(`Suspect Handle: `, 50, y + 40)
      .font('Helvetica')
      .text(c.suspect_handle || 'Unknown', 140, y + 40);

    doc
      .font('Helvetica-Bold')
      .text(`Assessed Risk Tier: `, 280, y + 40);

    const riskColor = c.risk_score === 'Critical' ? '#dc2626' : c.risk_score === 'High' ? '#ea580c' : '#0284c7';
    doc
      .fillColor(riskColor)
      .font('Helvetica-Bold')
      .text(c.risk_score.toUpperCase(), 380, y + 40);

    doc
      .fillColor('#334155')
      .font('Helvetica-Bold')
      .text(`Victim Account ID: `, 50, y + 55)
      .font('Helvetica')
      .text(user?.email || 'Registered CyberShield User', 150, y + 55);

    // Section 2: AI Threat & Forensic Analysis Summary
    y += 105;
    doc
      .fillColor('#1e293b')
      .fontSize(14)
      .font('Helvetica-Bold')
      .text('2. AI Threat & Media Forensic Findings', 40, y);

    y += 20;

    if (analyses.length === 0) {
      doc
        .fontSize(9)
        .font('Helvetica-Oblique')
        .fillColor('#64748b')
        .text('No AI analysis modules executed for this case yet.', 50, y);
      y += 20;
    } else {
      analyses.forEach((a, idx) => {
        doc
          .rect(40, y, doc.page.width - 80, 50)
          .fillAndStroke('#f1f5f9', '#cbd5e1');

        doc
          .fillColor('#0f172a')
          .fontSize(10)
          .font('Helvetica-Bold')
          .text(`[${a.type.toUpperCase()} ANALYSIS] Confidence: ${Math.round(a.confidence * 100)}%`, 50, y + 8);

        const res = a.result as any;
        const explanation = res.explanation || 'Analysis details stored.';

        doc
          .fillColor('#334155')
          .fontSize(8)
          .font('Helvetica')
          .text(explanation, 50, y + 22, { width: doc.page.width - 100, height: 24 });

        y += 58;
      });
    }

    // Section 3: Cryptographic Evidence Log (Chain of Custody)
    y += 10;
    doc
      .fillColor('#1e293b')
      .fontSize(14)
      .font('Helvetica-Bold')
      .text('3. Evidence Log & Cryptographic Hashes (SHA-256)', 40, y);

    y += 20;

    // Table Header
    doc
      .rect(40, y, doc.page.width - 80, 20)
      .fill('#334155');

    doc
      .fillColor('#ffffff')
      .fontSize(8)
      .font('Helvetica-Bold')
      .text('TYPE', 45, y + 6)
      .text('SOURCE', 110, y + 6)
      .text('TIMESTAMP', 190, y + 6)
      .text('SHA-256 INTEGRITY HASH', 300, y + 6);

    y += 20;

    evidence.forEach((item, index) => {
      const rowBg = index % 2 === 0 ? '#ffffff' : '#f8fafc';
      doc
        .rect(40, y, doc.page.width - 80, 22)
        .fillAndStroke(rowBg, '#e2e8f0');

      doc
        .fillColor('#0f172a')
        .fontSize(7)
        .font('Helvetica-Bold')
        .text(item.type.toUpperCase(), 45, y + 6)
        .font('Helvetica')
        .text(item.source_platform || 'Web', 110, y + 6)
        .text(item.uploaded_at.split('T')[0], 190, y + 6)
        .font('Courier')
        .text(item.hash.slice(0, 32) + '...', 300, y + 6);

      y += 22;
    });

    // Section 4: Reporting Authority Resources
    y += 25;
    doc
      .fillColor('#1e293b')
      .fontSize(14)
      .font('Helvetica-Bold')
      .text('4. Authority Reporting Resources', 40, y);

    y += 20;
    doc
      .fontSize(8)
      .font('Helvetica')
      .fillColor('#475569')
      .text('• National Cyber Crime Reporting Portal (India): https://cybercrime.gov.in | Helpline: 1930', 50, y)
      .text('• StopNCII.org (Non-Consensual Intimate Image Hash Blocking): https://stopncii.org', 50, y + 14)
      .text('• FBI Internet Crime Complaint Center (IC3): https://ic3.gov', 50, y + 28);

    // Footer
    doc
      .fontSize(8)
      .fillColor('#94a3b8')
      .text('Generated automatically by CyberShield Engine. Page 1 of 1', 40, doc.page.height - 30, {
        align: 'center'
      });

    doc.end();

    writeStream.on('finish', () => {
      // Save record in db
      db.addReport(caseId, `/uploads/reports/${fileName}`);
      resolve(`/uploads/reports/${fileName}`);
    });

    writeStream.on('error', (err) => {
      reject(err);
    });
  });
}
