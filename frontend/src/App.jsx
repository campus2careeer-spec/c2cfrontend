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

  // 1. Always check if the Auth initialization is still in progress first.
  if (loading) {
    return <LoadingSpinner />;
  }

  // 2. If loading is finished and there is no user session, go to login.
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3. DEADLOCK FIX: If we have a user but NO profile and loading is DONE, 
  // the database fetch failed or timed out. Don't spin—redirect.
  // if (!profile && !loading) {
  //   console.error("User session exists but profile fetch failed/timed out.");
  //   return <Navigate to="/login" replace />; 
  // }

  // 4. If we have a user but the profile is still being fetched (rare race condition),
  // then and only then show the spinner.
  if (!profile) {
    return <LoadingSpinner />;
  }

  // 5. Profile is loaded, but verify the role exists (edge case).
  if (!profile.role) {
    console.warn("Profile exists but no role is assigned.");
    return <LoadingSpinner />;
  }

  // 6. Role-Based Access Control (RBAC)
  // If user is in the wrong section, send them to their designated dashboard.
  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    const roleRoutes = {
      industry: "/industry",
      admin: "/admin",
      student: "/student"
    };
    return <Navigate to={roleRoutes[profile.role] || "/student"} replace />;
  }

  // 7. Everything passed!
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
