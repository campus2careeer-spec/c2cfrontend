import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../AuthContext";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap');

.reg-page {
  min-height: 100vh; display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
  padding: 1.5rem; position: relative; overflow: hidden;
  font-family: 'DM Sans', sans-serif;
}
.reg-page::before {
  content: ''; position: absolute; top: -50%; left: -50%;
  width: 200%; height: 200%;
  background: radial-gradient(ellipse at 70% 30%, rgba(16,185,129,0.12) 0%, transparent 50%),
              radial-gradient(ellipse at 30% 70%, rgba(79,70,229,0.1) 0%, transparent 50%);
  animation: auroraR 18s ease-in-out infinite alternate;
}
@keyframes auroraR { 0% { transform: translate(0,0); } 100% { transform: translate(3%,-2%); } }

.reg-card {
  position: relative; z-index: 10; display: flex; width: 100%; max-width: 1020px;
  background: rgba(255,255,255,0.04); backdrop-filter: blur(40px) saturate(1.5);
  border: 1px solid rgba(255,255,255,0.08); border-radius: 28px;
  box-shadow: 0 32px 80px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06);
  overflow: hidden;
}
.reg-hero {
  width: 42%; display: flex; flex-direction: column; align-items: center;
  justify-content: center; padding: 3rem 2.5rem; position: relative; overflow: hidden;
  background: linear-gradient(135deg, rgba(16,185,129,0.15), rgba(79,70,229,0.15));
  border-right: 1px solid rgba(255,255,255,0.06);
}
.reg-hero h1 {
  font-family: 'Syne', sans-serif; font-size: 2.2rem; font-weight: 800;
  color: white; text-align: center; line-height: 1.1; letter-spacing: -0.03em;
  position: relative; z-index: 2;
}
.reg-hero p {
  color: rgba(255,255,255,0.5); font-size: 0.85rem; text-align: center;
  margin-top: 0.8rem; line-height: 1.5; position: relative; z-index: 2;
}
.reg-form-side {
  flex: 1; padding: 2.5rem 2.8rem; display: flex; flex-direction: column;
  justify-content: center; background: rgba(255,255,255,0.97); border-radius: 0 28px 28px 0;
  overflow-y: auto; max-height: 92vh;
}
.reg-title {
  font-family: 'Syne', sans-serif; font-size: 1.65rem; font-weight: 800;
  color: #0f172a; margin-bottom: 0.2rem; letter-spacing: -0.03em;
}
.reg-sub { font-size: 0.82rem; color: #64748b; margin-bottom: 1.4rem; }
.reg-tabs {
  display: flex; background: #f1f5f9; padding: 4px; border-radius: 14px;
  margin-bottom: 1.3rem; position: relative; border: 1px solid #e2e8f0;
}
.reg-tab {
  flex: 1; padding: 0.6rem; text-align: center; font-size: 0.8rem; font-weight: 700;
  cursor: pointer; border-radius: 11px; z-index: 2; position: relative;
  color: #64748b; transition: color 0.2s; border: none; background: none;
  font-family: 'DM Sans', sans-serif;
}
.reg-tab.active { color: white; }
.reg-slider {
  position: absolute; top: 4px; bottom: 4px; left: 4px;
  width: calc(50% - 4px); border-radius: 11px;
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  box-shadow: 0 4px 12px rgba(79,70,229,0.3);
}
.reg-google-btn {
  width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.6rem;
  padding: 0.72rem; background: white; border: 1.5px solid #e2e8f0; border-radius: 12px;
  font-family: 'DM Sans', sans-serif; font-size: 0.82rem; font-weight: 600;
  color: #334155; cursor: pointer; transition: 0.2s; margin-bottom: 1rem;
}
.reg-google-btn:hover { border-color: #4f46e5; background: #fafbff; }
.reg-divider {
  display: flex; align-items: center; gap: 0.6rem; margin-bottom: 1rem;
  font-size: 0.7rem; color: #94a3b8; font-weight: 600; letter-spacing: 0.06em;
}
.reg-divider::before, .reg-divider::after { content: ''; flex: 1; height: 1px; background: #e2e8f0; }
.reg-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.7rem; }
.reg-field { margin-bottom: 0.7rem; }
.reg-label { display: block; font-size: 0.7rem; font-weight: 700; color: #64748b; margin-bottom: 0.25rem; letter-spacing: 0.04em; text-transform: uppercase; }
.reg-input {
  width: 100%; padding: 0.72rem 0.9rem; border: 1.5px solid #e2e8f0; border-radius: 11px;
  background: #fafbff; font-family: 'DM Sans', sans-serif; font-size: 0.84rem;
  color: #0f172a; outline: none; transition: 0.25s;
}
.reg-input:focus { border-color: #4f46e5; background: white; box-shadow: 0 0 0 3px rgba(79,70,229,0.08); }
.reg-input::placeholder { color: #94a3b8; }
.reg-submit {
  width: 100%; padding: 0.85rem; border: none; border-radius: 14px;
  background: linear-gradient(135deg, #4f46e5, #7c3aed); color: white;
  font-family: 'Syne', sans-serif; font-size: 0.92rem; font-weight: 700;
  cursor: pointer; margin-top: 0.3rem;
  box-shadow: 0 6px 20px rgba(79,70,229,0.3); transition: 0.2s;
}
.reg-submit:hover { opacity: 0.92; transform: translateY(-1px); }
.reg-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
.reg-footer { text-align: center; margin-top: 1.2rem; font-size: 0.8rem; color: #64748b; }
.reg-footer a { color: #4f46e5; font-weight: 700; cursor: pointer; text-decoration: none; }
.reg-footer a:hover { text-decoration: underline; }
.reg-error {
  background: #fef2f2; border: 1px solid #fecaca; border-radius: 10px;
  padding: 0.6rem 0.9rem; font-size: 0.78rem; color: #b91c1c; font-weight: 600;
  margin-bottom: 0.8rem;
}
.reg-success {
  background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px;
  padding: 0.6rem 0.9rem; font-size: 0.78rem; color: #166534; font-weight: 600;
  margin-bottom: 0.8rem;
}
@media (max-width: 768px) {
  .reg-hero { display: none; }
  .reg-form-side { border-radius: 28px; }
  .reg-card { max-width: 480px; }
  .reg-row { grid-template-columns: 1fr; }
}
`;

export default function Register() {
  const [role, setRole] = useState("student");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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
    <>
      <style>{CSS}</style>
      <div className="reg-page">
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

            <button className="reg-google-btn" onClick={handleGoogleReg}>
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Sign up with Google
            </button>

            <div className="reg-divider">OR CREATE MANUALLY</div>

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
                  <input className="reg-input" name="password" type="password" placeholder="Min 6 characters" value={form.password} onChange={handleChange} required minLength={6} />
                </div>
                <div className="reg-field">
                  <label className="reg-label">Confirm Password</label>
                  <input className="reg-input" name="confirmPassword" type="password" placeholder="Re-enter password" value={form.confirmPassword} onChange={handleChange} required />
                </div>
              </div>

              <button className="reg-submit" type="submit" disabled={isLoading}>
                {isLoading ? "Creating Account…" : "CREATE ACCOUNT"}
              </button>
            </form>

            <div className="reg-footer">
              Already have an account? <a onClick={() => navigate("/login")}>Sign in</a>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}