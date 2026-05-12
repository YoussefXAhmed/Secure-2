import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API = 'http://localhost:5000';

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [passwords, setPasswords] = useState([]);
  const [tab, setTab] = useState('users');
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');
  const headers = { authorization: token };

  useEffect(() => {
    Promise.all([
      axios.get(`${API}/admin/users`, { headers }),
      axios.get(`${API}/admin/all-passwords`, { headers }),
    ]).then(([u, p]) => {
      setUsers(u.data);
      setPasswords(p.data);
    }).catch(() => toast.error('Failed to load admin data'))
      .finally(() => setLoading(false));
  }, []);

  const deleteUser = async (id, email) => {
    if (!window.confirm(`Delete user "${email}" and all their passwords?`)) return;
    try {
      await axios.delete(`${API}/admin/users/${id}`, { headers });
      setUsers(users.filter(u => u._id !== id));
      setPasswords(passwords.filter(p => p.userId !== id));
      toast.success('User deleted');
    } catch { toast.error('Delete failed'); }
  };

  const toggleRole = async (id, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      const res = await axios.put(`${API}/admin/users/${id}/role`, { role: newRole }, { headers });
      setUsers(users.map(u => u._id === id ? res.data : u));
      toast.success(`Role changed to ${newRole}`);
    } catch { toast.error('Role change failed'); }
  };

  if (loading) return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin"/>
      </div>
  );

  return (
      <div style={{ fontFamily:"'DM Mono','Courier New',monospace" }}>
        <div className="mb-8">
          <p className="text-[10px] tracking-[0.3em] text-gray-600 uppercase mb-1">Administration</p>
          <h1 className="text-2xl font-bold tracking-wide">Admin Panel</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button onClick={() => setTab('users')}
            className={`px-5 py-2 rounded-lg text-xs tracking-widest uppercase transition-all border
              ${tab === 'users' ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30' : 'text-gray-500 border-transparent hover:text-gray-300'}`}>
            Users ({users.length})
          </button>
          <button onClick={() => setTab('passwords')}
            className={`px-5 py-2 rounded-lg text-xs tracking-widest uppercase transition-all border
              ${tab === 'passwords' ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30' : 'text-gray-500 border-transparent hover:text-gray-300'}`}>
            All Passwords ({passwords.length})
          </button>
        </div>

        {tab === 'users' && (
          <div className="space-y-2">
            {users.map(user => (
              <div key={user._id}
                className="bg-[#08090f]/90 backdrop-blur-xl border border-white/[0.07] rounded-xl p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-cyan-500/20 flex items-center justify-center font-bold text-cyan-300 shrink-0">
                  {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold">{user.name || 'No name'}</div>
                  <div className="text-xs text-gray-500">{user.email}</div>
                </div>
                <span className={`text-[10px] px-2 py-1 rounded-full tracking-widest uppercase border
                  ${user.role === 'admin' ? 'text-violet-400 border-violet-500/30 bg-violet-500/10' : 'text-gray-500 border-gray-500/30 bg-gray-500/10'}`}>
                  {user.role}
                </span>
                <button onClick={() => toggleRole(user._id, user.role)}
                  className="px-3 py-1.5 rounded-lg text-[10px] tracking-widest uppercase border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/10 transition-all">
                  Toggle Role
                </button>
                <button onClick={() => deleteUser(user._id, user.email)}
                  className="px-3 py-1.5 rounded-lg text-[10px] tracking-widest uppercase border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-all">
                  Delete
                </button>
              </div>
            ))}
            {users.length === 0 && <p className="text-gray-500 text-sm">No users found.</p>}
          </div>
        )}

        {tab === 'passwords' && (
          <div className="space-y-2">
            {passwords.map(pw => {
              const owner = users.find(u => u._id === pw.userId);
              return (
                <div key={pw._id}
                  className="bg-[#08090f]/90 backdrop-blur-xl border border-white/[0.07] rounded-xl p-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold">{pw.site}</div>
                    <div className="text-xs text-gray-500">{pw.username}</div>
                  </div>
                  <span className="text-[10px] text-gray-600 tracking-wider">
                    {owner?.email || 'Unknown'}
                  </span>
                  <span className="text-[10px] px-2 py-1 rounded-full border border-gray-500/20 text-gray-500">
                    {pw.deleted ? 'Trashed' : 'Active'}
                  </span>
                </div>
              );
            })}
            {passwords.length === 0 && <p className="text-gray-500 text-sm">No passwords stored.</p>}
          </div>
        )}
      </div>
  );
}
