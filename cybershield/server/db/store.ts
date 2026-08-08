import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  User,
  Case,
  Evidence,
  Analysis,
  CaseReport,
  RiskScore,
  ThreatAnalysisResult,
  FakeProfileAnalysisResult,
  DeepfakeAnalysisResult
} from '../../src/types.js';

interface DatabaseData {
  users: User[];
  cases: Case[];
  evidence: Evidence[];
  analyses: Analysis[];
  reports: CaseReport[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Helper to hash passwords
export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + 'cybershield_salt').digest('hex');
}

// Generate SHA-256 hash for file or buffer
export function generateFileHash(content: Buffer | string): string {
  return crypto.createHash('sha256').update(content).digest('hex');
}

// Initial Seed Data
const defaultSeedData: DatabaseData = {
  users: [
    {
      id: 'usr_demo_1',
      email: 'demo@cybershield.org',
      password_hash: hashPassword('password123'),
      trusted_contacts: [
        {
          id: 'contact_1',
          name: 'Sarah Jenkins (Sister)',
          phone: '+1 (555) 234-5678',
          email: 'sarah.j@example.com',
          relationship: 'Family / Primary Contact'
        },
        {
          id: 'contact_2',
          name: 'Dr. Elena Rostova (Counselor)',
          phone: '+1 (555) 987-6543',
          email: 'elena.counseling@example.org',
          relationship: 'Support Counselor'
        }
      ],
      created_at: new Date(Date.now() - 7 * 86400000).toISOString()
    }
  ],
  cases: [
    {
      id: 'case_101',
      user_id: 'usr_demo_1',
      title: 'Persistent Instagram Stalking & Unsolicited Threats',
      status: 'Active',
      risk_score: 'Critical',
      suspect_handle: '@mark_x900',
      target_platform: 'Instagram',
      description: 'Extortion threats, fake account creation, and harassment DMs from handle @mark_x900 across Instagram and WhatsApp.',
      created_at: new Date(Date.now() - 5 * 86400000).toISOString()
    },
    {
      id: 'case_102',
      user_id: 'usr_demo_1',
      title: 'Twitter Impersonation & Defamatory Fake Profile',
      status: 'Investigating',
      risk_score: 'High',
      suspect_handle: '@cyber_shadow_99',
      target_platform: 'X / Twitter',
      description: 'A duplicate profile using my real photos and name is posting explicit defamatory statements and attempting to message my colleagues.',
      created_at: new Date(Date.now() - 3 * 86400000).toISOString()
    },
    {
      id: 'case_103',
      user_id: 'usr_demo_1',
      title: 'Discord Spam & Non-Consensual Media Warning',
      status: 'Active',
      risk_score: 'Medium',
      suspect_handle: '@dark_knight_77',
      target_platform: 'Discord',
      description: 'Unsolicited explicit image attachments sent via direct message on Discord.',
      created_at: new Date(Date.now() - 1 * 86400000).toISOString()
    }
  ],
  evidence: [
    {
      id: 'evi_1',
      case_id: 'case_101',
      type: 'screenshot',
      file_path: '/uploads/screenshot_extortion_msg.png',
      source_platform: 'Instagram Direct',
      sender_handle: '@mark_x900',
      hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      content_preview: 'Direct message threat: "I have edited your pictures. Pay 500 or I publish them to all your followers tonight."',
      uploaded_at: new Date(Date.now() - 4 * 86400000).toISOString()
    },
    {
      id: 'evi_2',
      case_id: 'case_101',
      type: 'screenshot',
      file_path: '/uploads/deepfake_face_manipulation.png',
      source_platform: 'Instagram Story',
      sender_handle: '@mark_x900',
      hash: '7d1a29348e3a2b1c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c',
      content_preview: 'Manipulated portrait screenshot uploaded to stories with non-consensual face swap tags.',
      uploaded_at: new Date(Date.now() - 2 * 86400000).toISOString()
    },
    {
      id: 'evi_3',
      case_id: 'case_102',
      type: 'url',
      file_path: 'https://twitter.com/cyber_shadow_99',
      source_platform: 'X / Twitter',
      sender_handle: '@cyber_shadow_99',
      hash: '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
      content_preview: 'Suspected fake account mirroring bio, name, and profile avatar with explicit defamatory bio additions.',
      uploaded_at: new Date(Date.now() - 3 * 86400000).toISOString()
    }
  ],
  analyses: [
    {
      id: 'ana_1',
      evidence_id: 'evi_1',
      type: 'threat',
      confidence: 0.96,
      result: {
        category: 'threat',
        confidence: 0.96,
        risk_score: 'Critical',
        toxic_phrases: ['Pay 500', 'publish them', 'all your followers tonight', 'I have edited your pictures'],
        explanation: 'Explicit extortion threat accompanied by intimidation and non-consensual image release coercion.',
        recommended_actions: [
          'Immediate evidence preservation (do not delete chat history)',
          'Trigger CyberShield Emergency Alert to trusted contacts',
          'File report on National Cyber Crime Reporting Portal (1930 / cybercrime.gov.in)',
          'Block sender and preserve original file timestamps'
        ]
      } as ThreatAnalysisResult,
      created_at: new Date(Date.now() - 4 * 86400000).toISOString()
    },
    {
      id: 'ana_2',
      evidence_id: 'evi_2',
      type: 'deepfake',
      confidence: 0.91,
      result: {
        manipulation_likelihood: 91,
        confidence_range: '87% - 95%',
        artifact_frequency_score: 88,
        facial_inconsistency_score: 93,
        flagged_regions: [
          { box: [15, 25, 45, 75], label: 'Facial Boundary Warping', score: 0.94 },
          { box: [50, 30, 70, 70], label: 'Lighting Mismatch & Edge Artifacts', score: 0.89 }
        ],
        explanation: 'High probability of neural face swap manipulation detected. Significant boundary blending artifacts around chin and hairline; frequency spectra inconsistency noted.'
      } as DeepfakeAnalysisResult,
      created_at: new Date(Date.now() - 2 * 86400000).toISOString()
    },
    {
      id: 'ana_3',
      evidence_id: 'evi_3',
      type: 'fake_profile',
      confidence: 0.89,
      result: {
        similarity_score: 89,
        name_match: 95,
        bio_match: 82,
        username_match: 88,
        photo_match: 92,
        impersonation_likelihood: 89,
        indicators: [
          'High visual match with user official avatar',
          'Exact name collision with targeted victim',
          'Added malicious defamation tags to profile description'
        ],
        explanation: 'Strong evidence of deliberate profile cloning and target impersonation intended to mislead contacts.'
      } as FakeProfileAnalysisResult,
      created_at: new Date(Date.now() - 3 * 86400000).toISOString()
    }
  ],
  reports: []
};

class Store {
  private data: DatabaseData;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseData {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      } catch (err) {
        console.error('Failed to parse database file, re-initializing with seed:', err);
      }
    }
    this.save(defaultSeedData);
    return defaultSeedData;
  }

  private save(data?: DatabaseData): void {
    if (data) this.data = data;
    fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
  }

  // User Operations
  getUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  getUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  createUser(email: string, passwordHash: string): User {
    const user: User = {
      id: `usr_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      email,
      password_hash: passwordHash,
      trusted_contacts: [],
      created_at: new Date().toISOString()
    };
    this.data.users.push(user);
    this.save();
    return user;
  }

  updateUserContacts(userId: string, contacts: any[]): User | undefined {
    const user = this.getUserById(userId);
    if (user) {
      user.trusted_contacts = contacts;
      this.save();
    }
    return user;
  }

  // Case Operations
  getCasesForUser(userId: string): Case[] {
    return this.data.cases.filter(c => c.user_id === userId);
  }

  getCaseById(caseId: string): Case | undefined {
    return this.data.cases.find(c => c.id === caseId);
  }

  createCase(userId: string, title: string, description?: string, suspectHandle?: string, targetPlatform?: string): Case {
    const newCase: Case = {
      id: `case_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      user_id: userId,
      title,
      status: 'Active',
      risk_score: 'Low',
      description: description || '',
      suspect_handle: suspectHandle || '',
      target_platform: targetPlatform || 'General',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.data.cases.unshift(newCase);
    this.save();
    return newCase;
  }

  updateCaseRiskScore(caseId: string, riskScore: RiskScore): Case | undefined {
    const c = this.getCaseById(caseId);
    if (c) {
      c.risk_score = riskScore;
      if (riskScore === 'Critical' && c.status === 'Active') {
        c.status = 'Escalated';
      }
      c.updated_at = new Date().toISOString();
      this.save();
    }
    return c;
  }

  // Evidence Operations
  getEvidenceForCase(caseId: string): Evidence[] {
    return this.data.evidence.filter(e => e.case_id === caseId);
  }

  addEvidence(evidence: Omit<Evidence, 'id' | 'uploaded_at'>): Evidence {
    const item: Evidence = {
      ...evidence,
      id: `evi_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      uploaded_at: new Date().toISOString()
    };
    this.data.evidence.push(item);
    this.save();
    return item;
  }

  // Analysis Operations
  getAnalysesForEvidence(evidenceId: string): Analysis[] {
    return this.data.analyses.filter(a => a.evidence_id === evidenceId);
  }

  getAnalysesForCase(caseId: string): Analysis[] {
    const caseEvidenceIds = new Set(this.getEvidenceForCase(caseId).map(e => e.id));
    return this.data.analyses.filter(a => caseEvidenceIds.has(a.evidence_id));
  }

  addAnalysis(evidenceId: string, type: 'threat' | 'fake_profile' | 'deepfake', result: any, confidence: number): Analysis {
    const item: Analysis = {
      id: `ana_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      evidence_id: evidenceId,
      type,
      result,
      confidence,
      created_at: new Date().toISOString()
    };
    this.data.analyses.push(item);
    this.save();
    return item;
  }

  // Reports
  getReportsForCase(caseId: string): CaseReport[] {
    return this.data.reports.filter(r => r.case_id === caseId);
  }

  addReport(caseId: string, filePath: string): CaseReport {
    const report: CaseReport = {
      id: `rep_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      case_id: caseId,
      file_path: filePath,
      generated_at: new Date().toISOString()
    };
    this.data.reports.push(report);
    this.save();
    return report;
  }
}

export const db = new Store();
