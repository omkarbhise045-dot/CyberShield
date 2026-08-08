import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Shield, FileText, Upload, AlertTriangle, ShieldAlert, FileCheck2, Download, ArrowLeft, Image as ImageIcon, UserCheck, Cpu, Hash, ExternalLink, CheckCircle2 } from 'lucide-react';
import { Case, Evidence, Analysis, RiskScore, TimelineItem, RiskTrendDataPoint, FlaggedRegion } from '../types.js';
import { RiskBadge } from '../components/RiskBadge.js';
import { BoundingBoxOverlay } from '../components/BoundingBoxOverlay.js';

interface Props {
  token: string;
}

export const CaseDetailPage: React.FC<Props> = ({ token }) => {
  const { id } = useParams<{ id: string }>();
  const [caseObj, setCaseObj] = useState<Case | null>(null);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [riskTrend, setRiskTrend] = useState<RiskTrendDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  // Active Tool Mode for Analyzer Widget
  const [activeTab, setActiveTab] = useState<'threat' | 'fake_profile' | 'deepfake'>('threat');

  // Threat Analyzer State
  const [threatText, setThreatText] = useState('');
  const [threatFile, setThreatFile] = useState<File | null>(null);
  const [threatResult, setThreatResult] = useState<any>(null);
  const [analyzingThreat, setAnalyzingThreat] = useState(false);

  // Fake Profile State
  const [suspectedHandle, setSuspectedHandle] = useState('');
  const [suspectedBio, setSuspectedBio] = useState('');
  const [realBio, setRealBio] = useState('');
  const [profileResult, setProfileResult] = useState<any>(null);
  const [analyzingProfile, setAnalyzingProfile] = useState(false);

  // Deepfake State
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState<string>('');
  const [deepfakeResult, setDeepfakeResult] = useState<any>(null);
  const [analyzingDeepfake, setAnalyzingDeepfake] = useState(false);

  // Report Generation State
  const [generatingReport, setGeneratingReport] = useState(false);
  const [reportDownloadUrl, setReportDownloadUrl] = useState<string>('');

  const fetchCaseDetails = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/cases/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setCaseObj(data.case);
        setEvidence(data.evidence || []);
        setAnalyses(data.analyses || []);
      }

      const timelineRes = await fetch(`/api/cases/${id}/timeline`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const timelineData = await timelineRes.json();
      if (timelineRes.ok) {
        setTimeline(timelineData.timeline || []);
        setRiskTrend(timelineData.risk_trend || []);
      }
    } catch (err) {
      console.error('Failed to load case detail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCaseDetails();
  }, [id, token]);

  // Handle Threat Text Analysis
  const handleRunThreatAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!threatText && !threatFile) return;
    setAnalyzingThreat(true);
    setThreatResult(null);

    const formData = new FormData();
    formData.append('text', threatText);
    formData.append('case_id', id || '');
    if (threatFile) formData.append('file', threatFile);

    try {
      const res = await fetch('/api/analyze/text', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setThreatResult(data.result);
        fetchCaseDetails();
      }
    } catch (err) {
      console.error('Threat analysis failed:', err);
    } finally {
      setAnalyzingThreat(false);
    }
  };

  // Handle Fake Profile Analysis
  const handleRunProfileAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suspectedHandle) return;
    setAnalyzingProfile(true);
    setProfileResult(null);

    const formData = new FormData();
    formData.append('suspected_handle', suspectedHandle);
    formData.append('suspected_bio', suspectedBio);
    formData.append('real_handle', 'victim_official');
    formData.append('real_bio', realBio);
    formData.append('case_id', id || '');

    try {
      const res = await fetch('/api/analyze/profile', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setProfileResult(data.result);
        fetchCaseDetails();
      }
    } catch (err) {
      console.error('Profile analysis failed:', err);
    } finally {
      setAnalyzingProfile(false);
    }
  };

  // Handle Deepfake Media Analysis
  const handleRunDeepfakeAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaFile) return;
    setAnalyzingDeepfake(true);
    setDeepfakeResult(null);

    const formData = new FormData();
    formData.append('media', mediaFile);
    formData.append('case_id', id || '');

    try {
      const res = await fetch('/api/analyze/media', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setDeepfakeResult(data.result);
        fetchCaseDetails();
      }
    } catch (err) {
      console.error('Deepfake analysis failed:', err);
    } finally {
      setAnalyzingDeepfake(false);
    }
  };

  // Generate Law Enforcement PDF Report
  const handleGenerateReport = async () => {
    if (!id) return;
    setGeneratingReport(true);
    try {
      const res = await fetch(`/api/cases/${id}/report`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setReportDownloadUrl(data.download_url);
        // Trigger direct download
        window.open(data.download_url, '_blank');
      }
    } catch (err) {
      console.error('PDF report generation error:', err);
    } finally {
      setGeneratingReport(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-500 text-sm">
        Retrieving encrypted case vault & evidence logs...
      </div>
    );
  }

  if (!caseObj) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <p className="text-slate-300">Case record not found.</p>

        <Link to="/dashboard" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back Button & Header */}
      <div className="space-y-4">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-indigo-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Incident Vault
        </Link>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-xl bg-[#16161a] border border-slate-800">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <RiskBadge score={caseObj.risk_score} size="lg" />
              <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded border border-indigo-500/30 font-semibold">
                {caseObj.target_platform || 'Instagram'}
              </span>
              <span className="text-xs font-mono text-slate-400">
                Suspect: <strong className="text-white">{caseObj.suspect_handle || '@unknown'}</strong>
              </span>
            </div>

            <h1 className="text-xl font-bold text-white tracking-tight">{caseObj.title}</h1>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">{caseObj.description}</p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {caseObj.risk_score === 'Critical' && (
              <Link
                to={`/case/${caseObj.id}/emergency`}
                className="animate-bounce px-4 py-2.5 rounded-md bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/20 flex items-center gap-2 border border-rose-500/50"
              >
                <ShieldAlert className="w-4 h-4" />
                Trigger Emergency Alert
              </Link>
            )}

            <button
              id="generate-pdf-report-btn"
              onClick={handleGenerateReport}
              disabled={generatingReport}
              className="px-4 py-2.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/20 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <FileCheck2 className="w-4 h-4" />
              {generatingReport ? 'Compiling Dossier...' : 'Generate Law Enforcement PDF'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols): AI Analyzer Engine & Evidence Timeline */}
        <div className="lg:col-span-2 space-y-8">
          {/* AI Evidence Analyzer Tool */}
          <div className="p-6 rounded-xl bg-[#16161a] border border-slate-800 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">AI Evidence Inspection Engine</h2>
                  <p className="text-xs text-slate-400">Run multi-modal threat scoring, profile checks & deepfake detection</p>
                </div>
              </div>
            </div>

            {/* Tab Selector */}
            <div className="flex rounded-md bg-[#09090b] p-1 border border-slate-800 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('threat')}
                className={`flex-1 py-2 rounded flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'threat' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileText className="w-4 h-4" />
                Threat & OCR Analyzer
              </button>
              <button
                onClick={() => setActiveTab('fake_profile')}
                className={`flex-1 py-2 rounded flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'fake_profile' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                Fake Profile Detector
              </button>
              <button
                onClick={() => setActiveTab('deepfake')}
                className={`flex-1 py-2 rounded flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'deepfake' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                Deepfake Media Check
              </button>
            </div>

            {/* TAB 1: THREAT ANALYZER */}
            {activeTab === 'threat' && (
              <form onSubmit={handleRunThreatAnalysis} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300">Message Text or Post Content</label>
                  <textarea
                    id="threat-text-textarea"
                    rows={3}
                    value={threatText}
                    onChange={e => setThreatText(e.target.value)}
                    placeholder="e.g. 'I will send your edited photos to all your followers tonight if you do not pay me...'"
                    className="mt-1 block w-full px-3 py-2 bg-[#09090b] border border-slate-800 rounded-md text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300">Or Upload Screenshot (OCR + Vision Threat Check)</label>
                  <input
                    id="threat-file-input"
                    type="file"
                    accept="image/*"
                    onChange={e => {
                      if (e.target.files && e.target.files[0]) {
                        setThreatFile(e.target.files[0]);
                      }
                    }}
                    className="mt-1 block w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-indigo-300 hover:file:bg-slate-700"
                  />
                </div>

                <button
                  id="run-threat-analysis-btn"
                  type="submit"
                  disabled={analyzingThreat}
                  className="w-full py-2.5 px-4 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {analyzingThreat ? 'Analyzing Text & Image with Gemini...' : 'Analyze Threat Level & Save to Vault'}
                </button>

                {/* Threat Results Display */}
                {threatResult && (
                  <div className="p-4 rounded-md bg-[#09090b] border border-indigo-500/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-300 uppercase">Analysis Results</span>
                      <RiskBadge score={threatResult.risk_score} size="sm" />
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 rounded bg-[#16161a] border border-slate-800">
                        <span className="text-slate-400 block text-[10px]">CATEGORY</span>
                        <span className="font-bold text-white uppercase">{threatResult.category}</span>
                      </div>
                      <div className="p-2 rounded bg-[#16161a] border border-slate-800">
                        <span className="text-slate-400 block text-[10px]">CONFIDENCE</span>
                        <span className="font-bold text-white">{Math.round((threatResult.confidence || 0.9) * 100)}%</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">{threatResult.explanation}</p>

                    {threatResult.toxic_phrases && threatResult.toxic_phrases.length > 0 && (
                      <div className="text-xs">
                        <span className="text-rose-400 font-semibold block text-[11px] mb-1">Highlighted Toxic / Extortion Phrases:</span>
                        <div className="flex flex-wrap gap-1">
                          {threatResult.toxic_phrases.map((p: string, idx: number) => (
                            <span key={idx} className="bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded text-[11px] font-mono border border-rose-500/30">
                              "{p}"
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </form>
            )}

            {/* TAB 2: FAKE PROFILE DETECTOR */}
            {activeTab === 'fake_profile' && (
              <form onSubmit={handleRunProfileAnalysis} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300">Suspected Fake Handle</label>
                    <input
                      id="suspected-handle-input"
                      type="text"
                      required
                      value={suspectedHandle}
                      onChange={e => setSuspectedHandle(e.target.value)}
                      placeholder="@mark_x900"
                      className="mt-1 block w-full px-3 py-2 bg-[#09090b] border border-slate-800 rounded-md text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300">Suspected Bio / Details</label>
                    <input
                      id="suspected-bio-input"
                      type="text"
                      value={suspectedBio}
                      onChange={e => setSuspectedBio(e.target.value)}
                      placeholder="e.g., Backup account for victim..."
                      className="mt-1 block w-full px-3 py-2 bg-[#09090b] border border-slate-800 rounded-md text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300">Official Target User Bio (For Comparison)</label>
                  <input
                    id="real-bio-input"
                    type="text"
                    value={realBio}
                    onChange={e => setRealBio(e.target.value)}
                    placeholder="e.g., Official designer profile..."
                    className="mt-1 block w-full px-3 py-2 bg-[#09090b] border border-slate-800 rounded-md text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <button
                  id="run-profile-analysis-btn"
                  type="submit"
                  disabled={analyzingProfile}
                  className="w-full py-2.5 px-4 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {analyzingProfile ? 'Computing Handle & Bio Similarity...' : 'Run Profile Impersonation Analysis'}
                </button>

                {profileResult && (
                  <div className="p-4 rounded-md bg-[#09090b] border border-indigo-500/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-300">Impersonation Likelihood Score</span>
                      <span className="font-mono text-sm font-black text-amber-400">{profileResult.impersonation_likelihood}%</span>
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-center text-xs">
                      <div className="p-2 rounded bg-[#16161a] border border-slate-800">
                        <span className="text-slate-400 block text-[9px]">NAME</span>
                        <span className="font-bold text-white">{profileResult.name_match}%</span>
                      </div>
                      <div className="p-2 rounded bg-[#16161a] border border-slate-800">
                        <span className="text-slate-400 block text-[9px]">HANDLE</span>
                        <span className="font-bold text-white">{profileResult.username_match}%</span>
                      </div>
                      <div className="p-2 rounded bg-[#16161a] border border-slate-800">
                        <span className="text-slate-400 block text-[9px]">BIO</span>
                        <span className="font-bold text-white">{profileResult.bio_match}%</span>
                      </div>
                      <div className="p-2 rounded bg-[#16161a] border border-slate-800">
                        <span className="text-slate-400 block text-[9px]">PHOTO</span>
                        <span className="font-bold text-white">{profileResult.photo_match}%</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">{profileResult.explanation}</p>
                  </div>
                )}
              </form>
            )}

            {/* TAB 3: DEEPFAKE DETECTOR */}
            {activeTab === 'deepfake' && (
              <form onSubmit={handleRunDeepfakeAnalysis} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300">Upload Suspected Image or Video Media</label>
                  <input
                    id="deepfake-media-input"
                    type="file"
                    accept="image/*,video/*"
                    required
                    onChange={e => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        setMediaFile(file);
                        setMediaPreviewUrl(URL.createObjectURL(file));
                      }
                    }}
                    className="mt-1 block w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-indigo-300 hover:file:bg-slate-700"
                  />
                </div>

                <button
                  id="run-deepfake-analysis-btn"
                  type="submit"
                  disabled={analyzingDeepfake || !mediaFile}
                  className="w-full py-2.5 px-4 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {analyzingDeepfake ? 'Scanning Frequency & Facial Artifacts...' : 'Scan for Deepfake Manipulation'}
                </button>

                {deepfakeResult && (
                  <div className="p-4 rounded-md bg-[#09090b] border border-rose-500/30 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-rose-400 uppercase">Deepfake Inspection Report</span>
                      <span className="font-mono text-sm font-black text-rose-400">
                        {deepfakeResult.manipulation_likelihood}% Likelihood ({deepfakeResult.confidence_range})
                      </span>
                    </div>

                    {/* Interactive Bounding Box Overlay Display */}
                    <BoundingBoxOverlay
                      imageUrl={mediaPreviewUrl}
                      flaggedRegions={deepfakeResult.flagged_regions || []}
                    />

                    <p className="text-xs text-slate-300 leading-relaxed">{deepfakeResult.explanation}</p>
                  </div>
                )}
              </form>
            )}
          </div>

          {/* Evidence Vault & Hashes */}
          <div className="p-6 rounded-xl bg-[#16161a] border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Hash className="w-4 h-4 text-indigo-400" />
                Evidence Vault & Cryptographic Hashes (SHA-256)
              </h2>
              <span className="text-xs text-slate-400">{evidence.length} items logged</span>
            </div>

            {evidence.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">No evidence items recorded yet.</p>
            ) : (
              <div className="space-y-3">
                {evidence.map(item => (
                  <div key={item.id} className="p-3.5 rounded-md bg-[#09090b] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30 uppercase">
                          {item.type}
                        </span>
                        <span className="text-xs font-semibold text-white">{item.source_platform}</span>
                        <span className="text-xs text-slate-400 font-mono">From: {item.sender_handle}</span>
                      </div>
                      {item.content_preview && (
                        <p className="text-xs text-slate-300 line-clamp-1">{item.content_preview}</p>
                      )}
                      <p className="text-[10px] font-mono text-indigo-400/90 truncate max-w-lg">
                        SHA-256: {item.hash}
                      </p>
                    </div>

                    <span className="text-[10px] text-slate-400 font-mono shrink-0">
                      {new Date(item.uploaded_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 Col): Risk Trend Chart & Timeline */}
        <div className="space-y-8">
          {/* Risk Escalation Trend Graph (Recharts) */}
          <div className="p-6 rounded-xl bg-[#16161a] border border-slate-800 shadow-xl space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-400" />
              Escalation & Risk Trend Graph
            </h2>

            <div className="h-48 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={riskTrend}>
                  <defs>
                    <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#64748b" fontSize={10} />
                  <YAxis domain={[1, 4]} ticks={[1, 2, 3, 4]} stroke="#64748b" fontSize={10} tickFormatter={(val) => ['Low', 'Med', 'High', 'Crit'][val - 1]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#16161a', borderColor: '#27272a', borderRadius: '8px', fontSize: '12px', color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="riskValue" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#riskGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Risk score aggregates threat keyword severity, deepfake manipulation percentages, and frequency of repeated contact over time.
            </p>
          </div>

          {/* Chronological Incident Timeline */}
          <div className="p-6 rounded-xl bg-[#16161a] border border-slate-800 shadow-xl space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Incident Timeline ({timeline.length})
            </h2>

            <div className="relative border-l-2 border-slate-800 pl-4 space-y-4 my-2">
              {timeline.map(item => (
                <div key={item.id} className="relative space-y-1">
                  <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-indigo-500 ring-4 ring-[#16161a]" />
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white">{item.sender_handle} ({item.source_platform})</span>
                    <RiskBadge score={item.risk_level} size="sm" />
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{item.summary}</p>
                  <span className="text-[10px] text-slate-500 font-mono block">
                    {new Date(item.timestamp).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
