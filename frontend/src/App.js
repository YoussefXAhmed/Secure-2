import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LoginPage      from './pages/LoginPage';
import SignupPage     from './pages/SignupPage';
import DashboardPage  from './pages/DashboardPage';
import VaultPage      from './pages/VaultPage';
import TrashPage      from './pages/TrashPage';
import SettingsPage   from './pages/SettingsPage';
import ProfilePage    from './pages/ProfilePage';
import GeneratorPage  from './pages/GeneratorPage';
import SecurityPage   from './pages/SecurityPage';
import InactivityLock from './components/InactivityLock';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/" replace />;
}

function App() {
  const token = localStorage.getItem('token');
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
        <Routes>
          <Route path="/"          element={token ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
          <Route path="/signup"    element={token ? <Navigate to="/dashboard" replace /> : <SignupPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/vault"     element={<ProtectedRoute><VaultPage /></ProtectedRoute>} />
          <Route path="/trash"     element={<ProtectedRoute><TrashPage /></ProtectedRoute>} />
          <Route path="/settings"  element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="/profile"   element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/generator" element={<ProtectedRoute><GeneratorPage /></ProtectedRoute>} />
          <Route path="/security"  element={<ProtectedRoute><SecurityPage /></ProtectedRoute>} />
        </Routes>
      </InactivityLock>
    </BrowserRouter>
  );
}

export default App;