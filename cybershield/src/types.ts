export type RiskScore = 'Low' | 'Medium' | 'High' | 'Critical';
export type CaseStatus = 'Active' | 'Investigating' | 'Closed' | 'Escalated';
export type EvidenceType = 'screenshot' | 'video' | 'url' | 'message';
export type AnalysisType = 'threat' | 'fake_profile' | 'deepfake';

export interface TrustedContact {
  id: string;
  name: string;
  phone: string;
  email: string;
  relationship: string;
}

export interface User {
  id: string;
  email: string;
  password_hash?: string;
  trusted_contacts: TrustedContact[];
  created_at: string;
}

export interface Case {
  id: string;
  user_id: string;
  title: string;
  status: CaseStatus;
  risk_score: RiskScore;
  created_at: string;
  updated_at?: string;
  description?: string;
  suspect_handle?: string;
  target_platform?: string;
}

export interface Evidence {
  id: string;
  case_id: string;
  type: EvidenceType;
  file_path: string;
  source_platform: string;
  sender_handle: string;
  hash: string;
  uploaded_at: string;
  content_preview?: string;
  file_size?: number;
  mime_type?: string;
}

export interface FlaggedRegion {
  box: [number, number, number, number]; // ymin, xmin, ymax, xmax (0-100 percentage)
  label: string;
  score: number;
}

export interface ThreatAnalysisResult {
  category: 'harassment' | 'threat' | 'sexual' | 'stalking' | 'neutral';
  confidence: number;
  risk_score: RiskScore;
  toxic_phrases: string[];
  explanation: string;
  recommended_actions: string[];
}

export interface FakeProfileAnalysisResult {
  similarity_score: number;
  name_match: number;
  bio_match: number;
  username_match: number;
  photo_match: number;
  impersonation_likelihood: number;
  indicators: string[];
  explanation: string;
}

export interface DeepfakeAnalysisResult {
  manipulation_likelihood: number; // 0-100
  confidence_range: string; // e.g. "84% - 92%"
  artifact_frequency_score: number;
  facial_inconsistency_score: number;
  flagged_regions: FlaggedRegion[];
  explanation: string;
}

export interface Analysis {
  id: string;
  evidence_id: string;
  type: AnalysisType;
  result: ThreatAnalysisResult | FakeProfileAnalysisResult | DeepfakeAnalysisResult;
  confidence: number;
  created_at: string;
}

export interface CaseReport {
  id: string;
  case_id: string;
  file_path: string;
  generated_at: string;
}

export interface TimelineItem {
  id: string;
  timestamp: string;
  sender_handle: string;
  source_platform: string;
  type: EvidenceType;
  risk_level: RiskScore;
  summary: string;
  hash: string;
}

export interface RiskTrendDataPoint {
  date: string;
  riskValue: number; // 1: Low, 2: Medium, 3: High, 4: Critical
  riskLevel: RiskScore;
  incidentCount: number;
}
