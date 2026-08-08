import React from 'react';
import { RiskScore } from '../types.js';
import { ShieldAlert, AlertTriangle, ShieldCheck, Flame } from 'lucide-react';

interface Props {
  score: RiskScore;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskBadge: React.FC<Props> = ({ score, size = 'md' }) => {
  const config = {
    Critical: {
      bg: 'bg-red-500/15 border-red-500/40 text-red-400',
      icon: Flame,
      label: 'CRITICAL RISK'
    },
    High: {
      bg: 'bg-orange-500/15 border-orange-500/40 text-orange-400',
      icon: AlertTriangle,
      label: 'HIGH RISK'
    },
    Medium: {
      bg: 'bg-amber-500/15 border-amber-500/40 text-amber-400',
      icon: ShieldAlert,
      label: 'MEDIUM RISK'
    },
    Low: {
      bg: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400',
      icon: ShieldCheck,
      label: 'LOW RISK'
    }
  };

  const current = config[score] || config.Low;
  const Icon = current.icon;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px] gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
    lg: 'px-3.5 py-1.5 text-sm gap-2 font-bold'
  };

  return (
    <span
      id={`risk-badge-${score.toLowerCase()}`}
      className={`inline-flex items-center font-mono font-medium rounded-full border ${current.bg} ${sizeClasses[size]}`}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
      {current.label}
    </span>
  );
};
