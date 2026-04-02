import React, { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import "../styles/StudentProfile.css";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const API = "http://localhost:5000/api";

const SKILL_SUGGESTIONS = [
  "Python","JavaScript","React","Node.js","Django","Flask","Java","C++","C#",
  "TypeScript","SQL","MongoDB","PostgreSQL","MySQL","AWS","Docker","Kubernetes",
  "Git","Linux","Machine Learning","Deep Learning","TensorFlow","PyTorch",
  "Data Analysis","Tableau","Power BI","Figma","UI/UX","HTML","CSS","PHP",
  "Ruby on Rails","Spring Boot","GraphQL","REST API","Agile","DevOps","Cybersecurity",
];

const QUAL_OPTIONS = ["10th","12th","Diploma","BCA","B.Tech","B.Sc","MCA","M.Tech","MBA","PhD","Other"];


// ─── HELPERS ─────────────────────────────────────────────────────────────────

function toBase64(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

function calcCompletion(profile) {
  const checks = [
    !!profile.name,
    !!profile.email,
    !!profile.phone,
    !!profile.address,
    !!profile.about && profile.about.length > 20,
    !!(profile.skills && profile.skills.length > 0),
    !!profile.photo,
    !!profile.tenth,
    !!profile.twelfth,
    !!profile.graduation,
    !!(profile.certificates && profile.certificates.length > 0),
    !!(profile.resumes && profile.resumes.length > 0),
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

function Avatar({ profile }) {
  const initials = (profile?.name || "?")
    .split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
  if (profile?.photo) {
    return <img src={profile.photo} alt={profile.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />;
  }
  return <span style={{ fontSize: "2.2rem", fontFamily: "Syne, sans-serif", fontWeight: 800 }}>{initials}</span>;
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function StudentProfile({ profile: initialProfile, onUpdate }) {
  const [profile, setProfile] = useState(initialProfile || {});
  const [activeTab, setActiveTab] = useState("overview");
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [toast, setToast] = useState(null);
  const [coverPreview, setCoverPreview] = useState(profile.coverPhoto || null);

  const avatarRef = useRef();
  const coverRef = useRef();
  const certRef = useRef();
  const resumeRef = useRef();
  const postRef = useRef();

  // ── Toast helper ──
  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // ── Start edit ──
  const startEdit = () => {
    setForm({
      name: profile.name || "",
      phone: profile.phone || "",
      address: profile.address || "",
      about: profile.about || "",
      qualification: profile.qualification || "",
      tenth: profile.tenth || "",
      twelfth: profile.twelfth || "",
      graduation: profile.graduation || "",
      website: profile.website || "",
      skills: [...(profile.skills || [])],
      certificates: [...(profile.certificates || [])],
      resumes: [...(profile.resumes || [])],
      personalPosts: [...(profile.personalPosts || [])],
    });
    setEditing(true);
    setActiveTab("overview");
  };

  // ── Field change ──
  const fc = (k, v) => setForm(p => ({ ...p, [k]: v }));

  // ── Save ──
  const handleSave = async () => {
    if (!profile.id) return;
    setIsSaving(true);
    try {
      const payload = {
        name: form.name,
        phone: form.phone,
        address: form.address,
        about: form.about,
        qualification: form.qualification,
        tenth: form.tenth,
        twelfth: form.twelfth,
        graduation: form.graduation,
        website: form.website,
        skills: form.skills,
        certificates: form.certificates,
        resumes: form.resumes,
        personalPosts: form.personalPosts,
      };
      const res = await axios.put(`${API}/profile/${profile.id}`, payload);
      const updated = { ...profile, ...payload, ...res.data };
      setProfile(updated);
      onUpdate?.(updated);
      setEditing(false);
      showToast("✓ Profile updated successfully");
    } catch (e) {
      showToast("✗ Could not save changes", "error");
    }
    setIsSaving(false);
  };

  // ── Avatar upload ──
  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const b64 = await toBase64(file);
    try {
      await axios.put(`${API}/profile/${profile.id}`, { photo: b64 });
      setProfile(p => ({ ...p, photo: b64 }));
      showToast("✓ Profile photo updated");
    } catch { showToast("✗ Upload failed", "error"); }
  };

  // ── Cover upload ──
  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const b64 = await toBase64(file);
    setCoverPreview(b64);
    try {
      await axios.put(`${API}/profile/${profile.id}`, { coverPhoto: b64 });
      setProfile(p => ({ ...p, coverPhoto: b64 }));
      showToast("✓ Cover photo updated");
    } catch { showToast("✗ Upload failed", "error"); }
  };

  // ── Skill mgmt ──
  const addSkill = (s) => {
    const sk = s.trim();
    if (!sk || form.skills?.includes(sk)) return;
    fc("skills", [...(form.skills || []), sk]);
    setSkillInput("");
  };
  const removeSkill = (s) => fc("skills", form.skills.filter(x => x !== s));

  // ── File uploads ──
  const handleCertUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    const results = await Promise.all(files.map(async f => ({
      url: await toBase64(f), type: f.type, name: f.name,
    })));
    fc("certificates", [...(form.certificates || []), ...results]);
  };

  const handleResumeUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    const results = await Promise.all(files.map(async f => ({
      url: await toBase64(f), type: f.type, name: f.name,
    })));
    fc("resumes", [...(form.resumes || []), ...results]);
  };

  const handlePostUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    const results = await Promise.all(files.map(async f => ({
      url: await toBase64(f), type: f.type, name: f.name,
    })));
    fc("personalPosts", [...(form.personalPosts || []), ...results]);
  };

  // ── Display data ──
  const data = editing ? form : profile;
  const completion = calcCompletion(profile);
  const skills = data.skills || [];
  const certs = data.certificates || [];
  const resumes = data.resumes || [];
  const posts = data.personalPosts || [];

  const filteredSuggestions = SKILL_SUGGESTIONS.filter(
    s => s.toLowerCase().includes(skillInput.toLowerCase()) && !skills.includes(s)
  ).slice(0, 8);

  // ─── TABS ─────────────────────────────────────────────────────────────────
  const tabs = [
    { id: "overview", label: "Overview", icon: "👤" },
    { id: "skills", label: "Skills", icon: "⚡" },
    { id: "academic", label: "Academic", icon: "🎓" },
    { id: "media", label: "Media", icon: "🖼️" },
    { id: "resume", label: "Resume", icon: "📄" },
  ];

  return (
    <div className="pf-root">
      
      <div className="pf-wrapper">

        {/* ── COVER + AVATAR ── */}
        <div style={{ borderRadius: "var(--r) var(--r) 0 0", overflow: "hidden", position: "relative" }}>
          <div className="pf-cover" onClick={() => coverRef.current?.click()}>
            {coverPreview
              ? <img src={coverPreview} alt="cover" />
              : <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg,#4f46e5 0%,#7c3aed 40%,#0ea5e9 100%)", position: "relative" }}>
                  <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 20% 80%,rgba(255,255,255,0.08) 0%,transparent 50%), radial-gradient(circle at 80% 20%,rgba(255,255,255,0.1) 0%,transparent 50%)" }} />
                  <svg style={{ position: "absolute", bottom: 0, left: 0, right: 0, opacity: 0.08 }} viewBox="0 0 1440 80" preserveAspectRatio="none"><path d="M0,40 C360,80 720,0 1080,40 L1440,20 L1440,80 L0,80Z" fill="white"/></svg>
                </div>
            }
            <div className="pf-cover-overlay">
              <span className="pf-cover-label">📸 Change Cover Photo</span>
            </div>
          </div>
          <input ref={coverRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleCoverUpload} />
        </div>

        {/* ── HERO CARD ── */}
        <div className="pf-hero">
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
            <div className="pf-avatar-wrap">
              <div className="pf-avatar" onClick={() => avatarRef.current?.click()}>
                <Avatar profile={profile} />
              </div>
              <div className="pf-avatar-cam" onClick={() => avatarRef.current?.click()}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
              </div>
              <input ref={avatarRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatarUpload} />
            </div>
            <div style={{ display: "flex", gap: "0.7rem", paddingBottom: "0.3rem" }}>
              {editing ? (
                <>
                  <button className="btn-outline" onClick={() => setEditing(false)}>Cancel</button>
                  <button className="btn-primary" onClick={handleSave} disabled={isSaving}>
                    {isSaving ? "Saving…" : "💾 Save Changes"}
                  </button>
                </>
              ) : (
                <button className="btn-primary" onClick={startEdit}>✏️ Edit Profile</button>
              )}
            </div>
          </div>

          <div className="pf-hero-row" style={{ marginTop: "0.6rem" }}>
            <div className="pf-hero-left">
              <div className="pf-hero-name">{profile.name || "Your Name"}</div>
              <div className="pf-hero-qual">{profile.qualification || "Add your qualification"}</div>
              <div className="pf-hero-meta">
                {profile.email && (
                  <span className="pf-meta-chip">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                    {profile.email}
                  </span>
                )}
                {profile.phone && (
                  <span className="pf-meta-chip">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.12 3.18 2 2 0 012.1 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
                    {profile.phone}
                  </span>
                )}
                {profile.address && (
                  <span className="pf-meta-chip">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    {profile.address}
                  </span>
                )}
                {profile.website && (
                  <a href={profile.website} target="_blank" rel="noreferrer" className="pf-meta-chip" style={{ color: "var(--accent)", textDecoration: "none" }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
                    Website
                  </a>
                )}
              </div>
              {profile.about && <div className="pf-hero-about">{profile.about}</div>}
            </div>
          </div>

          {/* Skills preview in hero */}
          {skills.length > 0 && !editing && (
            <div className="pf-skills-row">
              {skills.slice(0, 8).map(sk => (
                <span key={sk} className="pf-skill">{sk}</span>
              ))}
              {skills.length > 8 && (
                <span className="pf-skill" style={{ cursor: "pointer" }} onClick={() => setActiveTab("skills")}>
                  +{skills.length - 8} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* ── PROFILE COMPLETION ── */}
        <motion.div className="pf-completion"
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div>
            <div style={{ fontSize: "0.78rem", fontWeight: 800, color: "var(--ink)", marginBottom: "0.15rem" }}>
              Profile Strength
            </div>
            <div className="pf-comp-text">
              {completion < 50 ? "Add more details to stand out" :
               completion < 80 ? "Looking good! A few more steps" : "Excellent profile! 🎉"}
            </div>
          </div>
          <div className="pf-comp-bar-wrap">
            <motion.div className="pf-comp-bar" initial={{ width: 0 }}
              animate={{ width: `${completion}%` }} transition={{ duration: 1, delay: 0.3 }} />
          </div>
          <div className="pf-comp-label">{completion}%</div>
        </motion.div>

        {/* ── STATS ── */}
        <div className="pf-stats">
          <motion.div className="pf-stat" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <div className="pf-stat-num pf-stat-accent">{skills.length}</div>
            <div className="pf-stat-label">Skills Listed</div>
          </motion.div>
          <motion.div className="pf-stat" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="pf-stat-num pf-stat-emerald">{certs.length}</div>
            <div className="pf-stat-label">Certificates</div>
          </motion.div>
          <motion.div className="pf-stat" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <div className="pf-stat-num pf-stat-amber">{resumes.length}</div>
            <div className="pf-stat-label">Resumes</div>
          </motion.div>
          <motion.div className="pf-stat" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <div className="pf-stat-num" style={{ color: "var(--sky)" }}>{posts.length}</div>
            <div className="pf-stat-label">Posts</div>
          </motion.div>
        </div>

        {/* ── TABS ── */}
        <div className="pf-tabs">
          {tabs.map(t => (
            <button key={t.id} className={`pf-tab ${activeTab === t.id ? "active" : ""}`}
              onClick={() => setActiveTab(t.id)}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* ══════════════ TAB: OVERVIEW ══════════════ */}
        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              
              {/* About */}
              <div className="pf-card">
                <div className="pf-card-title">
                  <div className="pf-card-title-icon">✍️</div>
                  About Me
                </div>
                {editing ? (
                  <textarea
                    className="pf-input pf-textarea"
                    placeholder="Write a short bio about yourself, your interests, and your career goals…"
                    value={form.about || ""}
                    onChange={e => fc("about", e.target.value)}
                    style={{ width: "100%" }}
                  />
                ) : (
                  <p style={{ color: "var(--muted)", lineHeight: 1.7, fontSize: "0.9rem" }}>
                    {profile.about || <span style={{ color: "var(--subtle)", fontStyle: "italic" }}>No bio added yet. Click Edit Profile to add one.</span>}
                  </p>
                )}
              </div>

              {/* Personal Info */}
              <div className="pf-card">
                <div className="pf-card-title">
                  <div className="pf-card-title-icon">📋</div>
                  Personal Information
                </div>
                {editing ? (
                  <div className="pf-grid">
                    {[
                      { key: "name", label: "Full Name", placeholder: "Your full name" },
                      { key: "phone", label: "Phone Number", placeholder: "+91 XXXXXXXXXX" },
                      { key: "address", label: "City / Location", placeholder: "Your city" },
                      { key: "website", label: "Website / LinkedIn", placeholder: "https://..." },
                    ].map(({ key, label, placeholder }) => (
                      <div className="pf-field" key={key}>
                        <label className="pf-label">{label}</label>
                        <input className="pf-input" placeholder={placeholder}
                          value={form[key] || ""}
                          onChange={e => fc(key, e.target.value)} />
                      </div>
                    ))}
                    <div className="pf-field">
                      <label className="pf-label">Qualification</label>
                      <select className="pf-input pf-select" value={form.qualification || ""}
                        onChange={e => fc("qualification", e.target.value)}>
                        <option value="">Select qualification</option>
                        {QUAL_OPTIONS.map(q => <option key={q} value={q}>{q}</option>)}
                      </select>
                    </div>
                    <div className="pf-field">
                      <label className="pf-label">Email (read-only)</label>
                      <input className="pf-input" value={profile.email || ""} readOnly style={{ background: "#f8fafc", cursor: "not-allowed" }} />
                    </div>
                  </div>
                ) : (
                  <div className="pf-grid">
                    {[
                      { label: "Full Name", value: profile.name },
                      { label: "Email", value: profile.email },
                      { label: "Phone", value: profile.phone },
                      { label: "Location", value: profile.address },
                      { label: "Qualification", value: profile.qualification },
                      { label: "Website", value: profile.website },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <div className="pf-label" style={{ marginBottom: "0.25rem" }}>{label}</div>
                        <div style={{ fontWeight: 600, color: value ? "var(--ink2)" : "var(--subtle)", fontStyle: value ? "normal" : "italic", fontSize: "0.88rem" }}>
                          {value || "Not provided"}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ══════════════ TAB: SKILLS ══════════════ */}
          {activeTab === "skills" && (
            <motion.div key="skills" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <div className="pf-card">
                <div className="pf-card-title">
                  <div className="pf-card-title-icon">⚡</div>
                  Skills & Expertise
                </div>

                <div className="pf-skills-row">
                  {skills.map(sk => (
                    <span key={sk} className="pf-skill">
                      {sk}
                      {editing && (
                        <button className="pf-skill-del" onClick={() => removeSkill(sk)}>✕</button>
                      )}
                    </span>
                  ))}
                  {skills.length === 0 && (
                    <span style={{ color: "var(--subtle)", fontStyle: "italic", fontSize: "0.85rem" }}>
                      No skills added yet.
                    </span>
                  )}
                </div>

                {editing && (
                  <>
                    <div className="pf-divider" />
                    <div className="pf-label" style={{ marginBottom: "0.6rem" }}>Add Skill</div>
                    <div className="pf-skill-adder">
                      <input
                        className="pf-input"
                        style={{ flex: 1, minWidth: 200 }}
                        placeholder="Type a skill name…"
                        value={skillInput}
                        onChange={e => setSkillInput(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter") { addSkill(skillInput); } }}
                      />
                      <button className="btn-ghost" onClick={() => addSkill(skillInput)}>+ Add</button>
                    </div>
                    {skillInput.length > 0 && filteredSuggestions.length > 0 && (
                      <div className="pf-skill-suggestions">
                        {filteredSuggestions.map(s => (
                          <span key={s} className="pf-sugg" onClick={() => addSkill(s)}>{s}</span>
                        ))}
                      </div>
                    )}
                    {skillInput.length === 0 && (
                      <>
                        <div className="pf-label" style={{ marginTop: "1rem", marginBottom: "0.5rem" }}>Popular Skills</div>
                        <div className="pf-skill-suggestions">
                          {SKILL_SUGGESTIONS.filter(s => !skills.includes(s)).slice(0, 15).map(s => (
                            <span key={s} className="pf-sugg" onClick={() => addSkill(s)}>{s}</span>
                          ))}
                        </div>
                      </>
                    )}
                    <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "flex-end" }}>
                      <button className="btn-primary" onClick={handleSave} disabled={isSaving}>
                        {isSaving ? "Saving…" : "💾 Save Skills"}
                      </button>
                    </div>
                  </>
                )}
                {!editing && (
                  <div style={{ marginTop: "1.2rem" }}>
                    <button className="btn-outline" onClick={startEdit}>✏️ Edit Skills</button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ══════════════ TAB: ACADEMIC ══════════════ */}
          {activeTab === "academic" && (
            <motion.div key="academic" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <div className="pf-card">
                <div className="pf-card-title">
                  <div className="pf-card-title-icon">🎓</div>
                  Academic Background
                </div>

                {!editing ? (
                  <div className="pf-acad-grid">
                    {[
                      { level: "10th Standard", value: profile.tenth },
                      { level: "12th Standard", value: profile.twelfth },
                      { level: "Graduation", value: profile.graduation },
                    ].map(({ level, value }) => (
                      <div className="pf-acad-card" key={level}>
                        <div className="pf-acad-level">{level}</div>
                        <div className="pf-acad-name">
                          {value || <span style={{ color: "var(--subtle)", fontStyle: "italic" }}>Not added</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="pf-grid-3">
                    {[
                      { key: "tenth", label: "10th School / Board / %", placeholder: "e.g. CBSE – 92%" },
                      { key: "twelfth", label: "12th School / Board / %", placeholder: "e.g. BSEB – 85%" },
                      { key: "graduation", label: "Graduation / College / CGPA", placeholder: "e.g. MIT Patna – 8.4 CGPA" },
                    ].map(({ key, label, placeholder }) => (
                      <div className="pf-field" key={key}>
                        <label className="pf-label">{label}</label>
                        <input className="pf-input" placeholder={placeholder}
                          value={form[key] || ""}
                          onChange={e => fc(key, e.target.value)} />
                      </div>
                    ))}
                  </div>
                )}

                {editing && (
                  <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "flex-end" }}>
                    <button className="btn-primary" onClick={handleSave} disabled={isSaving}>
                      {isSaving ? "Saving…" : "💾 Save Academic Info"}
                    </button>
                  </div>
                )}
                {!editing && (
                  <div style={{ marginTop: "1.2rem" }}>
                    <button className="btn-outline" onClick={startEdit}>✏️ Edit Academic Info</button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ══════════════ TAB: MEDIA ══════════════ */}
          {activeTab === "media" && (
            <motion.div key="media" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              {/* Certificates */}
              <div className="pf-card">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.2rem" }}>
                  <div className="pf-card-title" style={{ marginBottom: 0 }}>
                    <div className="pf-card-title-icon">🏆</div>
                    Certificates
                  </div>
                  {editing && (
                    <button className="btn-ghost" onClick={() => certRef.current?.click()}>+ Upload</button>
                  )}
                </div>
                <input ref={certRef} type="file" accept="image/*,application/pdf" multiple style={{ display: "none" }} onChange={handleCertUpload} />

                <div className="pf-upload-grid">
                  {(editing ? form.certificates : profile.certificates || []).map((c, i) => (
                    <div className="pf-upload-thumb" key={i} onClick={() => window.open(c.url, "_blank")}>
                      {c.type?.startsWith("image/")
                        ? <img src={c.url} alt={c.name || `cert-${i}`} />
                        : <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, background: "rgba(79,70,229,0.06)" }}>
                            <span style={{ fontSize: "2rem" }}>📑</span>
                            <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--muted)" }}>PDF</span>
                          </div>
                      }
                      {editing && (
                        <button className="pf-upload-thumb-del"
                          onClick={e => { e.stopPropagation(); fc("certificates", form.certificates.filter((_, j) => j !== i)); }}>
                          ✕
                        </button>
                      )}
                      <div className="pf-upload-thumb-label">Certificate</div>
                    </div>
                  ))}
                  {editing && (
                    <div className="pf-add-thumb" onClick={() => certRef.current?.click()}>
                      <span style={{ fontSize: "1.5rem" }}>+</span>
                      <span>Add Certificate</span>
                    </div>
                  )}
                  {!editing && (profile.certificates || []).length === 0 && (
                    <div style={{ color: "var(--subtle)", fontStyle: "italic", fontSize: "0.85rem", gridColumn: "1/-1" }}>
                      No certificates uploaded yet.
                    </div>
                  )}
                </div>
              </div>

              {/* Personal Posts */}
              <div className="pf-card">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.2rem" }}>
                  <div className="pf-card-title" style={{ marginBottom: 0 }}>
                    <div className="pf-card-title-icon">📸</div>
                    Personal Posts
                  </div>
                  {editing && (
                    <button className="btn-ghost" onClick={() => postRef.current?.click()}>+ Upload</button>
                  )}
                </div>
                <input ref={postRef} type="file" accept="image/*,video/*" multiple style={{ display: "none" }} onChange={handlePostUpload} />

                <div className="pf-upload-grid">
                  {(editing ? form.personalPosts : profile.personalPosts || []).map((p, i) => (
                    <div className="pf-upload-thumb" key={i} onClick={() => window.open(p.url, "_blank")}>
                      {p.type?.startsWith("image/")
                        ? <img src={p.url} alt={`post-${i}`} />
                        : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(14,165,233,0.06)" }}>
                            <span style={{ fontSize: "2rem" }}>🎬</span>
                          </div>
                      }
                      {editing && (
                        <button className="pf-upload-thumb-del"
                          onClick={e => { e.stopPropagation(); fc("personalPosts", form.personalPosts.filter((_, j) => j !== i)); }}>
                          ✕
                        </button>
                      )}
                      <div className="pf-upload-thumb-label">Post</div>
                    </div>
                  ))}
                  {editing && (
                    <div className="pf-add-thumb" onClick={() => postRef.current?.click()}>
                      <span style={{ fontSize: "1.5rem" }}>+</span>
                      <span>Add Post</span>
                    </div>
                  )}
                  {!editing && (profile.personalPosts || []).length === 0 && (
                    <div style={{ color: "var(--subtle)", fontStyle: "italic", fontSize: "0.85rem", gridColumn: "1/-1" }}>
                      No posts uploaded yet.
                    </div>
                  )}
                </div>

                {editing && (
                  <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "flex-end" }}>
                    <button className="btn-primary" onClick={handleSave} disabled={isSaving}>
                      {isSaving ? "Saving…" : "💾 Save Media"}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ══════════════ TAB: RESUME ══════════════ */}
          {activeTab === "resume" && (
            <motion.div key="resume" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <div className="pf-card">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.4rem" }}>
                  <div className="pf-card-title" style={{ marginBottom: 0 }}>
                    <div className="pf-card-title-icon">📄</div>
                    My Resumes
                  </div>
                  {editing && (
                    <button className="btn-ghost" onClick={() => resumeRef.current?.click()}>+ Upload Resume</button>
                  )}
                </div>
                <input ref={resumeRef} type="file" accept="application/pdf,image/*" multiple style={{ display: "none" }} onChange={handleResumeUpload} />

                <div className="pf-resume-list">
                  {(editing ? form.resumes : profile.resumes || []).map((r, i) => (
                    <div className="pf-resume-item" key={i}>
                      <div className="pf-resume-icon">
                        {r.type === "application/pdf" ? "📑" : "🖼️"}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div className="pf-resume-name">{r.name || `Resume ${i + 1}`}</div>
                        <div className="pf-resume-type">{r.type || "Document"}</div>
                      </div>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <a href={r.url} target="_blank" rel="noreferrer">
                          <button className="btn-ghost" style={{ fontSize: "0.72rem" }}>View</button>
                        </a>
                        {editing && (
                          <button className="btn-danger"
                            onClick={() => fc("resumes", form.resumes.filter((_, j) => j !== i))}>
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {(editing ? form.resumes : profile.resumes || []).length === 0 && (
                    <div style={{ textAlign: "center", padding: "2.5rem 1rem", color: "var(--subtle)" }}>
                      <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>📄</div>
                      <div style={{ fontWeight: 700, marginBottom: "0.3rem" }}>No Resumes Uploaded</div>
                      <div style={{ fontSize: "0.8rem" }}>Upload your resume to attach it to job applications.</div>
                      {editing && (
                        <button className="btn-primary" style={{ marginTop: "1rem" }}
                          onClick={() => resumeRef.current?.click()}>
                          + Upload Resume
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {editing && form.resumes?.length > 0 && (
                  <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "flex-end" }}>
                    <button className="btn-primary" onClick={handleSave} disabled={isSaving}>
                      {isSaving ? "Saving…" : "💾 Save Resumes"}
                    </button>
                  </div>
                )}
                {!editing && (
                  <div style={{ marginTop: "1.2rem" }}>
                    <button className="btn-outline" onClick={startEdit}>✏️ Manage Resumes</button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── TOAST ── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            className={`pf-toast ${toast.type === "error" ? "pf-toast-error" : "pf-toast-success"}`}
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}>
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/*
═══════════════════════════════════════════════════════════
  USAGE — drop into StudentDashboard.jsx "Profile" section
═══════════════════════════════════════════════════════════

import StudentProfile from './StudentProfile';

// Inside your Dashboard, where you currently render the profile tab:
{activeSection === "profile" && (
  <StudentProfile
    profile={profile}            // from useAuth()
    onUpdate={(updated) => {
      // Optionally refresh your auth context / local state here
    }}
  />
)}
*/
