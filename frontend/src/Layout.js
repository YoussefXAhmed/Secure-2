import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';

const API = 'http://localhost:5000';

const navItems = [
  { path: '/dashboard', icon: '⬡', label: 'Dashboard'  },
  { path: '/vault',     icon: '◈', label: 'Vault'       },
  { path: '/generator', icon: '⟳', label: 'Generator'  },
  { path: '/trash',     icon: '◻', label: 'Trash'       },
  { path: '/security',  icon: '⊕', label: 'Security'   },
  { path: '/settings',  icon: '◎', label: 'Settings'    },
  { path: '/profile',   icon: '◉', label: 'Profile'     },
  { path: '/admin',     icon: '⚙', label: 'Admin'       },
];

export default function Layout({ children }) {
  const location = useLocation();
  const [profile, setProfile] = useState(null);
  const [sidebar, setSidebar] = useState(false);
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('sidebarCollapsed') === 'true');
  const token = localStorage.getItem('token');

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', collapsed);
  }, [collapsed]);

  useEffect(() => {
    if (!token) return;
    axios.get(`${API}/profile`, { headers: { authorization: token } })
      .then(r => setProfile(r.data)).catch(() => {});
  }, [token]);

  const logout = () => { localStorage.removeItem('token'); window.location.href = '/'; };
  const letter = profile?.name?.[0]?.toUpperCase() ?? profile?.email?.[0]?.toUpperCase() ?? '?';

  return (
    <div className="flex min-h-screen bg-[#050508] text-white overflow-hidden"
      style={{ fontFamily: "'DM Mono','Courier New',monospace" }}>

      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 w-[700px] h-[700px] bg-cyan-950/25 rounded-full blur-[140px]"/>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-violet-950/20 rounded-full blur-[120px]"/>
        <div className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage:'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize:'48px 48px' }}/>
      </div>

      {/* Mobile overlay */}
      {sidebar && <div className="fixed inset-0 bg-black/60 z-20 md:hidden" onClick={() => setSidebar(false)}/>}

      {/* SIDEBAR */}
      <aside className={`fixed md:relative z-30 h-screen bg-[#07080e]/95 backdrop-blur-xl border-r border-white/[0.05] flex flex-col transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] ${sidebar ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} ${collapsed ? 'w-16' : 'w-72'}`}>

        {/* Logo + collapse */}
        <div className={`h-16 border-b border-white/[0.05] flex items-center shrink-0 transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] ${collapsed ? 'justify-center px-0' : 'justify-between px-5'}`}>
          <div className={`flex items-center overflow-hidden transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] ${collapsed ? 'max-w-0 opacity-0' : 'max-w-56 opacity-100 gap-3'}`}>
            <div className="w-9 h-9 bg-gradient-to-br from-cyan-400 to-violet-500 rounded-xl flex items-center justify-center font-black text-black text-sm shadow-lg shadow-cyan-500/20 shrink-0">S</div>
            <div className="shrink-0 whitespace-nowrap">
              <div className="text-sm font-bold tracking-[0.2em]">SECURE</div>
              <div className="text-[10px] tracking-[0.3em] text-gray-500 uppercase">Vault System</div>
            </div>
          </div>
          <button onClick={() => setCollapsed(!collapsed)}
            className="flex items-center justify-center w-7 h-7 rounded-lg text-gray-500 hover:text-white hover:bg-white/[0.1] transition-all duration-200 text-xs shrink-0" title={collapsed ? 'Expand' : 'Collapse'}>
            <span className="transition-transform duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] inline-block" style={{ transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)' }}>◂</span>
          </button>
        </div>

        {/* Profile mini */}
        {profile && (
          <Link to="/profile" onClick={() => setSidebar(false)}
            className={`mx-2 mt-4 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-cyan-500/30 transition-all duration-200 group flex items-center overflow-hidden ${collapsed ? 'justify-center' : 'gap-3'}`}>
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-cyan-500/20 flex items-center justify-center font-bold text-cyan-300 shrink-0">{letter}</div>
            <div className={`overflow-hidden transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] ${collapsed ? 'max-w-0 opacity-0' : 'max-w-48 opacity-100'}`}>
              <div className="text-xs font-semibold truncate whitespace-nowrap">{profile.name || 'Set your name'}</div>
              <div className="text-[10px] text-gray-500 truncate whitespace-nowrap">{profile.email}</div>
            </div>
            <span className={`text-gray-600 group-hover:text-cyan-400 transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] text-xs shrink-0 overflow-hidden ${collapsed ? 'max-w-0 opacity-0' : 'max-w-4 opacity-100'}`}>›</span>
          </Link>
        )}

        {/* Nav */}
        <nav className="flex-1 px-2 mt-4 space-y-0.5 overflow-y-auto overflow-x-hidden"
          style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.08) transparent' }}>
          <p className={`text-[10px] tracking-[0.25em] text-gray-500 px-2 mb-3 uppercase overflow-hidden transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] ${collapsed ? 'max-h-0 opacity-0' : 'max-h-8 opacity-100'}`}>Menu</p>
          {navItems.filter(item => item.path !== '/admin' || profile?.role === 'admin').map(item => {
            const active = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} onClick={() => setSidebar(false)}
                className={`flex items-center ${collapsed ? 'justify-center w-full' : 'gap-3 px-3'} py-2.5 rounded-lg text-sm transition-all duration-200 relative group border
                  ${active
                    ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20'
                    : 'text-gray-500 hover:text-gray-200 hover:bg-white/[0.04] border-transparent'}`}
                title={collapsed ? item.label : undefined}>
                {active && <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-5 bg-cyan-400 rounded-full transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] ${collapsed ? 'opacity-0' : 'opacity-100'}`}/>}
                <span className={`${active ? 'text-cyan-400' : 'text-gray-600 group-hover:text-gray-400'} text-lg shrink-0`}>{item.icon}</span>
                <span className={`overflow-hidden whitespace-nowrap tracking-wide transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] ${collapsed ? 'max-w-0 opacity-0 ml-0' : 'max-w-32 opacity-100 ml-2'}`}>{item.label}</span>
                {active && <span className={`ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0 transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] ${collapsed ? 'opacity-0' : 'opacity-100'}`}/>}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-2 border-t border-white/[0.05] shrink-0">
          <button onClick={logout}
            className={`w-full flex items-center ${collapsed ? 'justify-center' : 'gap-3 px-3'} py-2.5 rounded-lg text-sm text-red-500/60 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-200`}
            title={collapsed ? 'Sign Out' : undefined}>
            <span className="text-lg shrink-0">⊗</span>
            <span className={`overflow-hidden whitespace-nowrap tracking-wide transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] ${collapsed ? 'max-w-0 opacity-0 ml-0' : 'max-w-24 opacity-100 ml-2'}`}>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 relative z-10 overflow-auto flex flex-col min-h-screen">
        {/* Topbar */}
        <div className="sticky top-0 z-10 h-14 bg-[#050508]/80 backdrop-blur-xl border-b border-white/[0.04] flex items-center px-6 gap-4 shrink-0">
          <button className="md:hidden text-gray-500 hover:text-white transition-colors text-lg" onClick={() => setSidebar(!sidebar)}>☰</button>
          <div className="flex-1"/>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"/>
          </div>
          {profile && (
            <Link to="/profile"
              className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-cyan-500/20 flex items-center justify-center text-xs font-bold text-cyan-300 hover:border-cyan-400/50 transition-all">
              {letter}
            </Link>
          )}
        </div>
        <div className="flex-1 p-6 md:p-8">{children}</div>
      </main>
    </div>
  );
}