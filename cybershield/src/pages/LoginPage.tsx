import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight, Sparkles } from 'lucide-react';

interface Props {
  onLogin: (token: string, user: any) => void;
}

export const LoginPage: React.FC<Props> = ({ onLogin }) => {
  const [email, setEmail] = useState('demo@cybershield.org');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Login failed');

      onLogin(data.token, data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login error');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoQuickLogin = async () => {
    setEmail('demo@cybershield.org');
    setPassword('password123');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'demo@cybershield.org', password: 'password123' })
      });
      const data = await res.json();
      if (res.ok) {
        onLogin(data.token, data.user);
        navigate('/dashboard');
      }
    } catch (e) {
      setError('Demo login error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-100 relative overflow-hidden">
      {/* Subtle Ambient Backdrop Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="p-3 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shadow-2xl">
            <Shield className="w-8 h-8" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-3xl font-black text-white tracking-tight">
          CyberShield <span className="text-indigo-400">AI</span>
        </h2>
        <p className="mt-2 text-center text-xs text-slate-400">
          Document, detect, and report online harassment, fake profiles & deepfakes
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-[#16161a] border border-slate-800 backdrop-blur-xl py-8 px-4 shadow-2xl rounded-xl sm:px-10">
          {error && (
            <div className="mb-4 p-3 rounded-md bg-rose-500/15 border border-rose-500/30 text-xs text-rose-300">
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-300">Email Address</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="login-email-input"
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 bg-[#09090b] border border-slate-800 rounded-md text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                  placeholder="demo@cybershield.org"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300">Password</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="login-password-input"
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 bg-[#09090b] border border-slate-800 rounded-md text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            <button
              id="login-submit-button"
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-800 text-center">
            <p className="text-xs text-slate-400 mb-3">Hackathon Judging Quick Action:</p>
            <button
              id="quick-demo-login-btn"
              onClick={handleDemoQuickLogin}
              className="w-full py-2 px-3 rounded-md bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-indigo-400" />
              1-Click Demo Account Login
            </button>
          </div>

          <div className="mt-4 text-center">
            <span className="text-xs text-slate-400">
              Need a new account?{' '}
              <Link to="/signup" className="text-indigo-400 hover:text-indigo-300 font-semibold">
                Sign Up
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
