import { Router, Request, Response } from 'express';
import multer from 'multer';
import { analyzeThreat } from '../services/threatDetector.js';
import { analyzeFakeProfile } from '../services/fakeProfileDetector.js';
import { analyzeMediaDeepfake } from '../services/deepfakeDetector.js';
import { db, generateFileHash } from '../db/store.js';
import { calculateCaseRiskScore } from '../services/riskEngine.js';

const router = Router();
const upload = multer({ limits: { fileSize: 20 * 1024 * 1024 } }); // 20MB limit

// POST /api/analyze/text
router.post('/text', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const { text, case_id } = req.body;
    const file = req.file;

    const result = await analyzeThreat(
      text || '',
      file?.buffer,
      file?.mimetype
    );

    // If case_id provided, record analysis
    if (case_id) {
      // Create evidence entry
      const evidence = db.addEvidence({
        case_id,
        type: file ? 'screenshot' : 'message',
        file_path: file ? `/uploads/${file.originalname}` : '',
        source_platform: req.body.source_platform || 'Direct Message',
        sender_handle: req.body.sender_handle || 'Unknown',
        hash: file ? generateFileHash(file.buffer) : generateFileHash(text || ''),
        content_preview: text || (file ? `Screenshot analyze: ${file.originalname}` : '')
      });

      db.addAnalysis(evidence.id, 'threat', result, result.confidence);
      calculateCaseRiskScore(case_id);
    }

    res.json({
      success: true,
      result,
      advisory_disclaimer: 'Advisory Notice: CyberShield AI threat scoring is generated for documentation and triage assistance and does not constitute legal proof.'
    });
  } catch (err: any) {
    console.error('Threat Analysis Error:', err);
    res.status(500).json({ error: err.message || 'Threat analysis failed' });
  }
});

// POST /api/analyze/profile
router.post('/profile', upload.single('photo'), async (req: Request, res: Response) => {
  try {
    const { suspected_handle, suspected_bio, real_handle, real_bio, case_id } = req.body;
    const file = req.file;

    const result = await analyzeFakeProfile(
      suspected_handle || '',
      suspected_bio || '',
      real_handle,
      real_bio,
      file?.buffer
    );

    if (case_id) {
      const evidence = db.addEvidence({
        case_id,
        type: 'url',
        file_path: req.body.profile_url || `https://instagram.com/${suspected_handle}`,
        source_platform: req.body.source_platform || 'Instagram',
        sender_handle: suspected_handle || 'Unknown',
        hash: generateFileHash(`${suspected_handle}_${suspected_bio}`),
        content_preview: `Suspected Impersonation Account: @${suspected_handle}`
      });

      db.addAnalysis(evidence.id, 'fake_profile', result, result.impersonation_likelihood / 100);
      calculateCaseRiskScore(case_id);
    }

    res.json({
      success: true,
      result,
      advisory_disclaimer: 'Advisory Notice: Impersonation probability is advisory and indicates similarity metrics across bio, handle, and imagery.'
    });
  } catch (err: any) {
    console.error('Fake Profile Analysis Error:', err);
    res.status(500).json({ error: err.message || 'Fake profile analysis failed' });
  }
});

// POST /api/analyze/media
router.post('/media', upload.single('media'), async (req: Request, res: Response) => {
  try {
    const file = req.file;
    const { case_id, source_platform, sender_handle } = req.body;

    if (!file) {
      res.status(400).json({ error: 'Image or video media file is required' });
      return;
    }

    const result = await analyzeMediaDeepfake(
      file.buffer,
      file.originalname,
      file.mimetype
    );

    if (case_id) {
      const evidence = db.addEvidence({
        case_id,
        type: file.mimetype.startsWith('video') ? 'video' : 'screenshot',
        file_path: `/uploads/${file.originalname}`,
        source_platform: source_platform || 'Media Upload',
        sender_handle: sender_handle || 'Unknown',
        hash: generateFileHash(file.buffer),
        content_preview: `Media file ${file.originalname} analyzed for synthetic deepfake alteration.`
      });

      db.addAnalysis(evidence.id, 'deepfake', result, result.manipulation_likelihood / 100);
      calculateCaseRiskScore(case_id);
    }

    res.json({
      success: true,
      result,
      advisory_disclaimer: 'Advisory Notice: Deepfake manipulation analysis evaluates pixel edge frequency anomalies and facial landmarks. Results are advisory ranges.'
    });
  } catch (err: any) {
    console.error('Deepfake Analysis Error:', err);
    res.status(500).json({ error: err.message || 'Deepfake media analysis failed' });
  }
});

export default router;
