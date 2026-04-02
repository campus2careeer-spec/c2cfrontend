import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from "framer-motion";
import axios from 'axios';
import { useAuth } from '../AuthContext';
import "../styles/StudentDashboard.css";

import API_BASE_URL from '../apiConfig'; // Adjust path as needed

const BASE = API_BASE_URL;

// ─── SKILL SUGGESTIONS ────────────────────────────────────────────────────────
const SKILL_SUGGESTIONS = [
  "Python","JavaScript","React","Node.js","Django","Flask","Java","C++","TypeScript",
  "SQL","MongoDB","PostgreSQL","AWS","Docker","Kubernetes","Git","Machine Learning",
  "Deep Learning","TensorFlow","PyTorch","Figma","UI/UX","HTML","CSS","Spring Boot",
  "GraphQL","DevOps","REST APIs","Data Science","Excel","Power BI","Tableau",
  "Android","Flutter","Swift","Kotlin","PHP","Laravel","Vue.js","Angular",
];

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const mockIndustries = [
  { id: 1, name: "TechNova Solutions", logo: "TN", domain: "Cloud Computing", location: "Bangalore", tagline: "Cloud Native Excellence" },
  { id: 2, name: "Quantum AI", logo: "QA", domain: "Artificial Intelligence", location: "Hyderabad", tagline: "Pioneering AI" },
  { id: 3, name: "Nexus Fintech", logo: "NF", domain: "Blockchain", location: "Mumbai", tagline: "Next-Gen Finance" },
  { id: 4, name: "GreenEnergy Co", logo: "GE", domain: "Sustainability", location: "Pune", tagline: "Sustainable Power" },
];
const mockCourses = [
  { id: 1, title: "React.js Complete Guide", provider: "Udemy", duration: "40 hrs", level: "Intermediate", link: "#", rating: 4.8, field: "BCA", skills: ["React","JSX","Hooks"] },
  { id: 2, title: "Data Structures & Algorithms", provider: "Coursera", duration: "60 hrs", level: "Advanced", link: "#", rating: 4.9, field: "BCA", skills: ["DSA","C++"] },
  { id: 3, title: "Machine Learning A-Z", provider: "Udemy", duration: "55 hrs", level: "Intermediate", link: "#", rating: 4.8, field: "MCA", skills: ["Python","sklearn"] },
  { id: 4, title: "System Design Fundamentals", provider: "Coursera", duration: "45 hrs", level: "Advanced", link: "#", rating: 4.9, field: "B.Tech", skills: ["Architecture","SQL"] },
  { id: 5, title: "Python for Data Science", provider: "edX", duration: "35 hrs", level: "Beginner", link: "#", rating: 4.7, field: "MCA", skills: ["Python","Pandas"] },
];
const mockVacancies = [
  { id: 101, ownerId: 1, ownerName: "TechNova Solutions", ownerLogo: "TN", type: "Internship", title: "MERN Stack Intern", desc: "Seeking proactive students with React and Node.js expertise for our Bangalore office.", skills: "React, Node.js, Express, MongoDB", duration: "6 Months", offerings: "Stipend ₹20,000/month, Pre-placement offer", date: "2 hours ago", likes: 24 },
  { id: 102, ownerId: 2, ownerName: "Quantum AI", ownerLogo: "QA", type: "Job Vacancy", title: "AI Research Associate", desc: "Join our neural network research team in Hyderabad. Masters preferred.", skills: "Python, PyTorch, Deep Learning", duration: "Full-Time", offerings: "Competitive Salary, Health Insurance", date: "3 days ago", likes: 89 },
  { id: 103, ownerId: 3, ownerName: "Nexus Fintech", ownerLogo: "NF", type: "Internship", title: "Blockchain Developer Intern", desc: "Work on Ethereum smart contracts and DApps at our Mumbai office.", skills: "Solidity, Web3.js, JavaScript", duration: "3 Months", offerings: "₹15,000/month stipend", date: "1 day ago", likes: 41 },
];
const mockJobs = [
  { industry: "TechCorp India", job: "Frontend Developer", desc: "Build scalable React UIs.", role: "SDE-1", ug: "B.Tech/BCA", pg: "Not Required", url: "#", dept: "Engineering", skills: "React, TypeScript, CSS" },
  { industry: "Infosys Ltd.", job: "Java Backend Engineer", desc: "Develop REST APIs with Spring Boot.", role: "Software Engineer", ug: "B.Tech", pg: "M.Tech preferred", url: "#", dept: "Backend", skills: "Java, Spring Boot, AWS" },
  { industry: "Analytics Co.", job: "Data Analyst", desc: "Insights from large datasets.", role: "Analyst", ug: "Any Graduate", pg: "MBA/MCA plus", url: "#", dept: "Analytics", skills: "Python, SQL, Tableau" },
  { industry: "CloudSoft", job: "DevOps Engineer", desc: "CI/CD pipelines and cloud infra.", role: "DevOps", ug: "B.Tech/BCA", pg: "Not Required", url: "#", dept: "Infrastructure", skills: "Docker, Kubernetes, AWS" },
  { industry: "DataViz Inc.", job: "ML Engineer", desc: "Build and deploy ML models.", role: "MLE", ug: "B.Tech/MCA", pg: "M.Tech preferred", url: "#", dept: "AI/ML", skills: "Python, TensorFlow, MLflow" },
  { industry: "StartupHub", job: "Full Stack Developer", desc: "End-to-end feature development.", role: "SDE-2", ug: "Any CS Degree", pg: "Not Required", url: "#", dept: "Product", skills: "React, Node.js, PostgreSQL" },
];

function toBase64(file) {
  return new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(file); });
}

function calcCompletion(p) {
  if (!p) return 0;
  const checks = [!!p.name, !!p.email, !!p.phone, !!p.address, !!(p.about?.length > 10),
    !!(p.skills?.length > 0), !!p.photo, !!p.tenth, !!p.twelfth, !!p.graduation,
    !!(p.certificates?.length > 0), !!(p.resumes?.length > 0), !!p.linkedin, !!p.github];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}


// ─── COMPONENT ────────────────────────────────────────────────────────────────
export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user: authUser, profile: authProfile, signOut } = useAuth();

  // UI state
  const [activeTab, setActiveTab] = useState("feed");
  const [editMode, setEditMode] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [activeChat, setActiveChat] = useState(null);
  const [activeUserProfile, setActiveUserProfile] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [applyModal, setApplyModal] = useState(null);
  const [applyForm, setApplyForm] = useState({ coverLetter: "" });
  const [postDetailModal, setPostDetailModal] = useState(null);

  // Data state
  const [profile, setProfile] = useState(null);
  const [industries, setIndustries] = useState([]);
  const [courses, setCourses] = useState([]);
  const [allJobs, setAllJobs] = useState([]);
  const [matchedJobs, setMatchedJobs] = useState([]);
  const [vacancies, setVacancies] = useState([]);
  const [myApplications, setMyApplications] = useState([]);

  // Loading
  const [isFeedLoading, setIsFeedLoading] = useState(true);
  const [isMatchLoading, setIsMatchLoading] = useState(false);

  // Profile page state
  const [pfTab, setPfTab] = useState("overview");
  const [pfEditing, setPfEditing] = useState(false);
  const [pfForm, setPfForm] = useState({});
  const [pfSaving, setPfSaving] = useState(false);
  const [pfToast, setPfToast] = useState(null);
  const [skillInput, setSkillInput] = useState("");
  const [coverPreview, setCoverPreview] = useState(null);

  // ── Auth failure + boot tracking states ──────────────────────────────────
  const [authFailed, setAuthFailed] = useState(false);
  const [bootDone,   setBootDone]   = useState(false);

  const coverRef  = useRef();
  const avatarRef = useRef();
  const certRef   = useRef();
  const resumeRef = useRef();
  const postRef   = useRef();
  const chatEndRef = useRef();
  const chatInputRef = useRef();

  // ── Bootstrap ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const boot = async () => {
      setIsFeedLoading(true);

      // ── FIX: If Supabase refresh token is invalid, authUser & authProfile are
      // both null. Without a guard the spinner hangs forever. We wait 1.5 s for
      // AuthContext to finish, then redirect to login if still unauthenticated.
      if (!authUser && !authProfile) {
        await new Promise(r => setTimeout(r, 1500));
        setBootDone(true);
        setIsFeedLoading(false);
        setAuthFailed(true);
        return;
      }

      // Seed profile immediately from AuthContext so spinner resolves at once
      if (authProfile || authUser) {
        setProfile(prev => prev || {
          id:            authUser?.id || "",
          name:          authProfile?.name || authProfile?.full_name || authUser?.email?.split("@")[0] || "Student",
          email:         authProfile?.email || authUser?.email || "",
          username:      authProfile?.username || (authProfile?.name || "student").toLowerCase().replace(/\s+/g,"_"),
          qualification: authProfile?.qualification || "",
          phone:         authProfile?.phone || "",
          address:       authProfile?.address || authProfile?.location || "",
          about:         authProfile?.about || "",
          skills:        Array.isArray(authProfile?.skills) ? authProfile.skills : [],
          photo:         authProfile?.photo || null,
          tenth:         authProfile?.tenth || "",
          twelfth:       authProfile?.twelfth || "",
          graduation:    authProfile?.graduation || "",
          certificates:  authProfile?.certificates || [],
          personalPosts: authProfile?.personalPosts || [],
          resumes:       authProfile?.resumes || [],
          chats:         {},
          linkedin:      authProfile?.linkedin || "",
          github:        authProfile?.github || "",
          website:       authProfile?.website || "",
          experience:    authProfile?.experience || "",
          cgpa:          authProfile?.cgpa || "",
        });
      }

      try {
        // 1. Full profile from backend — only if we have a valid user id
        if (authUser?.id) {
          try {
            const res = await axios.get(`${BASE}/api/get-profile?user_id=${authUser.id}`, { timeout: 6000 });
            const d = res.data;
            if (d && d.id) {
              setProfile({
                id:            d.id,
                name:          d.name || d.full_name || authProfile?.name || authUser?.email?.split("@")[0] || "Student",
                email:         d.email || authUser?.email || "",
                username:      d.username || (d.name || "student").toLowerCase().replace(/\s+/g,"_"),
                qualification: d.qualification || authProfile?.qualification || "",
                phone:         d.phone || "",
                address:       d.address || d.location || "",
                about:         d.about || "",
                skills:        Array.isArray(d.skills) ? d.skills : [],
                photo:         d.photo || null,
                tenth:         d.tenth || "",
                twelfth:       d.twelfth || "",
                graduation:    d.graduation || "",
                certificates:  d.certificates || [],
                personalPosts: d.personalPosts || d.personal_posts || [],
                resumes:       d.resumes || [],
                chats:         d.chats || {},
                linkedin:      d.linkedin || "",
                github:        d.github || "",
                website:       d.website || "",
                experience:    d.experience || "",
                cgpa:          d.cgpa || "",
              });
            }
          } catch (profileErr) {
            // Profile fetch timed out or backend is down — keep the seeded profile.
            // This is a WARNING not an error; user still sees the dashboard.
            console.warn("Profile fetch failed, using cached session data:", profileErr?.message);
          }
        }

        // 2. Parallel data fetches — Promise.allSettled so one failure never blocks rest
        const [indRes, coursesRes, vacRes, appsRes, jobsRes] = await Promise.allSettled([
          axios.get(`${BASE}/api/industries`, { timeout: 8000 }),
          axios.get(`${BASE}/api/courses`,    { timeout: 8000 }),
          axios.get(`${BASE}/api/vacancies`,  { timeout: 8000 }),
          authUser?.id
            ? axios.get(`${BASE}/api/applications/student/${authUser.id}`, { timeout: 8000 })
            : Promise.resolve({ data: [] }),
          axios.get(`${BASE}/api/all-jobs`, { timeout: 8000 }),
        ]);

        setIndustries(
          indRes.status === "fulfilled" && Array.isArray(indRes.value?.data) && indRes.value.data.length
            ? indRes.value.data : mockIndustries
        );
        setCourses(
          coursesRes.status === "fulfilled" && Array.isArray(coursesRes.value?.data) && coursesRes.value.data.length
            ? coursesRes.value.data : mockCourses
        );

        if (vacRes.status === "fulfilled" && Array.isArray(vacRes.value?.data)) {
          const loadedInd = indRes.status === "fulfilled" && Array.isArray(indRes.value?.data) ? indRes.value.data : mockIndustries;
          setVacancies(vacRes.value.data.map(v => ({
            id:        v.id,
            ownerId:   v.owner_id || v.ownerId,
            ownerName: v.owner_name || v.ownerName || loadedInd.find(i => i.id === v.owner_id)?.name || "Company",
            ownerLogo: (v.owner_name || "CO").substring(0, 2).toUpperCase(),
            type:      v.type || "Job Vacancy",
            title:     v.title,
            desc:      v.description || v.desc || "",
            skills:    v.skills || "",
            duration:  v.duration || "Full-Time",
            offerings: v.offerings || "",
            date:      v.created_at ? new Date(v.created_at).toLocaleDateString() : "Recent",
            likes:     v.likes || 0,
          })));
        } else {
          setVacancies(mockVacancies);
        }

        if (appsRes.status === "fulfilled" && Array.isArray(appsRes.value?.data)) {
          setMyApplications(appsRes.value.data.map(a => ({
            id:          a.id,
            postId:      a.vacancy_id,
            role:        a.vacancies?.title || "Role",
            company:     a.vacancies?.owner_name || "Company",
            appliedOn:   new Date(a.created_at).toLocaleDateString(),
            status:      a.status || "Pending",
            coverLetter: a.cover_letter,
          })));
        }

        if (jobsRes.status === "fulfilled") {
          let raw = jobsRes.value?.data || [];
          if (typeof raw === "string") { try { raw = JSON.parse(raw); } catch { raw = []; } }
          if (!Array.isArray(raw)) raw = [];
          const jobs = raw.map(j => ({
            industry: j.industry || j.company || j.employer || "Company",
            job:      j.job || j.title || j.position || "Job Opening",
            desc:     j.desc || j.description || j.summary || "",
            role:     j.role || j.role_type || "",
            ug:       j.ug || j.education_ug || j.education || "",
            pg:       j.pg || j.education_pg || "",
            url:      j.url || j.link || j.apply_url || "#",
            dept:     j.dept || j.department || j.category || "",
            skills:   j.skills || j.required_skills || "",
          }));
          setAllJobs(jobs.length ? jobs : mockJobs);
        } else {
          setAllJobs(mockJobs);
        }

      } catch (err) {
        console.error("Boot error:", err);
        // Fallback to mock data so the dashboard is never completely blank
        setIndustries(mockIndustries);
        setCourses(mockCourses);
        setVacancies(mockVacancies);
        setAllJobs(mockJobs);
      } finally {
        setIsFeedLoading(false);
        setBootDone(true);
      }
    };
    boot();
  }, [authUser?.id]);

  // AI skill match
  useEffect(() => {
    if (!profile?.skills?.length) return;
    const doMatch = async () => {
      setIsMatchLoading(true);
      try {
        const res = await axios.post(`${BASE}/api/analyze-skills`, { skills: profile.skills.join(", ") }, { timeout: 12000 });
        setMatchedJobs(Array.isArray(res.data) ? res.data : []);
      } catch { setMatchedJobs([]); }
      setIsMatchLoading(false);
    };
    doMatch();
  }, [profile?.skills?.join(",")]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [profile?.chats, activeChat]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const pushNotify = useCallback((msg) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, msg }]);
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 3500);
  }, []);

  const showPfToast = useCallback((msg, type = "success") => {
    setPfToast({ msg, type });
    setTimeout(() => setPfToast(null), 3000);
  }, []);

  const alreadyApplied = (postId) => myApplications.some(a => a.postId === postId);

  const sendMessage = async (toId, message) => {
    if (!authUser?.id) return;
    try {
      await axios.post(`${BASE}/api/messages`, { sender_id: authUser.id, receiver_id: toId, text: message });
      const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      setProfile(prev => ({ ...prev, chats: { ...prev.chats, [toId]: [...(prev.chats?.[toId] || []), { sender: prev.name, message, time }] } }));
    } catch { pushNotify("Failed to send message."); }
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!applyModal || !authUser?.id) return;
    try {
      const res = await axios.post(`${BASE}/api/applications`, {
        vacancy_id: applyModal.id, student_id: authUser.id, cover_letter: applyForm.coverLetter,
      });
      setMyApplications(prev => [...prev, { id: res.data.id || Date.now(), postId: applyModal.id, role: applyModal.title, company: applyModal.ownerName, appliedOn: new Date().toLocaleDateString(), status: "Pending" }]);
      pushNotify(`✓ Applied to ${applyModal.title}!`);
      setApplyForm({ coverLetter: "" }); setApplyModal(null); setPostDetailModal(null);
    } catch { pushNotify("Failed to apply — you may have already applied."); }
  };

  const handleLogout = async () => {
    try { await signOut(); navigate("/login"); } catch { navigate("/login"); }
  };

  const deletePost = (type, idx) => {
    const key = type === "certificate" ? "certificates" : "personalPosts";
    setProfile(prev => { const arr = [...prev[key]]; arr.splice(idx, 1); return { ...prev, [key]: arr }; });
  };
  const deleteResume = (idx) => {
    setProfile(prev => { const arr = [...prev.resumes]; arr.splice(idx, 1); return { ...prev, resumes: arr }; });
  };

  // ── Profile edit helpers ───────────────────────────────────────────────────
  const pffc = (k, v) => setPfForm(p => ({ ...p, [k]: v }));
  const startPfEdit = () => {
    setPfForm({
      name: profile.name || "", phone: profile.phone || "", address: profile.address || "",
      about: profile.about || "", qualification: profile.qualification || "",
      tenth: profile.tenth || "", twelfth: profile.twelfth || "", graduation: profile.graduation || "",
      website: profile.website || "", linkedin: profile.linkedin || "", github: profile.github || "",
      experience: profile.experience || "", cgpa: profile.cgpa || "",
      skills: [...(profile.skills || [])],
      certificates: [...(profile.certificates || [])],
      resumes: [...(profile.resumes || [])],
      personalPosts: [...(profile.personalPosts || [])],
    });
    setPfEditing(true);
    setPfTab("overview");
  };

  const savePfForm = async () => {
    if (!profile?.id) return;
    setPfSaving(true);
    try {
      await axios.put(`${BASE}/api/profile/${profile.id}`, pfForm);
      setProfile(prev => ({ ...prev, ...pfForm }));
      setPfEditing(false);
      showPfToast("✓ Profile updated");
    } catch { showPfToast("✗ Could not save", "error"); }
    setPfSaving(false);
  };

  const addSkill = (s) => {
    const sk = s.trim();
    if (!sk || pfForm.skills?.includes(sk)) return;
    pffc("skills", [...(pfForm.skills || []), sk]);
    setSkillInput("");
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    const b64 = await toBase64(file);
    try {
      await axios.put(`${BASE}/api/profile/${profile.id}`, { photo: b64 });
      setProfile(p => ({ ...p, photo: b64 }));
      showPfToast("✓ Photo updated");
    } catch { showPfToast("✗ Upload failed", "error"); }
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    const b64 = await toBase64(file);
    setCoverPreview(b64);
    try { await axios.put(`${BASE}/api/profile/${profile.id}`, { coverPhoto: b64 }); } catch {}
  };

  const handleCertUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    const results = await Promise.all(files.map(async f => ({ url: await toBase64(f), type: f.type, name: f.name })));
    pffc("certificates", [...(pfForm.certificates || []), ...results]);
  };
  const handleResumeUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    const results = await Promise.all(files.map(async f => ({ url: await toBase64(f), type: f.type, name: f.name })));
    pffc("resumes", [...(pfForm.resumes || []), ...results]);
  };
  const handlePostUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    const results = await Promise.all(files.map(async f => ({ url: await toBase64(f), type: f.type, name: f.name })));
    pffc("personalPosts", [...(pfForm.personalPosts || []), ...results]);
  };

  // ── Avatar helper ──────────────────────────────────────────────────────────
  const Av = ({ name, photo, size = 48, r = 13 }) =>
    photo
      ? <img src={photo} style={{ width: size, height: size, borderRadius: r, objectFit: "cover", flexShrink: 0 }} alt="" />
      : <div style={{ width: size, height: size, borderRadius: r, background: "var(--grad)", color: "white", fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: size * 0.38, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {(name || "U")[0].toUpperCase()}
        </div>;

  // ── Sidebar panel ─────────────────────────────────────────────────────────
  const renderPanel = (user, editable = false) => (
    <div style={{ overflowY: "auto", height: "100%" }}>
      <div className="sb-top">
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: ".85rem" }}>
            <div className="sb-av">{user.photo ? <img src={user.photo} alt="" /> : (user.name || "U")[0].toUpperCase()}</div>
            <div>
              <div className="sb-name">{user.name || "Student"}</div>
              <div className="sb-handle">@{user.username || "student"}</div>
            </div>
          </div>
          {editable
            ? <div style={{ display: "flex", gap: 6 }}>
                {editMode && <button className="sb-save-btn" onClick={async () => {
                  if (!authUser?.id || !profile) return;
                  try {
                    await axios.put(`${BASE}/api/profile/${authUser.id}`, { name: profile.name, qualification: profile.qualification, phone: profile.phone, address: profile.address, tenth: profile.tenth, twelfth: profile.twelfth, graduation: profile.graduation, skills: profile.skills, about: profile.about });
                    pushNotify("✓ Profile saved");
                  } catch { pushNotify("Changes saved locally."); }
                  setEditMode(false);
                }}>✓ Save</button>}
                <button className="sb-edit-btn" onClick={() => setEditMode(m => !m)}>{editMode ? "✕" : "✎ Edit"}</button>
              </div>
            : <button className="close-x" onClick={() => setActiveUserProfile(null)}>✕</button>
          }
        </div>
        <div style={{ marginTop: ".7rem", display: "flex", flexWrap: "wrap", gap: ".35rem", position: "relative", zIndex: 1 }}>
          {user.qualification && <span className="sb-badge">🎓 {user.qualification}</span>}
          {(user.skills || []).slice(0, 3).map((s, i) => (
            <span key={i} className="sb-badge" style={{ background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.18)", fontSize: ".62rem" }}>⚡ {s}</span>
          ))}
        </div>
      </div>

      {/* Completion bar (own profile only) */}
      {editable && (() => {
        const comp = calcCompletion(profile);
        return (
          <div className="comp-bar-wrap">
            <div className="comp-label"><span>Profile Strength</span><span style={{ color: comp >= 80 ? "var(--emerald)" : comp >= 50 ? "var(--amber)" : "var(--rose)" }}>{comp}%</span></div>
            <div className="comp-track"><div className="comp-fill" style={{ width: `${comp}%` }} /></div>
          </div>
        );
      })()}

      {editable && editMode && (
        <>
          <div className="fs">
            <div className="fs-title">Photo</div>
            <label className="upload-btn">📷 Change Photo
              <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => { const f = e.target.files[0]; if (f) setProfile(p => ({ ...p, photo: URL.createObjectURL(f) })); }} />
            </label>
          </div>
          <div className="fs">
            <div className="fs-title">Personal Info</div>
            <div className="fg">
              {[{ name: "name", label: "Full Name", placeholder: "Your full name" }, { name: "phone", label: "Phone", placeholder: "+91 XXXXXXXXXX" }, { name: "address", label: "City", placeholder: "Your city" }, { name: "qualification", label: "Qualification", placeholder: "e.g. BCA" }].map(f => (
                <div className="ff" key={f.name}>
                  <label className="fl">{f.label}</label>
                  <input name={f.name} placeholder={f.placeholder} value={profile?.[f.name] || ""} onChange={e => setProfile(p => ({ ...p, [e.target.name]: e.target.value }))} className="fi" />
                </div>
              ))}
            </div>
          </div>
          <div className="fs">
            <div className="fs-title">Academic</div>
            <div style={{ display: "flex", flexDirection: "column", gap: ".4rem" }}>
              {[{ name: "tenth", label: "10th" }, { name: "twelfth", label: "12th" }, { name: "graduation", label: "Graduation / College" }].map(f => (
                <div className="ff" key={f.name}>
                  <label className="fl">{f.label}</label>
                  <input name={f.name} value={profile?.[f.name] || ""} onChange={e => setProfile(p => ({ ...p, [e.target.name]: e.target.value }))} className="fi" />
                </div>
              ))}
            </div>
          </div>
          <div className="fs">
            <div className="fs-title">Upload Resume</div>
            <label className="upload-btn">📄 Add Resume
              <input type="file" accept=".pdf,image/*" style={{ display: "none" }}
                onChange={e => { const file = e.target.files[0]; if (!file) return; setProfile(prev => ({ ...prev, resumes: [...prev.resumes, { url: URL.createObjectURL(file), name: file.name, type: file.type, size: (file.size / 1024).toFixed(0) + " KB" }] })); pushNotify("Resume added!"); }} />
            </label>
            {(profile?.resumes || []).map((r, i) => (
              <div key={i} className="resume-item" style={{ marginTop: ".4rem" }}>
                <span style={{ fontSize: "1.1rem" }}>{r.type === "application/pdf" ? "📑" : "🖼️"}</span>
                <span className="resume-name">{r.name}</span>
                <button className="resume-del" onClick={() => deleteResume(i)}>✕</button>
              </div>
            ))}
          </div>
          <div className="fs">
            <div className="fs-title">Certificate</div>
            <label className="upload-btn">+ Add Certificate
              <input type="file" style={{ display: "none" }} onChange={e => { const f = e.target.files[0]; if (!f) return; setProfile(p => ({ ...p, certificates: [...p.certificates, { url: URL.createObjectURL(f), type: f.type }] })); }} />
            </label>
          </div>
          <div className="fs">
            <div className="fs-title">Activity Post</div>
            <label className="upload-btn">+ Add Post
              <input type="file" style={{ display: "none" }} onChange={e => { const f = e.target.files[0]; if (!f) return; setProfile(p => ({ ...p, personalPosts: [...p.personalPosts, { url: URL.createObjectURL(f), type: f.type }] })); }} />
            </label>
          </div>
        </>
      )}

      {/* Know More / Details */}
      <div style={{ padding: ".9rem 1.4rem", borderBottom: "1px solid var(--border)" }}>
        <button className="know-btn" onClick={() => setShowDetails(d => !d)}>
          <span style={{ fontSize: ".62rem" }}>{showDetails ? "▲" : "▼"}</span>
          {showDetails ? "Hide Details" : "View Candidate Details"}
        </button>
        {showDetails && (
          <div className="details-box" style={{ marginTop: ".65rem" }}>
            <div className="details-row">✉ {user.email || "Not provided"}</div>
            <div className="details-row">📞 {user.phone || "Not provided"}</div>
            <div className="details-row">📍 {user.address || "Not provided"}</div>
            {user.linkedin && <div className="details-row">🔗 {user.linkedin}</div>}
            {user.github && <div className="details-row">🐙 {user.github}</div>}
            <div className="details-sh">Academic</div>
            <div className="details-row">10th — {user.tenth || "—"}</div>
            <div className="details-row">12th — {user.twelfth || "—"}</div>
            <div className="details-row">Grad — {user.graduation || "—"}</div>
            {user.cgpa && <div className="details-row">CGPA — {user.cgpa}</div>}
          </div>
        )}
      </div>

      <div className="feed-sec">
        <div className="feed-title">Resumes ({(user.resumes || []).length})</div>
        {!(user.resumes || []).length ? <div className="empty-feed">No resumes uploaded.</div>
          : (user.resumes || []).map((r, i) => (
            <div key={i} className="resume-item">
              <span style={{ fontSize: "1.1rem" }}>{r.type === "application/pdf" ? "📑" : "🖼️"}</span>
              <span className="resume-name">{r.name}</span>
              {editable && <button className="resume-del" onClick={() => deleteResume(i)}>✕</button>}
            </div>
          ))
        }
      </div>
      <div className="feed-sec">
        <div className="feed-title">Certificates</div>
        {!(user.certificates || []).length ? <div className="empty-feed">No certificates.</div>
          : <div className="posts-grid">{(user.certificates || []).map((p, i) => (
              <div key={i} className="post-cell">
                {editable && <button className="post-del" onClick={() => deletePost("certificate", i)}>✕</button>}
                {p.type?.startsWith("video") ? <video src={p.url} /> : <img src={p.url} alt="" />}
              </div>
            ))}</div>
        }
      </div>
      <div className="feed-sec">
        <div className="feed-title">Activity Posts</div>
        {!(user.personalPosts || []).length ? <div className="empty-feed">No posts yet.</div>
          : <div className="posts-grid">{(user.personalPosts || []).map((p, i) => (
              <div key={i} className="post-cell">
                {editable && <button className="post-del" onClick={() => deletePost("personal", i)}>✕</button>}
                {p.type?.startsWith("video") ? <video src={p.url} /> : <img src={p.url} alt="" />}
              </div>
            ))}</div>
        }
      </div>
    </div>
  );

  // ── Profile Page ───────────────────────────────────────────────────────────
  const renderProfilePage = () => {
    const data = pfEditing ? pfForm : profile;
    const skills = data?.skills || [];
    const certs = data?.certificates || [];
    const resumes = data?.resumes || [];
    const posts = data?.personalPosts || [];
    const completion = calcCompletion(profile);

    const filteredSugg = SKILL_SUGGESTIONS.filter(s => s.toLowerCase().includes(skillInput.toLowerCase()) && !skills.includes(s)).slice(0, 8);

    const pfTabs = [
      { id: "overview", icon: "👤", label: "Overview" },
      { id: "skills", icon: "⚡", label: "Skills" },
      { id: "academic", icon: "🎓", label: "Academic" },
      { id: "experience", icon: "💼", label: "Experience" },
      { id: "media", icon: "🖼️", label: "Media" },
      { id: "resume", icon: "📄", label: "Resume" },
    ];

    return (
      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        {/* Hidden file inputs */}
        <input ref={coverRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleCoverUpload} />
        <input ref={avatarRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatarUpload} />
        <input ref={certRef} type="file" accept="image/*,application/pdf" multiple style={{ display: "none" }} onChange={handleCertUpload} />
        <input ref={resumeRef} type="file" accept="application/pdf,image/*" multiple style={{ display: "none" }} onChange={handleResumeUpload} />
        <input ref={postRef} type="file" accept="image/*,video/*" multiple style={{ display: "none" }} onChange={handlePostUpload} />

        {/* Cover */}
        <div className="pf-cover" onClick={() => coverRef.current?.click()}>
          {(coverPreview || profile.coverPhoto)
            ? <img src={coverPreview || profile.coverPhoto} alt="cover" />
            : <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg,#4f46e5 0%,#7c3aed 50%,#0ea5e9 100%)", position: "relative" }}>
                <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 20% 80%,rgba(255,255,255,.08) 0%,transparent 50%), radial-gradient(circle at 80% 20%,rgba(255,255,255,.1) 0%,transparent 50%)" }} />
              </div>}
          <div className="pf-cover-ov"><span className="pf-cover-lbl">📸 Change Cover</span></div>
        </div>

        {/* Hero */}
        <div className="pf-hero">
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: ".8rem" }}>
            <div style={{ position: "relative" }}>
              <div className="pf-av" onClick={() => avatarRef.current?.click()}>
                {profile.photo ? <img src={profile.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span>{(profile.name || "U")[0].toUpperCase()}</span>}
              </div>
              <div className="pf-av-cam" onClick={() => avatarRef.current?.click()}>📷</div>
            </div>

            {/* Completion ring */}
            <div style={{ textAlign: "center", marginLeft: ".5rem" }}>
              <div style={{ font: `800 1.6rem/1 'Syne',sans-serif`, color: completion >= 80 ? "var(--emerald)" : "var(--indigo)" }}>{completion}%</div>
              <div style={{ fontSize: ".65rem", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".06em" }}>Complete</div>
            </div>

            <div style={{ display: "flex", gap: ".5rem", paddingBottom: ".2rem", marginLeft: "auto" }}>
              {pfEditing
                ? <><button className="pf-edit-btn" onClick={() => setPfEditing(false)}>Cancel</button>
                    <button className="pf-save-btn" onClick={savePfForm} disabled={pfSaving}>{pfSaving ? "Saving…" : "💾 Save"}</button></>
                : <button className="pf-save-btn" onClick={startPfEdit}>✏️ Edit Profile</button>}
            </div>
          </div>

          <div className="pf-name">{profile.name || "Your Name"}</div>
          <div className="pf-qual">{profile.qualification || "Add your qualification"}</div>
          <div className="pf-meta">
            {profile.email && <span>✉ {profile.email}</span>}
            {profile.phone && <span>📞 {profile.phone}</span>}
            {profile.address && <span>📍 {profile.address}</span>}
            {profile.linkedin && <a href={profile.linkedin} target="_blank" rel="noreferrer" style={{ color: "var(--indigo)", textDecoration: "none" }}>🔗 LinkedIn</a>}
            {profile.github && <a href={profile.github} target="_blank" rel="noreferrer" style={{ color: "var(--indigo)", textDecoration: "none" }}>🐙 GitHub</a>}
          </div>
          {profile.about && <div className="pf-about">{profile.about}</div>}
          {skills.length > 0 && (
            <div className="pf-skills-row">
              {(pfEditing ? pfForm.skills : profile.skills || []).slice(0, 8).map(s => <span key={s} className="pf-skill-chip">{s}</span>)}
              {(profile.skills || []).length > 8 && <span className="pf-skill-chip" style={{ cursor: "pointer" }} onClick={() => setPfTab("skills")}>+{profile.skills.length - 8}</span>}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="pf-tabs">
          {pfTabs.map(t => <button key={t.id} className={`pf-tab ${pfTab === t.id ? "active" : ""}`} onClick={() => setPfTab(t.id)}>{t.icon} {t.label}</button>)}
        </div>

        <AnimatePresence mode="wait">
          {/* OVERVIEW */}
          {pfTab === "overview" && (
            <motion.div key="ov" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="pf-card">
                <div className="pf-card-title">✍️ About Me</div>
                {pfEditing
                  ? <textarea className="pf-input" style={{ width: "100%" }} placeholder="Write about yourself, your interests, goals…" value={pfForm.about || ""} onChange={e => pffc("about", e.target.value)} />
                  : <p style={{ color: "var(--muted)", lineHeight: 1.7, fontSize: ".88rem" }}>{profile.about || <em style={{ color: "var(--subtle)" }}>No bio yet. Click Edit Profile to add one.</em>}</p>
                }
              </div>

              <div className="pf-card">
                <div className="pf-card-title">📋 Personal Information</div>
                {pfEditing
                  ? <div className="pf-grid">
                      {[
                        { k: "name", l: "Full Name", p: "Your full name" },
                        { k: "phone", l: "Phone", p: "+91 XXXXXXXXXX" },
                        { k: "address", l: "City / Location", p: "Your city" },
                        { k: "cgpa", l: "CGPA / Percentage", p: "e.g. 8.5 or 85%" },
                        { k: "experience", l: "Experience Summary", p: "e.g. 1 yr internship at XYZ" },
                        { k: "website", l: "Portfolio / Website", p: "https://..." },
                        { k: "linkedin", l: "LinkedIn URL", p: "linkedin.com/in/..." },
                        { k: "github", l: "GitHub URL", p: "github.com/username" },
                      ].map(f => (
                        <div className="pf-field" key={f.k}>
                          <label className="pf-label">{f.l}</label>
                          <input className="pf-input" placeholder={f.p} value={pfForm[f.k] || ""} onChange={e => pffc(f.k, e.target.value)} />
                        </div>
                      ))}
                      <div className="pf-field">
                        <label className="pf-label">Qualification</label>
                        <select className="pf-input" value={pfForm.qualification || ""} onChange={e => pffc("qualification", e.target.value)}>
                          <option value="">Select…</option>
                          {["10th","12th","Diploma","ITI","BCA","B.Tech","B.Sc","B.Com","BA","MCA","M.Tech","M.Sc","MBA","PhD","Other"].map(q => <option key={q} value={q}>{q}</option>)}
                        </select>
                      </div>
                      <div className="pf-field">
                        <label className="pf-label">Email (read-only)</label>
                        <input className="pf-input" value={profile.email || ""} readOnly style={{ background: "#f8fafc", cursor: "not-allowed", opacity: .7 }} />
                      </div>
                    </div>
                  : <div className="pf-grid">
                      {[
                        ["Full Name", profile.name],
                        ["Email", profile.email],
                        ["Phone", profile.phone],
                        ["Location", profile.address],
                        ["Qualification", profile.qualification],
                        ["CGPA / %", profile.cgpa],
                        ["Experience", profile.experience],
                        ["Portfolio", profile.website],
                        ["LinkedIn", profile.linkedin],
                        ["GitHub", profile.github],
                      ].map(([l, v]) => (
                        <div key={l}>
                          <div className="pf-label" style={{ marginBottom: ".2rem" }}>{l}</div>
                          <div style={{ fontWeight: 600, color: v ? "var(--navy)" : "var(--subtle)", fontStyle: v ? "normal" : "italic", fontSize: ".87rem", wordBreak: "break-all" }}>{v || "Not provided"}</div>
                        </div>
                      ))}
                    </div>
                }
                {pfEditing && <div style={{ marginTop: "1.2rem", display: "flex", justifyContent: "flex-end" }}>
                  <button className="pf-save-btn" onClick={savePfForm} disabled={pfSaving}>{pfSaving ? "Saving…" : "💾 Save"}</button>
                </div>}
              </div>
            </motion.div>
          )}

          {/* SKILLS */}
          {pfTab === "skills" && (
            <motion.div key="sk" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="pf-card">
                <div className="pf-card-title">⚡ Skills & Expertise</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: ".4rem" }}>
                  {skills.map(s => (
                    <span key={s} className="pf-skill-chip">
                      {s}
                      {pfEditing && <button onClick={() => pffc("skills", pfForm.skills.filter(x => x !== s))} style={{ background: "none", border: "none", color: "var(--rose)", cursor: "pointer", marginLeft: ".3rem", fontWeight: 800, fontSize: ".65rem" }}>✕</button>}
                    </span>
                  ))}
                  {skills.length === 0 && <em style={{ color: "var(--subtle)", fontSize: ".85rem" }}>No skills added yet.</em>}
                </div>
                {pfEditing && (
                  <>
                    <div style={{ height: 1, background: "var(--border)", margin: "1rem 0" }} />
                    <div className="pf-label" style={{ marginBottom: ".5rem" }}>Add Skill</div>
                    <div className="pf-skill-add-row">
                      <input className="pf-input" style={{ flex: 1 }} placeholder="Type skill name…" value={skillInput}
                        onChange={e => setSkillInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") addSkill(skillInput); }} />
                      <button className="pf-save-btn" style={{ padding: ".58rem 1.2rem" }} onClick={() => addSkill(skillInput)}>+ Add</button>
                    </div>
                    {skillInput.length > 0 && filteredSugg.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: ".35rem", marginTop: ".5rem" }}>
                        {filteredSugg.map(s => <span key={s} className="pf-sugg" onClick={() => addSkill(s)}>{s}</span>)}
                      </div>
                    )}
                    {skillInput.length === 0 && (
                      <>
                        <div className="pf-label" style={{ marginTop: "1rem", marginBottom: ".4rem" }}>Popular Skills (click to add)</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: ".35rem" }}>
                          {SKILL_SUGGESTIONS.filter(s => !skills.includes(s)).slice(0, 20).map(s => <span key={s} className="pf-sugg" onClick={() => addSkill(s)}>{s}</span>)}
                        </div>
                      </>
                    )}
                    <div style={{ marginTop: "1.2rem", display: "flex", justifyContent: "flex-end" }}>
                      <button className="pf-save-btn" onClick={savePfForm} disabled={pfSaving}>{pfSaving ? "Saving…" : "💾 Save Skills"}</button>
                    </div>
                  </>
                )}
                {!pfEditing && <div style={{ marginTop: ".9rem" }}><button className="pf-edit-btn" onClick={startPfEdit}>✏️ Edit Skills</button></div>}
              </div>
            </motion.div>
          )}

          {/* ACADEMIC */}
          {pfTab === "academic" && (
            <motion.div key="ac" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="pf-card">
                <div className="pf-card-title">🎓 Academic Background</div>
                {pfEditing
                  ? <div className="pf-grid-3">
                      {[
                        { k: "tenth", l: "10th — School / Board / %", p: "e.g. CBSE – 92%" },
                        { k: "twelfth", l: "12th — School / Board / %", p: "e.g. BSEB – 85%" },
                        { k: "graduation", l: "College / Degree / CGPA", p: "e.g. MIT Patna – 8.4 CGPA" },
                      ].map(f => (
                        <div className="pf-field" key={f.k}>
                          <label className="pf-label">{f.l}</label>
                          <input className="pf-input" placeholder={f.p} value={pfForm[f.k] || ""} onChange={e => pffc(f.k, e.target.value)} />
                        </div>
                      ))}
                    </div>
                  : <div className="pf-grid-3">
                      {[["10th Standard", profile.tenth], ["12th Standard", profile.twelfth], ["Graduation", profile.graduation]].map(([l, v]) => (
                        <div className="pf-acad-card" key={l}>
                          <div className="pf-acad-level">{l}</div>
                          <div className="pf-acad-name">{v || <em style={{ color: "var(--subtle)", fontStyle: "italic" }}>Not added</em>}</div>
                        </div>
                      ))}
                    </div>
                }
                {pfEditing && <div style={{ marginTop: "1.2rem", display: "flex", justifyContent: "flex-end" }}>
                  <button className="pf-save-btn" onClick={savePfForm} disabled={pfSaving}>{pfSaving ? "Saving…" : "💾 Save"}</button>
                </div>}
                {!pfEditing && <div style={{ marginTop: "1rem" }}><button className="pf-edit-btn" onClick={startPfEdit}>✏️ Edit Academic</button></div>}
              </div>
            </motion.div>
          )}

          {/* EXPERIENCE */}
          {pfTab === "experience" && (
            <motion.div key="ex" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="pf-card">
                <div className="pf-card-title">💼 Experience & Projects</div>
                {pfEditing
                  ? <div style={{ display: "flex", flexDirection: "column", gap: ".9rem" }}>
                      <div className="pf-field">
                        <label className="pf-label">Work / Internship Experience</label>
                        <textarea className="pf-input" rows={4} placeholder="e.g. 6-month intern at TechCorp as React Developer. Built user dashboard, managed API integrations." value={pfForm.experience || ""} onChange={e => pffc("experience", e.target.value)} />
                      </div>
                      <div className="pf-field">
                        <label className="pf-label">Projects</label>
                        <textarea className="pf-input" rows={4} placeholder="Describe your key projects, tech stack, outcomes…" value={pfForm.projects || ""} onChange={e => pffc("projects", e.target.value)} />
                      </div>
                      <div className="pf-field">
                        <label className="pf-label">Achievements / Awards</label>
                        <textarea className="pf-input" rows={3} placeholder="Hackathon wins, certifications, recognitions…" value={pfForm.achievements || ""} onChange={e => pffc("achievements", e.target.value)} />
                      </div>
                      <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <button className="pf-save-btn" onClick={savePfForm} disabled={pfSaving}>{pfSaving ? "Saving…" : "💾 Save"}</button>
                      </div>
                    </div>
                  : <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
                      {[["Work / Internship Experience", profile.experience], ["Projects", profile.projects], ["Achievements / Awards", profile.achievements]].map(([l, v]) => (
                        <div key={l}>
                          <div className="pf-label" style={{ marginBottom: ".4rem" }}>{l}</div>
                          <p style={{ fontSize: ".87rem", color: v ? "var(--slate)" : "var(--subtle)", lineHeight: 1.65, fontStyle: v ? "normal" : "italic" }}>{v || `No ${l.toLowerCase()} added yet.`}</p>
                        </div>
                      ))}
                      <button className="pf-edit-btn" onClick={startPfEdit}>✏️ Add Experience</button>
                    </div>
                }
              </div>
            </motion.div>
          )}

          {/* MEDIA */}
          {pfTab === "media" && (
            <motion.div key="md" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="pf-card">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                  <div className="pf-card-title" style={{ marginBottom: 0 }}>🏆 Certificates</div>
                  {pfEditing && <button className="pf-edit-btn" onClick={() => certRef.current?.click()}>+ Upload</button>}
                </div>
                <div className="pf-upload-grid">
                  {certs.map((c, i) => (
                    <div className="pf-upload-thumb" key={i} onClick={() => window.open(c.url, "_blank")}>
                      {c.type?.startsWith("image/") ? <img src={c.url} alt="" /> : <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "rgba(79,70,229,.05)" }}><span style={{ fontSize: "1.8rem" }}>📑</span><span style={{ fontSize: ".6rem", fontWeight: 700, color: "var(--muted)" }}>PDF</span></div>}
                      {pfEditing && <button className="pf-upload-thumb-del" onClick={e => { e.stopPropagation(); pffc("certificates", pfForm.certificates.filter((_, j) => j !== i)); }}>✕</button>}
                    </div>
                  ))}
                  {pfEditing && <div className="pf-add-thumb" onClick={() => certRef.current?.click()}><span style={{ fontSize: "1.4rem" }}>+</span><span>Add</span></div>}
                  {!pfEditing && certs.length === 0 && <em style={{ color: "var(--subtle)", fontSize: ".83rem" }}>No certificates yet.</em>}
                </div>
              </div>
              <div className="pf-card">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                  <div className="pf-card-title" style={{ marginBottom: 0 }}>📸 Personal Posts</div>
                  {pfEditing && <button className="pf-edit-btn" onClick={() => postRef.current?.click()}>+ Upload</button>}
                </div>
                <div className="pf-upload-grid">
                  {posts.map((p, i) => (
                    <div className="pf-upload-thumb" key={i} onClick={() => window.open(p.url, "_blank")}>
                      {p.type?.startsWith("image/") ? <img src={p.url} alt="" /> : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: "1.8rem" }}>🎬</span></div>}
                      {pfEditing && <button className="pf-upload-thumb-del" onClick={e => { e.stopPropagation(); pffc("personalPosts", pfForm.personalPosts.filter((_, j) => j !== i)); }}>✕</button>}
                    </div>
                  ))}
                  {pfEditing && <div className="pf-add-thumb" onClick={() => postRef.current?.click()}><span style={{ fontSize: "1.4rem" }}>+</span><span>Add</span></div>}
                  {!pfEditing && posts.length === 0 && <em style={{ color: "var(--subtle)", fontSize: ".83rem" }}>No posts yet.</em>}
                </div>
                {pfEditing && <div style={{ marginTop: "1.2rem", display: "flex", justifyContent: "flex-end" }}>
                  <button className="pf-save-btn" onClick={savePfForm} disabled={pfSaving}>{pfSaving ? "Saving…" : "💾 Save Media"}</button>
                </div>}
              </div>
            </motion.div>
          )}

          {/* RESUME */}
          {pfTab === "resume" && (
            <motion.div key="rv" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="pf-card">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.2rem" }}>
                  <div className="pf-card-title" style={{ marginBottom: 0 }}>📄 My Resumes</div>
                  {pfEditing && <button className="pf-edit-btn" onClick={() => resumeRef.current?.click()}>+ Upload</button>}
                </div>
                {resumes.length === 0
                  ? <div style={{ textAlign: "center", padding: "2rem 1rem", color: "var(--subtle)" }}>
                      <div style={{ fontSize: "2.2rem", marginBottom: ".5rem" }}>📄</div>
                      <div style={{ fontWeight: 700, color: "var(--muted)" }}>No Resumes Yet</div>
                      <div style={{ fontSize: ".78rem", marginTop: ".3rem" }}>Upload a resume to attach it to applications.</div>
                      {pfEditing && <button className="pf-save-btn" style={{ marginTop: "1rem" }} onClick={() => resumeRef.current?.click()}>+ Upload Resume</button>}
                      {!pfEditing && <button className="pf-edit-btn" style={{ marginTop: "1rem" }} onClick={startPfEdit}>Go to Edit Mode</button>}
                    </div>
                  : resumes.map((r, i) => (
                    <div className="pf-resume-item" key={i}>
                      <div className="pf-resume-icon">{r.type === "application/pdf" ? "📑" : "🖼️"}</div>
                      <div style={{ flex: 1 }}>
                        <div className="pf-resume-name">{r.name || `Resume ${i + 1}`}</div>
                        <div style={{ fontSize: ".68rem", color: "var(--subtle)", fontWeight: 600 }}>{r.type}</div>
                      </div>
                      <div style={{ display: "flex", gap: ".5rem" }}>
                        <a href={r.url} target="_blank" rel="noreferrer"><button style={{ padding: ".38rem .85rem", background: "rgba(79,70,229,.08)", border: "none", borderRadius: 8, fontSize: ".72rem", fontWeight: 700, color: "var(--indigo)", cursor: "pointer" }}>View</button></a>
                        {pfEditing && <button style={{ padding: ".38rem .8rem", background: "rgba(244,63,94,.07)", border: "1px solid rgba(244,63,94,.18)", borderRadius: 8, fontSize: ".72rem", fontWeight: 700, color: "var(--rose)", cursor: "pointer" }} onClick={() => pffc("resumes", pfForm.resumes.filter((_, j) => j !== i))}>Remove</button>}
                      </div>
                    </div>
                  ))
                }
                {pfEditing && resumes.length > 0 && <div style={{ marginTop: "1.2rem", display: "flex", justifyContent: "flex-end" }}>
                  <button className="pf-save-btn" onClick={savePfForm} disabled={pfSaving}>{pfSaving ? "Saving…" : "💾 Save"}</button>
                </div>}
                {!pfEditing && <div style={{ marginTop: "1rem" }}><button className="pf-edit-btn" onClick={startPfEdit}>✏️ Manage Resumes</button></div>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {pfToast && (
            <motion.div className={`pf-toast ${pfToast.type === "error" ? "pf-toast-error" : "pf-toast-success"}`}
              initial={{ opacity: 0, y: 14, scale: .96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }}>
              {pfToast.msg}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  // ── FIX: Redirect to login when session is invalid instead of hanging
  useEffect(() => {
    if (authFailed) {
      try { signOut(); } catch {}
      navigate("/login");
    }
  }, [authFailed]);

  if (!profile) return (
    <div style={{ height:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"var(--bg)",flexDirection:"column",gap:"1.2rem" }}>
      
      <div style={{ fontFamily:"var(--font-display)",fontSize:"2rem",fontWeight:800,background:"var(--grad)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>Campus2Career</div>
      {bootDone
        ? <>
            <div style={{ color:"var(--danger)",fontSize:".9rem",fontWeight:700 }}>Session expired — please log in again</div>
            <button style={{ marginTop:".5rem",padding:".6rem 1.4rem",borderRadius:"99px",border:"none",background:"linear-gradient(135deg,#6366f1,#8b5cf6)",color:"white",fontWeight:700,cursor:"pointer",fontSize:".85rem" }} onClick={() => navigate("/login")}>Go to Login</button>
          </>
        : <>
            <div className="spinner" style={{ width:30,height:30,border:"3px solid rgba(99,102,241,.15)",borderTopColor:"#6366f1",borderRadius:"50%",animation:"spin .7s linear infinite" }} />
            <div style={{ color:"var(--muted)",fontSize:".84rem" }}>Loading your profile…</div>
          </>
      }
    </div>
  );

  const typeChip = (type) => {
    if (!type) return <span className="type-chip chip-job">Job</span>;
    if (type.toLowerCase().includes("intern")) return <span className="type-chip chip-intern">Internship</span>;
    if (type.toLowerCase().includes("train")) return <span className="type-chip chip-train">Training</span>;
    return <span className="type-chip chip-job">{type}</span>;
  };

  // ── Main render ────────────────────────────────────────────────────────────
  return (
    <>
      

      {/* NAV */}
      <nav className="s-nav">
        <div>
          <div className="brand">Campus2Career</div>
          <div className="brand-sub">Student Portal</div>
        </div>
        <div className="s-search">
          <span className="ico">🔍</span>
          <input placeholder="Search industries, jobs, courses…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
        <div className="nav-right">
          {["feed","jobs","courses","applications","profile"].map(tab => (
            <button key={tab} className={`nav-pill ${activeTab === tab ? "active" : ""}`} onClick={() => setActiveTab(tab)}>
              {{ feed:"🏠 Feed", jobs:"💼 Jobs", courses:"📚 Courses", applications:"📋 My Apps", profile:"👤 Profile" }[tab]}
            </button>
          ))}
          <div className="notif-btn"><span>🔔</span><span className="notif-dot" /></div>
          <div className="nav-av" title={profile.name}>{profile.photo ? <img src={profile.photo} alt="" /> : (profile.name || "S")[0].toUpperCase()}</div>
          <button onClick={handleLogout} style={{ padding: ".35rem .9rem", borderRadius: 99, background: "rgba(244,63,94,.08)", border: "1.5px solid rgba(244,63,94,.2)", color: "var(--rose)", fontSize: ".74rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Sign Out</button>
        </div>
      </nav>

      <div className="s-layout">
        {/* ── LEFT SIDEBAR: own profile ── */}
        <aside className="s-sidebar">
          {renderPanel(profile, true)}
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main className="s-content">
          <AnimatePresence mode="wait">

            {/* ══ FEED ══════════════════════════════════════════════════════ */}
            {activeTab === "feed" && (
              <motion.div key="feed" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

                {/* Industries */}
                <div className="page-sec">
                  <div className="sec-head">
                    <div>
                      <span className="sec-title">Partner Industries</span>
                      <span className="sec-sub">· {industries.length} registered</span>
                    </div>
                  </div>
                  <div className="ind-grid">
                    {industries.map((ind, i) => (
                      <motion.div key={ind.id || i} className="ind-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                        onClick={() => setActiveChat(ind.id)}>
                        <div className="ind-logo">{ind.logo || (ind.name || "CO").substring(0, 2).toUpperCase()}</div>
                        <div className="ind-name">{ind.name}</div>
                        <div className="ind-domain">{ind.domain}</div>
                        <div className="ind-loc">📍 {ind.location}</div>
                        {ind.tagline && <div className="ind-tagline">"{ind.tagline}"</div>}
                        <div style={{ marginTop: ".8rem" }}>
                          <button className="apply-btn" style={{ padding: ".42rem .9rem", fontSize: ".72rem", width: "auto" }} onClick={e => { e.stopPropagation(); setActiveChat(ind.id); }}>💬 Message</button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Vacancy Feed */}
                <div className="page-sec">
                  <div className="sec-head">
                    <div>
                      <span className="sec-title">Opportunity Feed</span>
                      <span className="sec-sub">· {vacancies.length} openings</span>
                    </div>
                  </div>
                  {isFeedLoading
                    ? <div style={{ textAlign: "center", padding: "3rem", color: "var(--subtle)" }}><div className="spinner" style={{ margin: "0 auto" }} /></div>
                    : <div className="feed-grid">
                        {vacancies.map((v, i) => (
                          <motion.div key={v.id || i} className="vac-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                            <div className="vac-body">
                              <div className="vac-top">
                                <div style={{ display: "flex", alignItems: "center", gap: ".7rem" }}>
                                  <div className="vac-logo">{v.ownerLogo || "CO"}</div>
                                  <div>
                                    <div className="vac-owner-name">{v.ownerName}</div>
                                    <div className="vac-date">{v.date}</div>
                                  </div>
                                </div>
                                {typeChip(v.type)}
                              </div>
                              <div className="vac-title">{v.title}</div>
                              <div className="vac-desc">{v.desc}</div>
                              <div className="skill-pills">
                                {(v.skills || "").split(",").filter(Boolean).slice(0, 5).map((sk, j) => <span key={j} className="spill">{sk.trim()}</span>)}
                              </div>
                            </div>
                            <div className="vac-foot">
                              <div style={{ display: "flex", gap: "1rem" }}>
                                {v.duration && <div className="vac-meta-item">⏱ {v.duration}</div>}
                                {v.offerings && <div className="vac-meta-item">💰 {v.offerings.slice(0, 28)}{v.offerings.length > 28 ? "…" : ""}</div>}
                              </div>
                              <div style={{ display: "flex", gap: ".5rem" }}>
                                <button style={{ padding: ".42rem .85rem", borderRadius: 99, background: "rgba(79,70,229,.08)", border: "1.5px solid var(--border2)", color: "var(--indigo)", fontSize: ".72rem", fontWeight: 700, cursor: "pointer" }} onClick={() => setPostDetailModal(v)}>Details</button>
                                {alreadyApplied(v.id)
                                  ? <span className="applied-tag">✓ Applied</span>
                                  : <button className="apply-btn" onClick={() => setApplyModal(v)}>Apply Now</button>
                                }
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                  }
                </div>
              </motion.div>
            )}

            {/* ══ JOBS ══════════════════════════════════════════════════════ */}
            {activeTab === "jobs" && (
              <motion.div key="jobs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

                {/* AI Matches */}
                <div className="page-sec">
                  <div className="sec-head">
                    <div>
                      <span className="sec-title">🤖 AI Skill Matches</span>
                      <span className="sec-sub">· Based on your skills</span>
                    </div>
                    {profile.skills?.length > 0 && (
                      <button className="sec-link" onClick={async () => {
                        setIsMatchLoading(true);
                        try {
                          const res = await axios.post(`${BASE}/api/analyze-skills`, { skills: profile.skills.join(", ") }, { timeout: 12000 });
                          setMatchedJobs(Array.isArray(res.data) ? res.data : []);
                        } catch {}
                        setIsMatchLoading(false);
                      }}>↺ Refresh</button>
                    )}
                  </div>
                  {isMatchLoading
                    ? <div style={{ textAlign: "center", padding: "2rem", color: "var(--subtle)" }}><div className="spinner" style={{ margin: "0 auto" }} /></div>
                    : !profile.skills?.length
                      ? <div className="empty-block">
                          <div className="empty-icon">⚡</div>
                          <div className="empty-title">No skills added yet</div>
                          <div className="empty-text">Add skills in your profile to get AI-powered job matches.</div>
                          <button className="pf-save-btn" style={{ marginTop: "1rem" }} onClick={() => { setActiveTab("profile"); setTimeout(() => setPfTab("skills"), 100); }}>Add Skills →</button>
                        </div>
                      : matchedJobs.length === 0
                        ? <div className="empty-block"><div className="empty-icon">🔍</div><div className="empty-title">No matches yet</div><div className="empty-text">Click Refresh to run the AI analysis.</div></div>
                        : <div className="match-grid">
                            {matchedJobs.map((m, i) => (
                              <motion.div key={i} className="match-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                                <div className="match-conf">{m.match_confidence ?? m.accuracy ?? 0}%</div>
                                <div className="match-label">Match Confidence</div>
                                <div className="match-bar"><div className="match-fill" style={{ width: `${m.match_confidence ?? m.accuracy ?? 0}%` }} /></div>
                                <div style={{ fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: ".95rem", color: "var(--navy)", marginBottom: ".3rem" }}>{m.job || m.matched_job}</div>
                                {m.industry && <div style={{ fontSize: ".72rem", color: "var(--muted)", fontWeight: 600, marginBottom: ".7rem" }}>📍 {m.industry}</div>}
                                {m.missing_skills?.length > 0 && (
                                  <div style={{ marginBottom: ".7rem" }}>
                                    <div style={{ fontSize: ".65rem", fontWeight: 800, textTransform: "uppercase", color: "var(--rose)", letterSpacing: ".06em", marginBottom: ".35rem" }}>Skills to Learn</div>
                                    <div>{m.missing_skills.map((s, j) => <span key={j} className="miss-chip">{s}</span>)}</div>
                                  </div>
                                )}
                                {m.courses?.length > 0 && (
                                  <div>
                                    <div style={{ fontSize: ".65rem", fontWeight: 800, textTransform: "uppercase", color: "var(--emerald)", letterSpacing: ".06em", marginBottom: ".35rem" }}>Recommended Courses</div>
                                    {m.courses.map((c, j) => (
                                      <a key={j} href={c.link || c.url || "#"} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
                                        <div className="course-rec">
                                          <span style={{ fontSize: "1rem" }}>📚</span>
                                          <div className="course-rec-title">{c.title}</div>
                                          <span style={{ fontSize: ".65rem", color: "var(--indigo)", fontWeight: 700, flexShrink: 0 }}>→</span>
                                        </div>
                                      </a>
                                    ))}
                                  </div>
                                )}
                                {m.url && <a href={m.url} target="_blank" rel="noreferrer"><button className="apply-btn" style={{ width: "100%", marginTop: ".7rem", justifyContent: "center" }}>View Job →</button></a>}
                              </motion.div>
                            ))}
                          </div>
                  }
                </div>

                {/* All Jobs */}
                <div className="page-sec">
                  <div className="sec-head">
                    <div>
                      <span className="sec-title">All Job Listings</span>
                      <span className="sec-sub">· {allJobs.length} openings scraped</span>
                    </div>
                  </div>
                  <div className="jobs-grid">
                    {allJobs.filter(j => !searchQuery || j.job?.toLowerCase().includes(searchQuery.toLowerCase()) || j.industry?.toLowerCase().includes(searchQuery.toLowerCase()) || j.skills?.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map((j, i) => (
                      <motion.div key={i} className="job-card" initial={{ opacity: 0, scale: .97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}>
                        <div className="job-co">{j.industry}</div>
                        <div className="job-title">{j.job}</div>
                        <div className="job-desc">{j.desc}</div>
                        <div className="job-tags">
                          {j.dept && <span className="jtag" style={{ background: "#e0f2fe", color: "#0369a1", borderColor: "#bae6fd" }}>{j.dept}</span>}
                          {j.role && <span className="jtag" style={{ background: "#ede9fe", color: "#5b21b6", borderColor: "#ddd6fe" }}>{j.role}</span>}
                          {j.ug && <span className="jtag" style={{ background: "#dcfce7", color: "#166534", borderColor: "#bbf7d0" }}>{j.ug}</span>}
                        </div>
                        <div className="skill-pills" style={{ marginBottom: ".7rem" }}>
                          {(j.skills || "").split(",").filter(Boolean).slice(0, 4).map((sk, k) => <span key={k} className="spill" style={{ fontSize: ".65rem" }}>{sk.trim()}</span>)}
                        </div>
                        <div className="job-foot">
                          <div className="job-dept">{j.pg && `PG: ${j.pg}`}</div>
                          <a href={j.url} target="_blank" rel="noreferrer" className="job-apply-link">Apply →</a>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ══ COURSES ═══════════════════════════════════════════════════ */}
            {activeTab === "courses" && (
              <motion.div key="courses" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="sec-head" style={{ marginBottom: "1.3rem" }}>
                  <div><span className="sec-title">Recommended Courses</span><span className="sec-sub">· {courses.length} available</span></div>
                </div>
                <div className="courses-grid">
                  {courses.map((c, i) => (
                    <motion.div key={c.id || i} className="course-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} onClick={() => window.open(c.link || c.url || "#", "_blank")}>
                      <div className="course-header">
                        <div className="course-provider">{c.provider}</div>
                        <div className="course-title">{c.title}</div>
                      </div>
                      <div className="course-body">
                        <div className="course-meta">
                          {c.duration && <span className="cmeta">⏱ {c.duration}</span>}
                          {c.rating && <span className="cmeta">⭐ {c.rating}</span>}
                          {c.students && <span className="cmeta">👥 {c.students}</span>}
                        </div>
                        {c.level && <div style={{ marginBottom: ".75rem" }}><span className={`level-pill level-${c.level}`}>{c.level}</span></div>}
                        {(c.skills || []).length > 0 && (
                          <div className="skill-pills" style={{ marginBottom: ".75rem" }}>
                            {c.skills.slice(0, 3).map((sk, j) => <span key={j} className="spill">{sk}</span>)}
                          </div>
                        )}
                        <button className="course-enroll">Enroll Now →</button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ══ APPLICATIONS ══════════════════════════════════════════════ */}
            {activeTab === "applications" && (
              <motion.div key="apps" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="sec-head" style={{ marginBottom: "1.3rem" }}>
                  <div><span className="sec-title">My Applications</span><span className="sec-sub">· {myApplications.length} submitted</span></div>
                </div>
                {myApplications.length === 0
                  ? <div className="empty-block">
                      <div className="empty-icon">📋</div>
                      <div className="empty-title">No applications yet</div>
                      <div className="empty-text">Browse the feed and apply to internships and job vacancies.</div>
                      <button className="pf-save-btn" style={{ marginTop: "1rem" }} onClick={() => setActiveTab("feed")}>Browse Openings →</button>
                    </div>
                  : <div className="app-list">
                      {myApplications.map((a, i) => (
                        <motion.div key={a.id || i} className="app-card" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <div>
                              <div className="app-role">{a.role}</div>
                              <div className="app-co">🏢 {a.company}</div>
                            </div>
                            <span className={`status-pill sp-${a.status}`}>{a.status}</span>
                          </div>
                          <div style={{ fontSize: ".78rem", color: "var(--muted)", marginTop: ".6rem", display: "flex", gap: "1.2rem" }}>
                            <span>📅 Applied: {a.appliedOn}</span>
                            {a.coverLetter && <span>📝 Cover letter attached</span>}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                }
              </motion.div>
            )}

            {/* ══ PROFILE PAGE ═══════════════════════════════════════════════ */}
            {activeTab === "profile" && (
              <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                {renderProfilePage()}
              </motion.div>
            )}

          </AnimatePresence>
        </main>

        {/* ── RIGHT SIDEBAR: other user profile ── */}
        <AnimatePresence>
          {activeUserProfile && (
            <motion.aside className="s-sidebar right" initial={{ x: 340, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 340, opacity: 0 }} transition={{ type: "spring", stiffness: 280, damping: 28 }}>
              {renderPanel(activeUserProfile, false)}
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* ── DM PANEL ── */}
      <AnimatePresence>
        {activeChat && (
          <motion.div className="dm-panel" initial={{ x: 360, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 360, opacity: 0 }} transition={{ type: "spring", stiffness: 280, damping: 28 }}>
            <div className="dm-head">
              <div>
                <div className="dm-recipient">{industries.find(i => i.id === activeChat)?.name ?? "Company"}</div>
                <div className="dm-status"><span className="online-dot" />Active</div>
              </div>
              <button className="close-x" onClick={() => setActiveChat(null)}>✕</button>
            </div>
            <div className="dm-body">
              {!(profile.chats?.[activeChat] || []).length
                ? <div className="dm-empty"><span style={{ fontSize: "1.8rem" }}>💬</span><span>No messages yet. Say hello!</span></div>
                : (profile.chats?.[activeChat] || []).map((msg, i) => (
                  <div key={i} className={`bubble ${msg.sender === profile.name ? "sent" : "recv"}`}>
                    <div>{msg.message}</div>
                    <div className="bubble-time">{msg.time}</div>
                  </div>
                ))
              }
              <div ref={chatEndRef} />
            </div>
            <div className="dm-foot">
              <input ref={chatInputRef} className="dm-input" placeholder="Type a message…"
                onKeyDown={e => { if (e.key === "Enter" && e.target.value.trim()) { sendMessage(activeChat, e.target.value.trim()); e.target.value = ""; } }} />
              <button className="send-btn" onClick={() => { const inp = chatInputRef.current; if (!inp?.value.trim()) return; sendMessage(activeChat, inp.value.trim()); inp.value = ""; }}>➤</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── POST DETAIL MODAL ── */}
      <AnimatePresence>
        {postDetailModal && (
          <motion.div className="modal-ov" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={e => { if (e.target === e.currentTarget) setPostDetailModal(null); }}>
            <motion.div className="modal-box" initial={{ scale: .94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: .94, opacity: 0 }}>
              <button className="modal-close" onClick={() => setPostDetailModal(null)}>✕</button>
              <div style={{ display: "flex", alignItems: "center", gap: ".85rem", marginBottom: "1.4rem" }}>
                <div style={{ width: 50, height: 50, borderRadius: 13, background: "rgba(79,70,229,.1)", color: "var(--indigo)", fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: ".95rem", display: "flex", alignItems: "center", justifyContent: "center" }}>{postDetailModal.ownerLogo || "CO"}</div>
                <div>
                  <div className="modal-title" style={{ fontSize: "1.3rem" }}>{postDetailModal.title}</div>
                  <div style={{ color: "var(--indigo)", fontWeight: 700, fontSize: ".83rem" }}>{postDetailModal.ownerName} · {postDetailModal.type}</div>
                </div>
              </div>
              <div style={{ marginBottom: "1.1rem", lineHeight: 1.65, color: "var(--muted)", fontSize: ".88rem" }}>{postDetailModal.desc}</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: ".75rem", marginBottom: "1.2rem", fontSize: ".85rem" }}>
                {postDetailModal.duration && <div><strong>Duration:</strong> {postDetailModal.duration}</div>}
                {postDetailModal.skills && <div><strong>Skills:</strong> {postDetailModal.skills}</div>}
                {postDetailModal.offerings && <div style={{ gridColumn: "1 / -1" }}><strong>Offerings:</strong> {postDetailModal.offerings}</div>}
              </div>
              {alreadyApplied(postDetailModal.id)
                ? <div style={{ textAlign: "center", padding: ".85rem", background: "#dcfce7", borderRadius: 12, color: "#166534", fontWeight: 700 }}>✓ Already Applied</div>
                : <button className="btn-primary" onClick={() => { setApplyModal(postDetailModal); setPostDetailModal(null); }}>Apply for this Role</button>
              }
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── APPLY MODAL ── */}
      <AnimatePresence>
        {applyModal && (
          <motion.div className="modal-ov" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={e => { if (e.target === e.currentTarget) setApplyModal(null); }}>
            <motion.div className="modal-box" initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}>
              <button className="modal-close" onClick={() => setApplyModal(null)}>✕</button>
              <div className="modal-title">Apply Now</div>
              <div className="modal-sub">Applying to <strong>{applyModal?.ownerName}</strong> for <strong>{applyModal?.title}</strong></div>
              <form onSubmit={handleApplySubmit}>
                <label className="field-label">Your Name</label>
                <input className="field-input" value={profile?.name || ""} readOnly style={{ background: "#f8fafc", cursor: "not-allowed", opacity: .8 }} />
                <label className="field-label">Email</label>
                <input className="field-input" value={profile?.email || ""} readOnly style={{ background: "#f8fafc", cursor: "not-allowed", opacity: .8 }} />
                <label className="field-label">Resume</label>
                {(profile?.resumes || []).length > 0
                  ? <div style={{ marginBottom: "1rem" }}>
                      {(profile.resumes || []).map((r, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: ".5rem", background: "rgba(79,70,229,.05)", border: "1px solid rgba(79,70,229,.15)", borderRadius: 10, padding: ".5rem .8rem", marginBottom: ".4rem" }}>
                          <span>{r.type === "application/pdf" ? "📑" : "🖼️"}</span>
                          <span style={{ fontSize: ".82rem", fontWeight: 600, flex: 1 }}>{r.name}</span>
                          <span style={{ fontSize: ".68rem", background: "#dcfce7", color: "#166534", padding: ".1rem .5rem", borderRadius: 99, fontWeight: 700 }}>Attached</span>
                        </div>
                      ))}
                    </div>
                  : <div style={{ marginBottom: "1rem", padding: ".7rem 1rem", background: "#fff8e6", border: "1px solid #fbbf24", borderRadius: 10, fontSize: ".8rem", color: "#92400e", fontWeight: 600 }}>
                      ⚠️ No resume on file. Go to <strong>My Profile → Resume</strong> to upload one first.
                    </div>
                }
                <label className="field-label">Cover Letter</label>
                <textarea required className="field-input" rows={4} placeholder="Explain why you're a great fit for this role…" value={applyForm.coverLetter} onChange={e => setApplyForm({ ...applyForm, coverLetter: e.target.value })} />
                <button type="submit" className="btn-primary">🚀 Submit Application</button>
                <button type="button" className="btn-secondary" onClick={() => setApplyModal(null)}>Cancel</button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── TOAST NOTIFICATIONS ── */}
      <div style={{ position: "fixed", bottom: "2rem", right: "2rem", zIndex: 2000, display: "flex", flexDirection: "column", gap: "10px" }}>
        <AnimatePresence>
          {notifications.map(n => (
            <motion.div key={n.id} className="notif-toast" initial={{ opacity: 0, x: 50, scale: .92 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, scale: .9 }}>
              <div className="notif-dot2" />{n.msg}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}
