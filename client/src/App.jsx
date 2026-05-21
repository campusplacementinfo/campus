 import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./AuthContext";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import StudentDashboard from "./pages/dashboards/StudentDashboard";
import AdminDashboard from "./pages/dashboards/AdminDashboard";
import CompanyDashboard from "./pages/dashboards/CompanyDashboard";

import ConnectionStatus from "./components/ConnectionStatus";

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, hasRole, loading } = useAuth();

  if (loading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.some(role => hasRole(role))) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// App Routes Component (needs to be inside AuthProvider)
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

      <Route
        path="/student/dashboard"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/company/dashboard"
        element={
          <ProtectedRoute allowedRoles={['company']}>
            <CompanyDashboard />
          </ProtectedRoute>
        }
      />

      {/* Backward compatibility redirects */}
      <Route path="/student" element={<Navigate to="/student/dashboard" replace />} />
      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/company" element={<Navigate to="/company/dashboard" replace />} />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <ConnectionStatus />
        <AppRoutes />
      </AuthProvider>
    </HashRouter>
  );
}

export default App;