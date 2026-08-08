import React from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { Shield, Settings, AlertOctagon, LayoutDashboard, LogOut, ShieldAlert } from 'lucide-react';
import { DemoScriptModal } from './DemoScriptModal.js';

interface Props {
  user: any;
  onLogout: () => void;
  hasCriticalCase?: boolean;
}

export const Navbar: React.FC<Props> = ({ user, onLogout, hasCriticalCase = false }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <header id="app-header-navbar" className="bg-[#09090b]/90 border-b border-slate-800/80 sticky top-0 z-40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-6">
          <RouterLink to="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-indigo-500/20 border border-indigo-500/40 rounded-lg flex items-center justify-center text-indigo-400 shadow-lg shadow-indigo-500/10 group-hover:scale-105 transition-transform">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                CyberShield <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">AI</span>
              </span>
              <p className="text-[10px] text-slate-400 hidden sm:block">Women's Online Safety & Documentation</p>
            </div>
          </RouterLink>

          {/* Primary Nav Links */}
          <nav className="hidden md:flex items-center gap-1.5 text-xs font-semibold">
            <RouterLink
              to="/dashboard"
              className={`px-3 py-1.5 rounded-md flex items-center gap-2 transition-colors ${
                location.pathname === '/dashboard'
                  ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </RouterLink>

            <RouterLink
              to="/settings"
              className={`px-3 py-1.5 rounded-md flex items-center gap-2 transition-colors ${
                location.pathname === '/settings'
                  ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Settings className="w-4 h-4" />
              Trusted Contacts
            </RouterLink>
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <DemoScriptModal />

          {hasCriticalCase && (
            <RouterLink
              to="/case/case_101/emergency"
              className="animate-pulse px-3 py-1.5 rounded-md bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-rose-600/20 transition-all border border-rose-500/50"
            >
              <ShieldAlert className="w-4 h-4" />
              EMERGENCY ALERT
            </RouterLink>
          )}

          {user && (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <span className="text-xs text-slate-300 hidden lg:inline-block max-w-[140px] truncate font-mono">
                {user.email}
              </span>
              <button
                id="user-logout-button"
                onClick={onLogout}
                title="Sign Out"
                className="p-2 rounded-md text-slate-400 hover:text-rose-400 hover:bg-slate-800/60 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
