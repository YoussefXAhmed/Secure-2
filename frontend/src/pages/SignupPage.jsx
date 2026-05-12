import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api';

function getStrength(pw) {
  let score = 0;
  if (pw.length >= 8)  score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { label: 'Weak',   color: 'bg-red-500',    text: 'text-red-400',    w: 'w-1/5' };
  if (score <= 2) return { label: 'Fair',   color: 'bg-orange-500', text: 'text-orange-400', w: 'w-2/5' };
  if (score <= 3) return { label: 'Good',   color: 'bg-yellow-500', text: 'text-yellow-400', w: 'w-3/5' };
  if (score <= 4) return { label: 'Strong', color: 'bg-emerald-500',text: 'text-emerald-400',w: 'w-4/5' };
  return { label: 'Excellent', color: 'bg-cyan-400', text: 'text-cyan-400', w: 'w-full' };
}

export default function SignupPage() {
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [confirmPassword, setConfirm]   = useState('');
  const [showPass, setShowPass]         = useState(false);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');
  const nav = useNavigate();

  const strength = password ? getStrength(password) : null;

  const signup = async () => {
    if (!email || !password || !confirmPassword) return setError('All fields required');
    if (password !== confirmPassword) return setError("Passwords don't match");
    if (password.length < 8) return setError('Password must be at least 8 characters');
    try {
      setLoading(true); setError('');
      await axios.post(`${API}/signup`, { email, password });
      nav('/');
    } catch {
      setError('Something went wrong. Try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050508] relative overflow-hidden"
      style={{ fontFamily: "'DM Mono','Courier New',monospace" }}>

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-violet-950/25 rounded-full blur-[130px]"/>
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-cyan-950/20 rounded-full blur-[100px]"/>
        <div className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage:'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize:'48px 48px' }}/>
      </div>

      <div className="relative z-10 w-full max-w-md mx-4">

        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs tracking-widest">
            <span>⊕</span> CREATE ACCOUNT
          </div>
        </div>

        <div className="bg-[#08090f]/90 backdrop-blur-xl border border-white/[0.07] rounded-2xl p-8 shadow-2xl shadow-black/50">

          <div className="text-center mb-8">
            <div className="inline-flex w-14 h-14 bg-gradient-to-br from-violet-400 to-cyan-500 rounded-2xl items-center justify-center text-2xl font-black text-black shadow-xl shadow-violet-500/20 mb-4">S</div>
            <h1 className="text-xl font-bold tracking-[0.15em] text-white">JOIN SECURE</h1>
            {/* <p className="text-xs text-gray-500 tracking-[0.2em] mt-1">ZERO-KNOWLEDGE ENCRYPTION</p> */}
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
              <span>⚠</span> {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-[10px] tracking-[0.2em] text-gray-500 uppercase mb-1.5 block">Email</label>
              <input type="email" placeholder="you@example.com" value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white/80 placeholder-gray-600 focus:outline-none focus:border-violet-500/50 focus:bg-violet-500/5 transition-all"/>
            </div>

            <div>
              <label className="text-[10px] tracking-[0.2em] text-gray-500 uppercase mb-1.5 block">Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} placeholder="Min. 8 characters" value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white/80 placeholder-gray-600 focus:outline-none focus:border-violet-500/50 focus:bg-violet-500/5 transition-all"/>
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors text-sm">
                  {showPass ? '○' : '●'}
                </button>
              </div>
              {/* Strength bar */}
              {strength && (
                <div className="mt-2">
                  <div className="h-1 bg-white/[0.05] rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-500 ${strength.color} ${strength.w}`}/>
                  </div>
                  <p className={`text-[10px] mt-1 tracking-widest ${strength.text}`}>{strength.label.toUpperCase()}</p>
                </div>
              )}
            </div>

            <div>
              <label className="text-[10px] tracking-[0.2em] text-gray-500 uppercase mb-1.5 block">Confirm Password</label>
              <input type="password" placeholder="••••••••••••" value={confirmPassword}
                onChange={e => setConfirm(e.target.value)}
                className={`w-full px-4 py-3 bg-white/[0.04] border rounded-xl text-sm text-white/80 placeholder-gray-600 focus:outline-none transition-all
                  ${confirmPassword && confirmPassword !== password
                    ? 'border-red-500/40 focus:border-red-500/60'
                    : confirmPassword && confirmPassword === password
                    ? 'border-emerald-500/40 focus:border-emerald-500/60'
                    : 'border-white/[0.08] focus:border-violet-500/50'}`}/>
              {confirmPassword && confirmPassword === password && (
                <p className="text-[10px] text-emerald-400 mt-1 tracking-widest">✓ PASSWORDS MATCH</p>
              )}
            </div>

            <button onClick={signup} disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 hover:from-violet-400 hover:to-cyan-400 text-black font-bold text-sm tracking-[0.15em] uppercase shadow-lg shadow-violet-500/20 transition-all duration-300 disabled:opacity-50 mt-2">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin inline-block"/>
                  Creating...
                </span>
              ) : 'Create Account'}
            </button>
          </div>

          <p className="mt-6 text-center text-xs text-gray-600">
            Have an account?{' '}
            <Link to="/" className="text-violet-400 hover:text-violet-300 transition-colors">Sign in →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
