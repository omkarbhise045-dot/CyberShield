import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';

export const AdvisoryBanner: React.FC = () => {
  return (
    <div id="advisory-disclaimer-banner" className="bg-[#111114] border-b border-slate-800/80 px-4 py-2 text-[11px] text-slate-400 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 max-w-7xl mx-auto">
        <Info className="w-3.5 h-3.5 text-amber-500/90 shrink-0" />
        <p>
          <strong className="font-semibold text-slate-300">Advisory Disclaimer:</strong> CyberShield AI analysis provides advisory assessments for documentation, triage, and authority reporting. Confidence scores reflect probability ranges and do not constitute absolute legal or forensic proof.
        </p>
      </div>
    </div>
  );
};
