import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./AuthContext";

import Landing from "./pages/Landing"; // Changed 'landing' to 'Landing'
import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentDashboard from "./pages/StudentDashboard";
import IndustryDashboard from "./pages/IndustryDashboard";
import AdminDashboard from "./pages/AdminDashboard";

const LoadingSpinner = () => (
  <div style={{
    height: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
    background: "#0a0c14", flexDirection: "column", gap: "1rem",
    fontFamily: "'DM Sans', sans-serif",
  }}>
    <div style={{
      fontSize: "1.8rem", fontWeight: 800, letterSpacing: "-0.04em",
      background: "linear-gradient(135deg, #6c63ff, #a78bfa)",
      WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
    }}>
      Campus2Career
    </div>
    <div style={{
      width: 36, height: 36, border: "3px solid rgba(108,99,255,0.15)",
      borderTopColor: "#6c63ff", borderRadius: "50%",
      animation: "spin 0.8s linear infinite",
    }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

function ProtectedRoute({ children, allowedRoles }) {
  const { user, profile, loading } = useAuth();

  // 1. Auth is still initializing
  if (loading) return <LoadingSpinner />;

  // 2. Not logged in at all
  if (!user) return <Navigate to="/login" replace />;

  // ✅ FIX: If user exists but profile hasn't loaded yet — keep showing spinner.
  // Previously this fell through and rendered the wrong dashboard.
  if (!profile) return <LoadingSpinner />;

  // 3. Profile loaded but role not yet set (edge case during signup)
  if (!profile.role) return <LoadingSpinner />;

  // 4. Logged in but accessing wrong role's route — redirect to correct one
  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    if (profile.role === "industry") return <Navigate to="/industry" replace />;
    if (profile.role === "admin") return <Navigate to="/admin" replace />;
    return <Navigate to="/student" replace />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/industry"
            element={
              <ProtectedRoute allowedRoles={["industry"]}>
                <IndustryDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
