import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Explore from './pages/Explore'; // force cache update
import TaskDetail from './pages/TaskDetail';
import ActiveTask from './pages/ActiveTask';
import MyTasks from './pages/MyTasks';
import Messages from './pages/Messages';
import AdminMetrics from './pages/AdminMetrics';
import AdminUsers from './pages/AdminUsers';
import AdminApprovals from './pages/AdminApprovals';
import AdminCategories from './pages/AdminCategories';
import AdminLogin from './pages/AdminLogin';
import PostTask from './pages/PostTask';
import Wallet from './pages/Wallet';
import Profile from './pages/Profile'; // force cache update
import Upgrade from './pages/Upgrade';
import Login from './pages/Login';
import Register from './pages/Register';
import CompleteProfile from './pages/CompleteProfile';
import ErrorBoundary from './components/ErrorBoundary';
import { AppLayout, TopNavLayout } from './components/Layout';
import { useAuth } from './contexts/AuthContext';
import { ensureInitialCategories } from './services/api';

function ProtectedRoute({ children, requireComplete = true, requireAdmin = false }: { children: React.ReactNode, requireComplete?: boolean, requireAdmin?: boolean }) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();
  
  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-indigo-600 gap-4">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="font-bold text-sm tracking-widest uppercase opacity-50">Sincronizando...</p>
      </div>
    );
  }

  if (!user || user.isAnonymous) return <Navigate to="/login" replace />;
  
  // Strict check for onboarding
  if (requireComplete && profile?.status === 'incomplete' && location.pathname !== '/complete-profile') {
    return <Navigate to="/complete-profile" replace />;
  }

  // Admin protection
  if (requireAdmin && profile?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}

export default function App() {
  React.useEffect(() => {
    ensureInitialCategories();
  }, []);

  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Admin Exclusive Login */}
          <Route path="/admin-setup" element={<AdminLogin />} />

          {/* Rutas Públicas */}
          <Route path="/" element={<TopNavLayout><Home /></TopNavLayout>} />
          
          {/* Onboarding */}
          <Route path="/complete-profile" element={
            <ProtectedRoute requireComplete={false}>
              <CompleteProfile />
            </ProtectedRoute>
          } />

          {/* Rutas Protegidas Normales */}
          <Route path="/explore" element={<ProtectedRoute><AppLayout><Explore /></AppLayout></ProtectedRoute>} />
          <Route path="/tasks/:id" element={<ProtectedRoute><AppLayout><TaskDetail /></AppLayout></ProtectedRoute>} />
          <Route path="/my-tasks/:id/active" element={<ProtectedRoute><ActiveTask /></ProtectedRoute>} />
          <Route path="/my-tasks" element={<ProtectedRoute><AppLayout><MyTasks /></AppLayout></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><AppLayout><Messages /></AppLayout></ProtectedRoute>} />
          <Route path="/post-task" element={<ProtectedRoute><AppLayout><PostTask /></AppLayout></ProtectedRoute>} />
          <Route path="/edit-task/:id" element={<ProtectedRoute><AppLayout><PostTask /></AppLayout></ProtectedRoute>} />
          <Route path="/wallet" element={<ProtectedRoute><AppLayout><Wallet /></AppLayout></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><AppLayout><Profile /></AppLayout></ProtectedRoute>} />
          <Route path="/upgrade" element={<ProtectedRoute><AppLayout><Upgrade /></AppLayout></ProtectedRoute>} />
          
          {/* Rutas Protegidas Administrador */}
          <Route path="/admin/metrics" element={<ProtectedRoute requireAdmin><AppLayout><AdminMetrics /></AppLayout></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute requireAdmin><AppLayout><AdminUsers /></AppLayout></ProtectedRoute>} />
          <Route path="/admin/approvals" element={<ProtectedRoute requireAdmin><AppLayout><AdminApprovals /></AppLayout></ProtectedRoute>} />
          <Route path="/admin/categories" element={<ProtectedRoute requireAdmin><AppLayout><AdminCategories /></AppLayout></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}
