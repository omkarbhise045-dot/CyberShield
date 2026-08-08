import { Router, Request, Response } from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { db, generateFileHash } from '../db/store.js';
import { authenticateToken } from './auth.js';
import { calculateCaseRiskScore } from '../services/riskEngine.js';

const router = Router();
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}_${file.originalname}`);
  }
});

const upload = multer({ storage });

// POST /api/evidence
router.post('/', authenticateToken, upload.single('file'), (req: Request, res: Response) => {
  try {
    const { case_id, type, source_platform, sender_handle, content_preview, url } = req.body;
    const file = req.file;

    if (!case_id) {
      res.status(400).json({ error: 'case_id is required' });
      return;
    }

    const caseObj = db.getCaseById(case_id);
    if (!caseObj) {
      res.status(404).json({ error: 'Case not found' });
      return;
    }

    let filePath = url || '';
    let hash = '';

    if (file) {
      filePath = `/uploads/${file.filename}`;
      const fileBuffer = fs.readFileSync(file.path);
      hash = generateFileHash(fileBuffer);
    } else if (url || content_preview) {
      hash = generateFileHash(url || content_preview || `${Date.now()}`);
    } else {
      hash = generateFileHash(`${Date.now()}`);
    }

    const evidenceType = (type || (file ? (file.mimetype.startsWith('video') ? 'video' : 'screenshot') : 'message')) as any;

    const evidence = db.addEvidence({
      case_id,
      type: evidenceType,
      file_path: filePath,
      source_platform: source_platform || 'Instagram',
      sender_handle: sender_handle || caseObj.suspect_handle || '@unknown',
      hash,
      content_preview: content_preview || (file ? `Uploaded file: ${file.originalname}` : url)
    });

    // Update Case Risk
    const updatedRisk = calculateCaseRiskScore(case_id);

    res.status(201).json({
      evidence,
      updated_risk_score: updatedRisk
    });
  } catch (err: any) {
    console.error('Evidence Upload Error:', err);
    res.status(500).json({ error: err.message || 'Failed to record evidence' });
  }
});

// GET /api/cases/:id/evidence
router.get('/case/:id', authenticateToken, (req: Request, res: Response) => {
  const caseId = req.params.id;
  const evidence = db.getEvidenceForCase(caseId);
  res.json({ evidence });
});

export default router;
