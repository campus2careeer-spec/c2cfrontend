import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from "framer-motion";
import axios from 'axios';
import { useAuth } from '../AuthContext';
import API_BASE_URL from '../apiConfig';

const BASE = API_BASE_URL;

const SKILL_SUGGESTIONS = [
  "Python","JavaScript","React","Node.js","Django","Flask","Java","C++","TypeScript",
  "SQL","MongoDB","PostgreSQL","AWS","Docker","Kubernetes","Git","Machine Learning",
  "Deep Learning","TensorFlow","PyTorch","Figma","UI/UX","HTML","CSS","Spring Boot",
  "GraphQL","DevOps","REST APIs","Data Science","Excel","Power BI","Tableau",
  "Android","Flutter","Swift","Kotlin","PHP","Laravel","Vue.js","Angular",
];

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

// ─── FIX: Build a profile API payload that correctly maps frontend keys to DB keys.
// The backend field_map handles name→full_name and address→location etc.
// We also explicitly pass every editable field so nothing is silently dropped.
function buildProfilePayload(form) {
  return {
    name:         form.name        || "",
    phone:        form.phone       || "",
    address:      form.address     || "",   // backend maps → location
    about:        form.about       || "",
    qualification:form.qualification|| "",
    tenth:        form.tenth       || "",
    twelfth:      form.twelfth     || "",
    graduation:   form.graduation  || "",
    website:      form.website     || "",
    linkedin:     form.linkedin    || "",
    github:       form.github      || "",
    experience:   form.experience  || "",
    projects:     form.projects    || "",
    achievements: form.achievements|| "",
    cgpa:         form.cgpa        || "",
    // Array fields – always send clean arrays
    skills:       Array.isArray(form.skills)       ? form.skills       : [],
    certificates: Array.isArray(form.certificates) ? form.certificates : [],
    resumes:      Array.isArray(form.resumes)      ? form.resumes      : [],
    personalPosts:Array.isArray(form.personalPosts)? form.personalPosts: [],
  };
}

const NAV_TABS = [
  { id: "feed",         icon: "⚡", label: "Feed"         },
  { id: "jobs",         icon: "💼", label: "Jobs"         },
  { id: "courses",      icon: "📚", label: "Courses"      },
  { id: "applications", icon: "📋", label: "My Apps"      },
  { id: "profile",      icon: "👤", label: "Profile"      },
];

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Clash+Display:wght@400;500;600;700&family=Satoshi:wght@300;400;500;600;700;900&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800;900&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --brand:#6366f1;--brand-2:#8b5cf6;--brand-3:#06b6d4;
  --accent:#f59e0b;--success:#10b981;--danger:#f43f5e;--info:#3b82f6;
  --navy:#0a0f1e;--dark:#111827;--slate:#1e2a3b;--mid:#374151;
  --muted:#6b7280;--subtle:#9ca3af;--faint:#d1d5db;
  --bg:#f4f6fb;--bg2:#eef1f8;
  --surface:rgba(255,255,255,0.92);--surface2:#ffffff;
  --border:rgba(99,102,241,0.1);--border2:rgba(99,102,241,0.2);
  --grad:linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%);
  --grad-2:linear-gradient(135deg,#06b6d4,#6366f1);
  --grad-warm:linear-gradient(135deg,#f59e0b,#ef4444);
  --grad-green:linear-gradient(135deg,#10b981,#059669);
  --glow:0 0 0 3px rgba(99,102,241,0.15);
  --shadow-xs:0 1px 3px rgba(10,15,30,0.06);
  --shadow-sm:0 2px 8px rgba(10,15,30,0.08);
  --shadow:0 4px 20px rgba(99,102,241,0.12);
  --shadow-lg:0 12px 40px rgba(99,102,241,0.18);
  --shadow-xl:0 24px 60px rgba(99,102,241,0.22);
  --r-xs:6px;--r-sm:10px;--r:16px;--r-lg:22px;--r-xl:28px;
  --font-display:'Syne',sans-serif;
  --font-body:'DM Sans',sans-serif;
  --nav-h:64px;
}

html{scroll-behavior:smooth}
body{font-family:var(--font-body);background:var(--bg);color:var(--slate);-webkit-font-smoothing:antialiased;min-height:100vh}
::-webkit-scrollbar{width:5px;height:5px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:rgba(99,102,241,0.2);border-radius:99px}
::-webkit-scrollbar-thumb:hover{background:rgba(99,102,241,0.4)}

/* ── NAV ── */
.nav{height:var(--nav-h);background:rgba(255,255,255,0.95);backdrop-filter:blur(20px);border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;padding:0 1.5rem;position:sticky;top:0;z-index:300;box-shadow:var(--shadow-xs)}
.nav-brand{display:flex;align-items:center;gap:.6rem;flex-shrink:0}
.nav-brand-icon{width:34px;height:34px;border-radius:10px;background:var(--grad);display:flex;align-items:center;justify-content:center;font-size:1rem;box-shadow:0 4px 12px rgba(99,102,241,.3)}
.nav-brand-text{font-family:var(--font-display);font-size:1.05rem;font-weight:800;background:var(--grad);-webkit-background-clip:text;-webkit-text-fill-color:transparent;letter-spacing:-.03em}
.nav-brand-sub{font-size:.58rem;font-weight:700;color:var(--subtle);text-transform:uppercase;letter-spacing:.12em;line-height:1}

.nav-tabs{display:flex;align-items:center;background:rgba(99,102,241,.05);border:1px solid var(--border);border-radius:var(--r);padding:4px;gap:2px}
.nav-tab{display:flex;align-items:center;gap:.4rem;padding:.4rem .85rem;border-radius:12px;font-size:.78rem;font-weight:600;color:var(--muted);cursor:pointer;border:none;background:transparent;font-family:var(--font-body);transition:all .18s;white-space:nowrap}
.nav-tab:hover{color:var(--brand);background:rgba(99,102,241,.06)}
.nav-tab.active{background:var(--grad);color:white;box-shadow:0 3px 10px rgba(99,102,241,.28)}
.nav-tab .tab-icon{font-size:.9rem}

.nav-right{display:flex;align-items:center;gap:.6rem}
.nav-search{position:relative}
.nav-search input{width:220px;padding:.45rem .9rem .45rem 2.1rem;border:1.5px solid var(--border2);border-radius:99px;background:var(--bg2);font-family:var(--font-body);font-size:.8rem;color:var(--slate);outline:none;transition:.2s}
.nav-search input:focus{border-color:var(--brand);background:white;box-shadow:var(--glow);width:260px}
.nav-search .search-ico{position:absolute;left:.75rem;top:50%;transform:translateY(-50%);font-size:.8rem;color:var(--subtle)}
.nav-icon-btn{width:36px;height:36px;border-radius:10px;background:var(--bg2);border:1.5px solid var(--border);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:.9rem;position:relative;transition:.18s;color:var(--muted)}
.nav-icon-btn:hover{background:rgba(99,102,241,.08);color:var(--brand);border-color:var(--border2)}
.nav-notif-dot{position:absolute;top:6px;right:6px;width:7px;height:7px;background:var(--danger);border-radius:50%;border:2px solid white}
.nav-avatar{width:36px;height:36px;border-radius:10px;background:var(--grad);color:white;font-family:var(--font-display);font-weight:800;font-size:.9rem;display:flex;align-items:center;justify-content:center;cursor:pointer;overflow:hidden;transition:.15s;border:2px solid transparent}
.nav-avatar:hover{border-color:var(--brand);box-shadow:0 0 0 3px rgba(99,102,241,.15)}
.nav-avatar img{width:100%;height:100%;object-fit:cover}
.nav-signout{padding:.38rem .85rem;border-radius:8px;background:rgba(244,63,94,.07);border:1.5px solid rgba(244,63,94,.18);color:var(--danger);font-size:.74rem;font-weight:700;cursor:pointer;font-family:var(--font-body);transition:.18s}
.nav-signout:hover{background:rgba(244,63,94,.13)}

/* ── LAYOUT ── */
.layout{display:flex;min-height:calc(100vh - var(--nav-h))}
.sidebar{width:300px;min-width:300px;background:var(--surface);border-right:1px solid var(--border);height:calc(100vh - var(--nav-h));position:sticky;top:var(--nav-h);overflow-y:auto;flex-shrink:0}
.sidebar-right{border-right:none;border-left:1px solid var(--border)}
.content{flex:1;padding:1.8rem;min-width:0;overflow-y:auto}

/* ── SIDEBAR PROFILE ── */
.sb-cover{height:90px;background:var(--grad);position:relative;overflow:hidden;cursor:pointer;flex-shrink:0}
.sb-cover::before{content:'';position:absolute;top:-30px;right:-30px;width:120px;height:120px;background:rgba(255,255,255,.08);border-radius:50%}
.sb-cover::after{content:'';position:absolute;bottom:-20px;left:10px;width:70px;height:70px;background:rgba(255,255,255,.05);border-radius:50%}
.sb-cover img{width:100%;height:100%;object-fit:cover}
.sb-avatar-wrap{padding:0 1.2rem;position:relative;margin-top:-28px;z-index:2}
.sb-avatar{width:54px;height:54px;border-radius:14px;border:3px solid white;background:var(--grad);color:white;font-family:var(--font-display);font-weight:800;font-size:1.2rem;display:flex;align-items:center;justify-content:center;overflow:hidden;box-shadow:var(--shadow)}
.sb-avatar img{width:100%;height:100%;object-fit:cover}
.sb-info{padding:.6rem 1.2rem .9rem}
.sb-name{font-family:var(--font-display);font-size:.98rem;font-weight:800;color:var(--dark);line-height:1.25}
.sb-handle{font-size:.7rem;color:var(--subtle);font-weight:500;margin-top:2px}
.sb-qual{display:inline-flex;align-items:center;gap:.35rem;margin-top:.4rem;padding:.18rem .6rem;background:rgba(99,102,241,.08);border:1px solid var(--border2);border-radius:99px;font-size:.68rem;font-weight:700;color:var(--brand)}
.sb-actions{display:flex;gap:.4rem;margin-top:.65rem}
.sb-btn{flex:1;padding:.38rem .7rem;border-radius:8px;font-size:.73rem;font-weight:700;cursor:pointer;font-family:var(--font-body);transition:.18s;border:1.5px solid}
.sb-btn-primary{background:var(--grad);color:white;border-color:transparent;box-shadow:0 3px 10px rgba(99,102,241,.22)}
.sb-btn-primary:hover{opacity:.88}
.sb-btn-ghost{background:transparent;color:var(--brand);border-color:var(--border2)}
.sb-btn-ghost:hover{background:rgba(99,102,241,.06)}
.sb-btn-success{background:var(--grad-green);color:white;border-color:transparent}
.sb-btn-success:hover{opacity:.88}

.comp-wrap{padding:.8rem 1.2rem;border-bottom:1px solid var(--border)}
.comp-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:.4rem}
.comp-label{font-size:.67rem;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.08em}
.comp-pct{font-size:.78rem;font-weight:800;color:var(--brand)}
.comp-track{height:4px;background:rgba(99,102,241,.1);border-radius:99px;overflow:hidden}
.comp-fill{height:100%;border-radius:99px;background:var(--grad);transition:width .9s cubic-bezier(.4,0,.2,1)}

.sb-section{padding:.75rem 1.2rem;border-bottom:1px solid var(--border)}
.sb-section-title{font-size:.63rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:var(--brand);opacity:.8;margin-bottom:.55rem}

.detail-group{background:var(--bg2);border:1px solid var(--border);border-radius:var(--r-sm);overflow:hidden;margin-top:.5rem}
.detail-row{display:flex;align-items:center;gap:.6rem;padding:.48rem .85rem;border-bottom:1px solid var(--border);font-size:.77rem;color:var(--slate);font-weight:500}
.detail-row:last-child{border-bottom:none}
.detail-row .ico{font-size:.85rem;width:18px;text-align:center;flex-shrink:0}
.detail-sh{padding:.28rem .85rem;background:rgba(99,102,241,.05);font-size:.6rem;font-weight:800;text-transform:uppercase;letter-spacing:.08em;color:var(--brand);border-bottom:1px solid var(--border)}

.toggle-btn{display:flex;align-items:center;gap:.35rem;font-size:.76rem;font-weight:600;color:var(--brand);background:none;border:none;cursor:pointer;font-family:var(--font-body);padding:0;transition:.15s}
.toggle-btn:hover{opacity:.7}

/* ── SIDEBAR FORM ── */
.sb-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:.4rem}
.sf{display:flex;flex-direction:column;gap:.18rem}
.sf-label{font-size:.63rem;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.06em}
.sf-input{padding:.44rem .7rem;border-radius:var(--r-sm);border:1.5px solid var(--border2);background:rgba(255,255,255,.8);font-family:var(--font-body);font-size:.8rem;color:var(--slate);outline:none;transition:.2s;width:100%}
.sf-input:focus{border-color:var(--brand);background:white;box-shadow:var(--glow)}
.sf-input::placeholder{color:var(--faint)}
.sf-upload{display:flex;align-items:center;justify-content:center;gap:.4rem;width:100%;padding:.5rem;border-radius:var(--r-sm);border:1.5px dashed rgba(99,102,241,.25);background:rgba(99,102,241,.03);color:var(--muted);font-size:.77rem;font-weight:600;cursor:pointer;transition:.2s;font-family:var(--font-body)}
.sf-upload:hover{border-color:var(--brand);color:var(--brand);background:rgba(99,102,241,.06)}

/* ── MEDIA GRID ── */
.posts-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:4px}
.post-cell{aspect-ratio:1;border-radius:8px;overflow:hidden;position:relative;background:var(--border);border:1px solid var(--bg2)}
.post-cell img,.post-cell video{width:100%;height:100%;object-fit:cover}
.post-del{position:absolute;top:3px;right:3px;width:18px;height:18px;border-radius:5px;background:rgba(255,255,255,.92);border:none;color:var(--danger);font-size:.5rem;display:flex;align-items:center;justify-content:center;cursor:pointer;font-weight:800}
.resume-item{display:flex;align-items:center;gap:.55rem;padding:.5rem .7rem;border-radius:var(--r-sm);background:rgba(99,102,241,.04);border:1px solid var(--border2);margin-bottom:.4rem}
.resume-name{font-size:.76rem;font-weight:600;color:var(--slate);flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.resume-del{background:none;border:none;color:var(--danger);cursor:pointer;font-size:.68rem;font-weight:800;flex-shrink:0}

/* ── PAGE SECTIONS ── */
.page-sec{margin-bottom:2.2rem}
.sec-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:1.1rem}
.sec-title{font-family:var(--font-display);font-size:1.15rem;font-weight:800;color:var(--dark);letter-spacing:-.02em}
.sec-count{font-size:.75rem;color:var(--subtle);font-weight:500;margin-left:.4rem}
.sec-action{font-size:.77rem;font-weight:700;color:var(--brand);background:none;border:none;cursor:pointer;font-family:var(--font-body);transition:.15s;display:flex;align-items:center;gap:.3rem}
.sec-action:hover{opacity:.7}

/* ── INDUSTRY CARDS ── */
.ind-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:.9rem}
.ind-card{background:var(--surface2);border:1.5px solid var(--border);border-radius:var(--r);padding:1.2rem;cursor:pointer;transition:all .22s;text-align:center;box-shadow:var(--shadow-xs);position:relative;overflow:hidden}
.ind-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:var(--grad);opacity:0;transition:.2s}
.ind-card:hover{box-shadow:var(--shadow-lg);border-color:rgba(99,102,241,.35);transform:translateY(-3px)}
.ind-card:hover::before{opacity:1}
.ind-logo{width:52px;height:52px;border-radius:14px;background:var(--grad);color:white;font-family:var(--font-display);font-weight:800;font-size:1rem;display:flex;align-items:center;justify-content:center;margin:0 auto .8rem;box-shadow:0 6px 18px rgba(99,102,241,.22)}
.ind-name{font-family:var(--font-display);font-size:.88rem;font-weight:800;color:var(--dark);margin-bottom:.3rem;line-height:1.3}
.ind-domain{font-size:.68rem;font-weight:700;color:var(--brand);background:rgba(99,102,241,.08);border:1px solid rgba(99,102,241,.15);padding:.16rem .5rem;border-radius:99px;display:inline-block;margin-bottom:.35rem}
.ind-loc{font-size:.7rem;color:var(--muted);font-weight:500}
.ind-tagline{font-size:.7rem;color:var(--subtle);margin-top:.3rem;font-style:italic;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden}
.ind-msg-btn{margin-top:.75rem;width:100%;padding:.4rem;border-radius:8px;border:none;background:rgba(99,102,241,.08);color:var(--brand);font-size:.72rem;font-weight:700;cursor:pointer;font-family:var(--font-body);transition:.18s}
.ind-msg-btn:hover{background:rgba(99,102,241,.16)}

/* ── VACANCY CARDS ── */
.feed-stack{display:flex;flex-direction:column;gap:1rem}
.vac-card{background:var(--surface2);border:1.5px solid var(--border);border-radius:var(--r-lg);overflow:hidden;box-shadow:var(--shadow-xs);transition:all .22s}
.vac-card:hover{box-shadow:var(--shadow);border-color:var(--border2)}
.vac-body{padding:1.3rem}
.vac-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:.9rem}
.vac-logo{width:42px;height:42px;border-radius:11px;background:rgba(99,102,241,.08);color:var(--brand);font-family:var(--font-display);font-weight:800;font-size:.82rem;display:flex;align-items:center;justify-content:center;border:1px solid rgba(99,102,241,.15);flex-shrink:0}
.vac-owner-name{font-weight:700;font-size:.88rem;color:var(--dark)}
.vac-date{font-size:.68rem;color:var(--subtle);font-weight:500}
.type-chip{padding:.18rem .6rem;border-radius:99px;font-size:.65rem;font-weight:800;letter-spacing:.02em}
.chip-intern{background:#ede9fe;color:#5b21b6}
.chip-job{background:#e0f2fe;color:#0369a1}
.chip-train{background:#dcfce7;color:#166534}
.vac-title{font-family:var(--font-display);font-size:.98rem;font-weight:800;color:var(--dark);margin-bottom:.35rem;line-height:1.3}
.vac-desc{font-size:.8rem;color:var(--muted);margin-bottom:.85rem;line-height:1.6;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.skill-pills{display:flex;flex-wrap:wrap;gap:.3rem;margin-bottom:.85rem}
.spill{padding:.16rem .5rem;border-radius:5px;font-size:.66rem;font-weight:700;background:rgba(99,102,241,.07);color:var(--brand);border:1px solid rgba(99,102,241,.14)}
.vac-foot{display:flex;align-items:center;justify-content:space-between;padding:.85rem 1.3rem;border-top:1px solid var(--border);background:rgba(248,250,255,.5)}
.vac-meta{display:flex;gap:1rem;align-items:center}
.vac-meta-item{font-size:.73rem;color:var(--muted);font-weight:500;display:flex;align-items:center;gap:.25rem}
.vac-actions{display:flex;gap:.45rem;align-items:center}
.btn-detail{padding:.45rem .9rem;border-radius:99px;border:1.5px solid var(--border2);background:transparent;color:var(--brand);font-size:.73rem;font-weight:700;cursor:pointer;font-family:var(--font-body);transition:.18s}
.btn-detail:hover{background:rgba(99,102,241,.06)}
.btn-apply{padding:.45rem 1.1rem;border-radius:99px;border:none;background:var(--grad);color:white;font-size:.73rem;font-weight:700;cursor:pointer;font-family:var(--font-body);box-shadow:0 3px 10px rgba(99,102,241,.22);transition:.2s}
.btn-apply:hover{opacity:.88;transform:translateY(-1px)}
.btn-apply:disabled{opacity:.45;cursor:not-allowed;transform:none}
.applied-tag{padding:.45rem 1rem;border-radius:99px;background:#dcfce7;color:#166534;font-size:.73rem;font-weight:700;border:1px solid #bbf7d0}

/* ── JOB CARDS ── */
.jobs-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(272px,1fr));gap:.9rem}
.job-card{background:var(--surface2);border:1.5px solid var(--border);border-radius:var(--r);padding:1.2rem;cursor:pointer;box-shadow:var(--shadow-xs);transition:all .22s;position:relative;overflow:hidden}
.job-card::after{content:'';position:absolute;bottom:0;left:0;right:0;height:3px;background:var(--grad-2);opacity:0;transition:.2s}
.job-card:hover{box-shadow:var(--shadow-lg);border-color:rgba(99,102,241,.3);transform:translateY(-2px)}
.job-card:hover::after{opacity:1}
.job-co{font-size:.65rem;font-weight:800;color:var(--muted);letter-spacing:.06em;text-transform:uppercase;margin-bottom:.22rem}
.job-title{font-family:var(--font-display);font-size:.9rem;font-weight:800;color:var(--dark);margin-bottom:.4rem;line-height:1.3}
.job-desc{font-size:.77rem;color:var(--muted);line-height:1.55;margin-bottom:.65rem;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.job-tags{display:flex;gap:.28rem;flex-wrap:wrap;margin-bottom:.65rem}
.jtag{padding:.13rem .48rem;border-radius:5px;font-size:.63rem;font-weight:700;border:1.5px solid}
.job-foot{display:flex;align-items:center;justify-content:space-between}
.job-apply-link{padding:.38rem .9rem;border-radius:8px;border:none;background:var(--grad);color:white;font-size:.7rem;font-weight:700;cursor:pointer;text-decoration:none;display:inline-block;transition:.2s;font-family:var(--font-body)}
.job-apply-link:hover{opacity:.85}

/* ── MATCH CARDS ── */
.match-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(272px,1fr));gap:.9rem}
.match-card{background:var(--surface2);border:1.5px solid var(--border);border-radius:var(--r);padding:1.3rem;box-shadow:var(--shadow-xs);transition:all .22s}
.match-card:hover{box-shadow:var(--shadow-lg);border-color:var(--border2);transform:translateY(-2px)}
.match-pct{font-family:var(--font-display);font-size:2rem;font-weight:900;background:var(--grad);-webkit-background-clip:text;-webkit-text-fill-color:transparent;line-height:1}
.match-pct-label{font-size:.63rem;font-weight:700;color:var(--subtle);text-transform:uppercase;letter-spacing:.06em;margin-bottom:.7rem;margin-top:2px}
.match-bar-track{height:4px;background:rgba(99,102,241,.1);border-radius:99px;margin-bottom:.9rem;overflow:hidden}
.match-bar-fill{height:100%;border-radius:99px;background:var(--grad)}
.miss-chip{display:inline-block;padding:.14rem .5rem;border-radius:5px;font-size:.66rem;font-weight:700;background:rgba(244,63,94,.07);color:var(--danger);border:1px solid rgba(244,63,94,.18);margin:.18rem .18rem 0 0}
.course-rec{display:flex;align-items:center;gap:.5rem;padding:.5rem .7rem;background:rgba(99,102,241,.04);border:1px solid var(--border2);border-radius:var(--r-sm);margin-top:.4rem;text-decoration:none;transition:.15s}
.course-rec:hover{background:rgba(99,102,241,.09)}
.course-rec-title{font-size:.76rem;font-weight:700;color:var(--slate);flex:1;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden}

/* ── COURSE CARDS ── */
.courses-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(228px,1fr));gap:.9rem}
.course-card{background:var(--surface2);border:1.5px solid var(--border);border-radius:var(--r);overflow:hidden;cursor:pointer;box-shadow:var(--shadow-xs);transition:all .22s}
.course-card:hover{box-shadow:var(--shadow-lg);transform:translateY(-2px)}
.course-hd{padding:1.1rem;background:var(--grad);position:relative;overflow:hidden}
.course-hd::before{content:'';position:absolute;top:-18px;right:-18px;width:72px;height:72px;background:rgba(255,255,255,.08);border-radius:50%}
.course-provider{font-size:.63rem;font-weight:800;color:rgba(255,255,255,.7);letter-spacing:.08em;text-transform:uppercase;margin-bottom:.28rem}
.course-title-text{font-family:var(--font-display);font-size:.88rem;font-weight:800;color:white;line-height:1.3;position:relative;z-index:1}
.course-bd{padding:.95rem}
.course-meta{display:flex;gap:.45rem;flex-wrap:wrap;margin-bottom:.7rem}
.cmeta{font-size:.67rem;font-weight:600;color:var(--muted);display:flex;align-items:center;gap:.22rem}
.level-pill{display:inline-block;padding:.15rem .55rem;border-radius:5px;font-size:.65rem;font-weight:800}
.level-Beginner{background:#ecfdf5;color:#065f46;border:1px solid #a7f3d0}
.level-Intermediate{background:#fffbeb;color:#92400e;border:1px solid #fcd34d}
.level-Advanced{background:#fef2f2;color:#991b1b;border:1px solid #fca5a5}
.course-enroll-btn{width:100%;padding:.52rem;border-radius:99px;border:none;background:var(--grad);color:white;font-family:var(--font-display);font-size:.76rem;font-weight:700;cursor:pointer;box-shadow:0 3px 10px rgba(99,102,241,.2);transition:.2s}
.course-enroll-btn:hover{opacity:.88}

/* ── APPLICATIONS ── */
.app-list{display:flex;flex-direction:column;gap:.85rem}
.app-card{background:var(--surface2);border:1.5px solid var(--border);border-radius:var(--r);padding:1.2rem;box-shadow:var(--shadow-xs);transition:.22s}
.app-card:hover{box-shadow:var(--shadow);border-color:var(--border2)}
.app-role{font-family:var(--font-display);font-size:.98rem;font-weight:800;color:var(--dark)}
.app-co{font-size:.77rem;color:var(--muted);font-weight:600;margin-top:2px}
.status-pill{padding:.2rem .65rem;border-radius:99px;font-size:.68rem;font-weight:800}
.sp-Pending{background:#fef3c7;color:#b45309}
.sp-Shortlisted{background:#e0e7ff;color:#3730a3}
.sp-Selected{background:#dcfce7;color:#166534}
.sp-Rejected{background:#fee2e2;color:#b91c1c}

/* ── PROFILE PAGE ── */
.pf-cover-wrap{width:100%;height:160px;border-radius:var(--r-lg) var(--r-lg) 0 0;overflow:hidden;cursor:pointer;position:relative}
.pf-cover-wrap img{width:100%;height:100%;object-fit:cover}
.pf-cover-overlay{position:absolute;inset:0;background:rgba(0,0,0,0);display:flex;align-items:flex-end;justify-content:flex-end;padding:.65rem;transition:.2s}
.pf-cover-wrap:hover .pf-cover-overlay{background:rgba(0,0,0,.2)}
.pf-cover-lbl{background:rgba(0,0,0,.55);color:white;font-size:.68rem;font-weight:700;padding:.28rem .65rem;border-radius:7px}
.pf-hero-card{background:var(--surface2);border:1.5px solid var(--border);border-radius:0 0 var(--r-lg) var(--r-lg);padding:1.3rem 1.6rem;margin-bottom:1.3rem;position:relative}
.pf-avatar-wrap{position:relative;display:inline-block}
.pf-avatar{width:84px;height:84px;border-radius:20px;border:4px solid white;background:var(--grad);color:white;font-family:var(--font-display);font-weight:900;font-size:1.9rem;display:flex;align-items:center;justify-content:center;cursor:pointer;overflow:hidden;margin-top:-54px;box-shadow:var(--shadow)}
.pf-avatar img{width:100%;height:100%;object-fit:cover}
.pf-avatar-cam{position:absolute;bottom:4px;right:4px;width:22px;height:22px;background:white;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:.65rem;box-shadow:var(--shadow-sm);cursor:pointer}
.pf-hero-row{display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:.7rem;margin-top:0}
.pf-completion-badge{text-align:center}
.pf-pct-num{font-family:var(--font-display);font-size:1.5rem;font-weight:900;background:var(--grad);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.pf-pct-label{font-size:.6rem;font-weight:700;color:var(--subtle);text-transform:uppercase;letter-spacing:.06em}
.pf-name{font-family:var(--font-display);font-size:1.35rem;font-weight:900;color:var(--dark);margin-top:.55rem;letter-spacing:-.02em}
.pf-qual-tag{font-size:.8rem;color:var(--brand);font-weight:700;margin-top:.15rem;margin-bottom:.45rem}
.pf-meta-row{display:flex;flex-wrap:wrap;gap:.4rem 1rem;font-size:.76rem;color:var(--muted);font-weight:500;margin-bottom:.65rem}
.pf-meta-row a{color:var(--brand);text-decoration:none;font-weight:600}
.pf-about-text{font-size:.84rem;color:var(--slate);line-height:1.65;margin-bottom:.75rem}
.pf-skills-row{display:flex;flex-wrap:wrap;gap:.3rem}
.pf-skill-chip{padding:.2rem .65rem;border-radius:99px;font-size:.72rem;font-weight:700;background:rgba(99,102,241,.08);color:var(--brand);border:1px solid rgba(99,102,241,.18)}

.pf-tabs{display:flex;gap:.3rem;margin-bottom:1.2rem;flex-wrap:wrap;background:rgba(99,102,241,.04);border:1px solid var(--border);border-radius:var(--r);padding:4px}
.pf-tab{padding:.42rem .95rem;border-radius:12px;font-size:.78rem;font-weight:600;cursor:pointer;border:none;color:var(--muted);background:transparent;transition:.18s;font-family:var(--font-body)}
.pf-tab.active{background:var(--grad);color:white;box-shadow:0 3px 10px rgba(99,102,241,.25)}
.pf-tab:hover:not(.active){background:rgba(99,102,241,.07);color:var(--brand)}

.pf-card{background:var(--surface2);border:1.5px solid var(--border);border-radius:var(--r);padding:1.4rem;margin-bottom:1rem;box-shadow:var(--shadow-xs)}
.pf-card-title{font-family:var(--font-display);font-size:.93rem;font-weight:800;color:var(--dark);margin-bottom:.95rem;display:flex;align-items:center;gap:.45rem}
.pf-card-title-icon{width:28px;height:28px;border-radius:8px;background:rgba(99,102,241,.1);display:flex;align-items:center;justify-content:center;font-size:.85rem}
.pf-grid{display:grid;grid-template-columns:1fr 1fr;gap:.85rem}
.pf-grid-3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:.85rem}
.pf-field{display:flex;flex-direction:column;gap:.28rem}
.pf-label{font-size:.65rem;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.06em}
.pf-input{padding:.62rem .88rem;border-radius:var(--r-sm);border:1.5px solid var(--border2);background:rgba(255,255,255,.8);font-family:var(--font-body);font-size:.83rem;color:var(--slate);outline:none;transition:.2s;width:100%}
.pf-input:focus{border-color:var(--brand);box-shadow:var(--glow);background:white}
.pf-input::placeholder{color:var(--faint)}
.pf-input:read-only{background:var(--bg2);cursor:not-allowed;opacity:.7}
select.pf-input{cursor:pointer}
textarea.pf-input{resize:vertical;min-height:88px;line-height:1.55}

.pf-acad-card{background:rgba(99,102,241,.04);border:1.5px solid var(--border2);border-radius:var(--r-sm);padding:1rem;text-align:center}
.pf-acad-level{font-size:.63rem;font-weight:800;text-transform:uppercase;letter-spacing:.08em;color:var(--brand);margin-bottom:.35rem}
.pf-acad-val{font-size:.83rem;font-weight:700;color:var(--dark);line-height:1.4}

.pf-upload-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(90px,1fr));gap:.55rem}
.pf-thumb{aspect-ratio:1;border-radius:9px;overflow:hidden;cursor:pointer;position:relative;background:rgba(99,102,241,.05);border:1px solid var(--border2)}
.pf-thumb img{width:100%;height:100%;object-fit:cover}
.pf-thumb-del{position:absolute;top:3px;right:3px;width:18px;height:18px;border-radius:5px;background:rgba(255,255,255,.92);border:none;color:var(--danger);font-size:.5rem;font-weight:800;display:flex;align-items:center;justify-content:center;cursor:pointer}
.pf-add-thumb{aspect-ratio:1;border-radius:9px;border:1.5px dashed rgba(99,102,241,.28);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.18rem;cursor:pointer;color:var(--brand);font-size:.66rem;font-weight:700;transition:.18s}
.pf-add-thumb:hover{background:rgba(99,102,241,.05);border-color:var(--brand)}
.pf-resume-item{display:flex;align-items:center;gap:.75rem;padding:.85rem;background:rgba(99,102,241,.04);border:1.5px solid var(--border2);border-radius:var(--r-sm);margin-bottom:.55rem}
.pf-resume-icon{font-size:1.4rem;flex-shrink:0}
.pf-resume-name{font-size:.8rem;font-weight:700;color:var(--slate);line-height:1.3}
.pf-resume-type{font-size:.66rem;color:var(--subtle);font-weight:500;margin-top:1px}

.pf-skill-chip-wrap{display:flex;flex-wrap:wrap;gap:.38rem}
.pf-skill-editable{display:flex;align-items:center;gap:.25rem;padding:.2rem .65rem .2rem .5rem;border-radius:99px;font-size:.72rem;font-weight:700;background:rgba(99,102,241,.08);color:var(--brand);border:1px solid rgba(99,102,241,.2)}
.pf-skill-remove{background:none;border:none;color:var(--danger);cursor:pointer;font-weight:800;font-size:.6rem;line-height:1;padding:0;margin-left:2px}
.pf-sugg-chip{padding:.2rem .6rem;border-radius:99px;font-size:.7rem;font-weight:700;background:rgba(99,102,241,.06);color:var(--brand);border:1px solid rgba(99,102,241,.18);cursor:pointer;transition:.14s}
.pf-sugg-chip:hover{background:rgba(99,102,241,.14)}

/* ── BUTTONS ── */
.btn-primary{padding:.6rem 1.2rem;border-radius:99px;border:none;background:var(--grad);color:white;font-family:var(--font-display);font-size:.82rem;font-weight:700;cursor:pointer;box-shadow:0 4px 14px rgba(99,102,241,.24);transition:.2s}
.btn-primary:hover{opacity:.88;transform:translateY(-1px)}
.btn-primary:disabled{opacity:.45;cursor:not-allowed;transform:none}
.btn-ghost{padding:.58rem 1.1rem;border-radius:99px;background:var(--bg2);border:1.5px solid var(--border2);color:var(--brand);font-family:var(--font-body);font-size:.8rem;font-weight:700;cursor:pointer;transition:.18s}
.btn-ghost:hover{background:rgba(99,102,241,.08)}
.btn-danger-sm{padding:.35rem .8rem;border-radius:7px;background:rgba(244,63,94,.07);border:1px solid rgba(244,63,94,.18);color:var(--danger);font-size:.7rem;font-weight:700;cursor:pointer;font-family:var(--font-body);transition:.15s}
.btn-danger-sm:hover{background:rgba(244,63,94,.13)}
.btn-view-sm{padding:.35rem .8rem;border-radius:7px;background:rgba(99,102,241,.07);border:none;color:var(--brand);font-size:.7rem;font-weight:700;cursor:pointer;font-family:var(--font-body);transition:.15s}
.btn-view-sm:hover{background:rgba(99,102,241,.13)}

/* ── MODAL ── */
.modal-ov{position:fixed;inset:0;background:rgba(10,15,30,.6);backdrop-filter:blur(10px);display:flex;align-items:center;justify-content:center;z-index:9999;padding:1rem}
.modal-box{background:white;border-radius:var(--r-xl);padding:2.2rem;width:100%;max-width:580px;max-height:90vh;overflow-y:auto;position:relative;box-shadow:0 32px 80px rgba(0,0,0,.28)}
.modal-close{position:absolute;top:1.1rem;right:1.1rem;width:30px;height:30px;background:#f1f5f9;border:none;border-radius:8px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--muted);font-size:.8rem;transition:.15s}
.modal-close:hover{background:#fee2e2;color:var(--danger)}
.modal-title{font-family:var(--font-display);font-size:1.28rem;font-weight:800;color:var(--dark);margin-bottom:.2rem}
.modal-sub{font-size:.8rem;color:var(--muted);margin-bottom:1.4rem}
.modal-field-label{display:block;font-size:.7rem;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:.28rem;margin-top:.85rem}
.modal-input{width:100%;padding:.68rem .88rem;border:1.5px solid #e2e8f0;border-radius:var(--r-sm);font-family:var(--font-body);font-size:.84rem;color:var(--dark);outline:none;transition:.2s;background:#fafbff}
.modal-input:focus{border-color:var(--brand);box-shadow:var(--glow);background:white}
.modal-input:read-only{background:#f8fafc;cursor:not-allowed;opacity:.75}
textarea.modal-input{resize:vertical;min-height:88px}
.modal-btn-primary{width:100%;padding:.78rem;border-radius:99px;border:none;background:var(--grad);color:white;font-family:var(--font-display);font-size:.88rem;font-weight:700;cursor:pointer;margin-top:.85rem;box-shadow:0 6px 18px rgba(99,102,241,.28);transition:.2s}
.modal-btn-primary:hover{opacity:.9;transform:translateY(-1px)}
.modal-btn-secondary{width:100%;padding:.68rem;border-radius:99px;border:1.5px solid #e2e8f0;background:white;color:var(--muted);font-family:var(--font-body);font-size:.83rem;font-weight:700;cursor:pointer;margin-top:.45rem;transition:.2s}
.modal-btn-secondary:hover{border-color:var(--brand);color:var(--brand)}

/* ── DM PANEL ── */
.dm-panel{position:fixed;bottom:0;right:1.5rem;width:340px;height:460px;background:white;border:1.5px solid var(--border);border-radius:var(--r-lg) var(--r-lg) 0 0;box-shadow:var(--shadow-xl);display:flex;flex-direction:column;z-index:500;overflow:hidden}
.dm-head{padding:.9rem 1.1rem;background:var(--grad);display:flex;align-items:center;justify-content:space-between;color:white}
.dm-recipient-name{font-family:var(--font-display);font-weight:800;font-size:.88rem}
.dm-status-line{font-size:.68rem;color:rgba(255,255,255,.7);display:flex;align-items:center;gap:.28rem;margin-top:1px}
.online-dot{width:6px;height:6px;background:#34d399;border-radius:50%;display:inline-block;animation:pulse-dot 2s ease-in-out infinite}
@keyframes pulse-dot{0%,100%{opacity:1}50%{opacity:.5}}
.dm-body{flex:1;overflow-y:auto;padding:.9rem;display:flex;flex-direction:column;gap:.45rem}
.dm-empty-state{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:.45rem;color:var(--subtle);font-size:.8rem}
.bubble{max-width:73%;padding:.5rem .8rem;border-radius:12px;font-size:.8rem;line-height:1.45}
.bubble.sent{background:var(--grad);color:white;align-self:flex-end;border-bottom-right-radius:3px}
.bubble.recv{background:#f3f4f6;color:var(--slate);align-self:flex-start;border-bottom-left-radius:3px}
.bubble-time{font-size:.58rem;opacity:.55;margin-top:2px;text-align:right}
.dm-foot{padding:.65rem .9rem;border-top:1px solid var(--border);display:flex;gap:.45rem;align-items:center}
.dm-input{flex:1;padding:.5rem .8rem;border-radius:99px;border:1.5px solid var(--border2);font-family:var(--font-body);font-size:.8rem;color:var(--slate);outline:none;transition:.2s}
.dm-input:focus{border-color:var(--brand)}
.dm-send-btn{width:34px;height:34px;border-radius:50%;background:var(--grad);border:none;color:white;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:.8rem;flex-shrink:0;transition:.15s}
.dm-send-btn:hover{transform:scale(1.08)}
.dm-close-btn{padding:.22rem .6rem;border-radius:7px;border:1.5px solid rgba(255,255,255,.25);background:rgba(255,255,255,.12);color:rgba(255,255,255,.88);font-size:.68rem;cursor:pointer;font-family:var(--font-body);transition:.15s}
.dm-close-btn:hover{background:rgba(220,38,38,.35)}

/* ── TOASTS / NOTIFICATIONS ── */
.toast-stack{position:fixed;bottom:1.8rem;right:1.8rem;z-index:2000;display:flex;flex-direction:column;gap:8px}
.toast{background:#0f172a;color:white;padding:.8rem 1.3rem;border-radius:var(--r-sm);box-shadow:var(--shadow-lg);font-size:.83rem;font-weight:600;display:flex;align-items:center;gap:.55rem}
.toast-success{background:#0f172a}
.toast-error{background:#fef2f2;color:#b91c1c;border:1px solid #fecaca}
.toast-dot{width:7px;height:7px;background:rgba(99,102,241,.8);border-radius:50%;flex-shrink:0}

/* ── EMPTY STATES ── */
.empty-state{text-align:center;padding:3rem 1.5rem;color:var(--subtle)}
.empty-state-icon{font-size:2.5rem;margin-bottom:.7rem;opacity:.5}
.empty-state-title{font-family:var(--font-display);font-size:.95rem;font-weight:800;color:var(--muted);margin-bottom:.28rem}
.empty-state-text{font-size:.78rem;line-height:1.65;max-width:260px;margin:0 auto}

/* ── SPINNER ── */
.spinner{width:30px;height:30px;border:3px solid rgba(99,102,241,.15);border-top-color:var(--brand);border-radius:50%;animation:spin .7s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.spinner-center{display:flex;align-items:center;justify-content:center;padding:3rem}

/* ── DIVIDER ── */
.divider{height:1px;background:var(--border);margin:1rem 0}
`;

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user: authUser, profile: authProfile, signOut } = useAuth();

  const [activeTab, setActiveTab]         = useState("feed");
  const [showDetails, setShowDetails]     = useState(false);
  const [editMode, setEditMode]           = useState(false);
  const [activeChat, setActiveChat]       = useState(null);
  const [activeUserProfile, setActiveUserProfile] = useState(null);
  const [searchQuery, setSearchQuery]     = useState("");
  const [notifications, setNotifications] = useState([]);
  const [applyModal, setApplyModal]       = useState(null);
  const [applyForm, setApplyForm]         = useState({ coverLetter: "" });
  const [postDetailModal, setPostDetailModal] = useState(null);

  const [profile, setProfile]           = useState(null);
  const [industries, setIndustries]     = useState([]);
  const [courses, setCourses]           = useState([]);
  const [allJobs, setAllJobs]           = useState([]);
  const [matchedJobs, setMatchedJobs]   = useState([]);
  const [vacancies, setVacancies]       = useState([]);
  const [myApplications, setMyApplications] = useState([]);

  const [isFeedLoading, setIsFeedLoading] = useState(true);
  const [isMatchLoading, setIsMatchLoading] = useState(false);

  const [pfTab, setPfTab]         = useState("overview");
  const [pfEditing, setPfEditing] = useState(false);
  const [pfForm, setPfForm]       = useState({});
  const [pfSaving, setPfSaving]   = useState(false);
  const [pfToast, setPfToast]     = useState(null);
  const [skillInput, setSkillInput] = useState("");
  const [coverPreview, setCoverPreview] = useState(null);
  const [sidebarForm, setSidebarForm] = useState({});

  const coverRef   = useRef();
  const avatarRef  = useRef();
  const certRef    = useRef();
  const resumeRef  = useRef();
  const postRef    = useRef();
  const chatEndRef = useRef();
  const chatInputRef = useRef();

  // ── BOOT ────────────────────────────────────────────────
  useEffect(() => {
    const boot = async () => {
      setIsFeedLoading(true);
      if (authProfile) {
        setProfile(prev => prev || {
          id: authUser?.id || "",
          name: authProfile.name || authProfile.full_name || authUser?.email?.split("@")[0] || "Student",
          email: authProfile.email || authUser?.email || "",
          username: authProfile.username || (authProfile.name || "student").toLowerCase().replace(/\s+/g,"_"),
          qualification: authProfile.qualification || "",
          phone: authProfile.phone || "",
          address: authProfile.address || authProfile.location || "",
          about: authProfile.about || "",
          skills: authProfile.skills || [],
          photo: authProfile.photo || null,
          tenth: authProfile.tenth || "",
          twelfth: authProfile.twelfth || "",
          graduation: authProfile.graduation || "",
          certificates: authProfile.certificates || [],
          personalPosts: authProfile.personalPosts || [],
          resumes: authProfile.resumes || [],
          chats: {},
          linkedin: authProfile.linkedin || "",
          github: authProfile.github || "",
          website: authProfile.website || "",
          experience: authProfile.experience || "",
          cgpa: authProfile.cgpa || "",
        });
      }

      try {
        try {
          const uid = authUser?.id;
          const url = uid ? `${BASE}/api/get-profile?user_id=${uid}` : `${BASE}/api/get-profile`;
          const res = await axios.get(url, { timeout: 7000 });
          const d = res.data;
          setProfile({
            id: d.id || authUser?.id || "",
            name: d.name || d.full_name || authProfile?.name || authUser?.email?.split("@")[0] || "Student",
            email: d.email || authUser?.email || "",
            username: d.username || (d.name || "student").toLowerCase().replace(/\s+/g,"_"),
            qualification: d.qualification || authProfile?.qualification || "",
            phone: d.phone || "",
            address: d.address || d.location || "",
            about: d.about || "",
            skills: d.skills || [],
            photo: d.photo || null,
            tenth: d.tenth || "",
            twelfth: d.twelfth || "",
            graduation: d.graduation || "",
            certificates: d.certificates || [],
            personalPosts: d.personalPosts || d.personal_posts || [],
            resumes: d.resumes || [],
            chats: d.chats || {},
            linkedin: d.linkedin || "",
            github: d.github || "",
            website: d.website || "",
            experience: d.experience || "",
            cgpa: d.cgpa || "",
          });
        } catch { /* keep seed */ }

        const [indRes, coursesRes, vacRes, appsRes, jobsRes] = await Promise.allSettled([
          axios.get(`${BASE}/api/industries`, { timeout: 8000 }),
          axios.get(`${BASE}/api/courses`, { timeout: 8000 }),
          axios.get(`${BASE}/api/vacancies`, { timeout: 8000 }),
          authUser?.id ? axios.get(`${BASE}/api/applications/student/${authUser.id}`, { timeout: 8000 }) : Promise.resolve({ data: [] }),
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
            id: v.id,
            ownerId: v.owner_id || v.ownerId,
            ownerName: v.owner_name || v.ownerName || loadedInd.find(i => i.id === v.owner_id)?.name || "Company",
            ownerLogo: (v.owner_name || "CO").substring(0,2).toUpperCase(),
            type: v.type || "Job Vacancy",
            title: v.title,
            desc: v.description || v.desc || "",
            skills: v.skills || "",
            duration: v.duration || "Full-Time",
            offerings: v.offerings || "",
            date: v.created_at ? new Date(v.created_at).toLocaleDateString() : "Recent",
            likes: v.likes || 0,
          })));
        } else {
          setVacancies(mockVacancies);
        }
        if (appsRes.status === "fulfilled" && Array.isArray(appsRes.value?.data)) {
          setMyApplications(appsRes.value.data.map(a => ({
            id: a.id, postId: a.vacancy_id,
            role: a.vacancies?.title || "Role",
            company: a.vacancies?.owner_name || "Company",
            appliedOn: new Date(a.created_at).toLocaleDateString(),
            status: a.status || "Pending",
            coverLetter: a.cover_letter,
          })));
        }
        if (jobsRes.status === "fulfilled") {
          let raw = jobsRes.value?.data || [];
          if (typeof raw === "string") { try { raw = JSON.parse(raw); } catch { raw = []; } }
          if (!Array.isArray(raw)) raw = [];
          const jobs = raw.map(j => ({
            industry: j.industry || j.company || j.employer || "Company",
            job: j.job || j.title || j.position || "Job Opening",
            desc: j.desc || j.description || j.summary || "",
            role: j.role || j.role_type || "",
            ug: j.ug || j.education_ug || j.education || "",
            pg: j.pg || j.education_pg || "",
            url: j.url || j.link || j.apply_url || "#",
            dept: j.dept || j.department || j.category || "",
            skills: j.skills || j.required_skills || "",
          }));
          setAllJobs(jobs.length ? jobs : mockJobs);
        } else {
          setAllJobs(mockJobs);
        }
      } catch (err) {
        console.error("Boot error:", err);
      } finally {
        setIsFeedLoading(false);
      }
    };
    boot();
  }, [authUser?.id]);

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
  }, [profile?.skills?.join?.(",")]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [profile?.chats, activeChat]);

  const pushNotify = useCallback((msg, type = "success") => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 3500);
  }, []);

  const showPfToast = useCallback((msg, type = "success") => {
    setPfToast({ msg, type });
    setTimeout(() => setPfToast(null), 3200);
  }, []);

  const alreadyApplied = (postId) => myApplications.some(a => a.postId === postId);

  // ── SEND MESSAGE ────────────────────────────────────────
  const sendMessage = async (toId, message) => {
    if (!authUser?.id) return;
    try {
      await axios.post(`${BASE}/api/messages`, { sender_id: authUser.id, receiver_id: toId, text: message });
      const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      setProfile(prev => ({ ...prev, chats: { ...prev.chats, [toId]: [...(prev.chats?.[toId] || []), { sender: prev.name, message, time }] } }));
    } catch { pushNotify("Failed to send message.", "error"); }
  };

  // ── APPLY ───────────────────────────────────────────────
  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!applyModal || !authUser?.id) return;
    try {
      const res = await axios.post(`${BASE}/api/applications`, {
        vacancy_id: applyModal.id, student_id: authUser.id, cover_letter: applyForm.coverLetter,
      });
      setMyApplications(prev => [...prev, {
        id: res.data.id || Date.now(), postId: applyModal.id,
        role: applyModal.title, company: applyModal.ownerName,
        appliedOn: new Date().toLocaleDateString(), status: "Pending"
      }]);
      pushNotify(`✓ Applied to ${applyModal.title}!`);
      setApplyForm({ coverLetter: "" }); setApplyModal(null); setPostDetailModal(null);
    } catch { pushNotify("Failed to apply — you may have already applied.", "error"); }
  };

  const handleLogout = async () => {
    try { await signOut(); navigate("/login"); } catch { navigate("/login"); }
  };

  const deletePost = (type, idx) => {
    const key = type === "certificate" ? "certificates" : "personalPosts";
    setProfile(prev => { const arr = [...prev[key]]; arr.splice(idx,1); return { ...prev, [key]: arr }; });
  };
  const deleteResume = (idx) => {
    setProfile(prev => { const arr = [...prev.resumes]; arr.splice(idx,1); return { ...prev, resumes: arr }; });
  };
  const pffc = (k, v) => setPfForm(p => ({ ...p, [k]: v }));

  // ── START EDIT ─ fetches fresh data first ───────────────
  const startPfEdit = async () => {
    let fresh = profile;
    try {
      const res = await axios.get(`${BASE}/api/profile/${profile.id}`, { timeout: 5000 });
      const d = res.data;
      fresh = {
        ...profile,
        skills:       Array.isArray(d.skills) ? d.skills : [],
        certificates: d.certificates  || [],
        resumes:      d.resumes        || [],
        personalPosts:d.personalPosts  || d.personal_posts || [],
        tenth:        d.tenth          || "",
        twelfth:      d.twelfth        || "",
        graduation:   d.graduation     || "",
        about:        d.about          || "",
        experience:   d.experience     || "",
        projects:     d.projects       || "",
        achievements: d.achievements   || "",
        website:      d.website        || "",
        linkedin:     d.linkedin       || "",
        github:       d.github         || "",
        cgpa:         d.cgpa           || "",
        phone:        d.phone          || "",
        address:      d.address || d.location || "",
        qualification:d.qualification  || "",
        name:         d.name || d.full_name || profile.name || "",
      };
      setProfile(prev => ({ ...prev, ...fresh }));
    } catch { /* fallback to local */ }

    setPfForm({
      name:         fresh.name          || "",
      phone:        fresh.phone         || "",
      address:      fresh.address       || "",
      about:        fresh.about         || "",
      qualification:fresh.qualification || "",
      tenth:        fresh.tenth         || "",
      twelfth:      fresh.twelfth       || "",
      graduation:   fresh.graduation    || "",
      website:      fresh.website       || "",
      linkedin:     fresh.linkedin      || "",
      github:       fresh.github        || "",
      experience:   fresh.experience    || "",
      projects:     fresh.projects      || "",
      achievements: fresh.achievements  || "",
      cgpa:         fresh.cgpa          || "",
      skills:       [...(fresh.skills       || [])],
      certificates: [...(fresh.certificates || [])],
      resumes:      [...(fresh.resumes       || [])],
      personalPosts:[...(fresh.personalPosts || [])],
    });
    setPfEditing(true);
    setPfTab("overview");
  };

  // ── SAVE PROFILE ─ FIX: use buildProfilePayload + ignore 404 on no-row return ──
  const savePfForm = async () => {
    if (!profile?.id) return;
    setPfSaving(true);
    try {
      const payload = buildProfilePayload(pfForm);
      // FIX: Don't rely on the response body for success — Supabase PUT may return
      // empty data on some configs. A non-throw means the update succeeded.
      await axios.put(`${BASE}/api/profile/${profile.id}`, payload);
      // Sync local state so UI reflects changes immediately
      const merged = {
        ...profile,
        ...payload,
        // Keep these aligned for local display:
        address: payload.address,
        personalPosts: payload.personalPosts,
      };
      setProfile(merged);
      setPfForm(prev => ({ ...prev, ...payload }));
      setPfEditing(false);
      showPfToast("✓ Profile updated successfully");
    } catch (err) {
      // FIX: On 404 from backend (Supabase empty row return), still persist locally
      // so the user doesn't lose their changes. Show a softer warning.
      if (err?.response?.status === 404) {
        const payload = buildProfilePayload(pfForm);
        setProfile(prev => ({ ...prev, ...payload }));
        setPfForm(prev => ({ ...prev, ...payload }));
        setPfEditing(false);
        showPfToast("✓ Saved (sync pending)");
      } else {
        showPfToast("✗ Could not save — try again", "error");
      }
    }
    setPfSaving(false);
  };

  const addSkill = (s) => {
    const sk = s.trim();
    if (!sk || (pfForm.skills || []).includes(sk)) return;
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

  const typeChip = (type) => {
    if (!type) return <span className="type-chip chip-job">Job</span>;
    if (type.toLowerCase().includes("intern")) return <span className="type-chip chip-intern">Internship</span>;
    if (type.toLowerCase().includes("train")) return <span className="type-chip chip-train">Training</span>;
    return <span className="type-chip chip-job">{type}</span>;
  };

  // ── SIDEBAR PANEL ────────────────────────────────────────
  const renderSidebarPanel = (user, editable = false) => (
    <div style={{ overflowY: "auto", height: "100%" }}>
      {/* Cover */}
      <div className="sb-cover">
        {user.coverPhoto ? <img src={user.coverPhoto} alt="" /> : null}
      </div>

      {/* Avatar + info */}
      <div className="sb-avatar-wrap">
        <div className="sb-avatar">
          {user.photo ? <img src={user.photo} alt="" /> : (user.name || "U")[0].toUpperCase()}
        </div>
      </div>

      <div className="sb-info">
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: ".5rem" }}>
          <div>
            <div className="sb-name">{user.name || "Student"}</div>
            <div className="sb-handle">@{user.username || "student"}</div>
            {user.qualification && <div className="sb-qual">🎓 {user.qualification}</div>}
          </div>
          {!editable && <button className="dm-close-btn" style={{ background: "var(--bg2)", border: "1.5px solid var(--border)", color: "var(--muted)" }} onClick={() => setActiveUserProfile(null)}>✕</button>}
        </div>

        {editable && (
          <div className="sb-actions">
            {editMode
              ? <>
                  <button className="sb-btn sb-btn-success" onClick={async () => {
                    if (!authUser?.id || !profile) return;
                    const payload = {
                      name: sidebarForm.name,
                      qualification: sidebarForm.qualification,
                      phone: sidebarForm.phone,
                      address: sidebarForm.address,
                      tenth: sidebarForm.tenth,
                      twelfth: sidebarForm.twelfth,
                      graduation: sidebarForm.graduation,
                      about: sidebarForm.about,
                      skills: profile.skills,
                    };
                    try {
                      await axios.put(`${BASE}/api/profile/${authUser.id}`, payload);
                      setProfile(prev => ({ ...prev, ...payload }));
                      pushNotify("✓ Profile saved");
                    } catch {
                      setProfile(prev => ({ ...prev, ...payload }));
                      pushNotify("Changes saved locally.");
                    }
                    setEditMode(false);
                  }}>✓ Save</button>
                  <button className="sb-btn sb-btn-ghost" onClick={() => setEditMode(false)}>Cancel</button>
                </>
              : <button className="sb-btn sb-btn-primary" onClick={() => {
                  setSidebarForm({
                    name: profile?.name || "",
                    phone: profile?.phone || "",
                    address: profile?.address || "",
                    qualification: profile?.qualification || "",
                    tenth: profile?.tenth || "",
                    twelfth: profile?.twelfth || "",
                    graduation: profile?.graduation || "",
                    about: profile?.about || "",
                  });
                  setEditMode(true);
                }}>✎ Quick Edit</button>
            }
          </div>
        )}
      </div>

      {/* Completion bar */}
      {editable && (() => {
        const comp = calcCompletion(profile);
        return (
          <div className="comp-wrap">
            <div className="comp-header">
              <span className="comp-label">Profile Strength</span>
              <span className="comp-pct" style={{ color: comp >= 80 ? "var(--success)" : comp >= 50 ? "var(--accent)" : "var(--danger)" }}>{comp}%</span>
            </div>
            <div className="comp-track"><div className="comp-fill" style={{ width: `${comp}%` }} /></div>
          </div>
        );
      })()}

      {/* Sidebar quick-edit form */}
      {editable && editMode && (
        <>
          <div className="sb-section">
            <div className="sb-section-title">Personal Info</div>
            <div className="sb-form-grid">
              {[{ name:"name",label:"Full Name" },{ name:"phone",label:"Phone" },{ name:"address",label:"City" },{ name:"qualification",label:"Qualification" }].map(f => (
                <div className="sf" key={f.name}>
                  <label className="sf-label">{f.label}</label>
                  <input className="sf-input" value={sidebarForm[f.name] ?? ""} onChange={e => setSidebarForm(p => ({ ...p, [f.name]: e.target.value }))} />
                </div>
              ))}
            </div>
          </div>
          <div className="sb-section">
            <div className="sb-section-title">Academic</div>
            {[{ name:"tenth",label:"10th" },{ name:"twelfth",label:"12th" },{ name:"graduation",label:"Graduation" }].map(f => (
              <div className="sf" key={f.name} style={{ marginBottom: ".38rem" }}>
                <label className="sf-label">{f.label}</label>
                <input className="sf-input" value={sidebarForm[f.name] ?? ""} onChange={e => setSidebarForm(p => ({ ...p, [f.name]: e.target.value }))} />
              </div>
            ))}
          </div>
        </>
      )}

      {/* Details toggle */}
      <div className="sb-section">
        <button className="toggle-btn" onClick={() => setShowDetails(d => !d)}>
          <span style={{ fontSize: ".58rem" }}>{showDetails ? "▲" : "▼"}</span>
          {showDetails ? "Hide Details" : "View Details"}
        </button>
        {showDetails && (
          <div className="detail-group" style={{ marginTop: ".55rem" }}>
            {user.email  && <div className="detail-row"><span className="ico">✉</span>{user.email}</div>}
            {user.phone  && <div className="detail-row"><span className="ico">📞</span>{user.phone}</div>}
            {user.address&& <div className="detail-row"><span className="ico">📍</span>{user.address}</div>}
            {user.linkedin&&<div className="detail-row"><span className="ico">🔗</span>{user.linkedin}</div>}
            {user.github  &&<div className="detail-row"><span className="ico">🐙</span>{user.github}</div>}
            <div className="detail-sh">Academic</div>
            <div className="detail-row"><span className="ico">🏫</span>10th — {user.tenth || "—"}</div>
            <div className="detail-row"><span className="ico">🏫</span>12th — {user.twelfth || "—"}</div>
            <div className="detail-row"><span className="ico">🎓</span>Grad — {user.graduation || "—"}</div>
            {user.cgpa && <div className="detail-row"><span className="ico">⭐</span>CGPA — {user.cgpa}</div>}
          </div>
        )}
      </div>

      {/* Skills preview */}
      {(user.skills || []).length > 0 && (
        <div className="sb-section">
          <div className="sb-section-title">Top Skills</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: ".3rem" }}>
            {(user.skills || []).slice(0,6).map((s,i) => <span key={i} className="spill">{s}</span>)}
            {(user.skills||[]).length > 6 && <span className="spill">+{(user.skills||[]).length - 6}</span>}
          </div>
        </div>
      )}

      {/* Resumes */}
      <div className="sb-section">
        <div className="sb-section-title">Resumes ({(user.resumes||[]).length})</div>
        {!(user.resumes||[]).length
          ? <div style={{ fontSize: ".74rem", color: "var(--subtle)" }}>No resumes uploaded.</div>
          : (user.resumes||[]).map((r,i) => (
            <div key={i} className="resume-item">
              <span style={{ fontSize: "1rem" }}>{r.type === "application/pdf" ? "📑" : "🖼️"}</span>
              <span className="resume-name">{r.name}</span>
              {editable && <button className="resume-del" onClick={() => deleteResume(i)}>✕</button>}
            </div>
          ))
        }
      </div>

      {/* Certificates */}
      <div className="sb-section">
        <div className="sb-section-title">Certificates ({(user.certificates||[]).length})</div>
        {!(user.certificates||[]).length
          ? <div style={{ fontSize: ".74rem", color: "var(--subtle)" }}>No certificates.</div>
          : <div className="posts-grid">
              {(user.certificates||[]).map((p,i) => (
                <div key={i} className="post-cell">
                  {editable && <button className="post-del" onClick={() => deletePost("certificate",i)}>✕</button>}
                  {p.type?.startsWith("video") ? <video src={p.url} /> : <img src={p.url} alt="" />}
                </div>
              ))}
            </div>
        }
      </div>

      {/* Personal posts */}
      <div className="sb-section" style={{ borderBottom: "none" }}>
        <div className="sb-section-title">Activity Posts ({(user.personalPosts||[]).length})</div>
        {!(user.personalPosts||[]).length
          ? <div style={{ fontSize: ".74rem", color: "var(--subtle)" }}>No posts yet.</div>
          : <div className="posts-grid">
              {(user.personalPosts||[]).map((p,i) => (
                <div key={i} className="post-cell">
                  {editable && <button className="post-del" onClick={() => deletePost("personal",i)}>✕</button>}
                  {p.type?.startsWith("video") ? <video src={p.url} /> : <img src={p.url} alt="" />}
                </div>
              ))}
            </div>
        }
      </div>
    </div>
  );

  // ── PROFILE PAGE ─────────────────────────────────────────
  const renderProfilePage = () => {
    const data    = pfEditing ? pfForm : profile;
    const skills  = data?.skills || [];
    const certs   = data?.certificates || [];
    const resumes = data?.resumes || [];
    const posts   = data?.personalPosts || [];
    const completion = calcCompletion(profile);
    const filteredSugg = SKILL_SUGGESTIONS.filter(s => s.toLowerCase().includes(skillInput.toLowerCase()) && !skills.includes(s)).slice(0, 10);

    const tabs = [
      { id:"overview", icon:"👤", label:"Overview" },
      { id:"skills",   icon:"⚡", label:"Skills"   },
      { id:"academic", icon:"🎓", label:"Academic"  },
      { id:"experience",icon:"💼",label:"Experience"},
      { id:"media",    icon:"🖼️", label:"Media"     },
      { id:"resume",   icon:"📄", label:"Resume"    },
    ];

    return (
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        <input ref={coverRef}  type="file" accept="image/*" style={{ display:"none" }} onChange={handleCoverUpload} />
        <input ref={avatarRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handleAvatarUpload} />
        <input ref={certRef}   type="file" accept="image/*,application/pdf" multiple style={{ display:"none" }} onChange={handleCertUpload} />
        <input ref={resumeRef} type="file" accept="application/pdf,image/*" multiple style={{ display:"none" }} onChange={handleResumeUpload} />
        <input ref={postRef}   type="file" accept="image/*,video/*" multiple style={{ display:"none" }} onChange={handlePostUpload} />

        {/* Cover */}
        <div className="pf-cover-wrap" onClick={() => coverRef.current?.click()}>
          {(coverPreview || profile.coverPhoto)
            ? <img src={coverPreview || profile.coverPhoto} alt="cover" />
            : <div style={{ width:"100%",height:"100%",background:"linear-gradient(135deg,#6366f1 0%,#8b5cf6 55%,#06b6d4 100%)",position:"relative" }}>
                <div style={{ position:"absolute",inset:0,background:"radial-gradient(circle at 20% 80%,rgba(255,255,255,.09) 0%,transparent 50%),radial-gradient(circle at 80% 20%,rgba(255,255,255,.12) 0%,transparent 50%)" }} />
              </div>
          }
          <div className="pf-cover-overlay"><span className="pf-cover-lbl">📸 Change Cover</span></div>
        </div>

        {/* Hero */}
        <div className="pf-hero-card">
          <div className="pf-hero-row">
            <div className="pf-avatar-wrap">
              <div className="pf-avatar" onClick={() => avatarRef.current?.click()}>
                {profile.photo ? <img src={profile.photo} alt="" /> : <span>{(profile.name||"U")[0].toUpperCase()}</span>}
              </div>
              <div className="pf-avatar-cam" onClick={() => avatarRef.current?.click()}>📷</div>
            </div>
            <div className="pf-completion-badge">
              <div className="pf-pct-num">{completion}%</div>
              <div className="pf-pct-label">Complete</div>
            </div>
            <div style={{ display:"flex",gap:".45rem",marginLeft:"auto",alignItems:"center" }}>
              {pfEditing
                ? <>
                    <button className="btn-ghost" onClick={() => setPfEditing(false)}>Cancel</button>
                    <button className="btn-primary" onClick={savePfForm} disabled={pfSaving}>{pfSaving ? "Saving…" : "💾 Save Profile"}</button>
                  </>
                : <button className="btn-primary" onClick={startPfEdit}>✏️ Edit Profile</button>
              }
            </div>
          </div>

          <div className="pf-name">{profile.name || "Your Name"}</div>
          <div className="pf-qual-tag">{profile.qualification || <em style={{ color:"var(--subtle)",fontStyle:"italic",fontSize:".78rem",fontWeight:400 }}>Add qualification</em>}</div>
          <div className="pf-meta-row">
            {profile.email    && <span>✉ {profile.email}</span>}
            {profile.phone    && <span>📞 {profile.phone}</span>}
            {profile.address  && <span>📍 {profile.address}</span>}
            {profile.linkedin && <a href={profile.linkedin} target="_blank" rel="noreferrer">🔗 LinkedIn</a>}
            {profile.github   && <a href={profile.github}   target="_blank" rel="noreferrer">🐙 GitHub</a>}
            {profile.website  && <a href={profile.website}  target="_blank" rel="noreferrer">🌐 Portfolio</a>}
          </div>
          {profile.about && <div className="pf-about-text">{profile.about}</div>}
          {(profile.skills||[]).length > 0 && (
            <div className="pf-skills-row">
              {(profile.skills||[]).slice(0,8).map(s => <span key={s} className="pf-skill-chip">{s}</span>)}
              {(profile.skills||[]).length > 8 && <span className="pf-skill-chip" style={{ cursor:"pointer" }} onClick={() => setPfTab("skills")}>+{profile.skills.length-8} more</span>}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="pf-tabs">
          {tabs.map(t => <button key={t.id} className={`pf-tab ${pfTab===t.id?"active":""}`} onClick={() => setPfTab(t.id)}>{t.icon} {t.label}</button>)}
        </div>

        <AnimatePresence mode="wait">

          {pfTab === "overview" && (
            <motion.div key="ov" initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0 }}>
              <div className="pf-card">
                <div className="pf-card-title"><span className="pf-card-title-icon">✍️</span>About Me</div>
                {pfEditing
                  ? <textarea className="pf-input" rows={4} placeholder="Write about yourself, your interests and goals…" value={pfForm.about||""} onChange={e => pffc("about",e.target.value)} />
                  : <p style={{ color:"var(--muted)",lineHeight:1.75,fontSize:".86rem" }}>{profile.about||<em style={{ color:"var(--subtle)" }}>No bio yet. Click Edit Profile to add one.</em>}</p>
                }
              </div>

              <div className="pf-card">
                <div className="pf-card-title"><span className="pf-card-title-icon">📋</span>Personal Information</div>
                {pfEditing
                  ? <div className="pf-grid">
                      {[
                        { k:"name",l:"Full Name",p:"Your full name" },
                        { k:"phone",l:"Phone",p:"+91 XXXXXXXXXX" },
                        { k:"address",l:"City / Location",p:"Your city" },
                        { k:"cgpa",l:"CGPA / Percentage",p:"e.g. 8.5 or 85%" },
                        { k:"experience",l:"Experience",p:"e.g. 1 yr at XYZ" },
                        { k:"website",l:"Portfolio URL",p:"https://..." },
                        { k:"linkedin",l:"LinkedIn URL",p:"linkedin.com/in/..." },
                        { k:"github",l:"GitHub URL",p:"github.com/username" },
                      ].map(f => (
                        <div className="pf-field" key={f.k}>
                          <label className="pf-label">{f.l}</label>
                          <input className="pf-input" placeholder={f.p} value={pfForm[f.k]||""} onChange={e => pffc(f.k,e.target.value)} />
                        </div>
                      ))}
                      <div className="pf-field">
                        <label className="pf-label">Qualification</label>
                        <select className="pf-input" value={pfForm.qualification||""} onChange={e => pffc("qualification",e.target.value)}>
                          <option value="">Select…</option>
                          {["10th","12th","Diploma","ITI","BCA","B.Tech","B.Sc","B.Com","BA","MCA","M.Tech","M.Sc","MBA","PhD","Other"].map(q => <option key={q}>{q}</option>)}
                        </select>
                      </div>
                      <div className="pf-field">
                        <label className="pf-label">Email (read-only)</label>
                        <input className="pf-input" value={profile.email||""} readOnly />
                      </div>
                    </div>
                  : <div className="pf-grid">
                      {[["Full Name",profile.name],["Email",profile.email],["Phone",profile.phone],["Location",profile.address],["Qualification",profile.qualification],["CGPA / %",profile.cgpa],["Experience",profile.experience],["Portfolio",profile.website],["LinkedIn",profile.linkedin],["GitHub",profile.github]].map(([l,v]) => (
                        <div key={l}>
                          <div className="pf-label" style={{ marginBottom:".2rem" }}>{l}</div>
                          <div style={{ fontWeight:600,color:v?"var(--dark)":"var(--subtle)",fontStyle:v?"normal":"italic",fontSize:".86rem",wordBreak:"break-all" }}>{v||"Not provided"}</div>
                        </div>
                      ))}
                    </div>
                }
                {pfEditing && <div style={{ marginTop:"1.2rem",display:"flex",justifyContent:"flex-end",gap:".5rem" }}>
                  <button className="btn-ghost" onClick={() => setPfEditing(false)}>Cancel</button>
                  <button className="btn-primary" onClick={savePfForm} disabled={pfSaving}>{pfSaving?"Saving…":"💾 Save"}</button>
                </div>}
              </div>
            </motion.div>
          )}

          {pfTab === "skills" && (
            <motion.div key="sk" initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0 }}>
              <div className="pf-card">
                <div className="pf-card-title"><span className="pf-card-title-icon">⚡</span>Skills & Expertise</div>
                <div className="pf-skill-chip-wrap">
                  {skills.map(s => (
                    <span key={s} className={pfEditing ? "pf-skill-editable" : "pf-skill-chip"}>
                      {s}
                      {pfEditing && <button className="pf-skill-remove" onClick={() => pffc("skills",(pfForm.skills||[]).filter(x=>x!==s))}>✕</button>}
                    </span>
                  ))}
                  {skills.length === 0 && <em style={{ color:"var(--subtle)",fontSize:".84rem" }}>No skills added yet.</em>}
                </div>

                {pfEditing && (
                  <>
                    <div className="divider" />
                    <div className="pf-label" style={{ marginBottom:".5rem" }}>Add a Skill</div>
                    <div style={{ display:"flex",gap:".55rem" }}>
                      <input className="pf-input" style={{ flex:1 }} placeholder="Type skill name…" value={skillInput}
                        onChange={e => setSkillInput(e.target.value)}
                        onKeyDown={e => { if (e.key==="Enter"){ e.preventDefault(); addSkill(skillInput); } }} />
                      <button className="btn-primary" style={{ padding:".58rem 1.1rem",whiteSpace:"nowrap" }} onClick={() => addSkill(skillInput)}>+ Add</button>
                    </div>
                    {skillInput.length > 0 && filteredSugg.length > 0 && (
                      <div style={{ display:"flex",flexWrap:"wrap",gap:".3rem",marginTop:".5rem" }}>
                        {filteredSugg.map(s => <span key={s} className="pf-sugg-chip" onClick={() => addSkill(s)}>{s}</span>)}
                      </div>
                    )}
                    {skillInput.length === 0 && (
                      <>
                        <div className="pf-label" style={{ marginTop:"1rem",marginBottom:".45rem" }}>Popular Skills</div>
                        <div style={{ display:"flex",flexWrap:"wrap",gap:".3rem" }}>
                          {SKILL_SUGGESTIONS.filter(s=>!(pfForm.skills||[]).includes(s)).slice(0,20).map(s => <span key={s} className="pf-sugg-chip" onClick={() => addSkill(s)}>{s}</span>)}
                        </div>
                      </>
                    )}
                    <div style={{ marginTop:"1.2rem",display:"flex",justifyContent:"flex-end",gap:".5rem" }}>
                      <button className="btn-ghost" onClick={() => setPfEditing(false)}>Cancel</button>
                      <button className="btn-primary" onClick={savePfForm} disabled={pfSaving}>{pfSaving?"Saving…":"💾 Save Skills"}</button>
                    </div>
                  </>
                )}
                {!pfEditing && <div style={{ marginTop:".9rem" }}><button className="btn-ghost" onClick={startPfEdit}>✏️ Edit Skills</button></div>}
              </div>
            </motion.div>
          )}

          {pfTab === "academic" && (
            <motion.div key="ac" initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0 }}>
              <div className="pf-card">
                <div className="pf-card-title"><span className="pf-card-title-icon">🎓</span>Academic Background</div>
                {pfEditing
                  ? <div className="pf-grid-3">
                      {[{ k:"tenth",l:"10th — Board / %",p:"e.g. CBSE – 92%" },{ k:"twelfth",l:"12th — Board / %",p:"e.g. BSEB – 85%" },{ k:"graduation",l:"College / Degree / CGPA",p:"e.g. MIT Patna – 8.4" }].map(f => (
                        <div className="pf-field" key={f.k}>
                          <label className="pf-label">{f.l}</label>
                          <input className="pf-input" placeholder={f.p} value={pfForm[f.k]||""} onChange={e => pffc(f.k,e.target.value)} />
                        </div>
                      ))}
                    </div>
                  : <div className="pf-grid-3">
                      {[["10th Standard",profile.tenth],["12th Standard",profile.twelfth],["Graduation",profile.graduation]].map(([l,v]) => (
                        <div className="pf-acad-card" key={l}>
                          <div className="pf-acad-level">{l}</div>
                          <div className="pf-acad-val">{v||<em style={{ color:"var(--subtle)",fontStyle:"italic",fontWeight:400,fontSize:".78rem" }}>Not added</em>}</div>
                        </div>
                      ))}
                    </div>
                }
                <div style={{ marginTop:"1.1rem",display:"flex",justifyContent:"flex-end",gap:".5rem" }}>
                  {pfEditing
                    ? <><button className="btn-ghost" onClick={() => setPfEditing(false)}>Cancel</button><button className="btn-primary" onClick={savePfForm} disabled={pfSaving}>{pfSaving?"Saving…":"💾 Save"}</button></>
                    : <button className="btn-ghost" onClick={startPfEdit}>✏️ Edit Academic</button>
                  }
                </div>
              </div>
            </motion.div>
          )}

          {pfTab === "experience" && (
            <motion.div key="ex" initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0 }}>
              <div className="pf-card">
                <div className="pf-card-title"><span className="pf-card-title-icon">💼</span>Experience & Projects</div>
                {pfEditing
                  ? <div style={{ display:"flex",flexDirection:"column",gap:".85rem" }}>
                      {[{ k:"experience",l:"Work / Internship Experience",p:"e.g. 6-month intern at TechCorp as React Developer",rows:4 },{ k:"projects",l:"Projects",p:"Describe your key projects, tech stack, outcomes…",rows:4 },{ k:"achievements",l:"Achievements / Awards",p:"Hackathon wins, certifications, recognitions…",rows:3 }].map(f => (
                        <div className="pf-field" key={f.k}>
                          <label className="pf-label">{f.l}</label>
                          <textarea className="pf-input" rows={f.rows} placeholder={f.p} value={pfForm[f.k]||""} onChange={e => pffc(f.k,e.target.value)} />
                        </div>
                      ))}
                      <div style={{ display:"flex",justifyContent:"flex-end",gap:".5rem" }}>
                        <button className="btn-ghost" onClick={() => setPfEditing(false)}>Cancel</button>
                        <button className="btn-primary" onClick={savePfForm} disabled={pfSaving}>{pfSaving?"Saving…":"💾 Save"}</button>
                      </div>
                    </div>
                  : <div style={{ display:"flex",flexDirection:"column",gap:"1.1rem" }}>
                      {[["Work / Internship Experience",profile.experience],["Projects",profile.projects],["Achievements / Awards",profile.achievements]].map(([l,v]) => (
                        <div key={l}>
                          <div className="pf-label" style={{ marginBottom:".35rem" }}>{l}</div>
                          <p style={{ fontSize:".86rem",color:v?"var(--slate)":"var(--subtle)",lineHeight:1.7,fontStyle:v?"normal":"italic" }}>{v||`No ${l.toLowerCase()} added yet.`}</p>
                        </div>
                      ))}
                      <button className="btn-ghost" style={{ alignSelf:"flex-start" }} onClick={startPfEdit}>✏️ Add Experience</button>
                    </div>
                }
              </div>
            </motion.div>
          )}

          {pfTab === "media" && (
            <motion.div key="md" initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0 }}>
              <div className="pf-card">
                <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"1rem" }}>
                  <div className="pf-card-title" style={{ marginBottom:0 }}><span className="pf-card-title-icon">🏆</span>Certificates</div>
                  {pfEditing && <button className="btn-ghost" style={{ fontSize:".74rem",padding:".38rem .85rem" }} onClick={() => certRef.current?.click()}>+ Upload</button>}
                </div>
                <div className="pf-upload-grid">
                  {certs.map((c,i) => (
                    <div className="pf-thumb" key={i} onClick={() => window.open(c.url,"_blank")}>
                      {c.type?.startsWith("image/") ? <img src={c.url} alt="" /> : <div style={{ width:"100%",height:"100%",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"rgba(99,102,241,.05)" }}><span style={{ fontSize:"1.6rem" }}>📑</span><span style={{ fontSize:".58rem",fontWeight:700,color:"var(--muted)" }}>PDF</span></div>}
                      {pfEditing && <button className="pf-thumb-del" onClick={e => { e.stopPropagation(); pffc("certificates",(pfForm.certificates||[]).filter((_,j)=>j!==i)); }}>✕</button>}
                    </div>
                  ))}
                  {pfEditing && <div className="pf-add-thumb" onClick={() => certRef.current?.click()}><span style={{ fontSize:"1.3rem" }}>+</span><span>Add</span></div>}
                  {!pfEditing && certs.length===0 && <em style={{ color:"var(--subtle)",fontSize:".8rem" }}>No certificates yet.</em>}
                </div>
              </div>

              <div className="pf-card">
                <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"1rem" }}>
                  <div className="pf-card-title" style={{ marginBottom:0 }}><span className="pf-card-title-icon">📸</span>Personal Posts</div>
                  {pfEditing && <button className="btn-ghost" style={{ fontSize:".74rem",padding:".38rem .85rem" }} onClick={() => postRef.current?.click()}>+ Upload</button>}
                </div>
                <div className="pf-upload-grid">
                  {posts.map((p,i) => (
                    <div className="pf-thumb" key={i} onClick={() => window.open(p.url,"_blank")}>
                      {p.type?.startsWith("image/") ? <img src={p.url} alt="" /> : <div style={{ width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center" }}><span style={{ fontSize:"1.6rem" }}>🎬</span></div>}
                      {pfEditing && <button className="pf-thumb-del" onClick={e => { e.stopPropagation(); pffc("personalPosts",(pfForm.personalPosts||[]).filter((_,j)=>j!==i)); }}>✕</button>}
                    </div>
                  ))}
                  {pfEditing && <div className="pf-add-thumb" onClick={() => postRef.current?.click()}><span style={{ fontSize:"1.3rem" }}>+</span><span>Add</span></div>}
                  {!pfEditing && posts.length===0 && <em style={{ color:"var(--subtle)",fontSize:".8rem" }}>No posts yet.</em>}
                </div>
                {pfEditing && <div style={{ marginTop:"1.1rem",display:"flex",justifyContent:"flex-end",gap:".5rem" }}>
                  <button className="btn-ghost" onClick={() => setPfEditing(false)}>Cancel</button>
                  <button className="btn-primary" onClick={savePfForm} disabled={pfSaving}>{pfSaving?"Saving…":"💾 Save Media"}</button>
                </div>}
              </div>
            </motion.div>
          )}

          {pfTab === "resume" && (
            <motion.div key="rv" initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0 }}>
              <div className="pf-card">
                <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"1.1rem" }}>
                  <div className="pf-card-title" style={{ marginBottom:0 }}><span className="pf-card-title-icon">📄</span>My Resumes</div>
                  {pfEditing && <button className="btn-ghost" style={{ fontSize:".74rem",padding:".38rem .85rem" }} onClick={() => resumeRef.current?.click()}>+ Upload</button>}
                </div>
                {resumes.length === 0
                  ? <div className="empty-state">
                      <div className="empty-state-icon">📄</div>
                      <div className="empty-state-title">No Resumes Yet</div>
                      <div className="empty-state-text">Upload a resume to attach it to job applications.</div>
                      {pfEditing && <button className="btn-primary" style={{ marginTop:"1rem" }} onClick={() => resumeRef.current?.click()}>+ Upload Resume</button>}
                      {!pfEditing && <button className="btn-ghost" style={{ marginTop:"1rem" }} onClick={startPfEdit}>Go to Edit Mode</button>}
                    </div>
                  : resumes.map((r,i) => (
                    <div className="pf-resume-item" key={i}>
                      <div className="pf-resume-icon">{r.type==="application/pdf"?"📑":"🖼️"}</div>
                      <div style={{ flex:1 }}>
                        <div className="pf-resume-name">{r.name||`Resume ${i+1}`}</div>
                        <div className="pf-resume-type">{r.type}</div>
                      </div>
                      <div style={{ display:"flex",gap:".4rem" }}>
                        <a href={r.url} target="_blank" rel="noreferrer"><button className="btn-view-sm">View</button></a>
                        {pfEditing && <button className="btn-danger-sm" onClick={() => pffc("resumes",(pfForm.resumes||[]).filter((_,j)=>j!==i))}>Remove</button>}
                      </div>
                    </div>
                  ))
                }
                {pfEditing && resumes.length > 0 && <div style={{ marginTop:"1.1rem",display:"flex",justifyContent:"flex-end",gap:".5rem" }}>
                  <button className="btn-ghost" onClick={() => setPfEditing(false)}>Cancel</button>
                  <button className="btn-primary" onClick={savePfForm} disabled={pfSaving}>{pfSaving?"Saving…":"💾 Save"}</button>
                </div>}
                {!pfEditing && <div style={{ marginTop:"1rem" }}><button className="btn-ghost" onClick={startPfEdit}>✏️ Manage Resumes</button></div>}
              </div>
            </motion.div>
          )}

        </AnimatePresence>

        {/* Profile page toast */}
        <AnimatePresence>
          {pfToast && (
            <motion.div className={`toast ${pfToast.type==="error"?"toast-error":"toast-success"}`}
              style={{ position:"fixed",bottom:"2rem",right:"2rem",zIndex:3000 }}
              initial={{ opacity:0,y:14,scale:.96 }} animate={{ opacity:1,y:0,scale:1 }} exit={{ opacity:0 }}>
              {pfToast.msg}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  // ── LOADING GATE ────────────────────────────────────────
  if (!profile) return (
    <div style={{ height:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"var(--bg)",flexDirection:"column",gap:"1.2rem" }}>
      <style>{CSS}</style>
      <div style={{ fontFamily:"var(--font-display)",fontSize:"2rem",fontWeight:800,background:"var(--grad)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>Campus2Career</div>
      <div className="spinner" />
      <div style={{ color:"var(--muted)",fontSize:".84rem" }}>Loading your profile…</div>
    </div>
  );

  // ── MAIN RENDER ─────────────────────────────────────────
  return (
    <>
      <style>{CSS}</style>

      {/* ── NAV ── */}
      <nav className="nav">
        <div className="nav-brand">
          <div className="nav-brand-icon">🎓</div>
          <div>
            <div className="nav-brand-text">Campus2Career</div>
            <div className="nav-brand-sub">Student Portal</div>
          </div>
        </div>

        <div className="nav-tabs">
          {NAV_TABS.map(t => (
            <button key={t.id} className={`nav-tab ${activeTab===t.id?"active":""}`} onClick={() => setActiveTab(t.id)}>
              <span className="tab-icon">{t.icon}</span>{t.label}
            </button>
          ))}
        </div>

        <div className="nav-right">
          <div className="nav-search">
            <span className="search-ico">🔍</span>
            <input placeholder="Search jobs, skills, courses…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
          <div className="nav-icon-btn" title="Notifications">
            🔔<span className="nav-notif-dot" />
          </div>
          <div className="nav-avatar" title={profile.name}>
            {profile.photo ? <img src={profile.photo} alt="" /> : (profile.name||"S")[0].toUpperCase()}
          </div>
          <button className="nav-signout" onClick={handleLogout}>Sign Out</button>
        </div>
      </nav>

      <div className="layout">
        {/* ── LEFT SIDEBAR ── */}
        <aside className="sidebar">{renderSidebarPanel(profile, true)}</aside>

        {/* ── MAIN CONTENT ── */}
        <main className="content">
          <AnimatePresence mode="wait">

            {/* FEED */}
            {activeTab === "feed" && (
              <motion.div key="feed" initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0 }}>
                <div className="page-sec">
                  <div className="sec-head">
                    <div><span className="sec-title">Partner Industries</span><span className="sec-count">· {industries.length} registered</span></div>
                  </div>
                  <div className="ind-grid">
                    {industries.map((ind,i) => (
                      <motion.div key={ind.id||i} className="ind-card" initial={{ opacity:0,y:12 }} animate={{ opacity:1,y:0 }} transition={{ delay:i*.06 }}>
                        <div className="ind-logo">{ind.logo||(ind.name||"CO").substring(0,2).toUpperCase()}</div>
                        <div className="ind-name">{ind.name}</div>
                        <div className="ind-domain">{ind.domain}</div>
                        <div className="ind-loc">📍 {ind.location}</div>
                        {ind.tagline && <div className="ind-tagline">"{ind.tagline}"</div>}
                        <button className="ind-msg-btn" onClick={() => setActiveChat(ind.id)}>💬 Message</button>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="page-sec">
                  <div className="sec-head">
                    <div><span className="sec-title">Opportunity Feed</span><span className="sec-count">· {vacancies.length} openings</span></div>
                  </div>
                  {isFeedLoading
                    ? <div className="spinner-center"><div className="spinner" /></div>
                    : <div className="feed-stack">
                        {vacancies.map((v,i) => (
                          <motion.div key={v.id||i} className="vac-card" initial={{ opacity:0,y:12 }} animate={{ opacity:1,y:0 }} transition={{ delay:i*.05 }}>
                            <div className="vac-body">
                              <div className="vac-top">
                                <div style={{ display:"flex",alignItems:"center",gap:".65rem" }}>
                                  <div className="vac-logo">{v.ownerLogo||"CO"}</div>
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
                                {(v.skills||"").split(",").filter(Boolean).slice(0,5).map((sk,j) => <span key={j} className="spill">{sk.trim()}</span>)}
                              </div>
                            </div>
                            <div className="vac-foot">
                              <div className="vac-meta">
                                {v.duration && <div className="vac-meta-item">⏱ {v.duration}</div>}
                                {v.offerings && <div className="vac-meta-item">💰 {v.offerings.slice(0,28)}{v.offerings.length>28?"…":""}</div>}
                              </div>
                              <div className="vac-actions">
                                <button className="btn-detail" onClick={() => setPostDetailModal(v)}>Details</button>
                                {alreadyApplied(v.id)
                                  ? <span className="applied-tag">✓ Applied</span>
                                  : <button className="btn-apply" onClick={() => setApplyModal(v)}>Apply Now</button>
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

            {/* JOBS */}
            {activeTab === "jobs" && (
              <motion.div key="jobs" initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0 }}>
                <div className="page-sec">
                  <div className="sec-head">
                    <div><span className="sec-title">🤖 AI Skill Matches</span><span className="sec-count">· Based on your profile</span></div>
                    {profile.skills?.length > 0 && (
                      <button className="sec-action" onClick={async () => {
                        setIsMatchLoading(true);
                        try {
                          const res = await axios.post(`${BASE}/api/analyze-skills`,{ skills:profile.skills.join(", ") },{ timeout:12000 });
                          setMatchedJobs(Array.isArray(res.data)?res.data:[]);
                        } catch {}
                        setIsMatchLoading(false);
                      }}>↺ Refresh</button>
                    )}
                  </div>
                  {isMatchLoading
                    ? <div className="spinner-center"><div className="spinner" /></div>
                    : !profile.skills?.length
                      ? <div className="empty-state">
                          <div className="empty-state-icon">⚡</div>
                          <div className="empty-state-title">No skills added yet</div>
                          <div className="empty-state-text">Add skills in your profile to get AI-powered job matches.</div>
                          <button className="btn-primary" style={{ marginTop:"1rem" }} onClick={() => { setActiveTab("profile"); setTimeout(()=>setPfTab("skills"),100); }}>Add Skills →</button>
                        </div>
                      : matchedJobs.length === 0
                        ? <div className="empty-state"><div className="empty-state-icon">🔍</div><div className="empty-state-title">No matches yet</div><div className="empty-state-text">Click Refresh to run the AI analysis.</div></div>
                        : <div className="match-grid">
                            {matchedJobs.map((m,i) => (
                              <motion.div key={i} className="match-card" initial={{ opacity:0,y:12 }} animate={{ opacity:1,y:0 }} transition={{ delay:i*.07 }}>
                                <div className="match-pct">{m.match_confidence??m.accuracy??0}%</div>
                                <div className="match-pct-label">Match Confidence</div>
                                <div className="match-bar-track"><div className="match-bar-fill" style={{ width:`${m.match_confidence??m.accuracy??0}%` }} /></div>
                                <div style={{ fontFamily:"var(--font-display)",fontWeight:800,fontSize:".93rem",color:"var(--dark)",marginBottom:".28rem" }}>{m.job||m.matched_job}</div>
                                {m.industry && <div style={{ fontSize:".7rem",color:"var(--muted)",fontWeight:600,marginBottom:".65rem" }}>📍 {m.industry}</div>}
                                {m.missing_skills?.length > 0 && (
                                  <div style={{ marginBottom:".65rem" }}>
                                    <div style={{ fontSize:".63rem",fontWeight:800,textTransform:"uppercase",color:"var(--danger)",letterSpacing:".06em",marginBottom:".3rem" }}>Skills to Learn</div>
                                    <div>{m.missing_skills.map((s,j) => <span key={j} className="miss-chip">{s}</span>)}</div>
                                  </div>
                                )}
                                {m.courses?.length > 0 && (
                                  <div>
                                    <div style={{ fontSize:".63rem",fontWeight:800,textTransform:"uppercase",color:"var(--success)",letterSpacing:".06em",marginBottom:".3rem" }}>Recommended Courses</div>
                                    {m.courses.map((c,j) => (
                                      <a key={j} href={c.link||c.url||"#"} target="_blank" rel="noreferrer" className="course-rec">
                                        <span style={{ fontSize:".9rem" }}>📚</span>
                                        <div className="course-rec-title">{c.title}</div>
                                        <span style={{ fontSize:".63rem",color:"var(--brand)",fontWeight:700,flexShrink:0 }}>→</span>
                                      </a>
                                    ))}
                                  </div>
                                )}
                                {m.url && <a href={m.url} target="_blank" rel="noreferrer"><button className="btn-primary" style={{ width:"100%",marginTop:".7rem" }}>View Job →</button></a>}
                              </motion.div>
                            ))}
                          </div>
                  }
                </div>

                <div className="page-sec">
                  <div className="sec-head">
                    <div><span className="sec-title">All Job Listings</span><span className="sec-count">· {allJobs.length} openings</span></div>
                  </div>
                  <div className="jobs-grid">
                    {allJobs.filter(j => !searchQuery || j.job?.toLowerCase().includes(searchQuery.toLowerCase()) || j.industry?.toLowerCase().includes(searchQuery.toLowerCase()) || j.skills?.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map((j,i) => (
                      <motion.div key={i} className="job-card" initial={{ opacity:0,scale:.97 }} animate={{ opacity:1,scale:1 }} transition={{ delay:i*.04 }}>
                        <div className="job-co">{j.industry}</div>
                        <div className="job-title">{j.job}</div>
                        <div className="job-desc">{j.desc}</div>
                        <div className="job-tags">
                          {j.dept && <span className="jtag" style={{ background:"#e0f2fe",color:"#0369a1",borderColor:"#bae6fd" }}>{j.dept}</span>}
                          {j.role && <span className="jtag" style={{ background:"#ede9fe",color:"#5b21b6",borderColor:"#ddd6fe" }}>{j.role}</span>}
                          {j.ug   && <span className="jtag" style={{ background:"#dcfce7",color:"#166534",borderColor:"#bbf7d0" }}>{j.ug}</span>}
                        </div>
                        <div className="skill-pills" style={{ marginBottom:".65rem" }}>
                          {(j.skills||"").split(",").filter(Boolean).slice(0,4).map((sk,k) => <span key={k} className="spill" style={{ fontSize:".63rem" }}>{sk.trim()}</span>)}
                        </div>
                        <div className="job-foot">
                          <div style={{ fontSize:".68rem",color:"var(--muted)",fontWeight:600 }}>{j.pg&&`PG: ${j.pg}`}</div>
                          <a href={j.url} target="_blank" rel="noreferrer" className="job-apply-link">Apply →</a>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* COURSES */}
            {activeTab === "courses" && (
              <motion.div key="courses" initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0 }}>
                <div className="sec-head" style={{ marginBottom:"1.2rem" }}>
                  <div><span className="sec-title">Recommended Courses</span><span className="sec-count">· {courses.length} available</span></div>
                </div>
                <div className="courses-grid">
                  {courses.map((c,i) => (
                    <motion.div key={c.id||i} className="course-card" initial={{ opacity:0,y:12 }} animate={{ opacity:1,y:0 }} transition={{ delay:i*.06 }} onClick={() => window.open(c.link||c.url||"#","_blank")}>
                      <div className="course-hd">
                        <div className="course-provider">{c.provider}</div>
                        <div className="course-title-text">{c.title}</div>
                      </div>
                      <div className="course-bd">
                        <div className="course-meta">
                          {c.duration && <span className="cmeta">⏱ {c.duration}</span>}
                          {c.rating   && <span className="cmeta">⭐ {c.rating}</span>}
                          {c.students && <span className="cmeta">👥 {c.students}</span>}
                        </div>
                        {c.level && <div style={{ marginBottom:".7rem" }}><span className={`level-pill level-${c.level}`}>{c.level}</span></div>}
                        {(c.skills||[]).length > 0 && (
                          <div className="skill-pills" style={{ marginBottom:".7rem" }}>
                            {c.skills.slice(0,3).map((sk,j) => <span key={j} className="spill">{sk}</span>)}
                          </div>
                        )}
                        <button className="course-enroll-btn">Enroll Now →</button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* APPLICATIONS */}
            {activeTab === "applications" && (
              <motion.div key="apps" initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0 }}>
                <div className="sec-head" style={{ marginBottom:"1.2rem" }}>
                  <div><span className="sec-title">My Applications</span><span className="sec-count">· {myApplications.length} submitted</span></div>
                </div>
                {myApplications.length === 0
                  ? <div className="empty-state">
                      <div className="empty-state-icon">📋</div>
                      <div className="empty-state-title">No applications yet</div>
                      <div className="empty-state-text">Browse the feed and apply to internships and job vacancies.</div>
                      <button className="btn-primary" style={{ marginTop:"1rem" }} onClick={() => setActiveTab("feed")}>Browse Openings →</button>
                    </div>
                  : <div className="app-list">
                      {myApplications.map((a,i) => (
                        <motion.div key={a.id||i} className="app-card" initial={{ opacity:0,x:-10 }} animate={{ opacity:1,x:0 }} transition={{ delay:i*.06 }}>
                          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start" }}>
                            <div>
                              <div className="app-role">{a.role}</div>
                              <div className="app-co">🏢 {a.company}</div>
                            </div>
                            <span className={`status-pill sp-${a.status}`}>{a.status}</span>
                          </div>
                          <div style={{ fontSize:".76rem",color:"var(--muted)",marginTop:".55rem",display:"flex",gap:"1.2rem" }}>
                            <span>📅 Applied: {a.appliedOn}</span>
                            {a.coverLetter && <span>📝 Cover letter</span>}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                }
              </motion.div>
            )}

            {/* PROFILE */}
            {activeTab === "profile" && (
              <motion.div key="profile" initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0 }}>
                {renderProfilePage()}
              </motion.div>
            )}

          </AnimatePresence>
        </main>

        {/* ── RIGHT SIDEBAR (user profile view) ── */}
        <AnimatePresence>
          {activeUserProfile && (
            <motion.aside className="sidebar sidebar-right" initial={{ x:310,opacity:0 }} animate={{ x:0,opacity:1 }} exit={{ x:310,opacity:0 }} transition={{ type:"spring",stiffness:280,damping:28 }}>
              {renderSidebarPanel(activeUserProfile,false)}
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* ── DM PANEL ── */}
      <AnimatePresence>
        {activeChat && (
          <motion.div className="dm-panel" initial={{ x:360,opacity:0 }} animate={{ x:0,opacity:1 }} exit={{ x:360,opacity:0 }} transition={{ type:"spring",stiffness:280,damping:28 }}>
            <div className="dm-head">
              <div>
                <div className="dm-recipient-name">{industries.find(i=>i.id===activeChat)?.name??"Company"}</div>
                <div className="dm-status-line"><span className="online-dot" />Active now</div>
              </div>
              <button className="dm-close-btn" onClick={() => setActiveChat(null)}>✕ Close</button>
            </div>
            <div className="dm-body">
              {!(profile.chats?.[activeChat]||[]).length
                ? <div className="dm-empty-state"><span style={{ fontSize:"1.8rem" }}>💬</span><span>No messages yet. Say hello!</span></div>
                : (profile.chats?.[activeChat]||[]).map((msg,i) => (
                  <div key={i} className={`bubble ${msg.sender===profile.name?"sent":"recv"}`}>
                    <div>{msg.message}</div>
                    <div className="bubble-time">{msg.time}</div>
                  </div>
                ))
              }
              <div ref={chatEndRef} />
            </div>
            <div className="dm-foot">
              <input ref={chatInputRef} className="dm-input" placeholder="Type a message…"
                onKeyDown={e => { if (e.key==="Enter"&&e.target.value.trim()){ sendMessage(activeChat,e.target.value.trim()); e.target.value=""; } }} />
              <button className="dm-send-btn" onClick={() => { const inp=chatInputRef.current; if (!inp?.value.trim()) return; sendMessage(activeChat,inp.value.trim()); inp.value=""; }}>➤</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── POST DETAIL MODAL ── */}
      <AnimatePresence>
        {postDetailModal && (
          <motion.div className="modal-ov" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} onClick={e => { if (e.target===e.currentTarget) setPostDetailModal(null); }}>
            <motion.div className="modal-box" initial={{ scale:.93,opacity:0 }} animate={{ scale:1,opacity:1 }} exit={{ scale:.93,opacity:0 }}>
              <button className="modal-close" onClick={() => setPostDetailModal(null)}>✕</button>
              <div style={{ display:"flex",alignItems:"center",gap:".8rem",marginBottom:"1.3rem" }}>
                <div style={{ width:48,height:48,borderRadius:12,background:"rgba(99,102,241,.1)",color:"var(--brand)",fontFamily:"var(--font-display)",fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center" }}>{postDetailModal.ownerLogo||"CO"}</div>
                <div>
                  <div className="modal-title" style={{ fontSize:"1.2rem" }}>{postDetailModal.title}</div>
                  <div style={{ color:"var(--brand)",fontWeight:700,fontSize:".8rem" }}>{postDetailModal.ownerName} · {postDetailModal.type}</div>
                </div>
              </div>
              <p style={{ marginBottom:"1rem",lineHeight:1.7,color:"var(--muted)",fontSize:".86rem" }}>{postDetailModal.desc}</p>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:".65rem",marginBottom:"1.1rem",fontSize:".84rem" }}>
                {postDetailModal.duration && <div><strong>Duration:</strong> {postDetailModal.duration}</div>}
                {postDetailModal.skills   && <div><strong>Skills:</strong> {postDetailModal.skills}</div>}
                {postDetailModal.offerings&& <div style={{ gridColumn:"1/-1" }}><strong>Offerings:</strong> {postDetailModal.offerings}</div>}
              </div>
              {alreadyApplied(postDetailModal.id)
                ? <div style={{ textAlign:"center",padding:".8rem",background:"#dcfce7",borderRadius:12,color:"#166534",fontWeight:700 }}>✓ Already Applied</div>
                : <button className="modal-btn-primary" onClick={() => { setApplyModal(postDetailModal); setPostDetailModal(null); }}>Apply for this Role</button>
              }
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── APPLY MODAL ── */}
      <AnimatePresence>
        {applyModal && (
          <motion.div className="modal-ov" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} onClick={e => { if (e.target===e.currentTarget) setApplyModal(null); }}>
            <motion.div className="modal-box" initial={{ y:40,opacity:0 }} animate={{ y:0,opacity:1 }} exit={{ y:40,opacity:0 }}>
              <button className="modal-close" onClick={() => setApplyModal(null)}>✕</button>
              <div className="modal-title">Apply Now</div>
              <div className="modal-sub">Applying to <strong>{applyModal?.ownerName}</strong> for <strong>{applyModal?.title}</strong></div>
              <form onSubmit={handleApplySubmit}>
                <label className="modal-field-label">Your Name</label>
                <input className="modal-input" value={profile?.name||""} readOnly />
                <label className="modal-field-label">Email</label>
                <input className="modal-input" value={profile?.email||""} readOnly />
                <label className="modal-field-label">Resume</label>
                {(profile?.resumes||[]).length > 0
                  ? <div style={{ marginBottom:".9rem" }}>
                      {(profile.resumes||[]).map((r,i) => (
                        <div key={i} style={{ display:"flex",alignItems:"center",gap:".5rem",background:"rgba(99,102,241,.05)",border:"1.5px solid rgba(99,102,241,.15)",borderRadius:10,padding:".48rem .8rem",marginBottom:".38rem" }}>
                          <span>{r.type==="application/pdf"?"📑":"🖼️"}</span>
                          <span style={{ fontSize:".8rem",fontWeight:600,flex:1 }}>{r.name}</span>
                          <span style={{ fontSize:".66rem",background:"#dcfce7",color:"#166534",padding:".1rem .45rem",borderRadius:99,fontWeight:700 }}>Attached</span>
                        </div>
                      ))}
                    </div>
                  : <div style={{ marginBottom:".9rem",padding:".65rem .9rem",background:"#fffbeb",border:"1.5px solid #fbbf24",borderRadius:10,fontSize:".78rem",color:"#92400e",fontWeight:600 }}>
                      ⚠️ No resume on file. Go to <strong>My Profile → Resume</strong> to upload one first.
                    </div>
                }
                <label className="modal-field-label">Cover Letter</label>
                <textarea required className="modal-input" rows={4} placeholder="Explain why you're a great fit for this role…" value={applyForm.coverLetter} onChange={e => setApplyForm({ ...applyForm,coverLetter:e.target.value })} />
                <button type="submit" className="modal-btn-primary">🚀 Submit Application</button>
                <button type="button" className="modal-btn-secondary" onClick={() => setApplyModal(null)}>Cancel</button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── NOTIFICATION TOASTS ── */}
      <div className="toast-stack">
        <AnimatePresence>
          {notifications.map(n => (
            <motion.div key={n.id} className={`toast ${n.type==="error"?"toast-error":"toast-success"}`}
              initial={{ opacity:0,x:50,scale:.92 }} animate={{ opacity:1,x:0,scale:1 }} exit={{ opacity:0,scale:.9 }}>
              <div className="toast-dot" />{n.msg}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}
