import React, { useState } from 'react';
import { HelpCircle, X, CheckCircle2, ArrowRight, Shield, FileText, AlertOctagon } from 'lucide-react';

export const DemoScriptModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const steps = [
    {
      num: 1,
      title: 'Sign In / Dashboard Overview',
      desc: 'Use pre-filled credentials (demo@cybershield.org) to enter the main CyberShield Dashboard showing active cases, risk scores, and evidence counts.'
    },
    {
      num: 2,
      title: 'Inspect Active Case & Risk Level',
      desc: 'Click on Case #101 ("Persistent Instagram Stalking"). Observe the calculated CRITICAL Risk Level badge and aggregated threat metrics.'
    },
    {
      num: 3,
      title: 'Run AI Threat & Screenshot Analyzer',
      desc: 'Click "Analyze New Evidence", type an abusive DM (e.g., "Pay me or I publish your private photos tonight") or upload a screenshot to generate AI threat categorization and risk classification.'
    },
    {
      num: 4,
      title: 'Run Deepfake & Media Manipulation Check',
      desc: 'Upload an image/video to run deepfake detection. View AI manipulation probability, frequency artifact scores, and interactive bounding box region overlays.'
    },
    {
      num: 5,
      title: 'Run Fake Profile Impersonation Check',
      desc: 'Compare a suspect handle against a real user handle to view handle typo-squatting detection, bio phrase overlap, and similarity scores.'
    },
    {
      num: 6,
      title: 'Examine Case Timeline & Evidence Vault',
      desc: 'Review the chronological incident escalation chart and SHA-256 cryptographic integrity hashes generated for legal chain-of-custody.'
    },
    {
      num: 7,
      title: 'Generate Official PDF Report & Emergency Alert',
      desc: 'Click "Generate Law Enforcement PDF Report" to download a formatted police dossier. Then test the "Emergency Escalation" panel to dispatch alerts to trusted contacts.'
    }
  ];

  return (
    <>
      <button
        id="demo-script-toggle-btn"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-xs font-semibold text-indigo-300 transition-colors"
      >
        <HelpCircle className="w-4 h-4 text-indigo-400" />
        Hackathon Demo Walkthrough (5-7 Steps)
      </button>

      {isOpen && (
        <div id="demo-script-modal" className="fixed inset-0 z-50 bg-[#09090b]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#16161a] border border-slate-800 rounded-xl max-w-2xl w-full p-6 text-slate-100 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">CyberShield Hackathon Judge Demo Script</h3>
                <p className="text-xs text-slate-400">Step-by-step feature walkthrough designed for live evaluation</p>
              </div>
            </div>

            <div className="space-y-3 my-4">
              {steps.map(s => (
                <div key={s.num} className="p-3 rounded-lg bg-[#09090b] border border-slate-800 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {s.num}
                  </span>
                  <div>
                    <h4 className="text-sm font-semibold text-indigo-300">{s.title}</h4>
                    <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-500">All data seeded in DB. Fully operational fullstack MVP.</span>
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-xs font-semibold transition-colors shadow-lg shadow-indigo-600/20"
              >
                Start Exploring Demo
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
