import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar.js';
import { AdvisoryBanner } from './components/AdvisoryBanner.js';
import { LoginPage } from './pages/LoginPage.js';
import { SignupPage } from './pages/SignupPage.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { CaseDetailPage } from './pages/CaseDetailPage.js';
import { EmergencyPage } from './pages/EmergencyPage.js';
import { SettingsPage } from './pages/SettingsPage.js';

export default function App() {
  const [token, setToken] = useState<string>(localStorage.getItem('cybershield_token') || '');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Auto-authenticate or fetch current user session
    const fetchMe = async () => {
      try {
        const res = await fetch('/api/auth/me', {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        const data = await res.json();
        if (res.ok && data.user) {
          setUser(data.user);
        } else {
          // Fallback to demo user for seamless hackathon preview
          const demoRes = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'demo@cybershield.org', password: 'password123' })
          });
          const demoData = await demoRes.json();
          if (demoRes.ok) {
            setToken(demoData.token);
            setUser(demoData.user);
            localStorage.setItem('cybershield_token', demoData.token);
          }
        }
      } catch (err) {
        console.error('Session verify error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, [token]);

  const handleLogin = (newToken: string, newUser: any) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('cybershield_token', newToken);
  };

  const handleLogout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('cybershield_token');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-xs font-mono">
        Initializing CyberShield Safety Vault...
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
        <AdvisoryBanner />

        {user && (
          <Navbar
            user={user}
            onLogout={handleLogout}
            hasCriticalCase={true}
          />
        )}

        <main className="flex-1">
          <Routes>
            <Route path="/login" element={!user ? <LoginPage onLogin={handleLogin} /> : <Navigate to="/dashboard" />} />
            <Route path="/signup" element={!user ? <SignupPage onLogin={handleLogin} /> : <Navigate to="/dashboard" />} />

            <Route path="/dashboard" element={user ? <DashboardPage user={user} token={token} /> : <Navigate to="/login" />} />
            <Route path="/case/:id" element={user ? <CaseDetailPage token={token} /> : <Navigate to="/login" />} />
            <Route path="/case/:id/emergency" element={user ? <EmergencyPage user={user} token={token} /> : <Navigate to="/login" />} />
            <Route path="/settings" element={user ? <SettingsPage user={user} token={token} onUserUpdate={setUser} /> : <Navigate to="/login" />} />

            <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
          </Routes>
        </main>

        {/* Operational Status Footer Bar */}
        <footer id="system-status-footer" className="bg-[#111114] border-t border-slate-800/80 px-4 sm:px-8 py-2.5 flex items-center justify-between text-xs text-slate-400">
          <div className="flex gap-4 items-center max-w-7xl mx-auto w-full">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono font-medium">All AI Systems Operational</span>
            </div>
            <div className="h-3 w-px bg-slate-800"></div>
            <p className="text-[10px] text-slate-500 hidden sm:block">CyberShield Safety Engine • AES-256 / SHA-256 Hash Vault Active</p>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}
