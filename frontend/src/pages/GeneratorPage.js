import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

function generatePassword(length, opts) {
  const sets = {
    upper:   'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lower:   'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
  };
  let pool = '';
  if (opts.upper)   pool += sets.upper;
  if (opts.lower)   pool += sets.lower;
  if (opts.numbers) pool += sets.numbers;
  if (opts.symbols) pool += sets.symbols;
  if (!pool) pool = sets.lower;

  const arr = new Uint8Array(length);
  crypto.getRandomValues(arr);
  return Array.from(arr).map(b => pool[b % pool.length]).join('');
}

function getStrength(pw) {
  if (!pw) return { score: 0, label: '', color: '' };
  let s = 0;
  if (pw.length >= 8)  s++;
  if (pw.length >= 12) s++;
  if (pw.length >= 16) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  const levels = [
    { label:'',          color:'',                    bar:'',               w:'w-0'    },
    { label:'Very Weak', color:'text-red-400',         bar:'bg-red-500',     w:'w-1/6'  },
    { label:'Weak',      color:'text-orange-400',      bar:'bg-orange-500',  w:'w-2/6'  },
    { label:'Fair',      color:'text-yellow-400',      bar:'bg-yellow-400',  w:'w-3/6'  },
    { label:'Good',      color:'text-lime-400',        bar:'bg-lime-500',    w:'w-4/6'  },
    { label:'Strong',    color:'text-emerald-400',     bar:'bg-emerald-500', w:'w-5/6'  },
    { label:'Excellent', color:'text-cyan-400',        bar:'bg-cyan-400',    w:'w-full' },
  ];
  return { score: s, ...levels[Math.min(s, 6)] };
}

function Toggle({ label, checked, onChange }) {
  return (
    <button onClick={() => onChange(!checked)}
      className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
        checked
          ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
          : 'bg-white/[0.03] border-white/[0.07] text-gray-500 hover:text-gray-300 hover:border-white/15'
      }`}>
      <span className="text-xs tracking-wide">{label}</span>
      <div className={`w-8 h-4 rounded-full transition-all relative ${checked ? 'bg-cyan-500' : 'bg-white/10'}`}>
        <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${checked ? 'left-4' : 'left-0.5'}`}/>
      </div>
    </button>
  );
}

export default function GeneratorPage() {
  const [length,  setLength]  = useState(16);
  const [upper,   setUpper]   = useState(true);
  const [lower,   setLower]   = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(false);
  const [password, setPassword] = useState('');
  const [history,  setHistory]  = useState([]);

  const generate = useCallback(() => {
    const pw = generatePassword(length, { upper, lower, numbers, symbols });
    setPassword(pw);
    setHistory(h => [pw, ...h].slice(0, 8));
  }, [length, upper, lower, numbers, symbols]);

  const copy = (pw) => {
    navigator.clipboard.writeText(pw);
    toast.success('Copied to clipboard ✓');
  };

  const strength = getStrength(password);

  return (
      <div style={{ fontFamily:"'DM Mono','Courier New',monospace" }}>
        <div className="mb-8">
          <p className="text-[10px] tracking-[0.3em] text-gray-600 uppercase mb-1">Tools</p>
          <h1 className="text-2xl font-bold tracking-wide">Password Generator</h1>
          <p className="text-xs text-gray-600 mt-1">Generate cryptographically secure passwords</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 max-w-4xl">

          {/* Generator card */}
          <div className="bg-[#08090f]/90 backdrop-blur-xl border border-white/[0.07] rounded-2xl p-6">

            {/* Output */}
            <div className="bg-black/30 border border-white/[0.06] rounded-xl p-4 mb-4 min-h-[72px] flex items-center justify-between gap-3">
              <p className="text-sm font-mono text-cyan-300 break-all flex-1 tracking-wider">
                {password || <span className="text-gray-700">Click generate...</span>}
              </p>
              {password && (
                <button onClick={() => copy(password)}
                  className="shrink-0 px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/[0.08] text-gray-400 hover:text-white hover:border-cyan-500/30 text-xs transition-all">
                  ⧉ Copy
                </button>
              )}
            </div>

            {/* Strength bar */}
            {password && (
              <div className="mb-5">
                <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden mb-1.5">
                  <div className={`h-full rounded-full transition-all duration-500 ${strength.bar} ${strength.w}`}/>
                </div>
                <p className={`text-[10px] tracking-widest ${strength.color}`}>{strength.label.toUpperCase()}</p>
              </div>
            )}

            {/* Length slider */}
            <div className="mb-5">
              <div className="flex justify-between items-center mb-2">
                <label className="text-[10px] tracking-[0.2em] text-gray-500 uppercase">Length</label>
                <span className="text-sm font-bold text-cyan-400 font-mono">{length}</span>
              </div>
              <input type="range" min="8" max="64" value={length}
                onChange={e => setLength(Number(e.target.value))}
                className="w-full h-1.5 bg-white/[0.08] rounded-full appearance-none cursor-pointer accent-cyan-400"/>
              <div className="flex justify-between text-[10px] text-gray-700 mt-1">
                <span>8</span><span>64</span>
              </div>
            </div>

            {/* Toggles */}
            <div className="space-y-2 mb-6">
              <p className="text-[10px] tracking-[0.2em] text-gray-600 uppercase mb-2">Character Sets</p>
              <Toggle label="Uppercase  A–Z"  checked={upper}   onChange={setUpper}   />
              <Toggle label="Lowercase  a–z"  checked={lower}   onChange={setLower}   />
              <Toggle label="Numbers  0–9"    checked={numbers} onChange={setNumbers} />
              <Toggle label="Symbols  !@#$…"  checked={symbols} onChange={setSymbols} />
            </div>

            {/* Generate button */}
            <button onClick={generate}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 text-black font-bold text-sm tracking-[0.15em] uppercase shadow-lg shadow-cyan-500/20 hover:opacity-90 transition-all">
              ⟳ Generate Password
            </button>
          </div>

          {/* History */}
          <div className="bg-[#08090f]/90 backdrop-blur-xl border border-white/[0.07] rounded-2xl p-6">
            <p className="text-[10px] tracking-[0.25em] text-gray-500 uppercase mb-4">Recent Generated</p>
            {history.length === 0 ? (
              <div className="text-center text-gray-700 mt-10">
                <div className="text-3xl mb-2">◻</div>
                <p className="text-xs tracking-widest">No history yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {history.map((pw, i) => (
                  <div key={i}
                    className="flex items-center gap-3 px-4 py-3 bg-white/[0.02] border border-white/[0.05] rounded-xl hover:border-white/10 transition-all group">
                    <p className="flex-1 text-xs font-mono text-gray-400 truncate group-hover:text-gray-200 transition-colors">{pw}</p>
                    <button onClick={() => copy(pw)}
                      className="shrink-0 text-gray-600 hover:text-cyan-400 transition-colors text-sm">⧉</button>
                  </div>
                ))}
              </div>
            )}

            {/* Tips */}
            <div className="mt-6 p-4 bg-cyan-500/5 border border-cyan-500/10 rounded-xl">
              <p className="text-[10px] tracking-[0.2em] text-cyan-600 uppercase mb-2">💡 Tips</p>
              <ul className="space-y-1.5 text-[11px] text-gray-600">
                <li>• Use 16+ characters for strong security</li>
                <li>• Include symbols for maximum strength</li>
                <li>• Never reuse passwords across sites</li>
                <li>• Use a unique password per account</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
  );
}