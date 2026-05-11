import { useEffect, useState } from 'react';
import Layout from '../Layout';

const tips = [
  {
    icon: '◈',
    title: 'Use Unique Passwords',
    desc: 'Never reuse the same password across multiple accounts. If one site is breached, all your accounts with that password become vulnerable.',
    severity: 'critical',
  },
  {
    icon: '⬡',
    title: 'Enable Two-Factor Authentication',
    desc: 'Add a second layer of security to your accounts. Even if your password is stolen, 2FA prevents unauthorized access.',
    severity: 'critical',
  },
  {
    icon: '◎',
    title: 'Use Long Passwords',
    desc: 'Passwords with 16+ characters are exponentially harder to crack. Use our generator to create strong, random passwords.',
    severity: 'high',
  },
  {
    icon: '◉',
    title: 'Avoid Personal Information',
    desc: 'Don\'t use your name, birthday, or common words. Attackers use these in dictionary attacks.',
    severity: 'high',
  },
  {
    icon: '⊕',
    title: 'Check for Data Breaches',
    desc: 'Regularly check if your email has been involved in a data breach using services like HaveIBeenPwned.',
    severity: 'medium',
  },
  {
    icon: '⟳',
    title: 'Rotate Passwords Periodically',
    desc: 'Change passwords for critical accounts (banking, email) every 3–6 months, especially after any suspected compromise.',
    severity: 'medium',
  },
  {
    icon: '◻',
    title: 'Beware of Phishing',
    desc: 'Always verify the URL before entering credentials. Attackers create fake login pages that look identical to real ones.',
    severity: 'high',
  },
  {
    icon: '⧉',
    title: 'Lock Your Vault When Idle',
    desc: 'Always lock your password manager when stepping away from your device. Enable auto-lock for extra protection.',
    severity: 'medium',
  },
];

const severityStyles = {
  critical: { badge: 'bg-red-500/15 text-red-400 border-red-500/20',    border: 'border-red-500/15',    icon: 'text-red-400'     },
  high:     { badge: 'bg-orange-500/15 text-orange-400 border-orange-500/20', border: 'border-orange-500/15', icon: 'text-orange-400' },
  medium:   { badge: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20', border: 'border-yellow-500/15', icon: 'text-yellow-400' },
};

export default function SecurityPage() {
  const [score, setScore] = useState(null);

  // Simple security score based on vault stats
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    // Mock score — in production, calculate from actual vault analysis
    setScore(72);
  }, []);

  return (
    <Layout>
      <div style={{ fontFamily:"'DM Mono','Courier New',monospace" }}>
        <div className="mb-8">
          <p className="text-[10px] tracking-[0.3em] text-gray-600 uppercase mb-1">Help</p>
          <h1 className="text-2xl font-bold tracking-wide">Security Center</h1>
          <p className="text-xs text-gray-600 mt-1">Best practices to keep your accounts safe</p>
        </div>

        {/* Security score */}
        {score !== null && (
          <div className="bg-[#08090f]/90 border border-white/[0.07] rounded-2xl p-6 mb-6 max-w-2xl">
            <p className="text-[10px] tracking-[0.25em] text-gray-500 uppercase mb-4">Security Score</p>
            <div className="flex items-center gap-5">
              <div className="relative w-20 h-20 shrink-0">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="2.5"/>
                  <circle cx="18" cy="18" r="15.9" fill="none"
                    stroke={score >= 80 ? '#22d3ee' : score >= 60 ? '#a3e635' : '#f97316'}
                    strokeWidth="2.5"
                    strokeDasharray={`${score} 100`}
                    strokeLinecap="round"/>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-white">{score}</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-lime-400">Good</p>
                <p className="text-xs text-gray-500 mt-1 max-w-xs">Your security is decent. Follow the tips below to reach 100.</p>
                <div className="flex gap-3 mt-3 text-[10px] text-gray-600">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block"/>Critical</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500 inline-block"/>High</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500 inline-block"/>Medium</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tips grid */}
        <div className="grid md:grid-cols-2 gap-4 max-w-4xl">
          {tips.map((tip, i) => {
            const s = severityStyles[tip.severity];
            return (
              <div key={i} className={`bg-[#08090f]/80 border ${s.border} rounded-2xl p-5 hover:border-opacity-40 transition-all`}>
                <div className="flex items-start gap-3">
                  <span className={`text-xl mt-0.5 ${s.icon}`}>{tip.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <h3 className="text-sm font-semibold">{tip.title}</h3>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full border tracking-widest uppercase ${s.badge}`}>
                        {tip.severity}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">{tip.desc}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Production disclaimer */}
        <div className="mt-8 p-5 bg-violet-500/5 border border-violet-500/15 rounded-2xl max-w-4xl">
          <p className="text-[10px] tracking-[0.2em] text-violet-500 uppercase mb-2">⚠ Security Notes for Production</p>
          <ul className="space-y-1.5 text-[11px] text-gray-600">
            <li>• <span className="text-gray-400">Implemented:</span> JWT auth, password hashing, HTTPS-ready API, input validation</li>
            <li>• <span className="text-gray-400">Implemented:</span> Token-based protected routes, auto-logout</li>
            <li>• <span className="text-gray-400">Recommended:</span> Add AES-256 client-side encryption before sending to server</li>
            <li>• <span className="text-gray-400">Recommended:</span> Add 2FA (TOTP), rate limiting, brute-force protection</li>
            <li>• <span className="text-gray-400">Recommended:</span> Integrate HaveIBeenPwned API for breach detection</li>
            <li>• <span className="text-gray-400">Recommended:</span> Add session expiry + inactivity auto-lock</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}