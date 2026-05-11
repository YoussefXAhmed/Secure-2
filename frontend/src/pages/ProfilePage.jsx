
import { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from '../Layout';
import toast from 'react-hot-toast';

const API = "http://localhost:5000";

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [name, setName]       = useState('');
  const [stats, setStats]     = useState({ total: 0, trashed: 0 });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    Promise.all([
      axios.get(`${API}/profile`,   { headers: { authorization: token } }),
      axios.get(`${API}/passwords`, { headers: { authorization: token } }),
      axios.get(`${API}/trash`,     { headers: { authorization: token } }),
    ]).then(([p, pw, tr]) => {
      setProfile(p.data);
      setName(p.data.name || '');
      setStats({ total: pw.data.length, trashed: tr.data.length });
    }).catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    try {
      await axios.put(`${API}/profile`, { name }, { headers: { authorization: token } });
      setProfile(p => ({ ...p, name }));
      setEditing(false);
      toast.success('Profile updated ✓');
    } catch { toast.error('Update failed'); }
  };

  const letter = name?.[0]?.toUpperCase() ?? profile?.email?.[0]?.toUpperCase() ?? '?';

  if (loading) return (
    <Layout>
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin"/>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div style={{ fontFamily:"'DM Mono','Courier New',monospace" }}>
        <div className="mb-8">
          <p className="text-[10px] tracking-[0.3em] text-gray-600 uppercase mb-1">Account</p>
          <h1 className="text-2xl font-bold tracking-wide">Profile</h1>
        </div>

        <div className="max-w-2xl space-y-6">

          {/* Avatar + name */}
          <div className="bg-[#08090f]/90 backdrop-blur-xl border border-white/[0.07] rounded-2xl p-6">
            <div className="flex items-center gap-5">
              {/* Avatar */}
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500/30 to-violet-500/30 border border-cyan-500/20 flex items-center justify-center text-3xl font-bold text-cyan-300 shadow-xl shadow-cyan-500/10 shrink-0">
                {letter}
              </div>

              <div className="flex-1 min-w-0">
                {editing ? (
                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] tracking-[0.2em] text-gray-500 uppercase mb-1.5 block">Display Name</label>
                      <input value={name} onChange={e => setName(e.target.value)}
                        placeholder="Enter your name"
                        className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm placeholder-gray-600 focus:outline-none focus:border-cyan-500/40 transition-all"/>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={save}
                        className="px-5 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-violet-500 text-black font-bold text-xs tracking-widest uppercase">
                        Save
                      </button>
                      <button onClick={() => { setEditing(false); setName(profile?.name || ''); }}
                        className="px-5 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-gray-400 text-xs tracking-widest uppercase hover:text-white transition-all">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h2 className="text-lg font-bold">{name || <span className="text-gray-600 font-normal">No name set</span>}</h2>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{profile?.email}</p>
                    <button onClick={() => setEditing(true)}
                      className="mt-3 flex items-center gap-1.5 text-[10px] tracking-widest text-cyan-400 hover:text-cyan-300 transition-colors uppercase">
                      <span>✎</span> Edit Profile
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Saved',   value: stats.total,                    accent: 'cyan'    },
              { label: 'Trashed', value: stats.trashed,                  accent: 'red'     },
              { label: 'Active',  value: stats.total - stats.trashed,    accent: 'emerald' },
            ].map(({ label, value, accent }) => {
              const colors = {
                cyan:   'border-cyan-500/20 text-cyan-400 bg-cyan-500/5',
                red:    'border-red-500/20 text-red-400 bg-red-500/5',
                emerald:'border-emerald-500/20 text-emerald-400 bg-emerald-500/5',
              };
              return (
                <div key={label} className={`${colors[accent]} border rounded-2xl p-5`}>
                  <p className="text-[10px] tracking-[0.25em] text-gray-500 uppercase mb-2">{label}</p>
                  <p className="text-3xl font-bold font-mono">{String(value).padStart(2, '0')}</p>
                </div>
              );
            })}
          </div>

          {/* Security info */}
          <div className="bg-[#08090f]/90 backdrop-blur-xl border border-white/[0.07] rounded-2xl p-6">
            <p className="text-[10px] tracking-[0.25em] text-gray-500 uppercase mb-4">Security Info</p>
            <div className="space-y-3">
              {[
                { label: 'Email',       value: profile?.email,          icon: '◉' },
                { label: 'Encryption',  value: 'AES-256-GCM',           icon: '◎' },
                { label: 'Auth Method', value: 'JWT Bearer Token',       icon: '⬡' },
                { label: 'Zero-Knowledge', value: 'Enabled',            icon: '◈' },
              ].map(row => (
                <div key={row.label} className="flex items-center gap-3 py-2.5 border-b border-white/[0.04] last:border-0">
                  <span className="text-gray-600 w-4 text-center">{row.icon}</span>
                  <span className="text-[10px] tracking-[0.15em] text-gray-600 uppercase w-28">{row.label}</span>
                  <span className="text-xs text-gray-300 ml-auto">{row.value}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
}
