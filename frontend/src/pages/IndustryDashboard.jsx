import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useAuth } from "../AuthContext";
import API_BASE_URL from "../apiConfig";
import "../styles/IndustryDashboard.css";

const API = `${API_BASE_URL}/api`;

// ─── MOCK DATA (fallback when backend is unavailable) ─────────────────────────
const MOCK_STUDENTS = [
  { id: "s1", name: "Arjun Mehta", email: "arjun.mehta@email.com", phone: "+91 9876512345", about: "Full Stack Developer specializing in MERN stack with 6 months of internship experience.", skills: ["React", "Node.js", "MongoDB", "Express", "AWS"], match: 97, rank: "Top 1%", experience: "6 months intern at WebDev Studio", certificates: ["AWS Cloud Practitioner", "React Advanced"], qualification: "BCA", graduation: "Delhi University", resumes: [{ name: "Arjun_Resume.pdf", type: "application/pdf", size: "245 KB" }], personalPosts: [], photo: null, applications: [] },
  { id: "s2", name: "Simran Kaur", email: "simran.kaur@email.com", phone: "+91 8765432109", about: "Data scientist with strong ML background and research experience.", skills: ["Python", "TensorFlow", "SQL", "Pandas", "Scikit-Learn"], match: 93, rank: "Top 5%", experience: "Research Assistant, IIT Delhi AI Lab", certificates: ["Deep Learning Specialization"], qualification: "MCA", graduation: "Pune University", resumes: [], personalPosts: [], photo: null, applications: [] },
  { id: "s3", name: "Rahul Verma", email: "rahul.design@email.com", phone: "+91 7654321098", about: "Creative UI/UX designer focused on user-centered design and product thinking.", skills: ["UI/UX", "Figma", "Adobe XD", "Framer", "CSS", "React"], match: 88, rank: "Top 10%", experience: "Freelance Designer 2 years", certificates: ["Google UX Design"], qualification: "B.Tech", graduation: "BITS Pilani", resumes: [], personalPosts: [], photo: null, applications: [] },
  { id: "s4", name: "Priya Sharma", email: "priya.backend@email.com", phone: "+91 6543210987", about: "Backend engineer specializing in microservices and distributed systems.", skills: ["Java", "Spring Boot", "AWS", "Docker", "Kubernetes", "PostgreSQL"], match: 85, rank: "Top 15%", experience: "1 year at TechCorp as Junior Dev", certificates: ["Oracle Java SE 8"], qualification: "B.Tech", graduation: "NIT Trichy", resumes: [], personalPosts: [], photo: null, applications: [] },
  { id: "s5", name: "Deepak Singh", email: "deepak.cloud@email.com", phone: "+91 5432109876", about: "DevOps engineer with expertise in cloud infrastructure and CI/CD pipelines.", skills: ["Docker", "Kubernetes", "AWS", "Terraform", "Jenkins", "Linux"], match: 82, rank: "Top 20%", experience: "6 months at CloudSoft", certificates: ["AWS Solutions Architect"], qualification: "B.Tech", graduation: "VIT Vellore", resumes: [], personalPosts: [], photo: null, applications: [] },
  { id: "s6", name: "Ankita Das", email: "ankita.ml@email.com", phone: "+91 4321098765", about: "ML engineer with focus on NLP and computer vision projects.", skills: ["Python", "PyTorch", "NLP", "Computer Vision", "FastAPI"], match: 79, rank: "Top 25%", experience: "Intern at Analytics Co.", certificates: ["TensorFlow Developer"], qualification: "M.Tech", graduation: "IIT Bombay", resumes: [], personalPosts: [], photo: null, applications: [] },
];


// ─── HELPER COMPONENTS ────────────────────────────────────────────────────────
const Avatar = ({ name, photo, size = 44, radius = 12 }) => (
  photo
    ? <img src={photo} alt="" style={{ width: size, height: size, borderRadius: radius, objectFit: "cover", flexShrink: 0 }} />
    : <div style={{ width: size, height: size, borderRadius: radius, background: "var(--accent3)", color: "var(--accent2)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: size * 0.36, flexShrink: 0 }}>{(name || "?")[0]}</div>
);

const StatusChip = ({ status }) => {
  const map = { Pending: "s-pending", Shortlisted: "s-shortlisted", Selected: "s-selected", Rejected: "s-rejected" };
  return <span className={`status-chip ${map[status] || "s-pending"}`}>{status || "Pending"}</span>;
};

const TypeChip = ({ type }) => {
  if (!type) return <span className="type-chip chip-vacancy">Vacancy</span>;
  const t = type.toLowerCase();
  if (t.includes("intern")) return <span className="type-chip chip-internship">Internship</span>;
  if (t.includes("train")) return <span className="type-chip chip-training">Training</span>;
  if (t.includes("campus")) return <span className="type-chip chip-campus">Campus</span>;
  return <span className="type-chip chip-vacancy">{type}</span>;
};

const lineColorForType = (type) => {
  if (!type) return "var(--accent)";
  const t = type.toLowerCase();
  if (t.includes("intern")) return "var(--violet)";
  if (t.includes("train")) return "var(--green)";
  if (t.includes("campus")) return "var(--amber)";
  return "var(--accent)";
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function IndustryDashboard() {
  const navigate = useNavigate();
  const { user: authUser, profile: authProfile, signOut } = useAuth();

  // ── State ──────────────────────────────────────────────────────────────────
  const [tab, setTab] = useState("dashboard");
  const [toasts, setToasts] = useState([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [activeChat, setActiveChat] = useState(null);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState({});
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [newAchievement, setNewAchievement] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Data
  const [jobs, setJobs] = useState([]);
  const [students, setStudents] = useState([]);
  const [companyProfile, setCompanyProfile] = useState({
    id: null,
    name: "Your Company",
    tagline: "Innovating Tomorrow",
    email: "",
    phone: "",
    website: "",
    location: "India",
    address: "",
    about: "Update your company profile to attract top talent.",
    industry: "Technology",
    founded: "",
    photo: null,
    achievements: ["Great Place to Work 2024"],
    employees: "100+",
  });

  // Form states
  const [newJob, setNewJob] = useState({ title: "", desc: "", type: "Job Vacancy", skills: "", duration: "", offerings: "", location: "" });
  const [profileForm, setProfileForm] = useState({});
  const [editingJob, setEditingJob] = useState(null);
  const [viewingJobDetail, setViewingJobDetail] = useState(null);
  const [applyingStudent, setApplyingStudent] = useState(null);

  const chatEndRef = useRef();
  const fileInputRef = useRef();
  const pendingNavRef = useRef(null);

  // ── Init ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      if (authProfile) {
        setCompanyProfile(prev => ({
          ...prev,
          id: authUser?.id,
          name: authProfile.company_name || authProfile.name || prev.name,
          email: authProfile.email || "",
          phone: authProfile.phone || "",
          website: authProfile.website || "",
          location: authProfile.location || authProfile.address || prev.location,
          address: authProfile.address || authProfile.location || "",
          about: authProfile.about || prev.about,
          industry: authProfile.domain || prev.industry,
          founded: authProfile.founded || "",
          photo: authProfile.photo || null,
          tagline: authProfile.tagline || prev.tagline,
          achievements: authProfile.achievements?.length ? authProfile.achievements : prev.achievements,
        }));
      }

      try {
        const [vacsRes, studentsRes, msgsRes] = await Promise.allSettled([
          axios.get(`${API}/vacancies`, { timeout: 8000 }),
          axios.get(`${API}/users?role=student`, { timeout: 8000 }),
          authUser?.id ? axios.get(`${API}/messages/${authUser.id}`, { timeout: 8000 }) : Promise.resolve({ data: [] }),
        ]);

        if (vacsRes.status === "fulfilled" && Array.isArray(vacsRes.value?.data)) {
          const uid = authUser?.id;
          const formattedJobs = await Promise.all(
            vacsRes.value.data.map(async (v) => {
              let apps = [];
              if (uid && v.owner_id === uid) {
                try {
                  const appsRes = await axios.get(`${API}/applications/vacancy/${v.id}`, { timeout: 6000 });
                  if (Array.isArray(appsRes.data)) {
                    apps = appsRes.data.map(a => ({
                      id: a.id,
                      studentId: a.student_id,
                      name: a.profiles?.full_name || a.student_name || "Student",
                      email: a.profiles?.email || "",
                      coverLetter: a.cover_letter,
                      status: a.status || "Pending",
                      appliedOn: a.created_at ? new Date(a.created_at).toLocaleDateString() : "Recent",
                    }));
                  }
                } catch (_) {}
              }
              return {
                id: v.id, ownerId: v.owner_id,
                ownerName: v.owner_name,
                type: v.type,
                title: v.title,
                desc: v.description || v.desc || "",
                skills: v.skills || "",
                duration: v.duration || "",
                offerings: v.offerings || "",
                location: v.location || "",
                date: v.created_at ? new Date(v.created_at).toLocaleDateString() : "Recent",
                likes: v.likes || 0,
                applications: apps,
              };
            })
          );
          setJobs(formattedJobs);
        }

        if (studentsRes.status === "fulfilled" && Array.isArray(studentsRes.value?.data) && studentsRes.value.data.length > 0) {
          setStudents(studentsRes.value.data.map(s => ({
            ...s,
            name: s.name || s.full_name || "Student",
            skills: s.skills || [],
            match: s.match || Math.floor(Math.random() * 25 + 70),
            rank: s.rank || "Top 25%",
            experience: s.experience || "",
            certificates: s.certificates || [],
            qualification: s.qualification || "",
            graduation: s.graduation || s.college || "",
            resumes: s.resumes || [],
            personalPosts: s.personalPosts || [],
            photo: s.photo || null,
            email: s.email || "",
            phone: s.phone || "",
            about: s.about || "",
            applications: [],
          })));
        } else {
          setStudents(MOCK_STUDENTS);
        }

        if (msgsRes.status === "fulfilled" && Array.isArray(msgsRes.value?.data) && authUser?.id) {
          const msgs = {};
          msgsRes.value.data.forEach(m => {
            const pid = m.sender_id === authUser.id ? m.receiver_id : m.sender_id;
            if (!msgs[pid]) msgs[pid] = [];
            msgs[pid].push({
              mine: m.sender_id === authUser.id,
              text: m.text,
              time: new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            });
          });
          setChatMessages(prev => ({ ...prev, ...msgs }));
        }
      } catch (err) {
        console.error("Init error:", err);
        setStudents(MOCK_STUDENTS);
      }
      setIsLoading(false);
    };
    init();
  }, [authUser?.id]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMessages, activeChat]);

  useEffect(() => {
    window.history.pushState({ dashboardGuard: true }, '');
    const handlePop = () => {
      window.history.pushState({ dashboardGuard: true }, '');
      setShowExitConfirm(true);
      pendingNavRef.current = '/login';
    };
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, []);

  useEffect(() => {
    const handle = e => { e.preventDefault(); e.returnValue = ''; return ''; };
    window.addEventListener('beforeunload', handle);
    return () => window.removeEventListener('beforeunload', handle);
  }, []);

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const toast = useCallback((msg, color = "var(--accent2)") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg, color }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const myJobs = jobs.filter(j => j.ownerId === (authUser?.id || companyProfile.id));
  const allApplications = myJobs.flatMap(j => (j.applications || []).map(a => ({ ...a, jobTitle: j.title, jobType: j.type, jobId: j.id })));
  const totalApplicants = myJobs.reduce((s, j) => s + (j.applications?.length || 0), 0);
  const shortlisted = myJobs.reduce((s, j) => s + (j.applications?.filter(a => a.status === "Shortlisted" || a.status === "Selected").length || 0), 0);
  const filtered = filterStatus === "All" ? allApplications : allApplications.filter(a => a.status === filterStatus);
  const filteredStudents = students.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    (s.skills || []).some(sk => sk.toLowerCase().includes(search.toLowerCase())) ||
    s.qualification?.toLowerCase().includes(search.toLowerCase())
  );

  // ── Actions ──────────────────────────────────────────────────────────────────

  /*
   * FIX: createJob now:
   * 1. Validates owner_id BEFORE calling the API (prevents null FK insert)
   * 2. Surfaces the real server error in the toast instead of silently
   *    creating a local-only job that disappears on refresh.
   */
  const createJob = async () => {
    if (!newJob.title.trim() || !newJob.desc.trim()) {
      toast("❌ Title and description are required", "var(--red)");
      return;
    }

    // Guard: user must be authenticated before posting
    const ownerId = authUser?.id || companyProfile.id;
    if (!ownerId) {
      toast("❌ You must be logged in to post a job. Please refresh and try again.", "var(--red)");
      return;
    }

    const payload = {
      ...newJob,
      owner_id: ownerId,
      owner_name: companyProfile.name,
    };

    try {
      const res = await axios.post(`${API}/vacancies`, payload);
      const saved = res.data;
      setJobs(prev => [{
        id: saved.id,
        ownerId: saved.owner_id,
        ownerName: saved.owner_name,
        type: saved.type,
        title: saved.title,
        desc: saved.description,
        skills: saved.skills,
        duration: saved.duration,
        offerings: saved.offerings,
        location: saved.location,
        date: "Just now",
        likes: 0,
        applications: [],
      }, ...prev]);
      toast("✅ Job posted successfully", "var(--green)");
    } catch (err) {
      // Surface the real backend error so it's visible
      const serverMsg = err.response?.data?.error || err.message || "Server error";
      console.error("Job post failed:", serverMsg);
      toast(`❌ Failed to post job: ${serverMsg}`, "var(--red)");
      // Do NOT create a local fallback job — it gives false confidence
      return;
    }

    setNewJob({ title: "", desc: "", type: "Job Vacancy", skills: "", duration: "", offerings: "", location: "" });
    setIsPostModalOpen(false);
  };

  const deleteJob = async (id) => {
    setJobs(prev => prev.filter(j => j.id !== id));
    try { await axios.delete(`${API}/vacancies/${id}`); } catch (_) {}
    toast("🗑️ Job removed");
  };

  const updateStatus = async (jobId, appId, status) => {
    setJobs(prev => prev.map(j => j.id === jobId
      ? { ...j, applications: j.applications.map(a => a.id === appId ? { ...a, status } : a) }
      : j
    ));
    try { await axios.put(`${API}/applications/${appId}/status`, { status }); } catch (_) {}
    const colors = { Shortlisted: "var(--accent2)", Selected: "var(--green)", Rejected: "var(--red)", Pending: "var(--amber)" };
    toast(`Marked: ${status}`, colors[status] || "var(--accent2)");
  };

  const sendMessage = async () => {
    if (!chatInput.trim() || !activeChat) return;
    const text = chatInput.trim();
    const sid = activeChat.id;
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setChatMessages(prev => ({ ...prev, [sid]: [...(prev[sid] || []), { mine: true, text, time }] }));
    setChatInput("");
    try {
      if (authUser?.id) await axios.post(`${API}/messages`, { sender_id: authUser.id, receiver_id: sid, text });
    } catch (_) {}
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    const updated = { ...companyProfile, ...profileForm };
    setCompanyProfile(updated);
    setIsEditingProfile(false);
    if (authUser?.id) {
      try {
        await axios.put(`${API}/profile/${authUser.id}`, {
          company_name: updated.name,
          email: updated.email,
          phone: updated.phone,
          website: updated.website,
          about: updated.about,
          location: updated.location,
          domain: updated.industry,
          founded: updated.founded,
          tagline: updated.tagline,
        });
        toast("✅ Profile saved");
      } catch (err) {
        const serverMsg = err.response?.data?.error || err.message;
        console.error("Profile save failed:", serverMsg);
        toast("Profile updated locally (sync failed)", "var(--amber)");
      }
    }
  };

  const handleLogout = async () => {
    try { await signOut(); } catch (_) {}
    navigate("/login");
  };

  // ── Sidebar nav ──────────────────────────────────────────────────────────────
  const navItems = [
    { id: "dashboard", icon: "⬛", label: "Dashboard" },
    { id: "jobs", icon: "💼", label: "My Jobs", badge: myJobs.length, badgeColor: "" },
    { id: "applications", icon: "📋", label: "Applications", badge: totalApplicants > 0 ? totalApplicants : null, badgeColor: totalApplicants > 0 ? "amber" : "" },
    { id: "talent", icon: "🎯", label: "Find Talent" },
    { id: "messages", icon: "💬", label: "Messages", badge: Object.keys(chatMessages).length > 0 ? Object.keys(chatMessages).length : null, badgeColor: "green" },
    { id: "analytics", icon: "📊", label: "Analytics" },
    { id: "profile", icon: "🏢", label: "Company" },
  ];

  // ── RENDER ──────────────────────────────────────────────────────────────────
  return (
    <div className="id-root">
      

      {/* EXIT CONFIRM OVERLAY */}
      <AnimatePresence>
        {showExitConfirm && (
          <motion.div className="exit-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="exit-box" initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 20 }}>
              <div className="exit-icon">🚪</div>
              <div className="exit-title">Leave CareerBridge?</div>
              <div className="exit-sub">You'll be signed out and returned to login. Any unsaved changes will be lost.</div>
              <div className="exit-btn-row">
                <button className="exit-btn-stay" onClick={() => setShowExitConfirm(false)}>Stay Here</button>
                <button className="exit-btn-leave" onClick={async () => {
                  setShowExitConfirm(false);
                  try { await signOut(); } catch (_) {}
                  navigate(pendingNavRef.current || '/login');
                }}>Yes, Leave</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SIDEBAR */}
      <aside className="id-sidebar">
        <div className="sidebar-brand">
          <div className="brand-logo">CareerBridge</div>
          <div className="brand-tag">Industry Portal</div>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-group-label">Main</div>
          {navItems.slice(0, 5).map(n => (
            <div key={n.id} className={`nav-item ${tab === n.id ? "active" : ""}`} onClick={() => setTab(n.id)}>
              <span className="nav-icon">{n.icon}</span>
              <span>{n.label}</span>
              {n.badge ? <span className={`nav-badge ${n.badgeColor || ""}`}>{n.badge}</span> : null}
            </div>
          ))}
          <div className="nav-group-label" style={{ marginTop: "0.5rem" }}>Insights</div>
          {navItems.slice(5).map(n => (
            <div key={n.id} className={`nav-item ${tab === n.id ? "active" : ""}`} onClick={() => setTab(n.id)}>
              <span className="nav-icon">{n.icon}</span>
              <span>{n.label}</span>
            </div>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-user" onClick={() => setTab("profile")}>
            <div className="s-avatar">
              {companyProfile.photo ? <img src={companyProfile.photo} alt="" /> : companyProfile.name[0]}
            </div>
            <div>
              <div className="s-name">{companyProfile.name}</div>
              <div className="s-role">{companyProfile.industry}</div>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>← Sign Out</button>
        </div>
      </aside>

      {/* MAIN */}
      <div className="id-main">
        {/* Topbar */}
        <div className="topbar">
          <div className="topbar-title">{navItems.find(n => n.id === tab)?.label || "Dashboard"}</div>
          <div className="search-box">
            <span style={{ color: "var(--text3)", fontSize: "0.8rem" }}>🔍</span>
            <input placeholder="Search talent, skills, jobs…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="topbar-actions">
            <div className="icon-btn" title="Notifications"><span>🔔</span><span className="notif-dot" /></div>
            <button className="btn btn-primary btn-sm" onClick={() => setIsPostModalOpen(true)}>+ Post Job</button>
          </div>
        </div>

        {/* Content */}
        <div className="content-area">
          <AnimatePresence mode="wait">

            {/* ══ DASHBOARD ═══════════════════════════════════════════════════ */}
            {tab === "dashboard" && (
              <motion.div className="page" key="dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="stats-grid">
                  {[
                    { label: "Active Jobs", value: myJobs.length, badge: "+2 this week", up: true, icon: "💼", color: "var(--accent2)", glow: "rgba(59,130,246,0.1)" },
                    { label: "Total Applicants", value: totalApplicants, badge: `${Math.floor(totalApplicants * 0.3)} new today`, up: true, icon: "👥", color: "#93c5fd", glow: "rgba(147,197,253,0.08)" },
                    { label: "Shortlisted", value: shortlisted, badge: `${totalApplicants ? Math.round(shortlisted / totalApplicants * 100) : 0}% acceptance`, up: true, icon: "⭐", color: "var(--amber)", glow: "rgba(245,158,11,0.08)" },
                    { label: "Talent Pool", value: students.length, badge: "Students registered", up: false, icon: "🎯", color: "var(--green)", glow: "rgba(16,185,129,0.08)" },
                  ].map((s, i) => (
                    <motion.div key={i} className="stat-card" style={{ "--glow": s.glow }} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                      <div className="stat-icon">{s.icon}</div>
                      <div className="stat-label">{s.label}</div>
                      <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
                      <span className="stat-badge" style={{ background: s.glow, color: s.color }}>▲ {s.badge}</span>
                    </motion.div>
                  ))}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "1.2rem" }}>
                  <div>
                    <div className="section-hd">
                      <div><div className="section-title">Recent Postings</div><div className="section-sub">{myJobs.length} active listings</div></div>
                      <button className="btn btn-ghost btn-sm" onClick={() => setTab("jobs")}>View All →</button>
                    </div>
                    {myJobs.length === 0
                      ? <div className="card card-p"><div className="empty-state"><div className="empty-icon">📭</div><div className="empty-title">No jobs posted yet</div><div className="empty-text">Post your first job to start receiving applications.</div><button className="btn btn-primary" style={{ marginTop: "1rem" }} onClick={() => setIsPostModalOpen(true)}>Post First Job</button></div></div>
                      : myJobs.slice(0, 3).map((j, i) => (
                        <motion.div key={j.id} className="card card-hover" style={{ marginBottom: "0.8rem", padding: "1.2rem", cursor: "pointer", "--line": lineColorForType(j.type) }} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }} onClick={() => { setViewingJobDetail(j); setTab("jobs"); }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <div style={{ flex: 1 }}>
                              <TypeChip type={j.type} />
                              <div className="job-title" style={{ fontSize: "0.9rem", margin: "0.5rem 0 0.3rem" }}>{j.title}</div>
                              <div className="job-meta">
                                {j.location && <span>📍 {j.location}</span>}
                                {j.duration && <span>⏱ {j.duration}</span>}
                                <span>📅 {j.date}</span>
                              </div>
                            </div>
                            <div style={{ textAlign: "right", flexShrink: 0, marginLeft: "1rem" }}>
                              <div style={{ fontFamily: "'Cabinet Grotesk'", fontSize: "1.5rem", fontWeight: 900, color: "var(--accent2)" }}>{j.applications?.length || 0}</div>
                              <div style={{ fontSize: "0.62rem", color: "var(--text3)" }}>applicants</div>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    }
                  </div>

                  <div>
                    <div className="section-hd"><div className="section-title">Quick Actions</div></div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", marginBottom: "1.4rem" }}>
                      {[
                        { icon: "➕", label: "Post New Job", sub: "Vacancies, internships, campus drives", action: () => setIsPostModalOpen(true), color: "var(--accent3)" },
                        { icon: "🎯", label: "Browse Talent", sub: `${students.length} students available`, action: () => setTab("talent"), color: "var(--green2)" },
                        { icon: "📋", label: "Review Applications", sub: `${totalApplicants} total applications`, action: () => setTab("applications"), color: "var(--amber2)" },
                      ].map((qa, i) => (
                        <div key={i} className="qa-item" onClick={qa.action}>
                          <div className="qa-icon" style={{ background: qa.color }}>{qa.icon}</div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: "0.82rem" }}>{qa.label}</div>
                            <div style={{ fontSize: "0.68rem", color: "var(--text3)", marginTop: 1 }}>{qa.sub}</div>
                          </div>
                          <span style={{ marginLeft: "auto", color: "var(--text3)", fontSize: "0.8rem" }}>›</span>
                        </div>
                      ))}
                    </div>

                    {allApplications.length > 0 && (
                      <>
                        <div className="section-hd" style={{ marginBottom: "0.7rem" }}><div className="section-title" style={{ fontSize: "0.88rem" }}>Recent Applicants</div></div>
                        {allApplications.slice(0, 4).map((a, i) => (
                          <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "0.6rem 0", borderBottom: "1px solid var(--border)" }}>
                            <div style={{ width: 30, height: 30, borderRadius: 8, background: "var(--surface3)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "0.72rem", color: "var(--text2)", flexShrink: 0 }}>{a.name?.[0] || "?"}</div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontWeight: 700, fontSize: "0.78rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.name}</div>
                              <div style={{ fontSize: "0.65rem", color: "var(--text3)" }}>{a.jobTitle}</div>
                            </div>
                            <StatusChip status={a.status} />
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>

                <div style={{ marginTop: "1.8rem" }}>
                  <div className="section-hd">
                    <div><div className="section-title">Top Talent Matches</div><div className="section-sub">Recommended for your domain</div></div>
                    <button className="btn btn-ghost btn-sm" onClick={() => setTab("talent")}>Explore All →</button>
                  </div>
                  <div className="talent-grid">
                    {students.slice(0, 4).map((s, i) => (
                      <motion.div key={s.id} className="talent-card" onClick={() => setSelectedStudent(s)} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                        <div className="talent-top">
                          <div className="talent-av"><Avatar name={s.name} photo={s.photo} size={44} radius={12} /></div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div className="talent-name">{s.name}</div>
                            <div className="talent-qual">{s.qualification} · {s.graduation}</div>
                          </div>
                        </div>
                        <div className="match-row">
                          <span className="rank-chip">{s.rank}</span>
                          <div className="match-bar-bg"><div className="match-bar-fill" style={{ width: `${s.match}%` }} /></div>
                          <span className="match-pct">{s.match}%</span>
                        </div>
                        <div className="skills-row" style={{ marginTop: "0.75rem" }}>
                          {(s.skills || []).slice(0, 3).map((sk, j) => <span key={j} className="skill-chip">{sk}</span>)}
                          {s.skills?.length > 3 && <span className="skill-chip">+{s.skills.length - 3}</span>}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ══ MY JOBS ═════════════════════════════════════════════════════ */}
            {tab === "jobs" && (
              <motion.div className="page" key="jobs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="section-hd">
                  <div><div className="section-title">Job Postings</div><div className="section-sub">{myJobs.length} posted by your company</div></div>
                  <button className="btn btn-primary" onClick={() => setIsPostModalOpen(true)}>+ New Posting</button>
                </div>
                {myJobs.length === 0
                  ? <div className="card"><div className="empty-state"><div className="empty-icon">📭</div><div className="empty-title">No postings yet</div><div className="empty-text">Post your first job to start attracting candidates.</div><button className="btn btn-primary" style={{ marginTop: "1rem" }} onClick={() => setIsPostModalOpen(true)}>Post a Job</button></div></div>
                  : <div className="jobs-grid">
                      {myJobs.map((j, i) => (
                        <motion.div key={j.id} className="job-card" style={{ "--line": lineColorForType(j.type) }} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                            <TypeChip type={j.type} />
                            <div style={{ display: "flex", gap: 4 }}>
                              <button className="btn btn-ghost btn-icon btn-xs" title="View & edit" onClick={() => setViewingJobDetail(j)}>👁</button>
                              <button className="btn btn-danger btn-icon btn-xs" title="Delete" onClick={() => deleteJob(j.id)}>🗑</button>
                            </div>
                          </div>
                          <div className="job-title">{j.title}</div>
                          <div className="job-meta">
                            {j.location && <span>📍 {j.location || companyProfile.location}</span>}
                            {j.duration && <span>⏱ {j.duration}</span>}
                            {j.offerings && <span>💰 {j.offerings}</span>}
                          </div>
                          <div style={{ fontSize: "0.78rem", color: "var(--text3)", lineHeight: 1.5, marginBottom: "0.9rem", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{j.desc}</div>
                          <div className="skills-row">
                            {(j.skills || "").split(",").filter(Boolean).slice(0, 4).map((sk, k) => <span key={k} className="skill-chip">{sk.trim()}</span>)}
                          </div>
                          <div className="job-foot">
                            <div className="applicants-ct">👥 <strong>{j.applications?.length || 0}</strong> applicant{j.applications?.length !== 1 ? "s" : ""}</div>
                            <button className="btn btn-ghost btn-sm" onClick={() => setViewingJobDetail(j)}>View Applicants →</button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                }

                {/* Job Detail Modal */}
                <AnimatePresence>
                  {viewingJobDetail && (
                    <motion.div className="modal-ov" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={e => e.target === e.currentTarget && setViewingJobDetail(null)}>
                      <motion.div className="modal-box lg" initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}>
                        <button className="modal-close" onClick={() => setViewingJobDetail(null)}>✕</button>
                        <TypeChip type={viewingJobDetail.type} />
                        <div className="modal-title" style={{ marginTop: "0.6rem" }}>{viewingJobDetail.title}</div>
                        <div className="modal-sub">{viewingJobDetail.ownerName} · {viewingJobDetail.date}</div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem", marginBottom: "1.2rem" }}>
                          {[["📍 Location", viewingJobDetail.location], ["⏱ Duration", viewingJobDetail.duration], ["💰 Offerings", viewingJobDetail.offerings]].map(([l, v]) => v && (
                            <div key={l} style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: "10px", padding: "0.75rem" }}>
                              <div style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", marginBottom: 3 }}>{l.split(" ").slice(1).join(" ")}</div>
                              <div style={{ fontSize: "0.82rem", fontWeight: 600 }}>{v}</div>
                            </div>
                          ))}
                        </div>
                        <div style={{ fontSize: "0.82rem", color: "var(--text2)", lineHeight: 1.7, marginBottom: "1.2rem" }}>{viewingJobDetail.desc}</div>
                        <div className="skills-row" style={{ marginBottom: "1.5rem" }}>
                          {(viewingJobDetail.skills || "").split(",").filter(Boolean).map((sk, k) => <span key={k} className="skill-chip">{sk.trim()}</span>)}
                        </div>
                        <div style={{ fontFamily: "'Cabinet Grotesk'", fontWeight: 800, fontSize: "0.9rem", marginBottom: "0.8rem" }}>
                          Applicants ({viewingJobDetail.applications?.length || 0})
                        </div>
                        {!(viewingJobDetail.applications?.length)
                          ? <div style={{ textAlign: "center", padding: "2rem", color: "var(--text3)", fontSize: "0.82rem" }}>No applications yet for this posting.</div>
                          : <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                              {viewingJobDetail.applications.map((a, i) => {
                                const student = students.find(s => String(s.id) === String(a.studentId));
                                return (
                                  <div key={i} style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: "10px", padding: "0.9rem 1rem", display: "flex", alignItems: "center", gap: "10px" }}>
                                    <div style={{ width: 34, height: 34, borderRadius: 9, background: "var(--surface3)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "0.78rem", color: "var(--text2)", flexShrink: 0 }}>{a.name?.[0] || "?"}</div>
                                    <div style={{ flex: 1 }}>
                                      <div style={{ fontWeight: 700, fontSize: "0.82rem" }}>{a.name}</div>
                                      <div style={{ fontSize: "0.68rem", color: "var(--text3)" }}>{a.email} · Applied {a.appliedOn}</div>
                                    </div>
                                    <select value={a.status || "Pending"} onChange={e => updateStatus(viewingJobDetail.id, a.id, e.target.value)}
                                      style={{ background: "var(--surface3)", border: "1px solid var(--border2)", borderRadius: "7px", padding: "0.35rem 0.7rem", color: "var(--text)", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                                      {["Pending", "Shortlisted", "Selected", "Rejected"].map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                    {student && (
                                      <button className="btn btn-ghost btn-xs" onClick={() => { setSelectedStudent(student); setViewingJobDetail(null); }}>Profile</button>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                        }
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* ══ APPLICATIONS ════════════════════════════════════════════════ */}
            {tab === "applications" && (
              <motion.div className="page" key="applications" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="section-hd">
                  <div><div className="section-title">All Applications</div><div className="section-sub">{allApplications.length} total · {shortlisted} shortlisted/selected</div></div>
                  <div className="pill-select">
                    {["All", "Pending", "Shortlisted", "Selected", "Rejected"].map(f => (
                      <button key={f} className={`pill-opt ${filterStatus === f ? "active" : ""}`} onClick={() => setFilterStatus(f)}>{f}</button>
                    ))}
                  </div>
                </div>

                {filtered.length === 0
                  ? <div className="card"><div className="empty-state"><div className="empty-icon">📥</div><div className="empty-title">No applications {filterStatus !== "All" ? `with status "${filterStatus}"` : "yet"}</div><div className="empty-text">Post jobs and students will apply here.</div></div></div>
                  : <div className="card" style={{ overflow: "hidden" }}>
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Candidate</th>
                            <th>Applied For</th>
                            <th>Applied On</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filtered.map((a, i) => {
                            const student = students.find(s => String(s.id) === String(a.studentId));
                            return (
                              <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                                <td>
                                  <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                                    <div style={{ width: 32, height: 32, borderRadius: 9, background: "var(--surface3)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "0.75rem", color: "var(--text2)", flexShrink: 0 }}>{a.name?.[0] || "?"}</div>
                                    <div>
                                      <div style={{ fontWeight: 700, fontSize: "0.82rem" }}>{a.name}</div>
                                      <div style={{ fontSize: "0.66rem", color: "var(--text3)" }}>{a.email}</div>
                                    </div>
                                  </div>
                                </td>
                                <td>
                                  <div style={{ fontWeight: 600, fontSize: "0.8rem" }}>{a.jobTitle}</div>
                                  <TypeChip type={a.jobType} />
                                </td>
                                <td style={{ color: "var(--text3)", fontSize: "0.75rem" }}>{a.appliedOn}</td>
                                <td>
                                  <select value={a.status || "Pending"} onChange={e => updateStatus(a.jobId, a.id, e.target.value)}
                                    style={{ background: "var(--surface3)", border: "1px solid var(--border2)", borderRadius: "7px", padding: "0.3rem 0.65rem", color: "var(--text)", fontSize: "0.72rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                                    {["Pending", "Shortlisted", "Selected", "Rejected"].map(s => <option key={s} value={s}>{s}</option>)}
                                  </select>
                                </td>
                                <td>
                                  <div style={{ display: "flex", gap: 5 }}>
                                    {student && <button className="btn btn-ghost btn-xs" onClick={() => setSelectedStudent(student)}>Profile</button>}
                                    {student && <button className="btn btn-ghost btn-xs" onClick={() => { setActiveChat(student); setTab("messages"); }}>💬</button>}
                                    {a.coverLetter && (
                                      <button className="btn btn-ghost btn-xs" onClick={() => setApplyingStudent({ name: a.name, coverLetter: a.coverLetter })} title="View cover letter">📄</button>
                                    )}
                                  </div>
                                </td>
                              </motion.tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                }

                <AnimatePresence>
                  {applyingStudent && (
                    <motion.div className="modal-ov" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={e => e.target === e.currentTarget && setApplyingStudent(null)}>
                      <motion.div className="modal-box" initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}>
                        <button className="modal-close" onClick={() => setApplyingStudent(null)}>✕</button>
                        <div className="modal-title">Cover Letter</div>
                        <div className="modal-sub">From: {applyingStudent.name}</div>
                        <div style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: "10px", padding: "1.2rem", fontSize: "0.84rem", lineHeight: 1.7, color: "var(--text2)" }}>{applyingStudent.coverLetter}</div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* ══ TALENT ══════════════════════════════════════════════════════ */}
            {tab === "talent" && (
              <motion.div className="page" key="talent" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="section-hd">
                  <div><div className="section-title">Talent Pool</div><div className="section-sub">{filteredStudents.length} students{search ? ` matching "${search}"` : " registered"}</div></div>
                </div>
                <div className="talent-grid">
                  {filteredStudents.map((s, i) => (
                    <motion.div key={s.id} className="talent-card" onClick={() => setSelectedStudent(s)} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}>
                      <div className="talent-top">
                        <div className="talent-av"><Avatar name={s.name} photo={s.photo} size={44} radius={12} /></div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="talent-name">{s.name}</div>
                          <div className="talent-qual">{s.qualification} · {s.graduation}</div>
                        </div>
                        <span className="rank-chip">{s.rank}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "0.75rem" }}>
                        <div className="match-bar-bg" style={{ flex: 1 }}><div className="match-bar-fill" style={{ width: `${s.match}%` }} /></div>
                        <span className="match-pct">{s.match}%</span>
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text3)", lineHeight: 1.5, marginBottom: "0.75rem", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{s.about || "No bio added yet."}</div>
                      <div className="skills-row">
                        {(s.skills || []).slice(0, 4).map((sk, j) => <span key={j} className="skill-chip">{sk}</span>)}
                        {s.skills?.length > 4 && <span className="skill-chip" style={{ color: "var(--text3)" }}>+{s.skills.length - 4}</span>}
                      </div>
                      <div style={{ display: "flex", gap: 6, marginTop: "0.9rem" }}>
                        <button className="btn btn-ghost btn-sm" style={{ flex: 1, justifyContent: "center" }} onClick={e => { e.stopPropagation(); setSelectedStudent(s); }}>View Profile</button>
                        <button className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: "center" }} onClick={e => { e.stopPropagation(); setActiveChat(s); setTab("messages"); }}>💬 Message</button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ══ MESSAGES ════════════════════════════════════════════════════ */}
            {tab === "messages" && (
              <motion.div className="page" key="messages" style={{ padding: 0 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="msg-layout" style={{ margin: "1.5rem" }}>
                  <div className="conv-list">
                    <div className="conv-list-head">💬 Conversations</div>
                    <div className="conv-list-body">
                      {students.filter(s => chatMessages[s.id]).length === 0
                        ? <div style={{ padding: "2rem 1.2rem", textAlign: "center", color: "var(--text3)", fontSize: "0.78rem" }}>No conversations yet. Go to Talent to start messaging.</div>
                        : students.filter(s => chatMessages[s.id]).map(s => (
                          <div key={s.id} className={`conv-row ${activeChat?.id === s.id ? "active" : ""}`} onClick={() => setActiveChat(s)}>
                            <div className="conv-av">{s.name[0]}</div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div className="conv-name">{s.name}</div>
                              <div className="conv-preview">{chatMessages[s.id]?.at(-1)?.text || "—"}</div>
                            </div>
                            {chatMessages[s.id]?.some(m => !m.mine) && <div className="unread-dot" />}
                          </div>
                        ))
                      }
                    </div>
                  </div>
                  <div className="chat-area">
                    {!activeChat
                      ? <div className="empty-state" style={{ margin: "auto" }}><div className="empty-icon">💬</div><div className="empty-title">Select a conversation</div><div className="empty-text">Choose a student from the left panel to start chatting.</div></div>
                      : <>
                          <div className="chat-head">
                            <div className="conv-av">{activeChat.name[0]}</div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 700, fontSize: "0.88rem" }}>{activeChat.name}</div>
                              <div style={{ fontSize: "0.68rem", color: "var(--text3)" }}>{activeChat.qualification} · {activeChat.graduation}</div>
                            </div>
                            <button className="btn btn-ghost btn-sm" onClick={() => setSelectedStudent(activeChat)}>View Profile</button>
                          </div>
                          <div className="chat-body">
                            {(chatMessages[activeChat.id] || []).length === 0
                              ? <div className="empty-state" style={{ margin: "auto" }}><div className="empty-icon">💬</div><div className="empty-title">Start the conversation</div></div>
                              : (chatMessages[activeChat.id] || []).map((m, i) => (
                                <div key={i} className={`bubble ${m.mine ? "sent" : "recv"}`}>
                                  {m.text}
                                  <div className="bubble-time">{m.time}</div>
                                </div>
                              ))
                            }
                            <div ref={chatEndRef} />
                          </div>
                          <div className="chat-input-row">
                            <textarea className="chat-input" rows={1} value={chatInput} onChange={e => setChatInput(e.target.value)}
                              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                              placeholder="Type a message… (Enter to send)" />
                            <button className="btn btn-primary" onClick={sendMessage}>Send</button>
                          </div>
                        </>
                    }
                  </div>
                </div>
              </motion.div>
            )}

            {/* ══ ANALYTICS ═══════════════════════════════════════════════════ */}
            {tab === "analytics" && (
              <motion.div className="page" key="analytics" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="section-hd" style={{ marginBottom: "1.5rem" }}>
                  <div><div className="section-title">Analytics Overview</div><div className="section-sub">Performance metrics for your hiring activity</div></div>
                </div>
                <div className="analytics-grid">
                  <div className="card card-p">
                    <div style={{ fontWeight: 700, marginBottom: "0.25rem" }}>Application Activity</div>
                    <div style={{ fontSize: "0.72rem", color: "var(--text3)", marginBottom: "0.75rem" }}>Last 7 days</div>
                    <div className="bar-chart-wrap">
                      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => {
                        const h = [35, 58, 42, 85, 65, 30, 18][i];
                        return (
                          <div key={day} style={{ flex: 1 }}>
                            <div className="bar" style={{ height: `${h}%`, background: i === 3 ? "var(--accent)" : "var(--surface3)", border: "1px solid var(--border2)" }} title={`~${Math.round(h * 0.4)} applications`} />
                            <div className="bar-label">{day}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="card card-p">
                    <div style={{ fontWeight: 700, marginBottom: "1rem" }}>Application Pipeline</div>
                    {[
                      { l: "Pending", count: allApplications.filter(a => (a.status || "Pending") === "Pending").length, color: "var(--amber)" },
                      { l: "Shortlisted", count: allApplications.filter(a => a.status === "Shortlisted").length, color: "var(--accent2)" },
                      { l: "Selected", count: allApplications.filter(a => a.status === "Selected").length, color: "var(--green)" },
                      { l: "Rejected", count: allApplications.filter(a => a.status === "Rejected").length, color: "var(--red)" },
                    ].map(item => (
                      <div key={item.l} style={{ marginBottom: "0.85rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", marginBottom: 4 }}>
                          <span style={{ color: "var(--text2)" }}>{item.l}</span>
                          <span style={{ fontWeight: 800, color: item.color }}>{item.count}</span>
                        </div>
                        <div style={{ height: 4, background: "var(--surface3)", borderRadius: 99 }}>
                          <div style={{ height: "100%", width: `${totalApplicants ? (item.count / totalApplicants) * 100 : 0}%`, background: item.color, borderRadius: 99, transition: "width 1s ease" }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
                  {[
                    { icon: "👁", title: "Total Views", value: myJobs.length * 138, sub: "Estimated across all posts", color: "var(--accent2)" },
                    { icon: "⚡", title: "Avg. Time to Fill", value: "12 days", sub: "Industry avg: 28 days", color: "var(--green)" },
                    { icon: "📊", title: "Acceptance Rate", value: `${totalApplicants > 0 ? Math.round((shortlisted / totalApplicants) * 100) : 0}%`, sub: "Shortlisted / total", color: "var(--violet)" },
                  ].map((m, i) => (
                    <motion.div key={i} className="card card-p" style={{ textAlign: "center" }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                      <div style={{ fontSize: "1.8rem", marginBottom: "0.6rem" }}>{m.icon}</div>
                      <div style={{ fontFamily: "'Cabinet Grotesk'", fontSize: "1.8rem", fontWeight: 900, color: m.color, marginBottom: "0.3rem" }}>{m.value}</div>
                      <div style={{ fontWeight: 700, fontSize: "0.82rem", marginBottom: "0.2rem" }}>{m.title}</div>
                      <div style={{ fontSize: "0.7rem", color: "var(--text3)" }}>{m.sub}</div>
                    </motion.div>
                  ))}
                </div>
                {myJobs.length > 0 && (
                  <>
                    <div className="section-hd" style={{ marginBottom: "0.8rem" }}><div className="section-title">Performance by Job</div></div>
                    <div className="card" style={{ overflow: "hidden" }}>
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Job Title</th><th>Type</th><th>Applicants</th><th>Shortlisted</th><th>Conversion</th><th>Posted</th>
                          </tr>
                        </thead>
                        <tbody>
                          {myJobs.map((j) => {
                            const appCount = j.applications?.length || 0;
                            const slCount = j.applications?.filter(a => a.status === "Shortlisted" || a.status === "Selected").length || 0;
                            const conv = appCount > 0 ? Math.round((slCount / appCount) * 100) : 0;
                            return (
                              <tr key={j.id}>
                                <td style={{ fontWeight: 700 }}>{j.title}</td>
                                <td><TypeChip type={j.type} /></td>
                                <td><span style={{ fontWeight: 800, color: "var(--accent2)" }}>{appCount}</span></td>
                                <td><span style={{ fontWeight: 800, color: "var(--green)" }}>{slCount}</span></td>
                                <td>
                                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <div style={{ flex: 1, height: 4, background: "var(--surface3)", borderRadius: 99 }}>
                                      <div style={{ height: "100%", width: `${conv}%`, background: "var(--green)", borderRadius: 99 }} />
                                    </div>
                                    <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--green)", minWidth: 28 }}>{conv}%</span>
                                  </div>
                                </td>
                                <td style={{ color: "var(--text3)", fontSize: "0.75rem" }}>{j.date}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </motion.div>
            )}

            {/* ══ COMPANY PROFILE ═════════════════════════════════════════════ */}
            {tab === "profile" && (
              <motion.div className="page" key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                {!isEditingProfile ? (
                  <>
                    <div className="profile-cover" style={{ marginBottom: "4.5rem" }}>
                      <div style={{ position: "relative", zIndex: 1 }}>
                        <div style={{ fontSize: "0.62rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.5)", marginBottom: 6 }}>Company Profile</div>
                        <div style={{ fontFamily: "'Cabinet Grotesk'", fontSize: "1.8rem", fontWeight: 900, color: "white" }}>{companyProfile.name}</div>
                        <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.85rem", marginTop: "0.4rem" }}>{companyProfile.tagline}</div>
                      </div>
                      <div className="profile-av-wrap" onClick={() => fileInputRef.current?.click()}>
                        {companyProfile.photo
                          ? <img src={companyProfile.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          : <div style={{ width: "100%", height: "100%", background: "var(--surface3)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Cabinet Grotesk'", fontWeight: 900, fontSize: "2rem", color: "var(--accent2)" }}>{companyProfile.name[0]}</div>}
                      </div>
                      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }}
                        onChange={e => { const f = e.target.files[0]; if (f) setCompanyProfile(p => ({ ...p, photo: URL.createObjectURL(f) })); }} />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1.2rem" }}>
                      <div>
                        <div className="card card-p" style={{ marginBottom: "1.2rem" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                            <div style={{ fontFamily: "'Cabinet Grotesk'", fontWeight: 800, fontSize: "0.95rem" }}>About Company</div>
                            <button className="btn btn-ghost btn-sm" onClick={() => { setProfileForm({ ...companyProfile }); setIsEditingProfile(true); }}>✏️ Edit</button>
                          </div>
                          <p style={{ fontSize: "0.84rem", color: "var(--text2)", lineHeight: 1.7 }}>{companyProfile.about || "No description added yet."}</p>
                        </div>
                        <div className="card card-p">
                          <div style={{ fontFamily: "'Cabinet Grotesk'", fontWeight: 800, fontSize: "0.95rem", marginBottom: "1rem" }}>Contact & Info</div>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                            {[
                              ["✉️", "Email", companyProfile.email],
                              ["📞", "Phone", companyProfile.phone],
                              ["🌐", "Website", companyProfile.website],
                              ["📍", "Location", companyProfile.location],
                              ["🏭", "Industry", companyProfile.industry],
                              ["📅", "Founded", companyProfile.founded],
                            ].map(([icon, label, val]) => (
                              <div key={label} style={{ display: "flex", gap: 8 }}>
                                <span style={{ fontSize: "0.95rem", marginTop: 1 }}>{icon}</span>
                                <div>
                                  <div style={{ fontSize: "0.62rem", fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.07em" }}>{label}</div>
                                  <div style={{ fontSize: "0.82rem", fontWeight: 600, marginTop: 2 }}>{val || "—"}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className="card card-p" style={{ marginBottom: "1.2rem" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.9rem" }}>
                            <div style={{ fontFamily: "'Cabinet Grotesk'", fontWeight: 800, fontSize: "0.9rem" }}>Achievements</div>
                          </div>
                          {(companyProfile.achievements || []).map((a, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "0.55rem 0", borderBottom: "1px solid var(--border)" }}>
                              <span>🏆</span>
                              <span style={{ fontSize: "0.82rem", fontWeight: 600, flex: 1 }}>{a}</span>
                              <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--red)", fontSize: "0.75rem" }} onClick={() => setCompanyProfile(p => ({ ...p, achievements: p.achievements.filter((_, j) => j !== i) }))}>✕</button>
                            </div>
                          ))}
                          <div style={{ display: "flex", gap: 6, marginTop: "0.8rem" }}>
                            <input className="form-input" style={{ padding: "0.42rem 0.7rem", flex: 1 }} placeholder="Add achievement…" value={newAchievement} onChange={e => setNewAchievement(e.target.value)}
                              onKeyDown={e => { if (e.key === "Enter" && newAchievement.trim()) { setCompanyProfile(p => ({ ...p, achievements: [...(p.achievements || []), newAchievement.trim()] })); setNewAchievement(""); } }} />
                            <button className="btn btn-primary btn-sm" onClick={() => { if (newAchievement.trim()) { setCompanyProfile(p => ({ ...p, achievements: [...(p.achievements || []), newAchievement.trim()] })); setNewAchievement(""); } }}>+</button>
                          </div>
                        </div>
                        <div className="card card-p">
                          <div style={{ fontFamily: "'Cabinet Grotesk'", fontWeight: 800, fontSize: "0.9rem", marginBottom: "0.9rem" }}>Hiring Stats</div>
                          {[
                            ["Jobs Posted", myJobs.length, "var(--accent2)"],
                            ["Total Applicants", totalApplicants, "#93c5fd"],
                            ["Shortlisted", shortlisted, "var(--green)"],
                            ["Talent Pool", students.length, "var(--amber)"],
                          ].map(([l, v, c], i) => (
                            <div key={l} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.55rem 0", borderBottom: i < 3 ? "1px solid var(--border)" : "none" }}>
                              <span style={{ fontSize: "0.78rem", color: "var(--text3)" }}>{l}</span>
                              <span style={{ fontFamily: "'Cabinet Grotesk'", fontWeight: 900, fontSize: "1rem", color: c }}>{v}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="card card-p" style={{ maxWidth: 700 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                      <div><div className="modal-title">Edit Company Profile</div><div className="modal-sub" style={{ marginBottom: 0 }}>Update your company information</div></div>
                      <button className="btn btn-ghost btn-sm" onClick={() => setIsEditingProfile(false)}>Cancel</button>
                    </div>
                    <form onSubmit={saveProfile}>
                      <div className="form-grid2">
                        <div className="form-group"><label className="form-label">Company Name</label><input className="form-input" value={profileForm.name || ""} onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))} /></div>
                        <div className="form-group"><label className="form-label">Tagline</label><input className="form-input" value={profileForm.tagline || ""} onChange={e => setProfileForm(p => ({ ...p, tagline: e.target.value }))} /></div>
                        <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" value={profileForm.email || ""} onChange={e => setProfileForm(p => ({ ...p, email: e.target.value }))} /></div>
                        <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={profileForm.phone || ""} onChange={e => setProfileForm(p => ({ ...p, phone: e.target.value }))} /></div>
                        <div className="form-group"><label className="form-label">Website</label><input className="form-input" value={profileForm.website || ""} onChange={e => setProfileForm(p => ({ ...p, website: e.target.value }))} /></div>
                        <div className="form-group"><label className="form-label">Industry / Domain</label><input className="form-input" value={profileForm.industry || ""} onChange={e => setProfileForm(p => ({ ...p, industry: e.target.value }))} /></div>
                        <div className="form-group"><label className="form-label">Location</label><input className="form-input" value={profileForm.location || ""} onChange={e => setProfileForm(p => ({ ...p, location: e.target.value }))} /></div>
                        <div className="form-group"><label className="form-label">Founded Year</label><input className="form-input" value={profileForm.founded || ""} onChange={e => setProfileForm(p => ({ ...p, founded: e.target.value }))} /></div>
                      </div>
                      <div className="form-group"><label className="form-label">About Company</label><textarea className="form-textarea" rows={4} value={profileForm.about || ""} onChange={e => setProfileForm(p => ({ ...p, about: e.target.value }))} /></div>
                      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                        <button type="button" className="btn btn-ghost" onClick={() => setIsEditingProfile(false)}>Cancel</button>
                        <button type="submit" className="btn btn-primary">Save Changes</button>
                      </div>
                    </form>
                  </div>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

      {/* ══ POST JOB MODAL ═══════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isPostModalOpen && (
          <motion.div className="modal-ov" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={e => e.target === e.currentTarget && setIsPostModalOpen(false)}>
            <motion.div className="modal-box lg" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>
              <button className="modal-close" onClick={() => setIsPostModalOpen(false)}>✕</button>
              <div className="modal-title">Post a New Opening</div>
              <div className="modal-sub">Attract the right candidates for your team</div>
              <div className="post-types">
                {["Job Vacancy", "Internship", "Training Program", "Campus Drive"].map(t => (
                  <button key={t} className={`post-type-btn ${newJob.type === t ? "active" : ""}`} onClick={() => setNewJob({ ...newJob, type: t })}>{t}</button>
                ))}
              </div>
              <div className="form-grid2">
                <div className="form-group" style={{ gridColumn: "span 2" }}>
                  <label className="form-label">Job Title *</label>
                  <input className="form-input" placeholder="e.g. Full Stack Developer, Data Science Intern…" value={newJob.title} onChange={e => setNewJob({ ...newJob, title: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input className="form-input" placeholder="e.g. Remote, Bangalore, Hybrid" value={newJob.location} onChange={e => setNewJob({ ...newJob, location: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Duration / Mode</label>
                  <input className="form-input" placeholder="e.g. 3 months, Full-time, Part-time" value={newJob.duration} onChange={e => setNewJob({ ...newJob, duration: e.target.value })} />
                </div>
                <div className="form-group" style={{ gridColumn: "span 2" }}>
                  <label className="form-label">Required Skills (comma separated)</label>
                  <input className="form-input" placeholder="e.g. React, Node.js, MongoDB, Python" value={newJob.skills} onChange={e => setNewJob({ ...newJob, skills: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Stipend / Salary / Offerings</label>
                  <input className="form-input" placeholder="e.g. ₹20,000/month, Negotiable" value={newJob.offerings} onChange={e => setNewJob({ ...newJob, offerings: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Company (auto-filled)</label>
                  <input className="form-input" value={companyProfile.name} readOnly />
                </div>
                <div className="form-group" style={{ gridColumn: "span 2" }}>
                  <label className="form-label">Job Description *</label>
                  <textarea className="form-textarea" rows={4} placeholder="Describe the role, responsibilities, requirements, and what you're looking for in an ideal candidate…" value={newJob.desc} onChange={e => setNewJob({ ...newJob, desc: e.target.value })} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: "0.5rem" }}>
                <button className="btn btn-ghost" onClick={() => setIsPostModalOpen(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={createJob} disabled={!newJob.title || !newJob.desc}>🚀 Publish Posting</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ STUDENT PROFILE DRAWER ═══════════════════════════════════════════════ */}
      <AnimatePresence>
        {selectedStudent && (
          <>
            <motion.div className="drawer-ov" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedStudent(null)} />
            <motion.div className="drawer" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 28, stiffness: 220 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.2rem" }}>
                <div style={{ fontFamily: "'Cabinet Grotesk'", fontWeight: 800, fontSize: "1rem" }}>Candidate Profile</div>
                <button className="modal-close" style={{ position: "static" }} onClick={() => setSelectedStudent(null)}>✕</button>
              </div>
              <div className="drawer-hero">
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.9rem" }}>
                  <div className="drawer-av"><Avatar name={selectedStudent.name} photo={selectedStudent.photo} size={60} radius={15} /></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: "1.05rem" }}>{selectedStudent.name}</div>
                    <div style={{ fontSize: "0.72rem", color: "var(--text3)", marginTop: 2 }}>{selectedStudent.qualification} · {selectedStudent.graduation}</div>
                    <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                      <span className="rank-chip">{selectedStudent.rank}</span>
                      <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--accent2)" }}>{selectedStudent.match}% match</span>
                    </div>
                  </div>
                </div>
                <div style={{ height: 3, background: "var(--surface4)", borderRadius: 99 }}>
                  <div style={{ height: "100%", width: `${selectedStudent.match}%`, background: "linear-gradient(90deg, var(--accent), var(--violet))", borderRadius: 99 }} />
                </div>
              </div>
              {selectedStudent.about && (
                <div style={{ marginBottom: "1.1rem" }}>
                  <div style={{ fontSize: "0.6rem", fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5 }}>About</div>
                  <p style={{ fontSize: "0.82rem", color: "var(--text2)", lineHeight: 1.6 }}>{selectedStudent.about}</p>
                </div>
              )}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.7rem", marginBottom: "1.1rem" }}>
                {[
                  ["Email", selectedStudent.email],
                  ["Phone", selectedStudent.phone],
                  ["Experience", selectedStudent.experience],
                  ["Qualification", selectedStudent.qualification],
                ].map(([l, v]) => (
                  <div key={l} style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: "10px", padding: "0.75rem" }}>
                    <div style={{ fontSize: "0.58rem", fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 3 }}>{l}</div>
                    <div style={{ fontSize: "0.78rem", fontWeight: 600, wordBreak: "break-all" }}>{v || "—"}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginBottom: "1.1rem" }}>
                <div style={{ fontSize: "0.6rem", fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Skills</div>
                <div className="skills-row">
                  {(selectedStudent.skills || []).map((sk, i) => (
                    <span key={i} className="skill-chip" style={{ background: "var(--accent3)", color: "var(--accent2)", borderColor: "rgba(59,130,246,0.2)" }}>{sk}</span>
                  ))}
                </div>
              </div>
              {selectedStudent.certificates?.length > 0 && (
                <div style={{ marginBottom: "1.1rem" }}>
                  <div style={{ fontSize: "0.6rem", fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Certificates</div>
                  {selectedStudent.certificates.map((c, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "0.5rem 0", borderBottom: "1px solid var(--border)" }}>
                      <span>🏅</span><span style={{ fontSize: "0.8rem", fontWeight: 600 }}>{typeof c === "string" ? c : c.name || "Certificate"}</span>
                    </div>
                  ))}
                </div>
              )}
              {selectedStudent.resumes?.length > 0 && (
                <div style={{ marginBottom: "1.1rem" }}>
                  <div style={{ fontSize: "0.6rem", fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Resumes</div>
                  {selectedStudent.resumes.map((r, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 9, padding: "0.7rem 0.9rem", background: "var(--surface2)", borderRadius: "9px", border: "1px solid var(--border)", marginBottom: 5, cursor: "pointer" }}
                      onClick={() => r.url && window.open(r.url, "_blank")}>
                      <span>{r.type === "application/pdf" ? "📑" : "🖼️"}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "0.78rem", fontWeight: 700 }}>{r.name}</div>
                        <div style={{ fontSize: "0.65rem", color: "var(--text3)" }}>{r.size}</div>
                      </div>
                      <span style={{ fontSize: "0.65rem", background: "var(--accent3)", color: "var(--accent2)", padding: "2px 8px", borderRadius: 4, fontWeight: 700 }}>View</span>
                    </div>
                  ))}
                </div>
              )}
              {myJobs.length > 0 && (
                <div style={{ marginBottom: "1.1rem" }}>
                  <div style={{ fontSize: "0.6rem", fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Quick Shortlist for Job</div>
                  <select className="form-select" onChange={async e => {
                    const jobId = e.target.value;
                    if (!jobId) return;
                    const job = myJobs.find(j => String(j.id) === jobId);
                    if (!job) return;
                    const existing = job.applications?.find(a => String(a.studentId) === String(selectedStudent.id));
                    if (existing) { toast("Student already in this job's pipeline", "var(--amber)"); return; }
                    const newApp = { id: `manual-${Date.now()}`, studentId: selectedStudent.id, name: selectedStudent.name, email: selectedStudent.email, status: "Shortlisted", appliedOn: new Date().toLocaleDateString(), coverLetter: "" };
                    setJobs(prev => prev.map(j => String(j.id) === jobId ? { ...j, applications: [...(j.applications || []), newApp] } : j));
                    toast(`✅ ${selectedStudent.name} shortlisted for ${job.title}`, "var(--green)");
                    e.target.value = "";
                  }}>
                    <option value="">Select a job to shortlist for…</option>
                    {myJobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
                  </select>
                </div>
              )}
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-primary" style={{ flex: 1, justifyContent: "center" }} onClick={() => { setActiveChat(selectedStudent); setTab("messages"); setSelectedStudent(null); }}>💬 Message</button>
                <button className="btn btn-ghost" style={{ flex: 1, justifyContent: "center" }} onClick={() => setSelectedStudent(null)}>Close</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ══ TOAST NOTIFICATIONS ═══════════════════════════════════════════════════ */}
      <div className="toast-stack">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div key={t.id} className="toast" initial={{ opacity: 0, x: 60, scale: 0.92 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
              <div className="toast-dot" style={{ background: t.color }} />
              {t.msg}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
