import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, ShieldAlert, FileText, ArrowRight, Clock, AlertTriangle, Eye, ShieldCheck, FolderPlus, Search, RefreshCw } from 'lucide-react';
import { Case, RiskScore } from '../types.js';
import { RiskBadge } from '../components/RiskBadge.js';

interface Props {
  user: any;
  token: string;
}

export const DashboardPage: React.FC<Props> = ({ user, token }) => {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [suspectHandle, setSuspectHandle] = useState('');
  const [platform, setPlatform] = useState('Instagram');
  const [creating, setCreating] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const navigate = useNavigate();

  const fetchCases = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/cases', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setCases(data.cases || []);
      }
    } catch (err) {
      console.error('Failed to load cases:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, [token]);

  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    setCreating(true);

    try {
      const res = await fetch('/api/cases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          description,
          suspect_handle: suspectHandle,
          target_platform: platform
        })
      });
      const data = await res.json();
      if (res.ok) {
        setShowCreateModal(false);
        setTitle('');
        setDescription('');
        setSuspectHandle('');
        fetchCases();
        navigate(`/case/${data.case.id}`);
      }
    } catch (err) {
      console.error('Create case failed:', err);
    } finally {
      setCreating(false);
    }
  };

  // Metrics calculation
  const criticalCases = cases.filter(c => c.risk_score === 'Critical');
  const highCases = cases.filter(c => c.risk_score === 'High');
  const activeCases = cases.filter(c => c.status === 'Active' || c.status === 'Escalated');

  const filteredCases = cases.filter(c => {
    if (filter === 'critical') return c.risk_score === 'Critical';
    if (filter === 'high') return c.risk_score === 'High';
    if (filter === 'active') return c.status === 'Active' || c.status === 'Escalated';
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Incident Protection Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Active documentation vault & AI risk assessment feed
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchCases}
            title="Refresh feed"
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            id="report-new-incident-btn"
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            Report New Incident
          </button>
        </div>
      </div>

      {/* Critical Emergency Banner if critical case exists */}
      {criticalCases.length > 0 && (
        <div id="critical-emergency-alert-banner" className="p-4 rounded-2xl bg-gradient-to-r from-red-950/80 to-slate-900 border border-red-500/40 text-red-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl shadow-red-950/40">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-red-600/30 text-red-400 shrink-0 mt-0.5">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-red-400 uppercase tracking-wide">Critical Threat Detected</span>
                <span className="text-[10px] bg-red-500/20 text-red-300 px-2 py-0.5 rounded border border-red-500/30 font-mono">HIGH PRIORITY</span>
              </div>
              <p className="text-sm font-semibold text-white mt-0.5">
                Case #{criticalCases[0].id}: {criticalCases[0].title}
              </p>
              <p className="text-xs text-red-200/80 mt-0.5">
                Severe harassment/extortion threats identified. Emergency escalation features available.
              </p>
            </div>
          </div>

          <Link
            to={`/case/${criticalCases[0].id}/emergency`}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-md shadow-red-600/40 shrink-0 flex items-center gap-2 transition-colors"
          >
            Open Emergency Escalation
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => setFilter('all')}
          className={`p-5 rounded-xl border transition-all cursor-pointer ${
            filter === 'all'
              ? 'bg-[#16161a] border-indigo-500/50 ring-1 ring-indigo-500/30'
              : 'bg-[#16161a]/80 border-slate-800/80 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>TOTAL CASES</span>
            <FileText className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-white">{cases.length}</div>
          <p className="text-[11px] text-slate-400 mt-1">Active documentation records</p>
        </div>

        <div
          onClick={() => setFilter('critical')}
          className={`p-5 rounded-xl border transition-all cursor-pointer ${
            filter === 'critical'
              ? 'bg-rose-950/30 border-rose-500/50 ring-1 ring-rose-500/30'
              : 'bg-[#16161a]/80 border-slate-800/80 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>CRITICAL RISK</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-rose-400">{criticalCases.length}</div>
          <p className="text-[11px] text-rose-300/70 mt-1">Immediate intervention suggested</p>
        </div>

        <div
          onClick={() => setFilter('high')}
          className={`p-5 rounded-xl border transition-all cursor-pointer ${
            filter === 'high'
              ? 'bg-amber-950/30 border-amber-500/50 ring-1 ring-amber-500/30'
              : 'bg-[#16161a]/80 border-slate-800/80 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>HIGH RISK</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-amber-400">{highCases.length}</div>
          <p className="text-[11px] text-amber-300/70 mt-1">Severe harassment or impersonation</p>
        </div>

        <div
          onClick={() => setFilter('active')}
          className={`p-5 rounded-xl border transition-all cursor-pointer ${
            filter === 'active'
              ? 'bg-[#16161a] border-indigo-500/50 ring-1 ring-indigo-500/30'
              : 'bg-[#16161a]/80 border-slate-800/80 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>ACTIVE INVESTIGATIONS</span>
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-indigo-400">{activeCases.length}</div>
          <p className="text-[11px] text-slate-400 mt-1">Collecting evidence logs</p>
        </div>
      </div>

      {/* Case List Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            Active Incident Vault
            <span className="text-xs font-normal text-slate-400">({filteredCases.length} records)</span>
          </h2>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Filter:</span>
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-md border text-xs font-medium transition-colors ${
                filter === 'all' ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-[#16161a] text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('critical')}
              className={`px-2.5 py-1 rounded-md border text-xs font-medium transition-colors ${
                filter === 'critical' ? 'bg-rose-600 text-white border-rose-500' : 'bg-[#16161a] text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              Critical
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            Loading CyberShield case records...
          </div>
        ) : filteredCases.length === 0 ? (
          <div className="p-12 text-center bg-[#16161a] border border-slate-800/80 rounded-xl space-y-3">
            <FolderPlus className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-sm text-slate-300 font-medium">No incidents match the selected filter.</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-xs font-semibold"
            >
              Report First Incident
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredCases.map(c => (
              <div
                key={c.id}
                id={`case-card-${c.id}`}
                className="group p-5 rounded-xl bg-[#16161a] border border-slate-800/80 hover:border-indigo-500/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg hover:shadow-indigo-500/5"
              >
                <div className="space-y-2 max-w-3xl">
                  <div className="flex items-center gap-2 flex-wrap">
                    <RiskBadge score={c.risk_score} size="sm" />
                    <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                      {c.target_platform || 'Instagram'}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      Suspect: <strong className="text-slate-200">{c.suspect_handle || '@unknown'}</strong>
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                    {c.title}
                  </h3>

                  {c.description && (
                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                      {c.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      Created {new Date(c.created_at).toLocaleDateString()}
                    </span>
                    <span>•</span>
                    <span>{(c as any).evidence_count || 0} Evidence Item(s) Attached</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800/80">
                  <Link
                    to={`/case/${c.id}`}
                    className="w-full md:w-auto px-4 py-2 rounded-md bg-[#09090b] hover:bg-slate-800 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 border border-slate-800 transition-colors"
                  >
                    <Eye className="w-4 h-4 text-indigo-400" />
                    Open Vault
                  </Link>

                  {c.risk_score === 'Critical' && (
                    <Link
                      to={`/case/${c.id}/emergency`}
                      className="px-3 py-2 rounded-md bg-rose-600/20 text-rose-400 hover:bg-rose-600/30 border border-rose-500/30 text-xs font-bold shrink-0 transition-colors"
                    >
                      Alert Contacts
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Report New Incident */}
      {showCreateModal && (
        <div id="new-incident-modal" className="fixed inset-0 z-50 bg-[#09090b]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#16161a] border border-slate-800 rounded-xl max-w-lg w-full p-6 text-slate-100 shadow-2xl relative space-y-4">
            <h3 className="text-lg font-bold text-white">Report New Online Harassment Incident</h3>
            <p className="text-xs text-slate-400">Initialize a case record to attach messages, screenshots, fake profiles, and deepfake media.</p>

            <form onSubmit={handleCreateCase} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300">Case Title / Brief Summary</label>
                <input
                  id="case-title-input"
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g., Unsolicited Explicit Messages on Instagram"
                  className="mt-1 block w-full px-3 py-2 bg-[#09090b] border border-slate-800 rounded-md text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300">Suspect Handle / Account</label>
                  <input
                    id="case-suspect-input"
                    type="text"
                    value={suspectHandle}
                    onChange={e => setSuspectHandle(e.target.value)}
                    placeholder="@stalker_handle"
                    className="mt-1 block w-full px-3 py-2 bg-[#09090b] border border-slate-800 rounded-md text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300">Platform</label>
                  <select
                    id="case-platform-select"
                    value={platform}
                    onChange={e => setPlatform(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-[#09090b] border border-slate-800 rounded-md text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="Instagram">Instagram</option>
                    <option value="X / Twitter">X / Twitter</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Discord">Discord</option>
                    <option value="Facebook">Facebook</option>
                    <option value="Telegram">Telegram</option>
                    <option value="Other / Web">Other / Web</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300">Incident Details / Description</label>
                <textarea
                  id="case-description-textarea"
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Describe repeated message occurrences, dates, extortion attempts..."
                  className="mt-1 block w-full px-3 py-2 bg-[#09090b] border border-slate-800 rounded-md text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-md bg-slate-800/80 text-slate-300 text-xs font-semibold hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  id="submit-create-case-btn"
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Initialize Case Vault'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
