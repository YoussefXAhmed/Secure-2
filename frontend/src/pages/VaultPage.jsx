import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import Layout from '../Layout';
import toast from 'react-hot-toast';

const API = "http://localhost:5000";

const CATEGORIES = ['All', 'Social', 'Email', 'Banking', 'Work', 'Shopping', 'Gaming', 'Other'];

const CAT_COLORS = {
  Social:   'bg-blue-500/15 text-blue-400 border-blue-500/20',
  Email:    'bg-violet-500/15 text-violet-400 border-violet-500/20',
  Banking:  'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  Work:     'bg-cyan-500/15 text-cyan-400 border-cyan-500/20',
  Shopping: 'bg-orange-500/15 text-orange-400 border-orange-500/20',
  Gaming:   'bg-pink-500/15 text-pink-400 border-pink-500/20',
  Other:    'bg-gray-500/15 text-gray-400 border-gray-500/20',
};

function strengthInfo(pw) {
  if (!pw) return null;
  let s = 0;
  if (pw.length >= 8)  s++;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  const levels = [
    null,
    { label:'Weak',      w:'w-1/5', bar:'bg-red-500',    text:'text-red-400'    },
    { label:'Fair',      w:'w-2/5', bar:'bg-orange-500',  text:'text-orange-400' },
    { label:'Good',      w:'w-3/5', bar:'bg-yellow-400',  text:'text-yellow-400' },
    { label:'Strong',    w:'w-4/5', bar:'bg-emerald-500', text:'text-emerald-400'},
    { label:'Excellent', w:'w-full',bar:'bg-cyan-400',    text:'text-cyan-400'   },
  ];
  return levels[Math.min(s, 5)];
}

function genPassword() {
  const pool = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  return Array.from(crypto.getRandomValues(new Uint8Array(16))).map(b => pool[b % pool.length]).join('');
}

const EMPTY_FORM = { site:'', url:'', username:'', password:'', notes:'', category:'Other' };

export default function VaultPage() {
  const [data,      setData]      = useState([]);
  const [favorites, setFavorites] = useState(() => JSON.parse(localStorage.getItem('favs') || '[]'));
  const [form,      setForm]      = useState(EMPTY_FORM);
  const [editId,    setEditId]    = useState(null);
  const [showForm,  setShowForm]  = useState(false);
  const [showPass,  setShowPass]  = useState({});
  const [showFormPass, setShowFormPass] = useState(false);
  const [search,    setSearch]    = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [favOnly,   setFavOnly]   = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const token = localStorage.getItem('token');

  const fetch_ = useCallback(async () => {
    const r = await axios.get(`${API}/passwords`, { headers: { authorization: token } });
    setData(r.data);
  }, [token]);

  useEffect(() => { fetch_(); }, [fetch_]);

  const saveFavs = (newFavs) => {
    setFavorites(newFavs);
    localStorage.setItem('favs', JSON.stringify(newFavs));
  };

  const toggleFav = (id) => {
    const next = favorites.includes(id) ? favorites.filter(f => f !== id) : [...favorites, id];
    saveFavs(next);
  };

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const resetForm = () => { setForm(EMPTY_FORM); setEditId(null); setShowFormPass(false); };

  const save = async () => {
    if (!form.site || !form.username || !form.password) return toast.error('Site, username and password are required');
    try {
      if (editId) {
        await axios.put(`${API}/passwords/${editId}`, form, { headers: { authorization: token } });
        toast.success('Updated ✓');
      } else {
        await axios.post(`${API}/passwords`, form, { headers: { authorization: token } });
        toast.success('Saved ✓');
      }
      resetForm(); setShowForm(false); fetch_();
    } catch { toast.error('Failed to save'); }
  };

  const confirmDelete = (id) => setDeleteConfirm(id);

  const del = async () => {
    await axios.delete(`${API}/passwords/${deleteConfirm}`, { headers: { authorization: token } });
    toast('Moved to Trash');
    setDeleteConfirm(null); fetch_();
  };

  const startEdit = (item) => {
    setForm({ site: item.site, url: item.url || '', username: item.username, password: item.password, notes: item.notes || '', category: item.category || 'Other' });
    setEditId(item._id); setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const copy = (text, label = '') => {
    navigator.clipboard.writeText(text);
    toast.success(`${label || 'Copied'} ✓`);
  };

  // Filter
  const filtered = data
    .filter(i => catFilter === 'All' || i.category === catFilter)
    .filter(i => !favOnly || favorites.includes(i._id))
    .filter(i =>
      i.site.toLowerCase().includes(search.toLowerCase()) ||
      i.username.toLowerCase().includes(search.toLowerCase()) ||
      (i.url || '').toLowerCase().includes(search.toLowerCase())
    );

  const strength = strengthInfo(form.password);

  return (
    <Layout>
      <div style={{ fontFamily:"'DM Mono','Courier New',monospace" }}>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
          <div className="flex-1">
            <p className="text-[10px] tracking-[0.3em] text-gray-600 uppercase mb-1">Vault</p>
            <h1 className="text-2xl font-bold tracking-wide">Passwords</h1>
          </div>
          <button onClick={() => { resetForm(); setShowForm(!showForm); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 text-black text-xs font-bold tracking-widest uppercase shadow-lg shadow-cyan-500/20 hover:opacity-90 transition-all self-start">
            {showForm && !editId ? '− Cancel' : editId ? '− Cancel Edit' : '+ Add New'}
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-[#08090f]/90 backdrop-blur-xl border border-white/[0.07] rounded-2xl p-6 mb-6">
            <p className="text-[10px] tracking-[0.25em] text-gray-500 uppercase mb-4">
              {editId ? '✎ Edit Entry' : '+ New Entry'}
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Site */}
              <div>
                <label className="text-[10px] tracking-[0.2em] text-gray-600 uppercase mb-1.5 block">Site / App Name *</label>
                <input value={form.site} onChange={e => setField('site', e.target.value)} placeholder="e.g. GitHub"
                  className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm placeholder-gray-600 focus:outline-none focus:border-cyan-500/40 transition-all"/>
              </div>

              {/* URL */}
              <div>
                <label className="text-[10px] tracking-[0.2em] text-gray-600 uppercase mb-1.5 block">Website URL</label>
                <input value={form.url} onChange={e => setField('url', e.target.value)} placeholder="https://github.com"
                  className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm placeholder-gray-600 focus:outline-none focus:border-cyan-500/40 transition-all"/>
              </div>

              {/* Username */}
              <div>
                <label className="text-[10px] tracking-[0.2em] text-gray-600 uppercase mb-1.5 block">Username / Email *</label>
                <input value={form.username} onChange={e => setField('username', e.target.value)} placeholder="you@email.com"
                  className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm placeholder-gray-600 focus:outline-none focus:border-cyan-500/40 transition-all"/>
              </div>

              {/* Password */}
              <div>
                <label className="text-[10px] tracking-[0.2em] text-gray-600 uppercase mb-1.5 block">Password *</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input type={showFormPass ? 'text' : 'password'} value={form.password}
                      onChange={e => setField('password', e.target.value)} placeholder="••••••••"
                      className="w-full px-4 py-3 pr-10 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm placeholder-gray-600 focus:outline-none focus:border-cyan-500/40 transition-all"/>
                    <button type="button" onClick={() => setShowFormPass(!showFormPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 text-xs">
                      {showFormPass ? '○' : '●'}
                    </button>
                  </div>
                  <button onClick={() => setField('password', genPassword())} title="Generate"
                    className="px-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-gray-400 hover:text-cyan-400 hover:border-cyan-500/30 transition-all">⟳</button>
                </div>
                {strength && (
                  <div className="mt-2">
                    <div className="h-1 bg-white/[0.05] rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-500 ${strength.bar} ${strength.w}`}/>
                    </div>
                    <p className={`text-[10px] mt-1 tracking-widest ${strength.text}`}>{strength.label.toUpperCase()}</p>
                  </div>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="text-[10px] tracking-[0.2em] text-gray-600 uppercase mb-1.5 block">Category</label>
                <select value={form.category} onChange={e => setField('category', e.target.value)}
                  className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-gray-300 focus:outline-none focus:border-cyan-500/40 transition-all appearance-none">
                  {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c} className="bg-[#0d0e18]">{c}</option>)}
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="text-[10px] tracking-[0.2em] text-gray-600 uppercase mb-1.5 block">Notes</label>
                <textarea value={form.notes} onChange={e => setField('notes', e.target.value)}
                  placeholder="Security questions, backup codes, etc."
                  rows={2}
                  className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm placeholder-gray-600 focus:outline-none focus:border-cyan-500/40 transition-all resize-none"/>
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={save}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 text-black font-bold text-xs tracking-widest uppercase shadow-lg shadow-cyan-500/15 hover:opacity-90 transition-all">
                {editId ? 'Update' : 'Save Entry'}
              </button>
              <button onClick={() => { resetForm(); setShowForm(false); }}
                className="px-6 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-gray-400 hover:text-white text-xs tracking-widest uppercase transition-all">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Search + Filters */}
        <div className="flex flex-col md:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 text-sm">⌕</span>
            <input placeholder="Search by site, username, or URL..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm placeholder-gray-600 focus:outline-none focus:border-cyan-500/40 transition-all"/>
          </div>
          <button onClick={() => setFavOnly(!favOnly)}
            className={`px-4 py-2.5 rounded-xl text-xs border transition-all ${favOnly ? 'bg-yellow-500/15 border-yellow-500/30 text-yellow-400' : 'bg-white/[0.04] border-white/[0.08] text-gray-500 hover:text-yellow-400'}`}>
            ★ Favorites
          </button>
        </div>

        {/* Category pills */}
        <div className="flex gap-2 flex-wrap mb-6">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCatFilter(c)}
              className={`px-3 py-1.5 rounded-lg text-[11px] border transition-all ${
                catFilter === c
                  ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300'
                  : 'bg-white/[0.03] border-white/[0.06] text-gray-600 hover:text-gray-300'}`}>
              {c}
            </button>
          ))}
        </div>

        {/* Cards */}
        {filtered.length === 0 ? (
          <div className="text-center text-gray-600 mt-16">
            <div className="text-5xl mb-4">◈</div>
            <p className="text-sm tracking-widest">
              {data.length === 0 ? 'VAULT IS EMPTY' : 'NO RESULTS FOUND'}
            </p>
            <p className="text-xs text-gray-700 mt-2">
              {data.length === 0 ? 'Click "Add New" to store your first password' : 'Try a different search or filter'}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(item => {
              const isFav = favorites.includes(item._id);
              const catStyle = CAT_COLORS[item.category] || CAT_COLORS['Other'];
              return (
                <div key={item._id}
                  className={`group bg-[#08090f]/80 border rounded-2xl p-5 hover:border-cyan-500/20 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/5 ${isFav ? 'border-yellow-500/20' : 'border-white/[0.06]'}`}>

                  {/* Header */}
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/15 to-violet-500/15 border border-white/[0.07] flex items-center justify-center font-bold text-cyan-300 uppercase text-base shrink-0">
                      {item.site[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-sm font-semibold capitalize">{item.site}</h2>
                        {item.category && (
                          <span className={`text-[9px] px-2 py-0.5 rounded-full border ${catStyle} tracking-wide`}>
                            {item.category}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-500 truncate mt-0.5">{item.username}</p>
                      {item.url && (
                        <a href={item.url.startsWith('http') ? item.url : `https://${item.url}`}
                          target="_blank" rel="noreferrer"
                          className="text-[10px] text-cyan-700 hover:text-cyan-400 transition-colors truncate block mt-0.5">
                          ↗ {item.url.replace(/https?:\/\//, '')}
                        </a>
                      )}
                    </div>
                    {/* Favorite */}
                    <button onClick={() => toggleFav(item._id)}
                      className={`shrink-0 text-sm transition-colors ${isFav ? 'text-yellow-400' : 'text-gray-700 hover:text-yellow-400'}`}>
                      ★
                    </button>
                  </div>

                  {/* Password field */}
                  <div className="bg-white/[0.03] border border-white/[0.05] rounded-xl px-4 py-3 mb-3">
                    <p className="text-[10px] tracking-[0.2em] text-gray-600 mb-1">PASSWORD</p>
                    <p className="text-sm font-mono text-cyan-300/80 tracking-wider truncate">
                      {showPass[item._id] ? item.password : '••••••••••••'}
                    </p>
                  </div>

                  {/* Notes */}
                  {item.notes && (
                    <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl px-4 py-2.5 mb-3">
                      <p className="text-[10px] tracking-[0.2em] text-gray-600 mb-1">NOTES</p>
                      <p className="text-[11px] text-gray-500 line-clamp-2">{item.notes}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="grid grid-cols-5 gap-1.5">
                    <button onClick={() => setShowPass(p => ({ ...p, [item._id]: !p[item._id] }))}
                      title={showPass[item._id] ? 'Hide' : 'Show'}
                      className="py-2 rounded-lg bg-white/[0.04] border border-white/[0.07] text-xs text-gray-500 hover:text-white hover:border-cyan-500/25 transition-all">
                      {showPass[item._id] ? '○' : '●'}
                    </button>
                    <button onClick={() => copy(item.password, 'Password')} title="Copy password"
                      className="py-2 rounded-lg bg-white/[0.04] border border-white/[0.07] text-xs text-gray-500 hover:text-white hover:border-violet-500/25 transition-all">
                      ⧉
                    </button>
                    <button onClick={() => copy(item.username, 'Username')} title="Copy username"
                      className="py-2 rounded-lg bg-white/[0.04] border border-white/[0.07] text-xs text-gray-500 hover:text-white hover:border-blue-500/25 transition-all">
                      @
                    </button>
                    <button onClick={() => startEdit(item)} title="Edit"
                      className="py-2 rounded-lg bg-white/[0.04] border border-white/[0.07] text-xs text-gray-500 hover:text-cyan-400 hover:border-cyan-500/25 transition-all">
                      ✎
                    </button>
                    <button onClick={() => confirmDelete(item._id)} title="Delete"
                      className="py-2 rounded-lg bg-white/[0.04] border border-white/[0.07] text-xs text-gray-500 hover:text-red-400 hover:border-red-500/25 transition-all">
                      ⊗
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Delete confirm modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#0d0e18] border border-red-500/20 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
              style={{ fontFamily:"'DM Mono','Courier New',monospace" }}>
              <div className="text-center mb-5">
                <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 text-xl mx-auto mb-3">⚠</div>
                <h3 className="text-sm font-bold mb-1">Move to Trash?</h3>
                <p className="text-xs text-gray-500">This entry will be moved to trash. You can restore it later.</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-gray-400 text-xs tracking-widest uppercase hover:text-white transition-all">
                  Cancel
                </button>
                <button onClick={del}
                  className="flex-1 py-2.5 rounded-xl bg-red-500/15 border border-red-500/25 text-red-400 text-xs tracking-widest uppercase hover:bg-red-500/25 transition-all">
                  Move to Trash
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}