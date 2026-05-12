import { useEffect, useState } from 'react';
import axios from 'axios';
import API from '../api';

function StatCard({ label, value, accent = 'cyan' }) {
  const colors = {
    cyan:   { border: 'border-cyan-500/20',   text: 'text-cyan-400',   bg: 'bg-cyan-500/5'   },
    violet: { border: 'border-violet-500/20', text: 'text-violet-400', bg: 'bg-violet-500/5' },
    emerald:{ border: 'border-emerald-500/20',text: 'text-emerald-400',bg: 'bg-emerald-500/5'},
  };
  const c = colors[accent];
  return (
    <div className={`${c.bg} border ${c.border} rounded-2xl p-5 backdrop-blur-sm`}>
      <p className="text-[10px] tracking-[0.25em] text-gray-500 uppercase mb-2">{label}</p>
      <p className={`text-3xl font-bold ${c.text} font-mono`}>{String(value).padStart(2, '0')}</p>
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData]         = useState([]);
  const [show, setShow]         = useState({});
  const [search, setSearch]     = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    axios.get(`${API}/passwords`, { headers: { authorization: token } })
      .then(r => setData(r.data)).catch(console.error);
  }, []);

  const copy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const filtered = data.filter(i => i.site.toLowerCase().includes(search.toLowerCase()));
  const visibleCount = Object.values(show).filter(Boolean).length;

  return (
      <div className="text-white" style={{ fontFamily:"'DM Mono','Courier New',monospace" }}>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <p className="text-[10px] tracking-[0.3em] text-gray-600 uppercase mb-1">Overview</p>
            <h1 className="text-2xl font-bold tracking-wide">Dashboard</h1>
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 text-sm">⌕</span>
            <input
              placeholder="Search sites..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm placeholder-gray-600 focus:outline-none focus:border-cyan-500/40 transition-all w-full md:w-64"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <StatCard label="Total"   value={data.length}                     accent="cyan"   />
          <StatCard label="Visible" value={visibleCount}                    accent="violet" />
          <StatCard label="Hidden"  value={data.length - visibleCount}      accent="emerald"/>
        </div>

        {/* Cards */}
        {filtered.length === 0 ? (
          <div className="text-center text-gray-600 mt-20">
            <div className="text-4xl mb-3">◻</div>
            <p className="text-sm tracking-widest">NO ENTRIES FOUND</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(item => (
              <div key={item._id}
                className="group bg-[#08090f]/80 backdrop-blur-lg border border-white/[0.06] rounded-2xl p-5 hover:border-cyan-500/25 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/5">

                {/* Site header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-white/[0.08] flex items-center justify-center text-sm font-bold text-cyan-300 uppercase">
                    {item.site[0]}
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold capitalize">{item.site}</h2>
                    <p className="text-[10px] text-gray-500 truncate max-w-[150px]">{item.username}</p>
                  </div>
                </div>

                {/* Password field */}
                <div className="bg-white/[0.03] border border-white/[0.05] rounded-xl px-4 py-3 mb-4">
                  <p className="text-[10px] tracking-[0.2em] text-gray-600 mb-1">PASSWORD</p>
                  <p className="text-sm font-mono text-cyan-300 tracking-wider truncate">
                    {show[item._id] ? item.password : '••••••••••••'}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setShow(p => ({ ...p, [item._id]: !p[item._id] }))}
                    className="flex-1 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-gray-400 hover:text-white hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all">
                    {show[item._id] ? '○ Hide' : '● Show'}
                  </button>
                  <button
                    onClick={() => copy(item.password, item._id)}
                    className={`flex-1 py-2 rounded-lg text-xs transition-all border
                      ${copiedId === item._id
                        ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                        : 'bg-white/[0.04] border-white/[0.08] text-gray-400 hover:text-white hover:border-violet-500/30 hover:bg-violet-500/5'}`}>
                    {copiedId === item._id ? '✓ Copied' : '⧉ Copy'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
  );
}
