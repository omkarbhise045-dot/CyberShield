import React from 'react';
import { FlaggedRegion } from '../types.js';

interface Props {
  imageUrl?: string;
  flaggedRegions: FlaggedRegion[];
}

export const BoundingBoxOverlay: React.FC<Props> = ({ imageUrl, flaggedRegions }) => {
  // Sample placeholder avatar image if no specific file uploaded
  const imageSrc = imageUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop';

  return (
    <div className="relative w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shadow-xl group">
      <img
        src={imageSrc}
        alt="Analyzed Media"
        className="w-full h-auto max-h-[380px] object-contain mx-auto block"
      />

      {/* Overlay Bounding Boxes */}
      {flaggedRegions.map((region, idx) => {
        const [ymin, xmin, ymax, xmax] = region.box;
        const top = `${ymin}%`;
        const left = `${xmin}%`;
        const width = `${Math.max(15, xmax - xmin)}%`;
        const height = `${Math.max(15, ymax - ymin)}%`;

        return (
          <div
            key={idx}
            className="absolute border-2 border-red-500 bg-red-500/15 rounded-lg transition-all hover:bg-red-500/30 group-hover:scale-[1.01]"
            style={{ top, left, width, height }}
          >
            <div className="absolute -top-7 left-0 bg-red-600 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded shadow-md whitespace-nowrap flex items-center gap-1">
              <span>{region.label}</span>
              <span className="opacity-80">({Math.round((region.score || 0.9) * 100)}%)</span>
            </div>
          </div>
        );
      })}

      <div className="p-3 bg-slate-900/95 border-t border-slate-800 text-xs text-slate-300 flex items-center justify-between">
        <span className="font-mono text-red-400 font-semibold flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          {flaggedRegions.length} Anomaly Bounding Region(s) Flagged
        </span>
        <span className="text-slate-400 text-[11px]">Hover over region to view score detail</span>
      </div>
    </div>
  );
};
