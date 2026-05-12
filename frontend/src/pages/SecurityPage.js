import { useEffect, useState } from 'react';
import axios from 'axios';
import API from '../api';

const severityStyles = {
  critical: {
    badge: 'bg-red-500/15 text-red-400 border-red-500/20',
    border: 'border-red-500/15',
    icon: 'text-red-400',
    glow: 'shadow-red-500/5',
  },
  high: {
    badge: 'bg-orange-500/15 text-orange-400 border-orange-500/20',
    border: 'border-orange-500/15',
    icon: 'text-orange-400',
    glow: 'shadow-orange-500/5',
  },
  medium: {
    badge: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
    border: 'border-yellow-500/15',
    icon: 'text-yellow-400',
    glow: 'shadow-yellow-500/5',
  },
  info: {
    badge: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/20',
    border: 'border-cyan-500/15',
    icon: 'text-cyan-400',
    glow: 'shadow-cyan-500/5',
  },
};

export default function SecurityPage() {
  const [analysis, setAnalysis] = useState(null);
  const [animatedScore, setAnimatedScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { setLoading(false); return; }
    axios.get(`${API}/security/analysis`, { headers: { authorization: token } })
      .then(r => { setAnalysis(r.data); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  useEffect(() => {
    if (!analysis) return;
    const duration = 1000;
    const steps = 30;
    const increment = analysis.score / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= analysis.score) {
        setAnimatedScore(analysis.score);
        clearInterval(timer);
      } else {
        setAnimatedScore(Math.round(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [analysis]);

  const getScoreColor = () => {
    const s = animatedScore;
    if (s >= 90) return { stroke: '#22d3ee', label: 'Excellent', text: 'text-cyan-400' };
    if (s >= 70) return { stroke: '#a3e635', label: 'Strong', text: 'text-lime-400' };
    if (s >= 50) return { stroke: '#facc15', label: 'Good', text: 'text-yellow-400' };
    if (s >= 30) return { stroke: '#fb923c', label: 'Fair', text: 'text-orange-400' };
    return { stroke: '#f87171', label: 'Weak', text: 'text-red-400' };
  };

  const scoreMeta = getScoreColor();

  return (
    <div style={{ fontFamily:"'DM Mono','Courier New',monospace" }}>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-cyan-500/20 flex items-center justify-center text-sm text-cyan-400">🛡️</div>
          <div>
            <p className="text-[10px] tracking-[0.3em] text-gray-600 uppercase">Security</p>
            <h1 className="text-2xl font-bold tracking-wide">Security Center</h1>
          </div>
        </div>
        <p className="text-xs text-gray-600 ml-11">Monitor and improve your account security</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl">

        {/* Left column */}
        <div className="lg:col-span-2 space-y-5">

          {/* Security Score */}
          {analysis && (
            <div className="group relative bg-[#08090f]/90 backdrop-blur-sm border border-white/[0.07] rounded-2xl p-6 hover:border-white/15 transition-all duration-300">
              <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-cyan-500/5 to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"/>
              <div className="relative">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"/>
                    <p className="text-[10px] tracking-[0.25em] text-gray-500 uppercase">Security Score</p>
                  </div>
                  <span className={`text-[10px] px-2.5 py-1 rounded-full border tracking-widest uppercase ${scoreMeta.text} border-current/20 bg-current/5`}>
                    {scoreMeta.label}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="relative w-24 h-24 shrink-0">
                    <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="2.5"/>
                      <circle cx="18" cy="18" r="15.9" fill="none"
                        stroke={scoreMeta.stroke}
                        strokeWidth="2.5"
                        strokeDasharray={`${animatedScore} 100`}
                        strokeLinecap="round"
                        className="transition-all duration-500 ease-out"
                        style={{ filter: 'drop-shadow(0 0 6px rgba(34,211,238,0.3))' }}/>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold text-white">{animatedScore}</span>
                      <span className="text-[8px] text-gray-600 tracking-widest uppercase mt-0.5">/ 100</span>
                    </div>
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <p className="text-sm font-semibold text-white">
                      {analysis.total === 0
                        ? 'No passwords saved yet'
                        : <>Your security is <span className={scoreMeta.text}>{scoreMeta.label.toLowerCase()}</span></>}
                    </p>
                    <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                      {analysis.total === 0
                        ? 'Start adding passwords to your vault to get a security analysis.'
                        : 'Follow the recommendations below to strengthen your account security.'}
                    </p>
                    <div className="flex gap-4 mt-4 flex-wrap justify-center sm:justify-start">
                      <div className="text-center">
                        <p className="text-lg font-bold text-white">{analysis.total}</p>
                        <p className="text-[9px] text-gray-600 tracking-wider uppercase">Total</p>
                      </div>
                      <div className="w-px bg-white/[0.06] self-stretch"/>
                      <div className="text-center">
                        <p className="text-lg font-bold text-emerald-400">{analysis.strongCount}</p>
                        <p className="text-[9px] text-gray-600 tracking-wider uppercase">Strong</p>
                      </div>
                      <div className="w-px bg-white/[0.06] self-stretch"/>
                      <div className="text-center">
                        <p className="text-lg font-bold text-red-400">{analysis.weakCount}</p>
                        <p className="text-[9px] text-gray-600 tracking-wider uppercase">Weak</p>
                      </div>
                      <div className="w-px bg-white/[0.06] self-stretch"/>
                      <div className="text-center">
                        <p className="text-lg font-bold text-orange-400">{analysis.reusedCount}</p>
                        <p className="text-[9px] text-gray-600 tracking-wider uppercase">Reused</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Password Details */}
          {analysis && analysis.details.length > 0 && (
            <div className="bg-[#08090f]/90 backdrop-blur-sm border border-white/[0.07] rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse"/>
                  <p className="text-[10px] tracking-[0.25em] text-gray-500 uppercase">Password Analysis</p>
                </div>
                <span className="text-[10px] text-gray-600 tracking-wider">{analysis.details.length} sites</span>
              </div>
              <div className="space-y-1.5">
                {analysis.details.map((item, i) => {
                  const barColor =
                    item.score <= 2 ? 'bg-red-500' :
                    item.score <= 3 ? 'bg-yellow-500' :
                    item.score <= 4 ? 'bg-lime-500' :
                    item.score >= 5 ? 'bg-cyan-500' : 'bg-gray-500';
                  const labelColor =
                    item.score <= 2 ? 'text-red-400' :
                    item.score <= 3 ? 'text-yellow-400' :
                    item.score <= 4 ? 'text-lime-400' :
                    'text-cyan-400';
                  return (
                    <div key={i}
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.03] transition-all duration-200">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-medium text-gray-200 truncate">{item.site}</p>
                          <div className="flex items-center gap-2 shrink-0">
                            {item.reused && <span className="text-[8px] px-1.5 py-0.5 rounded border border-orange-500/30 text-orange-400 bg-orange-500/10 tracking-wider uppercase">Reused</span>}
                            <span className={`text-[9px] tracking-wider ${labelColor}`}>{item.label}</span>
                          </div>
                        </div>
                        <div className="mt-1.5 h-1 bg-white/[0.05] rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                            style={{ width: `${(item.score / 6) * 100}%` }}/>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Empty state when no passwords */}
          {analysis && analysis.total === 0 && (
            <div className="bg-[#08090f]/90 backdrop-blur-sm border border-white/[0.07] rounded-2xl p-10 text-center">
              <div className="text-4xl mb-4 text-gray-700">📂</div>
              <p className="text-sm text-gray-500">No passwords in your vault yet</p>
              <p className="text-xs text-gray-700 mt-1">Add passwords from the Vault page to get a security analysis</p>
            </div>
          )}

          {/* Loading skeleton */}
          {loading && (
            <div className="bg-[#08090f]/90 backdrop-blur-sm border border-white/[0.07] rounded-2xl p-6">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-2 h-2 rounded-full bg-gray-700 animate-pulse"/>
                <div className="h-3 w-28 bg-white/[0.05] rounded animate-pulse"/>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-white/[0.04] animate-pulse shrink-0"/>
                <div className="flex-1 space-y-3 w-full">
                  <div className="h-4 w-48 bg-white/[0.05] rounded animate-pulse"/>
                  <div className="h-3 w-64 bg-white/[0.03] rounded animate-pulse"/>
                  <div className="flex gap-4 mt-4">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="text-center">
                        <div className="h-6 w-8 bg-white/[0.05] rounded animate-pulse mx-auto"/>
                        <div className="h-2 w-10 bg-white/[0.03] rounded animate-pulse mt-1 mx-auto"/>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Fallback when not loading and no analysis */}
          {!loading && !analysis && (
            <div className="bg-[#08090f]/90 backdrop-blur-sm border border-white/[0.07] rounded-2xl p-10 text-center">
              <div className="text-4xl mb-4 text-gray-700">🛡️</div>
              <p className="text-sm text-gray-500">Unable to load security data</p>
              <p className="text-xs text-gray-700 mt-1">Make sure the backend server is running</p>
            </div>
          )}

          {/* Production Notes */}
          <div className="group relative bg-[#08090f]/90 backdrop-blur-sm border border-violet-500/10 rounded-2xl p-6 hover:border-violet-500/20 transition-all duration-300">
            <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"/>
            <div className="relative">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-2 h-2 rounded-full bg-violet-400"/>
                <p className="text-[10px] tracking-[0.2em] text-violet-400 uppercase font-semibold">Production Security Notes</p>
              </div>
              <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-[11px] text-gray-600">
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-emerald-400 shadow-[0_0_4px_rgba(52,211,153,0.5)] shrink-0"/>
                  <span><span className="text-gray-400">✓</span> JWT auth &amp; password hashing</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-emerald-400 shadow-[0_0_4px_rgba(52,211,153,0.5)] shrink-0"/>
                  <span><span className="text-gray-400">✓</span> Token-based protected routes</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-amber-400 shadow-[0_0_4px_rgba(251,191,36,0.5)] shrink-0"/>
                  <span><span className="text-amber-400">⟳</span> Add AES-256 client-side encryption</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-amber-400 shadow-[0_0_4px_rgba(251,191,36,0.5)] shrink-0"/>
                  <span><span className="text-amber-400">⟳</span> Add 2FA &amp; rate limiting</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-amber-400 shadow-[0_0_4px_rgba(251,191,36,0.5)] shrink-0"/>
                  <span><span className="text-amber-400">⟳</span> Breach detection integration</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-amber-400 shadow-[0_0_4px_rgba(251,191,36,0.5)] shrink-0"/>
                  <span><span className="text-amber-400">⟳</span> Session expiry + auto-lock</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right column — Dynamic recommendations */}
        <div className="space-y-4">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"/>
            <p className="text-[10px] tracking-[0.25em] text-gray-500 uppercase">Recommendations</p>
          </div>
          {analysis && analysis.recommendations.map((rec, i) => {
            const s = severityStyles[rec.severity] || severityStyles.medium;
            return (
              <div key={i}
                className={`group relative bg-[#08090f]/90 backdrop-blur-sm border ${s.border} rounded-xl p-4 hover:border-opacity-60 transition-all duration-300 cursor-default hover:-translate-y-0.5 hover:shadow-lg ${s.glow}`}>
                <div className="absolute -inset-px rounded-xl bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"/>
                <div className="relative flex items-start gap-3">
                  <span className={`text-base mt-0.5 shrink-0 ${s.icon}`}>{rec.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="text-xs font-semibold text-gray-200 group-hover:text-white transition-colors">{rec.title}</h3>
                      <span className={`text-[8px] px-2 py-0.5 rounded-full border tracking-widest uppercase ${s.badge} shrink-0`}>
                        {rec.severity}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-600 leading-relaxed group-hover:text-gray-500 transition-colors">{rec.desc}</p>
                  </div>
                </div>
              </div>
            );
          })}
          {loading && (
            <div className="flex items-center justify-center h-32">
              <div className="w-5 h-5 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin"/>
            </div>
          )}
          {error && (
            <div className="bg-[#08090f]/90 backdrop-blur-sm border border-red-500/10 rounded-xl p-5 text-center">
              <p className="text-xs text-red-400/70">⚠ Failed to load security analysis</p>
              <button onClick={() => window.location.reload()}
                className="mt-3 text-[10px] text-cyan-500/60 hover:text-cyan-400 tracking-widest uppercase transition-colors">
                Retry
              </button>
            </div>
          )}
          {!loading && !error && !analysis && (
            <div className="bg-[#08090f]/90 backdrop-blur-sm border border-white/[0.07] rounded-xl p-5 text-center">
              <p className="text-xs text-gray-600">Please log in to see security analysis</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
