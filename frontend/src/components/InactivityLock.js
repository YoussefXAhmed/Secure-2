import { useEffect, useState, useCallback, useRef } from 'react';

const IDLE_MINUTES = 5; // Lock after 5 minutes idle

export default function InactivityLock({ children }) {
  const [locked, setLocked]     = useState(false);
  const [pin,    setPin]         = useState('');
  const [error,  setError]       = useState('');
  const [countdown, setCountdown] = useState(IDLE_MINUTES * 60);
  const timer   = useRef(null);
  const countRef = useRef(null);

  const token = localStorage.getItem('token');
  const isAuth = !!token;

  const resetTimer = useCallback(() => {
    if (!isAuth) return;
    setCountdown(IDLE_MINUTES * 60);
    clearTimeout(timer.current);
    clearInterval(countRef.current);

    countRef.current = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { clearInterval(countRef.current); return 0; }
        return c - 1;
      });
    }, 1000);

    timer.current = setTimeout(() => {
      setLocked(true);
    }, IDLE_MINUTES * 60 * 1000);
  }, [isAuth]);

  useEffect(() => {
    if (!isAuth) return;
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach(e => window.addEventListener(e, resetTimer));
    resetTimer();
    return () => {
      events.forEach(e => window.removeEventListener(e, resetTimer));
      clearTimeout(timer.current);
      clearInterval(countRef.current);
    };
  }, [isAuth, resetTimer]);

  const unlock = () => {
    // Simple unlock: re-enter master password or just confirm presence
    // In production, verify against stored hash
    if (pin.length < 1) return setError('Enter your password');
    // For demo: check against a stored PIN or just any input unlocks
    // Replace with real verification logic
    const storedPin = localStorage.getItem('lockPin') || '';
    if (storedPin && pin !== storedPin) {
      setError('Wrong password');
      setPin('');
      return;
    }
    setLocked(false);
    setPin('');
    setError('');
    resetTimer();
  };

  const logout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  // Format mm:ss
  const mins = String(Math.floor(countdown / 60)).padStart(2, '0');
  const secs = String(countdown % 60).padStart(2, '0');

  if (!isAuth) return children;

  if (locked) return (
    <div className="fixed inset-0 bg-[#050508] z-[999] flex items-center justify-center"
      style={{ fontFamily:"'DM Mono','Courier New',monospace" }}>

      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-cyan-950/20 rounded-full blur-[130px]"/>
        <div className="absolute inset-0 opacity-[0.02]"
          style={{ backgroundImage:'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize:'48px 48px' }}/>
      </div>

      <div className="relative z-10 w-full max-w-sm mx-4">
        <div className="bg-[#08090f]/95 backdrop-blur-xl border border-white/[0.07] rounded-2xl p-8 shadow-2xl text-center">

          {/* Lock icon */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-cyan-500/20 flex items-center justify-center text-3xl mx-auto mb-5">
            🔒
          </div>

          <h2 className="text-lg font-bold tracking-wide mb-1">Vault Locked</h2>
          <p className="text-xs text-gray-500 mb-6">Session locked due to inactivity. Enter your password to continue.</p>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              {error}
            </div>
          )}

          <input
            type="password"
            placeholder="Enter password to unlock"
            value={pin}
            onChange={e => { setPin(e.target.value); setError(''); }}
            onKeyDown={e => e.key === 'Enter' && unlock()}
            autoFocus
            className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm placeholder-gray-600 focus:outline-none focus:border-cyan-500/40 transition-all mb-4 text-center tracking-widest"
          />

          <button onClick={unlock}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 text-black font-bold text-sm tracking-widest uppercase shadow-lg shadow-cyan-500/20 hover:opacity-90 transition-all mb-3">
            Unlock
          </button>

          <button onClick={logout}
            className="w-full py-2.5 rounded-xl text-xs text-red-500/60 hover:text-red-400 transition-colors tracking-widest">
            ⊗ Sign Out Instead
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {children}
      {/* Idle warning — show last 60 seconds */}
      {isAuth && countdown <= 60 && countdown > 0 && (
        <div className="fixed bottom-4 right-4 z-50 bg-[#0d0e18] border border-yellow-500/30 rounded-xl px-4 py-3 shadow-xl"
          style={{ fontFamily:"'DM Mono','Courier New',monospace" }}>
          <p className="text-xs text-yellow-400 tracking-wide">
            ⚠ Locking in <span className="font-bold">{mins}:{secs}</span>
          </p>
        </div>
      )}
    </>
  );
}