import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../AuthContext";
import "../styles/Login.css";

export default function Login() {
  const [role, setRole] = useState("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn, signInWithGoogle, user, profile, loading } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user && profile) {
      if (profile.role === "industry") navigate("/industry", { replace: true });
      else if (profile.role === "admin") navigate("/admin", { replace: true });
      else navigate("/student", { replace: true });
    }
  }, [user, profile, loading, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await signIn({ email, password });
      // Auth state listener in AuthContext will handle redirect
    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials.");
    }
    setIsLoading(false);
  };

  const handleGoogleLogin = async () => {
    setError("");
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err.message || "Google login failed. Please try again.");
    }
  };

  return (
    <div className="login-page">
      {/* Ambient orbs */}
      <div className="login-orb" style={{ width: 400, height: 400, background: "rgba(79,70,229,0.12)", top: "-10%", left: "-5%" }} />
      <div className="login-orb" style={{ width: 300, height: 300, background: "rgba(124,58,237,0.1)", bottom: "-5%", right: "10%" }} />

      <motion.div
        className="login-card"
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Left hero */}
        <div className="login-hero">
          <div className="login-hero-ring" />
          <div className="login-hero-ring" />
          <div className="login-hero-ring" />
          <h1>Campus<br />2Career</h1>
          <p>Bridging the gap between academic excellence and professional opportunity.</p>
        </div>

        {/* Right form */}
        <div className="login-form-side">
          <div className="login-form-title">Welcome Back</div>
          <div className="login-form-sub">Sign in to your {role === "student" ? "student" : "industry"} portal</div>

          {/* Role tabs */}
          <div className="role-tabs">
            <motion.div
              className="role-slider"
              animate={{ x: role === "student" ? 0 : "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
            <button className={`role-tab ${role === "student" ? "active" : ""}`} onClick={() => setRole("student")}>
              🎓 Student
            </button>
            <button className={`role-tab ${role === "industry" ? "active" : ""}`} onClick={() => setRole("industry")}>
              🏢 Industry
            </button>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div className="login-error"
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                ⚠️ {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleLogin}>
            <div className="login-field-group">
              <label className="login-label">Email Address</label>
              <div className="login-input-wrapper">
                <span className="input-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                </span>
                <input
                  className="login-input with-icon"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="login-field-group">
              <div className="login-label-row">
                <label className="login-label">Enter Password</label>
                <a href="#" className="forgot-link">Forgot Access?</a>
              </div>
              <div className="login-input-wrapper">
                <span className="input-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                </span>
                <input
                  className="login-input with-icon"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                  )}
                </button>
              </div>
            </div>

            <button className="login-submit green-btn" type="submit" disabled={isLoading}>
              {isLoading ? "Signing in…" : "Login"}
            </button>
          </form>

          <div className="login-divider">OR CONNECT VIA</div>

          <button className="login-google-btn" onClick={handleGoogleLogin}>
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Sync with Google
          </button>

          <div className="login-footer">
            Don't have an account?{" "}
            <a onClick={() => navigate("/register")}>Signup</a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
