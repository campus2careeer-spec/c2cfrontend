import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../AuthContext";
import "../styles/Register.css";

export default function Register() {
  const [role, setRole] = useState("student");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { signUp, signInWithGoogle, user, profile, loading } = useAuth();

  const [form, setForm] = useState({
    fullName: "", email: "", password: "", confirmPassword: "",
    qualification: "", location: "", companyName: "", domain: "",
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  useEffect(() => {
    if (!loading && user && profile) {
      if (profile.role === "industry") navigate("/industry", { replace: true });
      else navigate("/student", { replace: true });
    }
  }, [user, profile, loading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);
    try {
      const extra = role === "student"
        ? { qualification: form.qualification, location: form.location }
        : { company_name: form.companyName, domain: form.domain, location: form.location };

      await signUp({
        email: form.email,
        password: form.password,
        fullName: form.fullName,
        role,
        extra,
      });
      setSuccess("Account created! Check your email to confirm, then log in.");
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    }
    setIsLoading(false);
  };

  const handleGoogleReg = async () => {
    setError("");
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err.message || "Google sign-up failed.");
    }
  };

  return (
    <div className="reg-page">
      <button className="back-home-btn" onClick={() => navigate("/")}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"></path><polyline points="12 19 5 12 12 5"></polyline></svg>
        Back to Home
      </button>

      <motion.div
        className="reg-card"
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="reg-hero">
          <h1>Join<br />Campus2Career</h1>
          <p>Create your account and start bridging the gap between campus and career.</p>
        </div>

        <div className="reg-form-side">
          <div className="reg-title">Create Account</div>
          <div className="reg-sub">Join as a {role === "student" ? "Student" : "Industry Partner"}</div>

          <div className="reg-tabs">
            <motion.div
              className="reg-slider"
              animate={{ x: role === "student" ? 0 : "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
            <button className={`reg-tab ${role === "student" ? "active" : ""}`} onClick={() => setRole("student")}>
              🎓 Student
            </button>
            <button className={`reg-tab ${role === "industry" ? "active" : ""}`} onClick={() => setRole("industry")}>
              🏢 Industry
            </button>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div className="reg-error"
                initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                ⚠️ {error}
              </motion.div>
            )}
            {success && (
              <motion.div className="reg-success"
                initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                ✅ {success}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit}>
            <div className="reg-row">
              <div className="reg-field">
                <label className="reg-label">Full Name</label>
                <input className="reg-input" name="fullName" placeholder="John Doe" value={form.fullName} onChange={handleChange} required />
              </div>
              <div className="reg-field">
                <label className="reg-label">Email</label>
                <input className="reg-input" name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
              </div>
            </div>

            {role === "student" ? (
              <div className="reg-row">
                <div className="reg-field">
                  <label className="reg-label">Qualification</label>
                  <input className="reg-input" name="qualification" placeholder="e.g. B.Tech CSE" value={form.qualification} onChange={handleChange} />
                </div>
                <div className="reg-field">
                  <label className="reg-label">City / Location</label>
                  <input className="reg-input" name="location" placeholder="Your city" value={form.location} onChange={handleChange} />
                </div>
              </div>
            ) : (
              <div className="reg-row">
                <div className="reg-field">
                  <label className="reg-label">Company Name</label>
                  <input className="reg-input" name="companyName" placeholder="Company name" value={form.companyName} onChange={handleChange} required />
                </div>
                <div className="reg-field">
                  <label className="reg-label">Domain / Industry</label>
                  <input className="reg-input" name="domain" placeholder="e.g. IT Services" value={form.domain} onChange={handleChange} />
                </div>
              </div>
            )}

            <div className="reg-row">
              <div className="reg-field">
                <label className="reg-label">Password</label>
                <div className="reg-input-wrapper">
                  <input className="reg-input" name="password" type={showPassword ? "text" : "password"} placeholder="Min 6 characters" value={form.password} onChange={handleChange} required minLength={6} />
                  <button type="button" className="reg-password-toggle" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                    )}
                  </button>
                </div>
              </div>
              <div className="reg-field">
                <label className="reg-label">Confirm Password</label>
                <div className="reg-input-wrapper">
                  <input className="reg-input" name="confirmPassword" type={showConfirmPassword ? "text" : "password"} placeholder="Re-enter password" value={form.confirmPassword} onChange={handleChange} required />
                  <button type="button" className="reg-password-toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <button className="reg-submit" type="submit" disabled={isLoading}>
              {isLoading ? "Creating Account…" : "CREATE ACCOUNT"}
            </button>
          </form>

          <div className="reg-divider">OR CONNECT VIA</div>

          <button className="reg-google-btn" onClick={handleGoogleReg}>
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Sign up with Google
          </button>

          <div className="reg-footer">
            Already have an account? <a onClick={() => navigate("/login")}>Sign in</a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}