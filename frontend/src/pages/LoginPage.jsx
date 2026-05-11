import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const API = "http://localhost:5000";

export default function LoginPage() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const nav = useNavigate();

const login = async () => {
  if (!email || !password) {
    return setError("All fields required");
  }

  try {
    setLoading(true);
    setError('');
    const res = await axios.post(`${API}/login`, { email, password });
    localStorage.setItem("token", res.data.token);
    nav("/dashboard");
  } catch (err) {
    setError(err.response?.data?.error || 'Login failed');
  } finally {
    setLoading(false);
  }
};

  const onKey = e => e.key === 'Enter' && login();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050508] relative overflow-hidden"
      style={{ fontFamily: "'DM Mono','Courier New',monospace" }}>

      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-cyan-950/30 rounded-full blur-[130px]"/>
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-violet-950/25 rounded-full blur-[100px]"/>
        <div className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage:'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize:'48px 48px' }}/>
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-md mx-4">

        {/* Header badge */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block"/>
            SECURE CONNECTION
          </div>
        </div>

        <div className="bg-[#08090f]/90 backdrop-blur-xl border border-white/[0.07] rounded-2xl p-8 shadow-2xl shadow-black/50">

          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex w-14 h-14 bg-gradient-to-br from-cyan-400 to-violet-500 rounded-2xl items-center justify-center text-2xl font-black text-black shadow-xl shadow-cyan-500/20 mb-4">S</div>
            <h1 className="text-xl font-bold tracking-[0.15em]">SECURE VAULT</h1>
            <p className="text-xs text-gray-500 tracking-[0.2em] mt-1">AUTHENTICATE TO CONTINUE</p>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs tracking-wide flex items-center gap-2">
              <span>⚠</span> {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-[10px] tracking-[0.2em] text-gray-500 uppercase mb-1.5 block">Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={onKey}
                className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 focus:bg-cyan-500/5 transition-all"
              />
            </div>

            <div>
              <label className="text-[10px] tracking-[0.2em] text-gray-500 uppercase mb-1.5 block">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={onKey}
                  className="w-full px-4 py-3 pr-12 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 focus:bg-cyan-500/5 transition-all"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors text-sm">
                  {showPass ? '○' : '●'}
                </button>
              </div>
            </div>

            <button onClick={login} disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-400 hover:to-violet-400 text-black font-bold text-sm tracking-[0.15em] uppercase shadow-lg shadow-cyan-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-2">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin inline-block"/>
                  Authenticating...
                </span>
              ) : 'Access Vault'}
            </button>

          </div>

          <p className="mt-6 text-center text-xs text-gray-600">
            No account?{' '}
            <Link to="/signup" className="text-cyan-400 hover:text-cyan-300 transition-colors tracking-wide">
              Create one →
            </Link>
          </p>
        </div>

        {/* <p className="text-center text-[10px] text-gray-700 tracking-widest mt-6">
          END-TO-END ENCRYPTED · ZERO KNOWLEDGE
        </p> */}
      </div>
    </div>
  );
}
