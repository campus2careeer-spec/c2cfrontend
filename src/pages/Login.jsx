import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../AuthContext";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
  padding: 1.5rem;
  position: relative;
  overflow: hidden;
  font-family: 'DM Sans', sans-serif;
}
.login-page::before {
  content: '';
  position: absolute;
  top: -50%; left: -50%;
  width: 200%; height: 200%;
  background:
    radial-gradient(ellipse at 30% 20%, rgba(79,70,229,0.15) 0%, transparent 50%),
    radial-gradient(ellipse at 70% 80%, rgba(124,58,237,0.12) 0%, transparent 50%);
  animation: aurora 15s ease-in-out infinite alternate;
}
@keyframes aurora {
  0%   { transform: translate(0,0) rotate(0deg); }
  100% { transform: translate(-5%,3%) rotate(3deg); }
}
.login-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
}
.login-card {
  position: relative;
  z-index: 10;
  display: flex;
  width: 100%;
  max-width: 960px;
  background: rgba(255,255,255,0.04);
  backdrop-filter: blur(40px) saturate(1.5);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 28px;
  box-shadow: 0 32px 80px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06);
  overflow: hidden;
  min-height: 560px;
}
.login-hero {
  width: 45%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2.5rem;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, rgba(79,70,229,0.2), rgba(124,58,237,0.15));
  border-right: 1px solid rgba(255,255,255,0.06);
}
.login-hero-ring {
  position: absolute;
  width: 320px; height: 320px;
  border-radius: 50%;
  border: 1px solid rgba(255,255,255,0.06);
  top: 50%; left: 50%;
  transform: translate(-50%,-50%);
}
.login-hero-ring:nth-child(2) { width: 240px; height: 240px; border-color: rgba(79,70,229,0.15); }
.login-hero-ring:nth-child(3) { width: 160px; height: 160px; border-color: rgba(124,58,237,0.15); }
.login-hero-badge {
  position: relative; z-index: 2;
  display: inline-flex; align-items: center; gap: .4rem;
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 99px;
  padding: .3rem .9rem;
  font-size: .7rem;
  font-weight: 700;
  color: rgba(255,255,255,0.8);
  letter-spacing: .08em;
  text-transform: uppercase;
  margin-bottom: 1.2rem;
}
.login-hero h1 {
  font-family: 'Syne', sans-serif;
  font-size: 2.4rem;
  font-weight: 800;
  color: white;
  text-align: center;
  line-height: 1.1;
  letter-spacing: -0.03em;
  position: relative; z-index: 2;
}
.login-hero p {
  color: rgba(255,255,255,0.5);
  font-size: 0.88rem;
  text-align: center;
  margin-top: 0.8rem;
  line-height: 1.6;
  position: relative; z-index: 2;
  max-width: 260px;
}
.login-hero-stats {
  display: flex; gap: 1.5rem;
  margin-top: 2rem;
  position: relative; z-index: 2;
}
.login-hero-stat {
  text-align: center;
}
.login-hero-stat-num {
  font-family: 'Syne', sans-serif;
  font-size: 1.3rem;
  font-weight: 800;
  color: white;
}
.login-hero-stat-label {
  font-size: .65rem;
  color: rgba(255,255,255,0.45);
  font-weight: 600;
  letter-spacing: .06em;
  text-transform: uppercase;
  margin-top: 2px;
}
.login-form-side {
  flex: 1;
  padding: 3rem 2.8rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: rgba(255,255,255,0.97);
  border-radius: 0 28px 28px 0;
}
.login-form-title {
  font-family: 'Syne', sans-serif;
  font-size: 1.75rem;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 0.3rem;
  letter-spacing: -0.03em;
}
.login-form-sub {
  font-size: 0.85rem;
  color: #64748b;
  margin-bottom: 1.8rem;
}
.role-tabs {
  display: flex;
  background: #f1f5f9;
  padding: 4px;
  border-radius: 14px;
  margin-bottom: 1.5rem;
  position: relative;
  border: 1px solid #e2e8f0;
}
.role-tab {
  flex: 1;
  padding: 0.65rem;
  text-align: center;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  border-radius: 11px;
  z-index: 2;
  position: relative;
  color: #64748b;
  transition: color 0.2s;
  border: none;
  background: none;
  font-family: 'DM Sans', sans-serif;
}
.role-tab.active { color: white; }
.role-slider {
  position: absolute;
  top: 4px; bottom: 4px; left: 4px;
  width: calc(33.33% - 4px);
  border-radius: 11px;
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  box-shadow: 0 4px 12px rgba(79,70,229,0.3);
  transition: transform 0.28s cubic-bezier(.4,0,.2,1);
}
.login-google-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.65rem;
  padding: 0.78rem;
  background: white;
  border: 1.5px solid #e2e8f0;
  border-radius: 13px;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.85rem;
  font-weight: 600;
  color: #334155;
  cursor: pointer;
  transition: 0.2s;
  margin-bottom: 1.2rem;
}
.login-google-btn:hover {
  border-color: #4f46e5;
  background: #f8fafc;
  box-shadow: 0 4px 12px rgba(79,70,229,0.08);
}
.login-divider {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin-bottom: 1.2rem;
  font-size: 0.72rem;
  color: #94a3b8;
  font-weight: 600;
  letter-spacing: 0.06em;
}
.login-divider::before,
.login-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #e2e8f0;
}
.login-field { position: relative; margin-bottom: 0.9rem; }
.login-field-icon {
  position: absolute;
  left: 1rem; top: 50%;
  transform: translateY(-50%);
  font-size: .85rem;
  pointer-events: none;
}
.login-input {
  width: 100%;
  padding: 0.85rem 1rem 0.85rem 2.6rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 13px;
  background: #fafbff;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.88rem;
  color: #0f172a;
  outline: none;
  transition: 0.25s;
}
.login-input:focus {
  border-color: #4f46e5;
  background: white;
  box-shadow: 0 0 0 3px rgba(79,70,229,0.08);
}
.login-input::placeholder { color: #94a3b8; }
.login-input-no-icon { padding-left: 1rem; }
.pw-toggle {
  position: absolute;
  right: 1rem; top: 50%;
  transform: translateY(-50%);
  background: none; border: none;
  cursor: pointer;
  font-size: .82rem;
  color: #94a3b8;
  padding: .2rem;
  transition: .15s;
}
.pw-toggle:hover { color: #4f46e5; }
.login-submit {
  width: 100%;
  padding: 0.9rem;
  border: none;
  border-radius: 14px;
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  color: white;
  font-family: 'Syne', sans-serif;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: 0.2s;
  margin-top: 0.4rem;
  box-shadow: 0 6px 20px rgba(79,70,229,0.3);
  letter-spacing: 0.02em;
}
.login-submit:hover { opacity: 0.92; transform: translateY(-1px); }
.login-submit:active { transform: scale(0.98); }
.login-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
.login-footer {
  text-align: center;
  margin-top: 1.4rem;
  font-size: 0.82rem;
  color: #64748b;
}
.login-footer a {
  color: #4f46e5;
  font-weight: 700;
  cursor: pointer;
  text-decoration: none;
}
.login-footer a:hover { text-decoration: underline; }
.login-error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 11px;
  padding: 0.65rem 1rem;
  font-size: 0.8rem;
  color: #b91c1c;
  font-weight: 600;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.login-success {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 11px;
  padding: 0.65rem 1rem;
  font-size: 0.8rem;
  color: #166534;
  font-weight: 600;
  margin-bottom: 1rem;
}
.forgot-link {
  display: block;
  text-align: right;
  font-size: .76rem;
  font-weight: 700;
  color: #4f46e5;
  cursor: pointer;
  margin-top: -.5rem;
  margin-bottom: .9rem;
  background: none; border: none;
  font-family: 'DM Sans', sans-serif;
}
.forgot-link:hover { text-decoration: underline; }

@media (max-width: 768px) {
  .login-hero { display: none; }
  .login-form-side { border-radius: 28px; padding: 2.2rem 1.8rem; }
  .login-card { max-width: 440px; }
}
@media (max-width: 480px) {
  .login-form-side { padding: 1.8rem 1.2rem; }
  .login-form-title { font-size: 1.45rem; }
}
`;

// ─── Forgot Password mini-form ────────────────────────────────────────────────
function ForgotPassword({ onBack }) {
  const { supabase: sb } = useSupabaseClient();
  const [email,   setEmail]   = useState('');
  const [sent,    setSent]    = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  // We call supabase directly here — import it from supabaseClient
  const handleReset = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { createClient } = await import('@supabase/supabase-js');
      // We just re-use the already-initialised client via the module
      const { supabase } = await import('../supabaseClient');
      const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password',
      });
      if (err) throw err;
      setSent(true);
    } catch (err) {
      setError(err.message || 'Could not send reset email.');
    }
    setLoading(false);
  };

  if (sent) return (
    <div style={{ textAlign: 'center', padding: '1rem 0' }}>
      <div style={{ fontSize: '2.5rem', marginBottom: '.8rem' }}>📬</div>
      <div style={{ fontFamily: 'Syne,sans-serif', fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '.4rem' }}>Check your inbox</div>
      <div style={{ fontSize: '.84rem', color: '#64748b', marginBottom: '1.4rem' }}>We sent a reset link to <strong>{email}</strong></div>
      <button className="login-submit" style={{ maxWidth: 220, margin: '0 auto' }} onClick={onBack}>Back to Sign In</button>
    </div>
  );

  return (
    <form onSubmit={handleReset}>
      <div style={{ fontFamily: 'Syne,sans-serif', fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '.3rem' }}>Reset Password</div>
      <div style={{ fontSize: '.84rem', color: '#64748b', marginBottom: '1.4rem' }}>Enter your email and we'll send a reset link.</div>
      {error && <div className="login-error">⚠️ {error}</div>}
      <div className="login-field">
        <span className="login-field-icon">✉️</span>
        <input className="login-input" type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} required />
      </div>
      <button className="login-submit" type="submit" disabled={loading}>{loading ? 'Sending…' : 'Send Reset Link'}</button>
      <button type="button" className="login-submit" style={{ marginTop: '.5rem', background: 'white', color: '#4f46e5', border: '1.5px solid #4f46e5', boxShadow: 'none' }} onClick={onBack}>← Back</button>
    </form>
  );
}

// ─── Main Login Component ─────────────────────────────────────────────────────
export default function Login() {
  const [role,       setRole]       = useState('student');
  const [mode,       setMode]       = useState('login');   // 'login' | 'register' | 'forgot'
  const [email,      setEmail]      = useState('');
  const [password,   setPassword]   = useState('');
  const [fullName,   setFullName]   = useState('');
  const [confirmPw,  setConfirmPw]  = useState('');
  const [showPw,     setShowPw]     = useState(false);
  const [error,      setError]      = useState('');
  const [success,    setSuccess]    = useState('');
  const [isLoading,  setIsLoading]  = useState(false);

  const navigate = useNavigate();
  const { signIn, signInWithGoogle, signUp, user, authUser, loading } = useAuth();

  // Role slider positions: student=0, industry=1, admin=2
  const roleIndex = { student: 0, industry: 1, admin: 2 };

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user && authUser) {
      const routes = { industry: '/industry', admin: '/admin', student: '/student' };
      navigate(routes[authUser.role] || '/student', { replace: true });
    }
  }, [user, authUser, loading, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); setIsLoading(true);
    try {
      const data = await signIn({ email, password });
      const r = data?.user?.user_metadata?.role;
      const routes = { industry: '/industry', admin: '/admin', student: '/student' };
      navigate(routes[r] || '/student', { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    }
    setIsLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (password !== confirmPw) { setError('Passwords do not match.'); return; }
    if (password.length < 6)    { setError('Password must be at least 6 characters.'); return; }
    setIsLoading(true);
    try {
      await signUp({ email, password, fullName, role });
      setSuccess('Account created! Please check your email to verify, then sign in.');
      setMode('login');
      setPassword(''); setConfirmPw(''); setFullName('');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    }
    setIsLoading(false);
  };

  const handleGoogle = async () => {
    setError('');
    try { await signInWithGoogle(); }
    catch (err) { setError(err.message || 'Google login failed.'); }
  };

  const sliderX = `${roleIndex[role] * 100}%`;

  return (
    <>
      <style>{CSS}</style>
      <div className="login-page">
        {/* Ambient orbs */}
        <div className="login-orb" style={{ width: 400, height: 400, background: 'rgba(79,70,229,0.12)', top: '-10%', left: '-5%' }} />
        <div className="login-orb" style={{ width: 300, height: 300, background: 'rgba(124,58,237,0.10)', bottom: '-5%', right: '10%' }} />

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
            <div className="login-hero-badge">🎓 Student Portal</div>
            <h1>Campus<br />2Career</h1>
            <p>Bridging the gap between academic excellence and professional opportunity.</p>
            <div className="login-hero-stats">
              <div className="login-hero-stat">
                <div className="login-hero-stat-num">500+</div>
                <div className="login-hero-stat-label">Companies</div>
              </div>
              <div className="login-hero-stat">
                <div className="login-hero-stat-num">10k+</div>
                <div className="login-hero-stat-label">Students</div>
              </div>
              <div className="login-hero-stat">
                <div className="login-hero-stat-num">95%</div>
                <div className="login-hero-stat-label">Placed</div>
              </div>
            </div>
          </div>

          {/* Right form */}
          <div className="login-form-side">
            <AnimatePresence mode="wait">

              {/* FORGOT PASSWORD */}
              {mode === 'forgot' && (
                <motion.div key="forgot"
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <ForgotPasswordInline onBack={() => setMode('login')} />
                </motion.div>
              )}

              {/* LOGIN */}
              {mode === 'login' && (
                <motion.div key="login"
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <div className="login-form-title">Welcome Back</div>
                  <div className="login-form-sub">Sign in to your portal</div>

                  {/* Role tabs */}
                  <div className="role-tabs">
                    <div className="role-slider" style={{ transform: `translateX(${sliderX})`, width: 'calc(33.33% - 2.67px)' }} />
                    {['student','industry','admin'].map(r => (
                      <button key={r} className={`role-tab ${role === r ? 'active' : ''}`} onClick={() => setRole(r)}>
                        {r === 'student' ? '🎓' : r === 'industry' ? '🏢' : '⚙️'} {r.charAt(0).toUpperCase() + r.slice(1)}
                      </button>
                    ))}
                  </div>

                  <AnimatePresence>
                    {error   && <motion.div className="login-error"   initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>⚠️ {error}</motion.div>}
                    {success && <motion.div className="login-success" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>✅ {success}</motion.div>}
                  </AnimatePresence>

                  <button className="login-google-btn" onClick={handleGoogle}>
                    <GoogleIcon /> Continue with Google
                  </button>
                  <div className="login-divider">OR SIGN IN WITH EMAIL</div>

                  <form onSubmit={handleLogin}>
                    <div className="login-field">
                      <span className="login-field-icon">✉️</span>
                      <input className="login-input" type="email" placeholder="Email address"
                        value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                    <div className="login-field">
                      <span className="login-field-icon">🔒</span>
                      <input className="login-input" type={showPw ? 'text' : 'password'} placeholder="Password"
                        value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
                      <button type="button" className="pw-toggle" onClick={() => setShowPw(p => !p)}>{showPw ? '🙈' : '👁️'}</button>
                    </div>
                    <button type="button" className="forgot-link" onClick={() => { setError(''); setMode('forgot'); }}>
                      Forgot password?
                    </button>
                    <button className="login-submit" type="submit" disabled={isLoading}>
                      {isLoading ? 'Signing in…' : 'SIGN IN'}
                    </button>
                  </form>

                  <div className="login-footer">
                    Don't have an account?{' '}
                    <a onClick={() => { setError(''); setSuccess(''); setMode('register'); }}>Create one now</a>
                  </div>
                </motion.div>
              )}

              {/* REGISTER */}
              {mode === 'register' && (
                <motion.div key="register"
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <div className="login-form-title">Create Account</div>
                  <div className="login-form-sub">Join Campus2Career today</div>

                  {/* Role tabs */}
                  <div className="role-tabs">
                    <div className="role-slider" style={{ transform: `translateX(${sliderX})`, width: 'calc(33.33% - 2.67px)' }} />
                    {['student','industry','admin'].map(r => (
                      <button key={r} className={`role-tab ${role === r ? 'active' : ''}`} onClick={() => setRole(r)}>
                        {r === 'student' ? '🎓' : r === 'industry' ? '🏢' : '⚙️'} {r.charAt(0).toUpperCase() + r.slice(1)}
                      </button>
                    ))}
                  </div>

                  <AnimatePresence>
                    {error && <motion.div className="login-error" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>⚠️ {error}</motion.div>}
                  </AnimatePresence>

                  <button className="login-google-btn" onClick={handleGoogle}>
                    <GoogleIcon /> Sign up with Google
                  </button>
                  <div className="login-divider">OR REGISTER WITH EMAIL</div>

                  <form onSubmit={handleRegister}>
                    <div className="login-field">
                      <span className="login-field-icon">👤</span>
                      <input className="login-input" type="text"
                        placeholder={role === 'industry' ? 'Company / Organization name' : 'Full name'}
                        value={fullName} onChange={e => setFullName(e.target.value)} required />
                    </div>
                    <div className="login-field">
                      <span className="login-field-icon">✉️</span>
                      <input className="login-input" type="email" placeholder="Email address"
                        value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                    <div className="login-field">
                      <span className="login-field-icon">🔒</span>
                      <input className="login-input" type={showPw ? 'text' : 'password'} placeholder="Password (min 6 chars)"
                        value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
                      <button type="button" className="pw-toggle" onClick={() => setShowPw(p => !p)}>{showPw ? '🙈' : '👁️'}</button>
                    </div>
                    <div className="login-field">
                      <span className="login-field-icon">🔒</span>
                      <input className="login-input" type={showPw ? 'text' : 'password'} placeholder="Confirm password"
                        value={confirmPw} onChange={e => setConfirmPw(e.target.value)} required minLength={6} />
                    </div>
                    <button className="login-submit" type="submit" disabled={isLoading}>
                      {isLoading ? 'Creating account…' : 'CREATE ACCOUNT'}
                    </button>
                  </form>

                  <div className="login-footer">
                    Already have an account?{' '}
                    <a onClick={() => { setError(''); setMode('login'); }}>Sign in</a>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </>
  );
}

// ─── Forgot Password inline (no dynamic import needed) ────────────────────────
function ForgotPasswordInline({ onBack }) {
  const [email,   setEmail]   = useState('');
  const [sent,    setSent]    = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleReset = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { supabase } = await import('../supabaseClient');
      const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password',
      });
      if (err) throw err;
      setSent(true);
    } catch (err) {
      setError(err.message || 'Could not send reset email.');
    }
    setLoading(false);
  };

  if (sent) return (
    <div style={{ textAlign: 'center', padding: '1rem 0' }}>
      <div style={{ fontSize: '2.5rem', marginBottom: '.8rem' }}>📬</div>
      <div style={{ fontFamily: 'Syne,sans-serif', fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '.4rem' }}>Check your inbox</div>
      <div style={{ fontSize: '.84rem', color: '#64748b', marginBottom: '1.4rem' }}>
        We sent a reset link to <strong>{email}</strong>
      </div>
      <button className="login-submit" style={{ maxWidth: 220, margin: '0 auto', display: 'block' }} onClick={onBack}>
        Back to Sign In
      </button>
    </div>
  );

  return (
    <form onSubmit={handleReset}>
      <div style={{ fontFamily: 'Syne,sans-serif', fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: '.3rem' }}>
        Reset Password
      </div>
      <div style={{ fontSize: '.84rem', color: '#64748b', marginBottom: '1.4rem' }}>
        Enter your email and we'll send you a reset link.
      </div>
      {error && <div className="login-error">⚠️ {error}</div>}
      <div className="login-field">
        <span className="login-field-icon">✉️</span>
        <input className="login-input" type="email" placeholder="Email address"
          value={email} onChange={e => setEmail(e.target.value)} required />
      </div>
      <button className="login-submit" type="submit" disabled={loading}>
        {loading ? 'Sending…' : 'Send Reset Link'}
      </button>
      <button type="button" onClick={onBack}
        style={{ marginTop: '.55rem', width: '100%', padding: '.78rem', border: '1.5px solid #e2e8f0', borderRadius: 14, background: 'white', color: '#64748b', fontFamily: 'DM Sans,sans-serif', fontSize: '.88rem', fontWeight: 700, cursor: 'pointer' }}>
        ← Back to Sign In
      </button>
    </form>
  );
}

// ─── Google SVG icon ─────────────────────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}
