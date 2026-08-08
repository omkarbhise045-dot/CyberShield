import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShieldAlert, Send, PhoneCall, ExternalLink, CheckCircle2, UserCheck, Shield, AlertTriangle, ArrowLeft } from 'lucide-react';
import { TrustedContact } from '../types.js';

interface Props {
  user: any;
  token: string;
}

export const EmergencyPage: React.FC<Props> = ({ user, token }) => {
  const { id } = useParams<{ id: string }>();
  const [customMsg, setCustomMsg] = useState('');
  const [dispatching, setDispatching] = useState(false);
  const [dispatchResult, setDispatchResult] = useState<any>(null);

  const contacts: TrustedContact[] = user?.trusted_contacts || [
    {
      id: 'contact_1',
      name: 'Sarah Jenkins (Sister)',
      phone: '+1 (555) 234-5678',
      email: 'sarah.j@example.com',
      relationship: 'Primary Contact'
    },
    {
      id: 'contact_2',
      name: 'Dr. Elena Rostova (Counselor)',
      phone: '+1 (555) 987-6543',
      email: 'elena.counseling@example.org',
      relationship: 'Support Counselor'
    }
  ];

  const handleTriggerAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    setDispatching(true);

    try {
      const res = await fetch('/api/emergency/notify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          case_id: id || 'case_101',
          custom_message: customMsg
        })
      });
      const data = await res.json();
      if (res.ok) {
        setDispatchResult(data);
      }
    } catch (err) {
      console.error('Emergency alert dispatch error:', err);
    } finally {
      setDispatching(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Link to={id ? `/case/${id}` : '/dashboard'} className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-indigo-400 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Case Vault
      </Link>

      {/* Emergency Header Banner */}
      <div id="emergency-escalation-panel-header" className="p-6 rounded-xl bg-gradient-to-r from-rose-950/80 via-[#16161a] to-[#16161a] border border-rose-500/40 shadow-2xl text-rose-100 space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-rose-600/20 text-rose-400 border border-rose-500/30 shrink-0">
            <ShieldAlert className="w-8 h-8 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              Emergency Escalation & Trusted Contact Alert
            </h1>
            <p className="text-xs text-rose-200/80 mt-0.5">
              Rapid notification dispatch and official helpline connection for critical harassment/extortion cases.
            </p>
          </div>
        </div>

        <div className="p-3 bg-rose-950/40 rounded-lg border border-rose-500/20 text-xs text-rose-200 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>Notice: CyberShield notification dispatch alerts user-configured personal contacts and provides official helpline resources. It does not replace 911 / emergency local law enforcement.</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Dispatch Alert to Trusted Contacts */}
        <div className="p-6 rounded-xl bg-[#16161a] border border-slate-800 shadow-xl space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-800">
            <UserCheck className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">Configured Trusted Contacts ({contacts.length})</h2>
          </div>

          <div className="space-y-3">
            {contacts.map(contact => (
              <div key={contact.id} className="p-3.5 rounded-md bg-[#09090b] border border-slate-800 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-xs font-bold text-white">{contact.name}</h3>
                  <p className="text-[11px] text-slate-400">{contact.relationship}</p>
                  <p className="text-[10px] text-indigo-400 font-mono mt-0.5">{contact.phone} • {contact.email}</p>
                </div>
                <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded">
                  READY
                </span>
              </div>
            ))}
          </div>

          <form onSubmit={handleTriggerAlert} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-300">Custom Emergency Note (Optional)</label>
              <textarea
                id="emergency-custom-message-textarea"
                rows={3}
                value={customMsg}
                onChange={e => setCustomMsg(e.target.value)}
                placeholder="I need help documenting an active threat. CyberShield has recorded the evidence..."
                className="mt-1 block w-full px-3 py-2 bg-[#09090b] border border-slate-800 rounded-md text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>

            <button
              id="dispatch-emergency-alert-btn"
              type="submit"
              disabled={dispatching || contacts.length === 0}
              className="w-full py-3 px-4 rounded-md bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {dispatching ? 'Dispatching Emergency Alerts...' : '1-Click Dispatch Alert to All Trusted Contacts'}
            </button>
          </form>

          {/* Dispatch Log Results */}
          {dispatchResult && (
            <div className="p-4 rounded-md bg-emerald-950/30 border border-emerald-500/30 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                Alert Notifications Successfully Sent!
              </div>

              <div className="space-y-2 text-xs text-slate-300">
                {dispatchResult.dispatched_logs.map((log: any, idx: number) => (
                  <div key={idx} className="p-2 rounded bg-[#09090b] border border-slate-800 flex items-center justify-between">
                    <span className="font-semibold text-white">{log.name}</span>
                    <span className="text-[10px] font-mono text-emerald-400">{log.status} ({new Date(log.timestamp).toLocaleTimeString()})</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Helplines & Official Cybercrime Portals */}
        <div className="p-6 rounded-xl bg-[#16161a] border border-slate-800 shadow-xl space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-800">
            <PhoneCall className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">Official Cybercrime Helplines & Resources</h2>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-md bg-[#09090b] border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-white">National Cyber Crime Reporting Portal (India)</h3>
                <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                  Helpline: 1930
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Official portal for reporting cyber fraud, online harassment, stalking, and non-consensual media.
              </p>
              <a
                href="https://cybercrime.gov.in"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold pt-1"
              >
                Visit cybercrime.gov.in
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="p-4 rounded-md bg-[#09090b] border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-white">StopNCII.org (Non-Consensual Image Hash Blocking)</h3>
                <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  GLOBAL
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Prevent intimate images and deepfake media from being shared on Facebook, Instagram, TikTok, Reddit, and Bumble.
              </p>
              <a
                href="https://stopncii.org"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold pt-1"
              >
                Visit StopNCII.org
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="p-4 rounded-md bg-[#09090b] border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-white">Cyber Civil Rights Initiative (CCRI)</h3>
                <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  24/7 Helpline
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                24/7 dedicated support and legal guidance for victims of non-consensual sexual content and online extortion.
              </p>
              <a
                href="https://cybercivilrights.org"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold pt-1"
              >
                Visit cybercivilrights.org
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
