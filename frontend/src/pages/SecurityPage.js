import { useEffect, useState } from 'react';

const tips = [
  {
    icon: '🔐',
    title: 'Use Unique Passwords',
    desc: 'Never reuse the same password across multiple accounts. If one site is breached, all your accounts with that password become vulnerable.',
    severity: 'critical',
  },
  {
    icon: '🛡️',
    title: 'Enable Two-Factor Authentication',
    desc: 'Add a second layer of security to your accounts. Even if your password is stolen, 2FA prevents unauthorized access.',
    severity: 'critical',
  },
  {
    icon: '📏',
    title: 'Use Long Passwords',
    desc: 'Passwords with 16+ characters are exponentially harder to crack. Use our generator to create strong, random passwords.',
    severity: 'high',
  },
  {
    icon: '🚫',
    title: 'Avoid Personal Information',
    desc: 'Don\'t use your name, birthday, or common words. Attackers use these in dictionary attacks.',
    severity: 'high',
  },
  {
    icon: '🔍',
    title: 'Check for Data Breaches',
    desc: 'Regularly check if your email has been involved in a data breach using services like HaveIBeenPwned.',
    severity: 'medium',
  },
  {
    icon: '🔄',
    title: 'Rotate Passwords Periodically',
    desc: 'Change passwords for critical accounts (banking, email) every 3–6 months, especially after any suspected compromise.',
    severity: 'medium',
  },
  {
    icon: '🎣',
    title: 'Beware of Phishing',
    desc: 'Always verify the URL before entering credentials. Attackers create fake login pages that look identical to real ones.',
    severity: 'high',
  },
  {
    icon: '🔒',
    title: 'Lock Your Vault When Idle',
    desc: 'Always lock your password manager when stepping away from your device. Enable auto-lock for extra protection.',
    severity: 'medium',
  },
];

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
};

const activities = [
  { action: 'Login detected', detail: 'New device · Chrome 123, Windows', time: '2 min ago', type: 'success' },
  { action: 'Password generated', detail: '18-char strong password created', time: '15 min ago', type: 'info' },
  { action: 'Vault accessed', detail: 'Dashboard overview viewed', time: '1 hour ago', type: 'neutral' },
  { action: 'Password updated', detail: 'Email account password changed', time: '3 hours ago', type: 'warning' },
  { action: 'Breach check completed', detail: 'No new breaches found', time: '1 day ago', type: 'success' },
];

const activityTypeStyles = {
  success: { dot: 'bg-emerald-400', text: 'text-emerald-400' },
  info: { dot: 'bg-cyan-400', text: 'text-cyan-400' },
  warning: { dot: 'bg-orange-400', text: 'text-orange-400' },
  neutral: { dot: 'bg-gray-500', text: 'text-gray-400' },
};

export default function SecurityPage() {
  const [score, setScore] = useState(null);
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    setScore(72);
  }, []);

  useEffect(() => {
    if (score === null) return;
    const duration = 1000;
    const steps = 30;
    const increment = score / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= score) {
        setAnimatedScore(score);
        clearInterval(timer);
      } else {
        setAnimatedScore(Math.round(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [score]);

  const getScoreColor = () => {
    if (animatedScore >= 80) return { stroke: '#22d3ee', label: 'Excellent', text: 'text-cyan-400', ring: 'from-cyan-400 to-cyan-600' };
    if (animatedScore >= 60) return { stroke: '#a3e635', label: 'Good', text: 'text-lime-400', ring: 'from-lime-400 to-lime-600' };
    if (animatedScore >= 40) return { stroke: '#fb923c', label: 'Fair', text: 'text-orange-400', ring: 'from-orange-400 to-orange-600' };
    return { stroke: '#f87171', label: 'Weak', text: 'text-red-400', ring: 'from-red-400 to-red-600' };
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

        {/* Left column — Score + activity */}
        <div className="lg:col-span-2 space-y-5">

          {/* Security Score Card */}
          {score !== null && (
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
                  {/* Animated ring */}
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
                    <p className="text-sm font-semibold text-white">Your security is <span className={scoreMeta.text}>{scoreMeta.label.toLowerCase()}</span></p>
                    <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                      Follow the recommendations below to strengthen your account security and reach a perfect score.
                    </p>
                    <div className="flex gap-3 mt-3 text-[10px] text-gray-600 justify-center sm:justify-start">
                      <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_4px_rgba(239,68,68,0.5)]"/>Critical</span>
                      <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_4px_rgba(249,115,22,0.5)]"/>High</span>
                      <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-yellow-500 shadow-[0_0_4px_rgba(234,179,8,0.5)]"/>Medium</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security Activity */}
          <div className="bg-[#08090f]/90 backdrop-blur-sm border border-white/[0.07] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse"/>
                <p className="text-[10px] tracking-[0.25em] text-gray-500 uppercase">Recent Activity</p>
              </div>
              <span className="text-[10px] text-gray-600 tracking-wider">{activities.length} events</span>
            </div>
            <div className="space-y-1">
              {activities.map((act, i) => {
                const st = activityTypeStyles[act.type];
                return (
                  <div key={i}
                    className="group flex items-start gap-3.5 p-3 rounded-xl hover:bg-white/[0.03] transition-all duration-200 cursor-default">
                    <div className="relative mt-1.5">
                      <div className={`w-2 h-2 rounded-full ${st.dot} shadow-[0_0_6px_var(--tw-shadow-color)]`}
                        style={{ boxShadow: `0 0 6px ${st.dot === 'bg-emerald-400' ? 'rgba(52,211,153,0.4)' : st.dot === 'bg-cyan-400' ? 'rgba(34,211,238,0.4)' : st.dot === 'bg-orange-400' ? 'rgba(251,146,60,0.4)' : 'rgba(107,114,128,0.4)'}` }}/>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-medium text-gray-200 group-hover:text-white transition-colors">{act.action}</p>
                        <span className={`text-[9px] tracking-wider shrink-0 ${st.text}`}>●</span>
                      </div>
                      <p className="text-[11px] text-gray-600 mt-0.5">{act.detail}</p>
                      <p className="text-[9px] text-gray-700 mt-0.5 tracking-wide">{act.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

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

        {/* Right column — Tips */}
        <div className="space-y-4">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"/>
            <p className="text-[10px] tracking-[0.25em] text-gray-500 uppercase">Recommendations</p>
          </div>
          {tips.map((tip, i) => {
            const s = severityStyles[tip.severity];
            return (
              <div key={i}
                className={`group relative bg-[#08090f]/90 backdrop-blur-sm border ${s.border} rounded-xl p-4 hover:border-opacity-60 transition-all duration-300 cursor-default hover:-translate-y-0.5 hover:shadow-lg ${s.glow}`}>
                <div className="absolute -inset-px rounded-xl bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"/>
                <div className="relative flex items-start gap-3">
                  <span className={`text-base mt-0.5 shrink-0 ${s.icon}`}>{tip.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="text-xs font-semibold text-gray-200 group-hover:text-white transition-colors">{tip.title}</h3>
                      <span className={`text-[8px] px-2 py-0.5 rounded-full border tracking-widest uppercase ${s.badge} shrink-0`}>
                        {tip.severity}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-600 leading-relaxed group-hover:text-gray-500 transition-colors">{tip.desc}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
