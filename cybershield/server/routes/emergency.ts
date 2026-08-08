import { Router, Request, Response } from 'express';
import { db } from '../db/store.js';
import { authenticateToken } from './auth.js';

const router = Router();

// POST /api/emergency/notify
router.post('/notify', authenticateToken, (req: Request, res: Response) => {
  const { case_id, custom_message } = req.body;
  const userId = (req as any).user.id;
  const user = db.getUserById(userId) || db.getUserByEmail((req as any).user.email);

  if (!user) {
    res.status(404).json({ error: 'User account not found' });
    return;
  }

  const contacts = user.trusted_contacts || [];
  const caseObj = case_id ? db.getCaseById(case_id) : null;

  // Generate mock dispatch notifications
  const dispatchedLogs = contacts.map(c => ({
    contact_id: c.id,
    name: c.name,
    phone: c.phone,
    email: c.email,
    status: 'DELIVERED',
    channel: 'SMS_AND_EMAIL_ALERT',
    timestamp: new Date().toISOString(),
    preview_body: custom_message || `[CYBERSHIELD EMERGENCY ALERT] User ${user.email} has triggered an emergency escalation for Case #${caseObj ? caseObj.id : 'URGENT'}: "${caseObj ? caseObj.title : 'Active Threats Detected'}". Please check in immediately.`
  }));

  res.json({
    success: true,
    message: `Emergency notification dispatched to ${contacts.length} trusted contact(s).`,
    dispatched_logs: dispatchedLogs,
    immediate_resources: [
      {
        name: 'National Cyber Crime Helpline (India)',
        contact: '1930',
        url: 'https://cybercrime.gov.in',
        description: 'Immediate cyber fraud, harassment, and non-consensual media portal.'
      },
      {
        name: 'StopNCII.org (Image Hash Protection)',
        url: 'https://stopncii.org',
        description: 'Prevent non-consensual intimate image dissemination across Facebook, Instagram, TikTok, and Reddit.'
      },
      {
        name: 'Cyber Civil Rights Initiative Helpline',
        contact: '+1-844-878-2274',
        url: 'https://cybercivilrights.org',
        description: '24/7 support for victims of non-consensual sexual content and online abuse.'
      }
    ]
  });
});

export default router;
