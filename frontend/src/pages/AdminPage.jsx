import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import API from '../api';

const TABS = [
  { key: 'dashboard', label: 'Dashboard', icon: '◈' },
  { key: 'users', label: 'Users', icon: '👥' },
  { key: 'passwords', label: 'Passwords', icon: '🔑' },
  { key: 'activity', label: 'Activity', icon: '⟳' },
  { key: 'security', label: 'Security', icon: '🛡️' },
  { key: 'system', label: 'System', icon: '⚙' },
];

function StatCard({ label, value, accent, sub }) {
  const colors = {
    cyan:   'border-cyan-500/20 text-cyan-400 bg-cyan-500/5',
    violet: 'border-violet-500/20 text-violet-400 bg-violet-500/5',
    emerald:'border-emerald-500/20 text-emerald-400 bg-emerald-500/5',
    amber:  'border-amber-500/20 text-amber-400 bg-amber-500/5',
    red:    'border-red-500/20 text-red-400 bg-red-500/5',
    orange: 'border-orange-500/20 text-orange-400 bg-orange-500/5',
  };
  const c = colors[accent] || colors.cyan;
  return (
    <div className={`rounded-2xl border ${c} p-5 backdrop-blur-sm bg-[#08090f]/80`}>
      <p className="text-[9px] tracking-[0.25em] text-gray-600 uppercase mb-2">{label}</p>
      <p className={`text-3xl font-bold tracking-tight ${c.split(' ')[1]}`}>{value}</p>
      {sub && <p className="text-[10px] text-gray-600 mt-1">{sub}</p>}
    </div>
  );
}

function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <button onClick={() => onChange(page - 1)} disabled={page <= 1}
        className="px-3 py-1.5 rounded-lg text-xs border border-white/[0.08] text-gray-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all">
        ‹ Prev
      </button>
      <span className="text-xs text-gray-600 px-3">
        {page} / {totalPages}
      </span>
      <button onClick={() => onChange(page + 1)} disabled={page >= totalPages}
        className="px-3 py-1.5 rounded-lg text-xs border border-white/[0.08] text-gray-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all">
        Next ›
      </button>
    </div>
  );
}

export default function AdminPage() {
  const [tab, setTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const token = localStorage.getItem('token');
  const headers = { authorization: token };

  // Users
  const [users, setUsers] = useState([]);
  const [usersTotal, setUsersTotal] = useState(0);
  const [usersPage, setUsersPage] = useState(1);
  const [usersPages, setUsersPages] = useState(1);
  const [userSearch, setUserSearch] = useState('');
  const [userRole, setUserRole] = useState('');

  // Passwords
  const [passwords, setPasswords] = useState([]);
  const [pwTotal, setPwTotal] = useState(0);
  const [pwPage, setPwPage] = useState(1);
  const [pwPages, setPwPages] = useState(1);
  const [pwSearch, setPwSearch] = useState('');

  // Activity
  const [logs, setLogs] = useState([]);
  const [logsPage, setLogsPage] = useState(1);
  const [logsPages, setLogsPages] = useState(1);

  // Security analytics
  const [security, setSecurity] = useState(null);
  const [health, setHealth] = useState(null);

  // User detail modal
  const [detailUser, setDetailUser] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Load stats on mount
  useEffect(() => {
    axios.get(`${API}/admin/stats`, { headers })
      .then(r => setStats(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const fetchUsers = useCallback((page, search, role) => {
    const params = new URLSearchParams({ page, limit: '10' });
    if (search) params.set('search', search);
    if (role) params.set('role', role);
    axios.get(`${API}/admin/users?${params}`, { headers })
      .then(r => { setUsers(r.data.users); setUsersTotal(r.data.total); setUsersPages(r.data.totalPages); })
      .catch(() => toast.error('Failed to load users'));
  }, []);

  const fetchPasswords = useCallback((page, search) => {
    const params = new URLSearchParams({ page, limit: '10' });
    if (search) params.set('search', search);
    axios.get(`${API}/admin/all-passwords?${params}`, { headers })
      .then(r => { setPasswords(r.data.passwords); setPwTotal(r.data.total); setPwPages(r.data.totalPages); })
      .catch(() => toast.error('Failed to load passwords'));
  }, []);

  const fetchLogs = useCallback((page) => {
    axios.get(`${API}/admin/activity?page=${page}&limit=15`, { headers })
      .then(r => { setLogs(r.data.logs); setLogsPages(r.data.totalPages); })
      .catch(() => {});
  }, []);

  const fetchSecurity = useCallback(() => {
    axios.get(`${API}/admin/security-analytics`, { headers })
      .then(r => setSecurity(r.data))
      .catch(() => {});
  }, []);

  const fetchHealth = useCallback(() => {
    axios.get(`${API}/admin/system-health`, { headers })
      .then(r => setHealth(r.data))
      .catch(() => {});
  }, []);

  // Fetch data on tab change
  useEffect(() => {
    switch (tab) {
      case 'users': fetchUsers(usersPage, userSearch, userRole); break;
      case 'passwords': fetchPasswords(pwPage, pwSearch); break;
      case 'activity': fetchLogs(logsPage); break;
      case 'security': fetchSecurity(); break;
      case 'system': fetchHealth(); break;
    }
  }, [tab]);

  // Re-fetch when page/search/filter changes
  useEffect(() => { if (tab === 'users') fetchUsers(usersPage, userSearch, userRole); }, [usersPage, userSearch, userRole]);
  useEffect(() => { if (tab === 'passwords') fetchPasswords(pwPage, pwSearch); }, [pwPage, pwSearch]);
  useEffect(() => { if (tab === 'activity') fetchLogs(logsPage); }, [logsPage]);

  const deleteUser = async (id, email) => {
    if (!window.confirm(`Delete user "${email}" and all their passwords?`)) return;
    try {
      await axios.delete(`${API}/admin/users/${id}`, { headers });
      toast.success('User deleted');
      fetchUsers(usersPage, userSearch, userRole);
      if (stats) setStats(s => ({ ...s, totalUsers: s.totalUsers - 1 }));
    } catch { toast.error('Delete failed'); }
  };

  const toggleRole = async (id, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      await axios.put(`${API}/admin/users/${id}/role`, { role: newRole }, { headers });
      toast.success(`Role changed to ${newRole}`);
      fetchUsers(usersPage, userSearch, userRole);
    } catch { toast.error('Role change failed'); }
  };

  const openDetail = async (user) => {
    setDetailLoading(true);
    setDetailUser(null);
    try {
      const r = await axios.get(`${API}/admin/users/${user._id}`, { headers });
      setDetailUser(r.data);
    } catch { toast.error('Failed to load user details'); }
    setDetailLoading(false);
  };

  const formatTime = (iso) => {
    const d = new Date(iso);
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getMonth() + 1}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const formatUptime = (s) => {
    const d = Math.floor(s / 86400);
    const h = Math.floor((s % 86400) / 3600);
    const m = Math.floor((s % 3600) / 60);
    return `${d}d ${h}h ${m}m`;
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin"/>
    </div>
  );

  return (
    <div style={{ fontFamily:"'DM Mono','Courier New',monospace" }}>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-cyan-500/20 flex items-center justify-center text-sm text-cyan-400">⚙</div>
          <div>
            <p className="text-[10px] tracking-[0.3em] text-gray-600 uppercase">Administration</p>
            <h1 className="text-2xl font-bold tracking-wide">Admin Panel</h1>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 mb-6 overflow-x-auto pb-1 scrollbar-none">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs tracking-widest uppercase transition-all border shrink-0
              ${tab === t.key
                ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30 shadow-sm shadow-cyan-500/10'
                : 'text-gray-500 border-transparent hover:text-gray-300 hover:border-white/[0.06]'}`}>
            <span className="text-sm">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* ===== DASHBOARD ===== */}
      {tab === 'dashboard' && (
        <div className="space-y-6">
          {/* Stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <StatCard label="Total Users" value={stats?.totalUsers ?? '—'} accent="cyan"/>
            <StatCard label="Passwords" value={stats?.totalPasswords ?? '—'} accent="violet"/>
            <StatCard label="Trashed" value={stats?.trashedPasswords ?? '—'} accent="amber"/>
            <StatCard label="Reused" value={stats?.reusedPasswords ?? '—'} accent="red"/>
            <StatCard label="Weak Passwords" value={stats?.weakPasswords ?? '—'} accent="orange"/>
            <StatCard label="Avg Strength" value={stats?.avgStrength != null ? `${stats.avgStrength}%` : '—'} accent="emerald"/>
          </div>

          {/* Quick actions */}
          <div className="bg-[#08090f]/90 backdrop-blur-sm border border-white/[0.07] rounded-2xl p-6">
            <p className="text-[10px] tracking-[0.25em] text-gray-500 uppercase mb-4">Quick Actions</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button onClick={() => setTab('users')}
                className="p-4 rounded-xl border border-white/[0.06] hover:border-cyan-500/20 bg-white/[0.02] hover:bg-cyan-500/5 transition-all text-left">
                <p className="text-lg mb-1">👥</p>
                <p className="text-xs font-semibold text-gray-300">Manage Users</p>
                <p className="text-[9px] text-gray-600 mt-0.5">View, edit, delete users</p>
              </button>
              <button onClick={() => setTab('passwords')}
                className="p-4 rounded-xl border border-white/[0.06] hover:border-violet-500/20 bg-white/[0.02] hover:bg-violet-500/5 transition-all text-left">
                <p className="text-lg mb-1">🔑</p>
                <p className="text-xs font-semibold text-gray-300">All Passwords</p>
                <p className="text-[9px] text-gray-600 mt-0.5">Browse stored passwords</p>
              </button>
              <button onClick={() => setTab('activity')}
                className="p-4 rounded-xl border border-white/[0.06] hover:border-amber-500/20 bg-white/[0.02] hover:bg-amber-500/5 transition-all text-left">
                <p className="text-lg mb-1">⟳</p>
                <p className="text-xs font-semibold text-gray-300">Activity Log</p>
                <p className="text-[9px] text-gray-600 mt-0.5">Review admin actions</p>
              </button>
              <button onClick={() => setTab('security')}
                className="p-4 rounded-xl border border-white/[0.06] hover:border-emerald-500/20 bg-white/[0.02] hover:bg-emerald-500/5 transition-all text-left">
                <p className="text-lg mb-1">🛡️</p>
                <p className="text-xs font-semibold text-gray-300">Security Overview</p>
                <p className="text-[9px] text-gray-600 mt-0.5">Password health analytics</p>
              </button>
            </div>
          </div>

          {/* Recent activity preview */}
          <div className="bg-[#08090f]/90 backdrop-blur-sm border border-white/[0.07] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] tracking-[0.25em] text-gray-500 uppercase">Recent Activity</p>
              <button onClick={() => setTab('activity')}
                className="text-[10px] text-cyan-500/60 hover:text-cyan-400 tracking-widest uppercase transition-colors">
                View All
              </button>
            </div>
            <RecentActivity headers={headers} API={API} />
          </div>
        </div>
      )}

      {/* ===== USERS ===== */}
      {tab === 'users' && (
        <div>
          {/* Search + filter */}
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 text-sm">⌕</span>
              <input placeholder="Search by name or email..."
                value={userSearch} onChange={e => { setUserSearch(e.target.value); setUsersPage(1); }}
                className="w-full pl-9 pr-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm placeholder-gray-600 focus:outline-none focus:border-cyan-500/40 transition-all"/>
            </div>
            <select value={userRole} onChange={e => { setUserRole(e.target.value); setUsersPage(1); }}
              className="px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-gray-400 focus:outline-none focus:border-cyan-500/40 transition-all appearance-none">
              <option value="" className="bg-[#0d0e18]">All Roles</option>
              <option value="user" className="bg-[#0d0e18]">Users</option>
              <option value="admin" className="bg-[#0d0e18]">Admins</option>
            </select>
          </div>

          <p className="text-[10px] text-gray-600 tracking-wider mb-3">{usersTotal} user{usersTotal !== 1 ? 's' : ''}</p>

          {/* User list */}
          <div className="space-y-2">
            {users.map(user => (
              <div key={user._id}
                className="bg-[#08090f]/90 backdrop-blur-xl border border-white/[0.07] rounded-xl p-4 flex items-center gap-4 hover:border-white/[0.12] transition-all">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-cyan-500/20 flex items-center justify-center font-bold text-cyan-300 shrink-0 text-sm">
                  {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold flex items-center gap-2">
                    {user.name || 'No name'}
                    {user.passwordCount > 0 && (
                      <span className="text-[9px] text-gray-600 tracking-wider">({user.passwordCount} pw)</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">{user.email}</div>
                </div>
                <span className={`text-[10px] px-2 py-1 rounded-full tracking-widest uppercase border shrink-0
                  ${user.role === 'admin' ? 'text-violet-400 border-violet-500/30 bg-violet-500/10' : 'text-gray-500 border-gray-500/30 bg-gray-500/10'}`}>
                  {user.role}
                </span>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button onClick={() => openDetail(user)}
                    className="px-3 py-1.5 rounded-lg text-[10px] tracking-widest uppercase border border-white/[0.08] text-gray-500 hover:text-cyan-400 hover:border-cyan-500/20 transition-all">
                    View
                  </button>
                  <button onClick={() => toggleRole(user._id, user.role)}
                    className="px-3 py-1.5 rounded-lg text-[10px] tracking-widest uppercase border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/10 transition-all">
                    Toggle Role
                  </button>
                  <button onClick={() => deleteUser(user._id, user.email)}
                    className="px-3 py-1.5 rounded-lg text-[10px] tracking-widest uppercase border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-all">
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {users.length === 0 && <p className="text-gray-600 text-sm text-center py-8">No users found.</p>}
          </div>

          <Pagination page={usersPage} totalPages={usersPages} onChange={setUsersPage} />
        </div>
      )}

      {/* ===== PASSWORDS ===== */}
      {tab === 'passwords' && (
        <div>
          <div className="relative mb-5">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 text-sm">⌕</span>
            <input placeholder="Search by site or username..."
              value={pwSearch} onChange={e => { setPwSearch(e.target.value); setPwPage(1); }}
              className="w-full pl-9 pr-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm placeholder-gray-600 focus:outline-none focus:border-cyan-500/40 transition-all"/>
          </div>

          <p className="text-[10px] text-gray-600 tracking-wider mb-3">{pwTotal} password{pwTotal !== 1 ? 's' : ''}</p>

          <div className="space-y-2">
            {passwords.map(pw => (
              <div key={pw._id}
                className="bg-[#08090f]/90 backdrop-blur-xl border border-white/[0.07] rounded-xl p-4 flex items-center gap-4 hover:border-white/[0.12] transition-all">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 border border-violet-500/20 flex items-center justify-center font-bold text-violet-300 shrink-0 text-sm">
                  {pw.site?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold">{pw.site}</div>
                  <div className="text-xs text-gray-500">{pw.username}</div>
                </div>
                <div className="text-[10px] text-gray-600 tracking-wider hidden sm:block">
                  {pw.owner?.email || 'Unknown'}
                </div>
                <span className={`text-[10px] px-2 py-1 rounded-full tracking-widest uppercase border shrink-0
                  ${pw.deleted
                    ? 'text-red-400 border-red-500/30 bg-red-500/10'
                    : 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'}`}>
                  {pw.deleted ? 'Trashed' : 'Active'}
                </span>
              </div>
            ))}
            {passwords.length === 0 && <p className="text-gray-600 text-sm text-center py-8">No passwords found.</p>}
          </div>

          <Pagination page={pwPage} totalPages={pwPages} onChange={setPwPage} />
        </div>
      )}

      {/* ===== ACTIVITY ===== */}
      {tab === 'activity' && (
        <div>
          <p className="text-[10px] text-gray-600 tracking-wider mb-4">Admin action history</p>
          <div className="space-y-1.5">
            {logs.map(log => (
              <div key={log._id}
                className="bg-[#08090f]/90 backdrop-blur-sm border border-white/[0.06] rounded-xl px-5 py-3 flex items-center gap-4 text-xs">
                <span className="text-[10px] text-gray-600 tracking-wider shrink-0 w-16">{formatTime(log.createdAt)}</span>
                <span className="text-cyan-400/80 font-semibold shrink-0 w-24 truncate">{log.adminEmail?.split('@')[0]}</span>
                <span className={`shrink-0 px-2 py-0.5 rounded text-[9px] tracking-widest uppercase border
                  ${log.action === 'delete_user' ? 'text-red-400 border-red-500/20 bg-red-500/10' : ''}
                  ${log.action === 'change_role' ? 'text-amber-400 border-amber-500/20 bg-amber-500/10' : ''}
                  ${!['delete_user','change_role'].includes(log.action) ? 'text-gray-500 border-gray-500/20 bg-gray-500/10' : ''}`}>
                  {log.action.replace(/_/g, ' ')}
                </span>
                <span className="text-gray-500 flex-1 min-w-0 truncate">
                  <span className="text-gray-400">{log.target}</span>
                  {log.detail && <span className="text-gray-600"> — {log.detail}</span>}
                </span>
              </div>
            ))}
            {logs.length === 0 && <p className="text-gray-600 text-sm text-center py-8">No activity recorded yet.</p>}
          </div>
          <Pagination page={logsPage} totalPages={logsPages} onChange={setLogsPage} />
        </div>
      )}

      {/* ===== SECURITY ===== */}
      {tab === 'security' && (
        <div>
          <p className="text-[10px] text-gray-600 tracking-wider mb-4">Password health across all users</p>
          {security ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              <StatCard label="Total Passwords" value={security.total} accent="cyan"/>
              <StatCard label="Strong (12+ chars)" value={security.strongCount} accent="emerald" sub={`${security.total > 0 ? Math.round(security.strongCount / security.total * 100) : 0}% of total`}/>
              <StatCard label="Weak (< 12 chars)" value={security.weakCount} accent="orange" sub={`${security.total > 0 ? Math.round(security.weakCount / security.total * 100) : 0}% of total`}/>
              <StatCard label="Reused" value={security.reusedCount} accent="red"/>

              <StatCard label="No Uppercase" value={security.noUpper} accent="amber"/>
              <StatCard label="No Digits" value={security.noDigit} accent="amber"/>
              <StatCard label="No Special Chars" value={security.noSpecial} accent="amber"/>
              <StatCard label="Short (< 8 chars)" value={security.shortCount} accent="red"/>
            </div>
          ) : (
            <div className="flex items-center justify-center h-32">
              <div className="w-5 h-5 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin"/>
            </div>
          )}
        </div>
      )}

      {/* ===== SYSTEM ===== */}
      {tab === 'system' && (
        <div>
          <p className="text-[10px] text-gray-600 tracking-wider mb-4">Server health and resource metrics</p>
          {health ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Server info */}
              <div className="bg-[#08090f]/90 backdrop-blur-sm border border-white/[0.07] rounded-2xl p-6">
                <p className="text-[10px] tracking-[0.25em] text-gray-500 uppercase mb-4">Server</p>
                <div className="space-y-3">
                  <div className="flex justify-between text-xs"><span className="text-gray-600">Node</span><span className="text-gray-300">{health.node}</span></div>
                  <div className="flex justify-between text-xs"><span className="text-gray-600">Platform</span><span className="text-gray-300">{health.platform}</span></div>
                  <div className="flex justify-between text-xs"><span className="text-gray-600">Uptime</span><span className="text-gray-300">{formatUptime(health.uptime)}</span></div>
                  <div className="flex justify-between text-xs"><span className="text-gray-600">MongoDB</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] tracking-widest uppercase border
                      ${health.mongodb === 'connected' ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10' : 'text-red-400 border-red-500/20 bg-red-500/10'}`}>
                      {health.mongodb}
                    </span>
                  </div>
                </div>
              </div>

              {/* Memory */}
              <div className="bg-[#08090f]/90 backdrop-blur-sm border border-white/[0.07] rounded-2xl p-6">
                <p className="text-[10px] tracking-[0.25em] text-gray-500 uppercase mb-4">Memory (MB)</p>
                <div className="space-y-4">
                  {[
                    { label: 'RSS', value: health.memory.rss, max: 512 },
                    { label: 'Heap Total', value: health.memory.heapTotal, max: 256 },
                    { label: 'Heap Used', value: health.memory.heapUsed, max: 256 },
                  ].map(m => (
                    <div key={m.label}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-600">{m.label}</span>
                        <span className="text-gray-300">{m.value} MB</span>
                      </div>
                      <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-500 ${m.value / m.max > 0.7 ? 'bg-orange-400' : 'bg-cyan-500'}`}
                          style={{ width: `${Math.min(100, (m.value / m.max) * 100)}%` }}/>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Timestamp */}
              <div className="md:col-span-2 bg-[#08090f]/90 backdrop-blur-sm border border-white/[0.07] rounded-2xl p-4">
                <p className="text-[10px] text-gray-600 tracking-wider">
                  Last updated: {new Date(health.timestamp).toLocaleString()}
                  <button onClick={fetchHealth}
                    className="ml-4 text-cyan-500/60 hover:text-cyan-400 transition-colors">
                    ⟳ Refresh
                  </button>
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-32">
              <div className="w-5 h-5 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin"/>
            </div>
          )}
        </div>
      )}

      {/* ===== USER DETAIL MODAL ===== */}
      {detailUser && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setDetailUser(null)}>
          <div className="bg-[#0d0e18] border border-white/[0.08] rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl"
            onClick={e => e.stopPropagation()}
            style={{ fontFamily:"'DM Mono','Courier New',monospace" }}>

            {/* Header */}
            <div className="p-6 border-b border-white/[0.06] flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-cyan-500/20 flex items-center justify-center font-bold text-xl text-cyan-300">
                {detailUser.name?.[0]?.toUpperCase() || detailUser.email?.[0]?.toUpperCase() || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold">{detailUser.name || 'No name'}</p>
                <p className="text-xs text-gray-500">{detailUser.email}</p>
              </div>
              <span className={`text-[10px] px-2 py-1 rounded-full tracking-widest uppercase border shrink-0
                ${detailUser.role === 'admin' ? 'text-violet-400 border-violet-500/30 bg-violet-500/10' : 'text-gray-500 border-gray-500/30 bg-gray-500/10'}`}>
                {detailUser.role}
              </span>
              <button onClick={() => setDetailUser(null)}
                className="text-gray-600 hover:text-white text-lg transition-colors">⊗</button>
            </div>

            {/* Password stats */}
            <div className="p-6 border-b border-white/[0.06]">
              <p className="text-[10px] tracking-[0.25em] text-gray-500 uppercase mb-3">Password Overview</p>
              {detailUser.passwordStats ? (
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <p className="text-xl font-bold text-white">{detailUser.passwordStats.total}</p>
                    <p className="text-[9px] text-gray-600 tracking-wider uppercase mt-0.5">Total</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/15">
                    <p className="text-xl font-bold text-emerald-400">{detailUser.passwordStats.strong}</p>
                    <p className="text-[9px] text-gray-600 tracking-wider uppercase mt-0.5">Strong</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-red-500/5 border border-red-500/15">
                    <p className="text-xl font-bold text-red-400">{detailUser.passwordStats.weak}</p>
                    <p className="text-[9px] text-gray-600 tracking-wider uppercase mt-0.5">Weak</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-16">
                  <div className="w-4 h-4 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin"/>
                </div>
              )}
            </div>

            {/* Passwords list */}
            <div className="p-6">
              <p className="text-[10px] tracking-[0.25em] text-gray-500 uppercase mb-3">
                Stored Passwords ({detailUser.passwords?.length || 0})
              </p>
              <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                {detailUser.passwords?.map(pw => (
                  <div key={pw._id}
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold">{pw.site}</p>
                      <p className="text-[10px] text-gray-600">{pw.username}</p>
                    </div>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full border tracking-wider uppercase
                      ${pw.deleted ? 'text-red-400 border-red-500/20 bg-red-500/10' : 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10'}`}>
                      {pw.deleted ? 'Trashed' : 'Active'}
                    </span>
                  </div>
                ))}
                {(!detailUser.passwords || detailUser.passwords.length === 0) && (
                  <p className="text-xs text-gray-600 text-center py-4">No passwords stored.</p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 pt-0 flex gap-3">
              <button onClick={() => { toggleRole(detailUser._id, detailUser.role); setDetailUser(null); }}
                className="flex-1 py-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs tracking-widest uppercase hover:bg-cyan-500/20 transition-all">
                Toggle Role
              </button>
              <button onClick={() => { deleteUser(detailUser._id, detailUser.email); setDetailUser(null); }}
                className="flex-1 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs tracking-widest uppercase hover:bg-red-500/20 transition-all">
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

/* ── Recent Activity widget (used in Dashboard tab) ── */
function RecentActivity({ headers, API }) {
  const [logs, setLogs] = useState([]);
  useEffect(() => {
    axios.get(`${API}/admin/activity?page=1&limit=5`, { headers })
      .then(r => setLogs(r.data.logs))
      .catch(() => {});
  }, []);
  if (logs.length === 0) return <p className="text-xs text-gray-600 text-center py-4">No recent activity.</p>;
  return (
    <div className="space-y-1.5">
      {logs.map(log => (
        <div key={log._id} className="flex items-center gap-3 py-1.5 text-xs">
          <span className="text-[10px] text-gray-600 w-14 shrink-0">
            {new Date(log.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
          </span>
          <span className={`px-2 py-0.5 rounded text-[9px] tracking-widest uppercase border shrink-0
            ${log.action === 'delete_user' ? 'text-red-400 border-red-500/20 bg-red-500/10' : ''}
            ${log.action === 'change_role' ? 'text-amber-400 border-amber-500/20 bg-amber-500/10' : ''}
            ${!['delete_user','change_role'].includes(log.action) ? 'text-gray-500 border-gray-500/20 bg-gray-500/10' : ''}`}>
            {log.action.replace(/_/g, ' ')}
          </span>
          <span className="text-gray-500 truncate flex-1">{log.target}</span>
        </div>
      ))}
    </div>
  );
}
