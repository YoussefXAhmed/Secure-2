import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout        from './Layout';
import LoginPage     from './pages/LoginPage';
import SignupPage    from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import VaultPage     from './pages/VaultPage';
import TrashPage     from './pages/TrashPage';
import SettingsPage  from './pages/SettingsPage';
import ProfilePage   from './pages/ProfilePage';
import GeneratorPage from './pages/GeneratorPage';
import SecurityPage  from './pages/SecurityPage';
import AdminPage     from './pages/AdminPage';
import InactivityLock from './components/InactivityLock';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/" replace />;
}

function AppLayout({ children }) {
  const location = useLocation();
  const noLayout = location.pathname === '/' || location.pathname === '/signup';
  if (noLayout) return children;
  return <Layout>{children}</Layout>;
}

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#0d0e18',
            color: '#e2e8f0',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
            fontFamily: "'DM Mono', monospace",
            fontSize: '12px',
            letterSpacing: '0.05em',
          },
          success: { iconTheme: { primary: '#22d3ee', secondary: '#0d0e18' } },
          error:   { iconTheme: { primary: '#f87171', secondary: '#0d0e18' } },
        }}
      />
      <InactivityLock>
        <AppLayout>
          <Routes>
            <Route path="/"          element={<LoginPage />} />
            <Route path="/signup"    element={<SignupPage />} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/vault"     element={<ProtectedRoute><VaultPage /></ProtectedRoute>} />
            <Route path="/trash"     element={<ProtectedRoute><TrashPage /></ProtectedRoute>} />
            <Route path="/settings"  element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            <Route path="/profile"   element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/generator" element={<ProtectedRoute><GeneratorPage /></ProtectedRoute>} />
            <Route path="/security"  element={<ProtectedRoute><SecurityPage /></ProtectedRoute>} />
            <Route path="/admin"     element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
          </Routes>
        </AppLayout>
      </InactivityLock>
    </BrowserRouter>
  );
}

export default App;