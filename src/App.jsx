import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./AuthContext";
import Landing         from "./pages/Landing";
import Login           from "./pages/Login";
import Register        from "./pages/Register";
import StudentDashboard  from "./pages/StudentDashboard";
import IndustryDashboard from "./pages/IndustryDashboard";
import AdminDashboard    from "./pages/AdminDashboard";

// ─── Loading spinner (unchanged) ─────────────────────────────────────────────
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

// ─── Protected Route ──────────────────────────────────────────────────────────
// Uses authUser (id + email + role only) from AuthContext.
// Full profile data is fetched inside each dashboard from the Python backend.
function ProtectedRoute({ children, allowedRoles }) {
  const { user, authUser, loading } = useAuth();

  // 1. Auth still initialising
  if (loading) return <LoadingSpinner />;

  // 2. No Supabase session → go to login
  if (!user) return <Navigate to="/login" replace />;

  // 3. Session exists but authUser (role row) not yet fetched
  //    This is a brief race — spinner, not redirect
  if (!authUser) return <LoadingSpinner />;

  // 4. Role missing in DB — something is wrong with the account
  if (!authUser.role) {
    console.warn("authUser has no role assigned:", authUser);
    // Send to login; user should re-register or contact support
    return <Navigate to="/login" replace />;
  }

  // 5. RBAC — wrong role for this route → redirect to correct dashboard
  if (allowedRoles && !allowedRoles.includes(authUser.role)) {
    const roleRoutes = { industry: "/industry", admin: "/admin", student: "/student" };
    return <Navigate to={roleRoutes[authUser.role] || "/student"} replace />;
  }

  // 6. All good — render the dashboard
  return children;
}

// ─── App ─────────────────────────────────────────────────────────────────────
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/"        element={<Landing />} />
          <Route path="/login"   element={<Login />} />
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
