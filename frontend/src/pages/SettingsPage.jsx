import { useState } from 'react';
import axios from 'axios';
import Layout from '../Layout';
import toast from 'react-hot-toast';

const API = "http://localhost:5000";

function Field({ label, type = 'password', value, onChange, placeholder }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="text-[10px] tracking-[0.2em] text-gray-500 uppercase mb-1.5 block">{label}</label>
      <div className="relative">
        <input
          type={type === 'password' ? (show ? 'text' : 'password') : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full px-4 py-3 pr-12 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm placeholder-gray-600 focus:outline-none focus:border-cyan-500/40 focus:bg-cyan-500/[0.03] transition-all"
        />
        {type === 'password' && (
          <button type="button" onClick={() => setShow(!show)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 text-sm">
            {show ? '○' : '●'}
          </button>
        )}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [oldPassword, setOld] = useState('');
  const [newPassword, setNew] = useState('');
  const [confirm, setConfirm] = useState('');
  const token = localStorage.getItem('token');

  const changePassword = async () => {
    if (!oldPassword || !newPassword || !confirm) return toast.error('Fill all fields');
    if (newPassword !== confirm) return toast.error("New passwords don't match");
    if (newPassword.length < 8) return toast.error('Password must be 8+ characters');
    try {
      await axios.put(`${API}/change-password`, { oldPassword, newPassword },
        { headers: { authorization: token } });
      toast.success('Password updated ✓');
      setOld(''); setNew(''); setConfirm('');
    } catch {
      toast.error('Wrong current password');
    }
  };

  const exportData = async () => {
    try {
      const r = await axios.get(`${API}/passwords`, { headers: { authorization: token } });
      const blob = new Blob([JSON.stringify(r.data, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `secure-export-${Date.now()}.json`;
      a.click();
      toast.success('Exported ✓');
    } catch { toast.error('Export failed'); }
  };

  return (
    <Layout>
      <div style={{ fontFamily:"'DM Mono','Courier New',monospace" }}>
        <div className="mb-8">
          <p className="text-[10px] tracking-[0.3em] text-gray-600 uppercase mb-1">Configuration</p>
          <h1 className="text-2xl font-bold tracking-wide">Settings</h1>
        </div>

        <div className="max-w-xl space-y-6">

          {/* Change password */}
          <div className="bg-[#08090f]/90 backdrop-blur-xl border border-white/[0.07] rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 text-sm">◎</div>
              <div>
                <h2 className="text-sm font-semibold">Change Password</h2>
                <p className="text-[10px] text-gray-600">Update your master password</p>
              </div>
            </div>

            <div className="space-y-4">
              <Field label="Current Password" value={oldPassword} onChange={e => setOld(e.target.value)} placeholder="Enter current password"/>
              <Field label="New Password"     value={newPassword} onChange={e => setNew(e.target.value)} placeholder="Min. 8 characters"/>
              <Field label="Confirm New"      value={confirm}     onChange={e => setConfirm(e.target.value)} placeholder="Repeat new password"/>
            </div>

            <button onClick={changePassword}
              className="mt-5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 text-black font-bold text-xs tracking-widest uppercase shadow-lg shadow-cyan-500/15 hover:opacity-90 transition-all">
              Update Password
            </button>
          </div>

          {/* Export */}
          <div className="bg-[#08090f]/90 backdrop-blur-xl border border-white/[0.07] rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 text-sm">⬡</div>
              <div>
                <h2 className="text-sm font-semibold">Export Data</h2>
                <p className="text-[10px] text-gray-600">Download all passwords as JSON</p>
              </div>
            </div>
            <button onClick={exportData}
              className="px-6 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-gray-300 hover:text-white hover:border-violet-500/30 text-xs tracking-widest uppercase transition-all">
              ↓ Export Vault
            </button>
          </div>

          {/* Danger zone */}
          <div className="bg-[#08090f]/90 backdrop-blur-xl border border-red-500/15 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 text-sm">⚠</div>
              <div>
                <h2 className="text-sm font-semibold text-red-400">Danger Zone</h2>
                <p className="text-[10px] text-gray-600">Irreversible actions</p>
              </div>
            </div>
            <button
              onClick={() => { if (window.confirm('Delete your account? This is permanent.')) toast.error('Contact support to delete account'); }}
              className="px-6 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-xs tracking-widest uppercase transition-all">
              ⊗ Delete Account
            </button>
          </div>

        </div>
      </div>
    </Layout>
  );
}
