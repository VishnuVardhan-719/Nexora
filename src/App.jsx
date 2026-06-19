import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import ErrorBoundary from './components/ui/ErrorBoundary';

// ── Code-splitting (CO5 / CO6): each page loads as a separate JS chunk ──
const Landing         = lazy(() => import('./pages/Landing'));
const Auth            = lazy(() => import('./pages/Auth'));
const StudentDashboard = lazy(() => import('./pages/student/StudentDashboard'));
const AdminDashboard   = lazy(() => import('./pages/admin/AdminDashboard'));
const Toast           = lazy(() => import('./components/ui/Toast'));

/* ── Page-level loading fallback ── */
function PageLoader() {
  return (
    <div style={{
      position: 'fixed', inset: 0,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg, #0b0f19)',
      gap: 20, zIndex: 9999,
    }}>
      {/* Glowing orb */}
      <div style={{
        width: 56, height: 56, borderRadius: '50%',
        background: 'linear-gradient(135deg,#4f8ef7,#7c3aed)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 24, color: '#fff',
        boxShadow: '0 0 32px rgba(79,142,247,0.5)',
        animation: 'nex-pulse 1.4s ease-in-out infinite',
      }}>
        <i className="fas fa-graduation-cap" />
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '1.05rem', letterSpacing: 0.5 }}>
          Nexora
        </div>
        <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: 4 }}>
          Loading…
        </div>
      </div>
      <style>{`
        @keyframes nex-pulse {
          0%,100% { box-shadow: 0 0 20px rgba(79,142,247,0.4); transform: scale(1); }
          50%      { box-shadow: 0 0 48px rgba(124,58,237,0.7); transform: scale(1.08); }
        }
      `}</style>
    </div>
  );
}

function ProtectedRoute({ children, role }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/auth" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <ErrorBoundary fallbackLabel="application">
      <Suspense fallback={<PageLoader />}>
        <Toast />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route
            path="/student/*"
            element={
              <ProtectedRoute role="student">
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
