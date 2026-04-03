import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from "framer-motion";
import axios from 'axios';
import { useAuth } from '../AuthContext';
import API_BASE_URL from '../apiConfig';

const BASE = API_BASE_URL;

// ─── SKILL SUGGESTIONS ────────────────────────────────────────────────────────
const SKILL_SUGGESTIONS = [
  "Python", "JavaScript", "React", "Node.js", "Django", "Flask", "Java", "C++", "TypeScript",
  "SQL", "MongoDB", "PostgreSQL", "AWS", "Docker", "Kubernetes", "Git", "Machine Learning",
  "Deep Learning", "TensorFlow", "PyTorch", "Figma", "UI/UX", "HTML", "CSS", "Spring Boot",
  "GraphQL", "DevOps", "REST APIs", "Data Science", "Excel", "Power BI", "Tableau",
  "Android", "Flutter", "Swift", "Kotlin", "PHP", "Laravel", "Vue.js", "Angular",
];

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const mockIndustries = [
  { id: 1, name: "TechNova Solutions", logo: "TN", domain: "Cloud Computing", location: "Bangalore", tagline: "Cloud Native Excellence" },
  { id: 2, name: "Quantum AI", logo: "QA", domain: "Artificial Intelligence", location: "Hyderabad", tagline: "Pioneering AI" },
  { id: 3, name: "Nexus Fintech", logo: "NF", domain: "Blockchain", location: "Mumbai", tagline: "Next-Gen Finance" },
  { id: 4, name: "GreenEnergy Co", logo: "GE", domain: "Sustainability", location: "Pune", tagline: "Sustainable Power" },
];
const mockCourses = [
  { id: 1, title: "React.js Complete Guide", provider: "Udemy", duration: "40 hrs", level: "Intermediate", link: "#", rating: 4.8, field: "BCA", skills: ["React", "JSX", "Hooks"] },
  { id: 2, title: "Data Structures & Algorithms", provider: "Coursera", duration: "60 hrs", level: "Advanced", link: "#", rating: 4.9, field: "BCA", skills: ["DSA", "C++"] },
  { id: 3, title: "Machine Learning A-Z", provider: "Udemy", duration: "55 hrs", level: "Intermediate", link: "#", rating: 4.8, field: "MCA", skills: ["Python", "sklearn"] },
  { id: 4, title: "System Design Fundamentals", provider: "Coursera", duration: "45 hrs", level: "Advanced", link: "#", rating: 4.9, field: "B.Tech", skills: ["Architecture", "SQL"] },
  { id: 5, title: "Python for Data Science", provider: "edX", duration: "35 hrs", level: "Beginner", link: "#", rating: 4.7, field: "MCA", skills: ["Python", "Pandas"] },
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
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

function calcCompletion(p) {
  if (!p) return 0;
  const checks = [
    !!p.name, !!p.email, !!p.phone, !!p.address,
    !!(p.about?.length > 10), !!(p.skills?.length > 0),
    !!p.photo, !!p.tenth, !!p.twelfth, !!p.graduation,
    !!(p.certificates?.length > 0), !!(p.resumes?.length > 0),
    !!p.linkedin, !!p.github,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

function buildDefaultProfile(authUser, authProfile) {
  return {
    id: authUser?.id || "",
    name: authProfile?.name || authProfile?.full_name || authUser?.email?.split("@")[0] || "Student",
    email: authProfile?.email || authUser?.email || "",
    username: authProfile?.username || (authProfile?.name || "student").toLowerCase().replace(/\s+/g, "_"),
    qualification: authProfile?.qualification || "",
    phone: authProfile?.phone || "",
    address: authProfile?.address || authProfile?.location || "",
    about: authProfile?.about || "",
    skills: Array.isArray(authProfile?.skills) ? authProfile.skills : [],
    photo: authProfile?.photo || null,
    tenth: authProfile?.tenth || "",
    twelfth: authProfile?.twelfth || "",
    graduation: authProfile?.graduation || "",
    certificates: authProfile?.certificates || [],
    personalPosts: authProfile?.personalPosts || [],
    resumes: authProfile?.resumes || [],
    chats: {},
    linkedin: authProfile?.linkedin || "",
    github: authProfile?.github || "",
    website: authProfile?.website || "",
    experience: authProfile?.experience || "",
    cgpa: authProfile?.cgpa || "",
  };
}

// ─── CSS ─────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800;900&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --indigo:#4f46e5;--indigo-light:#818cf8;--violet:#7c3aed;
  --emerald:#10b981;--amber:#f59e0b;--rose:#f43f5e;--blue:#3b82f6;
  --navy:#0f172a;--slate:#1e293b;--muted:#64748b;--subtle:#94a3b8;
  --bg:#f0f4ff;
  --border:rgba(148,163,184,0.15);--border2:rgba(99,102,241,0.2);
  --surface:rgba(255,255,255,0.82);--surface2:rgba(255,255,255,0.96);
  --grad:linear-gradient(135deg,#4f46e5,#7c3aed);
  --grad-warm:linear-gradient(135deg,#f59e0b,#ef4444);
  --grad-emerald:linear-gradient(135deg,#10b981,#059669);
  --shadow-sm:0 1px 4px rgba(15,23,42,0.07);
  --shadow:0 4px 20px rgba(79,70,229,0.12);
  --shadow-lg:0 12px 40px rgba(79,70,229,0.18);
  --r:18px;--r-sm:12px;--r-xs:8px;
  --nav-h:60px;
  --sidebar-w:300px;
}
html{scroll-behavior:smooth}
body{font-family:'DM Sans',sans-serif;background:var(--bg);color:var(--slate);-webkit-font-smoothing:antialiased;overflow-x:hidden}
::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:rgba(79,70,229,0.2);border-radius:99px}

/* ── NAV ── */
.s-nav{
  height:var(--nav-h);background:var(--surface);backdrop-filter:blur(24px);
  border-bottom:1px solid var(--border);display:flex;align-items:center;
  justify-content:space-between;padding:0 1rem;position:sticky;top:0;
  z-index:200;box-shadow:var(--shadow-sm);gap:.5rem;
}
.brand{font-family:'Syne',sans-serif;font-size:1.1rem;font-weight:900;letter-spacing:-0.04em;background:var(--grad);-webkit-background-clip:text;-webkit-text-fill-color:transparent;white-space:nowrap}
.brand-sub{font-size:0.58rem;font-weight:700;color:var(--subtle);letter-spacing:0.14em;text-transform:uppercase;margin-top:1px}
.s-search{position:relative;flex:1;max-width:280px;min-width:0}
.s-search input{width:100%;padding:.48rem .9rem .48rem 2.1rem;border:1.5px solid var(--border2);border-radius:99px;background:var(--surface2);font-family:'DM Sans',sans-serif;font-size:.82rem;color:var(--slate);outline:none;transition:.2s}
.s-search input:focus{border-color:var(--indigo);box-shadow:0 0 0 3px rgba(79,70,229,.1)}
.s-search .ico{position:absolute;left:.7rem;top:50%;transform:translateY(-50%);font-size:.78rem;color:var(--subtle);pointer-events:none}
.nav-right{display:flex;align-items:center;gap:.45rem;flex-shrink:0}
.nav-pills-desktop{display:flex;align-items:center;gap:.35rem}
.nav-pill{padding:.32rem .8rem;border-radius:99px;background:var(--surface2);border:1.5px solid var(--border2);font-size:.72rem;font-weight:700;color:var(--muted);cursor:pointer;transition:.18s;white-space:nowrap;font-family:'DM Sans',sans-serif}
.nav-pill:hover{background:rgba(79,70,229,.08);color:var(--indigo)}
.nav-pill.active{background:var(--grad);color:white;border-color:transparent;box-shadow:0 4px 14px rgba(79,70,229,.3)}
.nav-av{width:34px;height:34px;border-radius:10px;background:var(--grad);color:white;font-family:'Syne',sans-serif;font-weight:800;font-size:.85rem;display:flex;align-items:center;justify-content:center;cursor:pointer;overflow:hidden;transition:.15s;flex-shrink:0}
.nav-av:hover{transform:scale(1.08)}
.nav-av img{width:100%;height:100%;object-fit:cover}
.notif-btn{width:34px;height:34px;border-radius:10px;background:var(--surface2);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:.85rem;position:relative;transition:.18s;flex-shrink:0}
.notif-btn:hover{background:rgba(79,70,229,.08)}
.notif-dot{position:absolute;top:6px;right:6px;width:7px;height:7px;background:var(--rose);border-radius:50%;border:1.5px solid white}
.signout-btn{padding:.32rem .75rem;border-radius:99px;background:rgba(244,63,94,.08);border:1.5px solid rgba(244,63,94,.2);color:var(--rose);font-size:.72rem;font-weight:700;cursor:pointer;font-family:inherit;white-space:nowrap}

/* ── MOBILE NAV BAR (bottom) ── */
.mobile-nav{
  display:none;position:fixed;bottom:0;left:0;right:0;
  background:var(--surface);backdrop-filter:blur(24px);
  border-top:1px solid var(--border);z-index:300;
  padding:.5rem .5rem calc(.5rem + env(safe-area-inset-bottom));
}
.mobile-nav-inner{display:flex;justify-content:space-around;align-items:center}
.mob-tab{display:flex;flex-direction:column;align-items:center;gap:2px;padding:.4rem .6rem;border-radius:12px;cursor:pointer;transition:.18s;border:none;background:none;min-width:52px}
.mob-tab .mob-icon{font-size:1.1rem;line-height:1}
.mob-tab .mob-label{font-size:.56rem;font-weight:700;color:var(--muted);letter-spacing:.04em;text-transform:uppercase}
.mob-tab.active{background:rgba(79,70,229,.1)}
.mob-tab.active .mob-label{color:var(--indigo)}

/* ── HAMBURGER ── */
.hamburger{display:none;flex-direction:column;gap:4px;cursor:pointer;padding:.3rem;border:none;background:none}
.hamburger span{display:block;width:20px;height:2px;background:var(--slate);border-radius:99px;transition:.2s}

/* ── LAYOUT ── */
.s-layout{display:flex;min-height:calc(100vh - var(--nav-h))}
.s-sidebar{
  width:var(--sidebar-w);min-width:var(--sidebar-w);
  background:var(--surface);backdrop-filter:blur(24px);
  border-right:1px solid var(--border);
  height:calc(100vh - var(--nav-h));position:sticky;top:var(--nav-h);
  overflow-y:auto;flex-shrink:0;transition:transform .28s cubic-bezier(.4,0,.2,1);
}
.s-sidebar.right{border-right:none;border-left:1px solid var(--border)}
.s-content{flex:1;padding:1.4rem 1.4rem 5rem;min-width:0;overflow-y:auto}

/* Sidebar overlay for mobile */
.sidebar-overlay{
  display:none;position:fixed;inset:0;background:rgba(15,23,42,.5);
  z-index:150;backdrop-filter:blur(4px);
}

/* ── SIDEBAR HEADER ── */
.sb-top{padding:1.2rem;background:var(--grad);position:relative;overflow:hidden}
.sb-top::before{content:'';position:absolute;top:-40px;right:-40px;width:130px;height:130px;background:rgba(255,255,255,.08);border-radius:50%}
.sb-top::after{content:'';position:absolute;bottom:-20px;left:-20px;width:80px;height:80px;background:rgba(255,255,255,.05);border-radius:50%}
.sb-av{width:48px;height:48px;border-radius:14px;background:rgba(255,255,255,.2);border:2.5px solid rgba(255,255,255,.3);color:white;font-family:'Syne',sans-serif;font-weight:800;font-size:1.2rem;display:flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden;position:relative;z-index:1}
.sb-av img{width:100%;height:100%;object-fit:cover}
.sb-name{font-family:'Syne',sans-serif;font-size:.95rem;font-weight:800;color:white;line-height:1.2;position:relative;z-index:1}
.sb-handle{font-size:.65rem;color:rgba(255,255,255,.6);margin-top:2px;position:relative;z-index:1}
.sb-badge{display:inline-flex;align-items:center;background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.2);border-radius:99px;padding:.18rem .6rem;font-size:.65rem;color:rgba(255,255,255,.9);font-weight:600;position:relative;z-index:1}

/* ── COMPLETION BAR ── */
.comp-bar-wrap{padding:.9rem 1.2rem;border-bottom:1px solid var(--border)}
.comp-label{font-size:.65rem;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;display:flex;justify-content:space-between;margin-bottom:.4rem}
.comp-track{height:5px;background:rgba(79,70,229,.1);border-radius:99px;overflow:hidden}
.comp-fill{height:100%;border-radius:99px;background:var(--grad);transition:width .8s ease}

/* ── FORM SECTIONS ── */
.fs{padding:.8rem 1.2rem;border-bottom:1px solid var(--border)}
.fs-title{font-size:.62rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:var(--indigo);margin-bottom:.55rem;opacity:.8}
.fg{display:grid;grid-template-columns:1fr 1fr;gap:.4rem}
.ff{display:flex;flex-direction:column;gap:.18rem}
.fl{font-size:.63rem;font-weight:700;color:var(--muted)}
.fi{padding:.44rem .75rem;border-radius:var(--r-sm);border:1.5px solid var(--border2);background:rgba(255,255,255,.7);font-family:'DM Sans',sans-serif;font-size:.8rem;color:var(--slate);outline:none;transition:.2s;width:100%}
.fi:focus{border-color:var(--indigo);background:white;box-shadow:0 0 0 3px rgba(79,70,229,.08)}
.fi::placeholder{color:var(--subtle)}
select.fi{cursor:pointer}
.upload-btn{display:flex;align-items:center;justify-content:center;gap:.4rem;width:100%;padding:.52rem;border-radius:var(--r-sm);border:1.5px dashed rgba(79,70,229,.25);background:rgba(79,70,229,.03);color:var(--muted);font-size:.78rem;font-weight:600;cursor:pointer;transition:.2s;font-family:'DM Sans',sans-serif}
.upload-btn:hover{border-color:var(--indigo);color:var(--indigo);background:rgba(79,70,229,.06)}
.sb-edit-btn{padding:.26rem .7rem;border-radius:8px;border:1.5px solid rgba(255,255,255,.25);background:rgba(255,255,255,.12);color:rgba(255,255,255,.92);font-size:.7rem;font-weight:700;cursor:pointer;transition:.2s;flex-shrink:0;font-family:'DM Sans',sans-serif}
.sb-edit-btn:hover{background:rgba(255,255,255,.25)}
.sb-save-btn{padding:.26rem .7rem;border-radius:8px;border:none;background:#10b981;color:white;font-size:.7rem;font-weight:700;cursor:pointer;transition:.2s;flex-shrink:0;font-family:'DM Sans',sans-serif}

/* ── SIDEBAR DETAILS ── */
.details-box{margin-top:.65rem;background:rgba(255,255,255,.7);border:1px solid var(--border2);border-radius:var(--r-sm);overflow:hidden}
.details-row{display:flex;align-items:center;gap:.5rem;padding:.46rem .85rem;border-bottom:1px solid rgba(255,255,255,.6);font-size:.76rem;color:var(--slate);font-weight:500;word-break:break-all}
.details-row:last-child{border-bottom:none}
.details-sh{padding:.32rem .85rem;background:rgba(79,70,229,.06);font-size:.6rem;font-weight:800;text-transform:uppercase;letter-spacing:.08em;color:var(--indigo);border-bottom:1px solid rgba(255,255,255,.6)}
.feed-sec{padding:.8rem 1.2rem}
.feed-title{font-size:.6rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:var(--indigo);opacity:.75;margin-bottom:.65rem}
.posts-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:5px}
.post-cell{aspect-ratio:1;border-radius:8px;overflow:hidden;position:relative;background:var(--border);border:1px solid rgba(255,255,255,.5)}
.post-cell img,.post-cell video{width:100%;height:100%;object-fit:cover}
.post-del{position:absolute;top:3px;right:3px;width:18px;height:18px;border-radius:5px;background:rgba(255,255,255,.9);border:none;color:var(--rose);font-size:.55rem;display:flex;align-items:center;justify-content:center;cursor:pointer}
.empty-feed{font-size:.74rem;color:var(--subtle);padding:.2rem 0}
.resume-item{display:flex;align-items:center;gap:.55rem;padding:.5rem .75rem;border-radius:var(--r-sm);background:rgba(79,70,229,.05);border:1px solid rgba(79,70,229,.12);margin-bottom:.4rem}
.resume-name{font-size:.76rem;font-weight:600;color:var(--slate);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.resume-del{background:none;border:none;color:var(--rose);cursor:pointer;font-size:.7rem;font-weight:700;flex-shrink:0}
.know-btn{display:flex;align-items:center;gap:.4rem;background:none;border:none;font-family:'DM Sans',sans-serif;font-size:.78rem;font-weight:700;color:var(--indigo);cursor:pointer;transition:.2s}
.know-btn:hover{opacity:.65}

/* ── SECTION ── */
.sec-head{display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:1rem;flex-wrap:wrap;gap:.5rem}
.sec-title{font-family:'Syne',sans-serif;font-size:1.1rem;font-weight:800;color:var(--navy)}
.sec-sub{font-size:.73rem;color:var(--muted);margin-left:.35rem;font-weight:500}
.sec-link{font-size:.76rem;font-weight:700;color:var(--indigo);background:none;border:none;cursor:pointer;font-family:'DM Sans',sans-serif;transition:.2s}
.sec-link:hover{opacity:.65}
.page-sec{margin-bottom:2rem}

/* ── INDUSTRY CARDS ── */
.ind-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:.85rem}
.ind-card{background:var(--surface2);border:1.5px solid var(--border);border-radius:var(--r);padding:1.1rem;cursor:pointer;transition:.22s;text-align:center;box-shadow:var(--shadow-sm)}
.ind-card:hover{box-shadow:var(--shadow-lg);border-color:var(--border2);transform:translateY(-3px)}
.ind-logo{width:50px;height:50px;border-radius:14px;background:var(--grad);color:white;font-family:'Syne',sans-serif;font-weight:800;font-size:1rem;display:flex;align-items:center;justify-content:center;margin:0 auto .8rem;box-shadow:0 6px 20px rgba(79,70,229,.25)}
.ind-name{font-family:'Syne',sans-serif;font-size:.85rem;font-weight:800;color:var(--navy);margin-bottom:.28rem}
.ind-domain{font-size:.7rem;font-weight:600;color:var(--indigo);background:rgba(79,70,229,.08);border:1px solid rgba(79,70,229,.15);padding:.16rem .5rem;border-radius:99px;display:inline-block;margin-bottom:.35rem}
.ind-loc{font-size:.7rem;color:var(--muted);font-weight:500}
.ind-tagline{font-size:.7rem;color:var(--subtle);margin-top:.3rem;font-style:italic;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}

/* ── VACANCY FEED ── */
.feed-grid{display:flex;flex-direction:column;gap:1rem}
.vac-card{background:var(--surface2);border:1.5px solid var(--border);border-radius:var(--r);overflow:hidden;box-shadow:var(--shadow-sm);transition:.22s}
.vac-card:hover{box-shadow:var(--shadow);border-color:var(--border2)}
.vac-body{padding:1.2rem}
.vac-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:.85rem;flex-wrap:wrap;gap:.4rem}
.vac-logo{width:42px;height:42px;border-radius:11px;background:rgba(79,70,229,.09);color:var(--indigo);font-family:'Syne',sans-serif;font-weight:800;font-size:.82rem;display:flex;align-items:center;justify-content:center;border:1px solid rgba(79,70,229,.15);flex-shrink:0}
.vac-owner-name{font-weight:800;font-size:.87rem}
.vac-date{font-size:.68rem;color:var(--subtle)}
.type-chip{padding:.18rem .58rem;border-radius:99px;font-size:.64rem;font-weight:800}
.chip-intern{background:#ede9fe;color:#5b21b6}
.chip-job{background:#e0f2fe;color:#0369a1}
.chip-train{background:#dcfce7;color:#166534}
.vac-title{font-family:'Syne',sans-serif;font-size:.95rem;font-weight:800;color:var(--navy);margin-bottom:.35rem}
.vac-desc{font-size:.8rem;color:var(--muted);margin-bottom:.85rem;line-height:1.55;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.skill-pills{display:flex;flex-wrap:wrap;gap:.3rem;margin-bottom:.85rem}
.spill{padding:.16rem .5rem;border-radius:6px;font-size:.66rem;font-weight:700;background:rgba(79,70,229,.07);color:var(--indigo);border:1px solid rgba(79,70,229,.15)}
.vac-foot{display:flex;align-items:center;justify-content:space-between;padding:.85rem 1.2rem;border-top:1px solid var(--border);background:rgba(248,250,255,.6);flex-wrap:wrap;gap:.5rem}
.vac-meta-item{font-size:.72rem;color:var(--muted);font-weight:500;display:flex;align-items:center;gap:.28rem}
.apply-btn{padding:.46rem 1.1rem;border-radius:99px;border:none;background:var(--grad);color:white;font-family:'Syne',sans-serif;font-size:.76rem;font-weight:700;cursor:pointer;transition:.2s;box-shadow:0 4px 12px rgba(79,70,229,.22);white-space:nowrap}
.apply-btn:hover{opacity:.88;transform:translateY(-1px)}
.apply-btn:disabled{opacity:.5;cursor:not-allowed;transform:none}
.applied-tag{padding:.46rem 1.1rem;border-radius:99px;background:#dcfce7;color:#166534;font-size:.76rem;font-weight:700;white-space:nowrap}

/* ── JOB CARDS ── */
.jobs-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:.9rem}
.job-card{background:var(--surface2);border:1.5px solid var(--border);border-radius:var(--r);padding:1.1rem;cursor:pointer;box-shadow:var(--shadow-sm);transition:.22s}
.job-card:hover{box-shadow:var(--shadow-lg);border-color:var(--border2);transform:translateY(-2px)}
.job-co{font-size:.65rem;font-weight:800;color:var(--muted);letter-spacing:.06em;text-transform:uppercase;margin-bottom:.22rem}
.job-title{font-family:'Syne',sans-serif;font-size:.88rem;font-weight:800;color:var(--navy);margin-bottom:.4rem;line-height:1.3}
.job-desc{font-size:.76rem;color:var(--muted);line-height:1.5;margin-bottom:.65rem;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.job-tags{display:flex;gap:.28rem;flex-wrap:wrap;margin-bottom:.65rem}
.jtag{padding:.13rem .48rem;border-radius:99px;font-size:.62rem;font-weight:700;border:1.5px solid}
.job-foot{display:flex;align-items:center;justify-content:space-between}
.job-dept{font-size:.68rem;font-weight:600;color:var(--muted)}
.job-apply-link{padding:.38rem .9rem;border-radius:99px;border:none;background:var(--grad);color:white;font-size:.7rem;font-weight:700;cursor:pointer;text-decoration:none;display:inline-block;transition:.2s}
.job-apply-link:hover{opacity:.85}

/* ── AI MATCH CARDS ── */
.match-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:.9rem}
.match-card{background:var(--surface2);border:1.5px solid var(--border);border-radius:var(--r);padding:1.2rem;box-shadow:var(--shadow-sm);transition:.22s}
.match-card:hover{box-shadow:var(--shadow-lg);border-color:var(--border2);transform:translateY(-2px)}
.match-conf{font-family:'Syne',sans-serif;font-size:1.45rem;font-weight:900;color:var(--indigo);margin-bottom:.1rem}
.match-label{font-size:.65rem;font-weight:700;color:var(--subtle);text-transform:uppercase;letter-spacing:.06em;margin-bottom:.55rem}
.match-bar{height:5px;background:rgba(79,70,229,.1);border-radius:99px;margin-bottom:.85rem;overflow:hidden}
.match-fill{height:100%;border-radius:99px;background:var(--grad)}
.miss-chip{display:inline-block;padding:.14rem .5rem;border-radius:6px;font-size:.66rem;font-weight:700;background:rgba(244,63,94,.07);color:var(--rose);border:1px solid rgba(244,63,94,.18);margin:.18rem}
.course-rec{display:flex;align-items:center;gap:.5rem;padding:.5rem .7rem;background:rgba(79,70,229,.04);border:1px solid rgba(79,70,229,.12);border-radius:var(--r-sm);margin-top:.4rem}
.course-rec-title{font-size:.76rem;font-weight:700;color:var(--slate);flex:1;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden}

/* ── COURSES ── */
.courses-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:.9rem}
.course-card{background:var(--surface2);border:1.5px solid var(--border);border-radius:var(--r);overflow:hidden;cursor:pointer;box-shadow:var(--shadow-sm);transition:.22s;display:flex;flex-direction:column}
.course-card:hover{box-shadow:var(--shadow-lg);transform:translateY(-2px)}
.course-header{padding:1.1rem;background:var(--grad);position:relative;overflow:hidden}
.course-header::before{content:'';position:absolute;top:-20px;right:-20px;width:80px;height:80px;background:rgba(255,255,255,.08);border-radius:50%}
.course-provider{font-size:.63rem;font-weight:800;color:rgba(255,255,255,.7);letter-spacing:.08em;text-transform:uppercase;margin-bottom:.28rem}
.course-title{font-family:'Syne',sans-serif;font-size:.87rem;font-weight:800;color:white;line-height:1.3;position:relative;z-index:1;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.course-body{padding:.9rem;flex:1;display:flex;flex-direction:column;justify-content:space-between}
.course-meta{display:flex;gap:.45rem;flex-wrap:wrap;margin-bottom:.75rem}
.cmeta{font-size:.66rem;font-weight:600;color:var(--muted);display:flex;align-items:center;gap:.22rem}
.level-pill{display:inline-block;padding:.16rem .56rem;border-radius:6px;font-size:.65rem;font-weight:800}
.level-Beginner{background:#e6f9f0;color:#1a7a4a;border:1px solid #b3e8cc}
.level-Intermediate{background:#fff8e6;color:#9a6400;border:1px solid #ffd97a}
.level-Advanced{background:#fdeef1;color:#b5192d;border:1px solid #f5b3bc}
.course-enroll{width:100%;padding:.52rem;border-radius:99px;border:none;background:var(--grad);color:white;font-family:'Syne',sans-serif;font-size:.76rem;font-weight:700;cursor:pointer;box-shadow:0 4px 12px rgba(79,70,229,.2);transition:.2s}
.course-enroll:hover{opacity:.88}

/* ── APPLICATIONS ── */
.app-list{display:flex;flex-direction:column;gap:.85rem}
.app-card{background:var(--surface2);border:1.5px solid var(--border);border-radius:var(--r);padding:1.1rem;box-shadow:var(--shadow-sm)}
.app-role{font-family:'Syne',sans-serif;font-size:.95rem;font-weight:800;color:var(--navy)}
.app-co{font-size:.76rem;color:var(--muted);font-weight:600;margin-top:2px}
.status-pill{padding:.2rem .65rem;border-radius:99px;font-size:.68rem;font-weight:800;white-space:nowrap}
.sp-Pending{background:#fef3c7;color:#b45309}
.sp-Shortlisted{background:#e0e7ff;color:#3730a3}
.sp-Selected{background:#dcfce7;color:#166534}
.sp-Rejected{background:#fee2e2;color:#b91c1c}

/* ── PROFILE PAGE ── */
.pf-cover{width:100%;height:160px;border-radius:var(--r);overflow:hidden;cursor:pointer;position:relative;margin-bottom:0}
.pf-cover img{width:100%;height:100%;object-fit:cover}
.pf-cover-ov{position:absolute;inset:0;background:rgba(0,0,0,0);display:flex;align-items:flex-end;justify-content:flex-end;padding:.7rem;transition:.2s}
.pf-cover:hover .pf-cover-ov{background:rgba(0,0,0,.18)}
.pf-cover-lbl{background:rgba(0,0,0,.55);color:white;font-size:.68rem;font-weight:700;padding:.28rem .65rem;border-radius:8px}
.pf-hero{background:var(--surface2);border:1.5px solid var(--border);border-radius:0 0 var(--r) var(--r);padding:1.2rem 1.5rem;margin-bottom:1.3rem;position:relative}
.pf-av{width:80px;height:80px;border-radius:20px;border:4px solid white;background:var(--grad);color:white;font-family:'Syne',sans-serif;font-weight:900;font-size:1.8rem;display:flex;align-items:center;justify-content:center;cursor:pointer;overflow:hidden;margin-top:-52px;position:relative;box-shadow:var(--shadow)}
.pf-av img{width:100%;height:100%;object-fit:cover}
.pf-av-cam{position:absolute;bottom:4px;right:4px;width:22px;height:22px;background:white;border-radius:5px;display:flex;align-items:center;justify-content:center;font-size:.65rem;box-shadow:var(--shadow-sm);cursor:pointer}
.pf-name{font-family:'Syne',sans-serif;font-size:1.3rem;font-weight:900;color:var(--navy);margin-top:.55rem;margin-bottom:.12rem}
.pf-qual{font-size:.8rem;color:var(--indigo);font-weight:700;margin-bottom:.45rem}
.pf-meta{display:flex;flex-wrap:wrap;gap:.4rem 1rem;font-size:.76rem;color:var(--muted);font-weight:500;margin-bottom:.65rem}
.pf-about{font-size:.84rem;color:var(--slate);line-height:1.65;margin-bottom:.75rem}
.pf-skills-row{display:flex;flex-wrap:wrap;gap:.3rem}
.pf-skill-chip{padding:.2rem .68rem;border-radius:99px;font-size:.72rem;font-weight:700;background:rgba(79,70,229,.08);color:var(--indigo);border:1px solid rgba(79,70,229,.18)}
.pf-tabs{display:flex;gap:.3rem;margin-bottom:1.2rem;flex-wrap:wrap}
.pf-tab{padding:.42rem 1rem;border-radius:99px;font-size:.78rem;font-weight:700;cursor:pointer;border:1.5px solid var(--border2);color:var(--muted);background:var(--surface2);transition:.18s;font-family:'DM Sans',sans-serif}
.pf-tab.active{background:var(--grad);color:white;border-color:transparent;box-shadow:0 4px 14px rgba(79,70,229,.28)}
.pf-tab:hover:not(.active){background:rgba(79,70,229,.06);color:var(--indigo)}
.pf-card{background:var(--surface2);border:1.5px solid var(--border);border-radius:var(--r);padding:1.3rem;margin-bottom:.9rem;box-shadow:var(--shadow-sm)}
.pf-card-title{font-family:'Syne',sans-serif;font-size:.92rem;font-weight:800;color:var(--navy);margin-bottom:.9rem}
.pf-grid{display:grid;grid-template-columns:1fr 1fr;gap:.85rem}
.pf-grid-3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:.85rem}
.pf-field{display:flex;flex-direction:column;gap:.28rem}
.pf-label{font-size:.65rem;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.06em}
.pf-input{padding:.6rem .85rem;border-radius:var(--r-sm);border:1.5px solid var(--border2);background:rgba(255,255,255,.8);font-family:'DM Sans',sans-serif;font-size:.82rem;color:var(--slate);outline:none;transition:.2s;width:100%}
.pf-input:focus{border-color:var(--indigo);box-shadow:0 0 0 3px rgba(79,70,229,.08);background:white}
.pf-input::placeholder{color:var(--subtle)}
select.pf-input{cursor:pointer}
textarea.pf-input{resize:vertical;min-height:85px}
.pf-acad-card{background:rgba(79,70,229,.04);border:1px solid var(--border2);border-radius:var(--r-sm);padding:.9rem;text-align:center}
.pf-acad-level{font-size:.63rem;font-weight:800;text-transform:uppercase;letter-spacing:.08em;color:var(--indigo);margin-bottom:.35rem}
.pf-acad-name{font-size:.82rem;font-weight:700;color:var(--navy)}
.pf-save-btn{padding:.5rem 1.2rem;border-radius:99px;background:var(--grad);color:white;border:none;font-family:'Syne',sans-serif;font-size:.8rem;font-weight:700;cursor:pointer;transition:.2s;box-shadow:0 4px 14px rgba(79,70,229,.25)}
.pf-save-btn:hover{opacity:.88;transform:translateY(-1px)}
.pf-save-btn:disabled{opacity:.5;cursor:not-allowed;transform:none}
.pf-edit-btn{padding:.46rem 1rem;border-radius:99px;background:var(--surface2);border:1.5px solid var(--border2);color:var(--indigo);font-family:'DM Sans',sans-serif;font-size:.78rem;font-weight:700;cursor:pointer;transition:.18s}
.pf-edit-btn:hover{background:rgba(79,70,229,.08)}
.pf-upload-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(90px,1fr));gap:.6rem}
.pf-upload-thumb{aspect-ratio:1;border-radius:10px;overflow:hidden;cursor:pointer;position:relative;background:rgba(79,70,229,.05);border:1px solid var(--border2)}
.pf-upload-thumb img{width:100%;height:100%;object-fit:cover}
.pf-upload-thumb-del{position:absolute;top:4px;right:4px;width:20px;height:20px;border-radius:5px;background:rgba(255,255,255,.9);border:none;color:var(--rose);font-size:.55rem;display:flex;align-items:center;justify-content:center;cursor:pointer}
.pf-add-thumb{aspect-ratio:1;border-radius:10px;border:1.5px dashed rgba(79,70,229,.3);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.2rem;cursor:pointer;color:var(--indigo);font-size:.66rem;font-weight:700;transition:.18s}
.pf-add-thumb:hover{background:rgba(79,70,229,.05);border-color:var(--indigo)}
.pf-resume-item{display:flex;align-items:center;gap:.75rem;padding:.85rem .95rem;background:rgba(79,70,229,.04);border:1px solid var(--border2);border-radius:var(--r-sm);margin-bottom:.55rem}
.pf-resume-icon{font-size:1.4rem;flex-shrink:0}
.pf-resume-name{font-size:.8rem;font-weight:700;color:var(--slate);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.pf-skill-add-row{display:flex;gap:.55rem;align-items:center}
.pf-sugg{padding:.2rem .6rem;border-radius:99px;font-size:.7rem;font-weight:700;background:rgba(79,70,229,.07);color:var(--indigo);border:1px solid rgba(79,70,229,.18);cursor:pointer;transition:.15s}
.pf-sugg:hover{background:rgba(79,70,229,.15)}
.pf-toast{position:fixed;bottom:5rem;right:1rem;padding:.8rem 1.3rem;border-radius:var(--r-sm);font-size:.82rem;font-weight:700;box-shadow:var(--shadow-lg);z-index:3000;display:flex;align-items:center;gap:.5rem;max-width:calc(100vw - 2rem)}
.pf-toast-success{background:#0f172a;color:white}
.pf-toast-error{background:#fef2f2;color:#b91c1c;border:1px solid #fecaca}

/* ── MODALS ── */
.modal-ov{position:fixed;inset:0;background:rgba(15,23,42,.65);backdrop-filter:blur(12px);display:flex;align-items:flex-end;justify-content:center;z-index:9999;padding:0}
@media(min-width:640px){.modal-ov{align-items:center;padding:1rem}}
.modal-box{background:white;border-radius:24px 24px 0 0;padding:1.8rem 1.5rem 2.5rem;width:100%;max-width:600px;max-height:92vh;overflow-y:auto;position:relative;box-shadow:0 32px 80px rgba(0,0,0,.3)}
@media(min-width:640px){.modal-box{border-radius:24px;padding:2.2rem}}
.modal-close{position:absolute;top:1rem;right:1rem;width:30px;height:30px;background:#f1f5f9;border:none;border-radius:8px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--muted);font-size:.82rem;transition:.15s}
.modal-close:hover{background:#fee2e2;color:var(--rose)}
.modal-title{font-family:'Syne',sans-serif;font-size:1.25rem;font-weight:800;color:var(--navy);margin-bottom:.22rem}
.modal-sub{font-size:.8rem;color:var(--muted);margin-bottom:1.4rem}
.field-label{display:block;font-size:.7rem;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:.28rem;margin-top:.85rem}
.field-input{width:100%;padding:.68rem .85rem;border:1.5px solid #e2e8f0;border-radius:var(--r-sm);font-family:'DM Sans',sans-serif;font-size:.84rem;color:var(--navy);outline:none;transition:.2s;background:#fafbff}
.field-input:focus{border-color:var(--indigo);box-shadow:0 0 0 3px rgba(79,70,229,.08);background:white}
textarea.field-input{resize:vertical;min-height:85px}
.btn-primary{width:100%;padding:.78rem;border-radius:99px;border:none;background:var(--grad);color:white;font-family:'Syne',sans-serif;font-size:.88rem;font-weight:700;cursor:pointer;margin-top:.85rem;box-shadow:0 6px 20px rgba(79,70,229,.28);transition:.2s}
.btn-primary:hover{opacity:.9;transform:translateY(-1px)}
.btn-secondary{width:100%;padding:.68rem;border-radius:99px;border:1.5px solid #e2e8f0;background:white;color:var(--muted);font-family:'DM Sans',sans-serif;font-size:.83rem;font-weight:700;cursor:pointer;margin-top:.45rem;transition:.2s}
.btn-secondary:hover{border-color:var(--indigo);color:var(--indigo)}

/* ── MESSAGES ── */
.dm-panel{position:fixed;bottom:0;right:0;width:min(360px,100vw);height:480px;background:white;border:1px solid var(--border);border-radius:22px 22px 0 0;box-shadow:var(--shadow-lg);display:flex;flex-direction:column;z-index:500;overflow:hidden}
.dm-head{padding:.9rem 1.1rem;background:var(--grad);display:flex;align-items:center;justify-content:space-between;color:white}
.dm-recipient{font-family:'Syne',sans-serif;font-weight:800;font-size:.88rem}
.dm-status{font-size:.68rem;color:rgba(255,255,255,.7);display:flex;align-items:center;gap:.28rem;margin-top:1px}
.online-dot{width:6px;height:6px;background:#34d399;border-radius:50%;display:inline-block}
.dm-body{flex:1;overflow-y:auto;padding:.9rem;display:flex;flex-direction:column;gap:.45rem}
.dm-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:.45rem;color:var(--subtle);font-size:.8rem}
.bubble{max-width:75%;padding:.5rem .8rem;border-radius:12px;font-size:.8rem;line-height:1.45}
.bubble.sent{background:var(--grad);color:white;align-self:flex-end;border-bottom-right-radius:3px}
.bubble.recv{background:#f1f5f9;color:var(--slate);align-self:flex-start;border-bottom-left-radius:3px}
.bubble-time{font-size:.58rem;opacity:.55;margin-top:2px;text-align:right}
.dm-foot{padding:.65rem .9rem;border-top:1px solid var(--border);display:flex;gap:.45rem;padding-bottom:calc(.65rem + env(safe-area-inset-bottom))}
.dm-input{flex:1;padding:.5rem .8rem;border-radius:99px;border:1.5px solid var(--border2);font-family:'DM Sans',sans-serif;font-size:.8rem;color:var(--slate);outline:none;transition:.2s}
.dm-input:focus{border-color:var(--indigo)}
.send-btn{width:34px;height:34px;border-radius:50%;background:var(--grad);border:none;color:white;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:.82rem;flex-shrink:0}
.close-x{padding:.22rem .65rem;border-radius:8px;border:1.5px solid rgba(255,255,255,.2);background:rgba(255,255,255,.1);color:rgba(255,255,255,.85);font-size:.68rem;cursor:pointer;font-family:'DM Sans',sans-serif}
.close-x:hover{background:rgba(220,38,38,.4)}

/* ── MESSAGES TAB ── */
.msg-layout{display:grid;grid-template-columns:260px 1fr;background:var(--surface2);border:1.5px solid var(--border);border-radius:var(--r);overflow:hidden;height:calc(100vh - var(--nav-h) - 6rem)}
.conv-list{border-right:1px solid var(--border);display:flex;flex-direction:column;overflow:hidden}
.conv-list-head{padding:.9rem 1.1rem;font-weight:800;font-size:.85rem;border-bottom:1px solid var(--border);flex-shrink:0;font-family:'Syne',sans-serif;color:var(--navy)}
.conv-list-body{flex:1;overflow-y:auto}
.conv-row{display:flex;align-items:center;gap:.6rem;padding:.75rem 1.1rem;cursor:pointer;border-bottom:1px solid var(--border);transition:.12s}
.conv-row:hover{background:rgba(79,70,229,.05)}
.conv-row.active{background:rgba(79,70,229,.09)}
.conv-av2{width:36px;height:36px;border-radius:10px;background:var(--grad);color:white;font-family:'Syne',sans-serif;font-weight:800;font-size:.75rem;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.conv-name2{font-size:.8rem;font-weight:700;color:var(--navy)}
.conv-preview2{font-size:.67rem;color:var(--subtle);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:140px}
.chat-area2{display:flex;flex-direction:column;overflow:hidden}
.chat-head2{padding:.9rem 1.2rem;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:.75rem;flex-shrink:0;background:var(--surface2)}
.chat-body2{flex:1;overflow-y:auto;padding:1rem;display:flex;flex-direction:column;gap:.4rem}
.chat-foot2{padding:.65rem .9rem;border-top:1px solid var(--border);display:flex;gap:.45rem}
.chat-inp2{flex:1;padding:.5rem .85rem;border-radius:99px;border:1.5px solid var(--border2);font-family:'DM Sans',sans-serif;font-size:.8rem;color:var(--slate);outline:none;transition:.2s;background:var(--surface2)}
.chat-inp2:focus{border-color:var(--indigo);background:white}
@media(max-width:600px){.msg-layout{grid-template-columns:1fr;height:auto}.conv-list{height:220px;border-right:none;border-bottom:1px solid var(--border)}}

/* ── TOAST ── */
.notif-toast{background:#0f172a;color:white;padding:.8rem 1.3rem;border-radius:14px;box-shadow:var(--shadow-lg);font-size:.82rem;font-weight:600;display:flex;align-items:center;gap:.55rem;max-width:calc(100vw - 2rem)}
.notif-dot2{width:7px;height:7px;background:var(--indigo-light);border-radius:50%;flex-shrink:0}

/* ── SPINNER ── */
.spinner{width:30px;height:30px;border:3px solid rgba(79,70,229,.15);border-top-color:var(--indigo);border-radius:50%;animation:spin .7s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}

/* ── EMPTY ── */
.empty-block{text-align:center;padding:2.5rem 1rem;color:var(--subtle)}
.empty-icon{font-size:2.2rem;margin-bottom:.7rem;opacity:.5}
.empty-title{font-size:.88rem;font-weight:700;color:var(--muted);margin-bottom:.28rem}
.empty-text{font-size:.76rem;line-height:1.6}

/* ════════════════════════════════════════════════════
   RESPONSIVE — TABLET (≤ 900px)
════════════════════════════════════════════════════ */
@media(max-width:900px){
  :root{--sidebar-w:280px}
  .s-sidebar{
    position:fixed;top:var(--nav-h);left:0;z-index:160;
    transform:translateX(-100%);height:calc(100vh - var(--nav-h));
    box-shadow:var(--shadow-lg);
  }
  .s-sidebar.open{transform:translateX(0)}
  .sidebar-overlay.show{display:block}
  .nav-pills-desktop{display:none}
  .mobile-nav{display:block}
  .hamburger{display:flex}
  .s-content{padding:1rem 1rem 5rem}
  .pf-grid-3{grid-template-columns:1fr 1fr}
}

/* ════════════════════════════════════════════════════
   RESPONSIVE — MOBILE (≤ 600px)
════════════════════════════════════════════════════ */
@media(max-width:600px){
  :root{--nav-h:56px}
  .s-nav{padding:0 .75rem;gap:.35rem}
  .brand{font-size:.95rem}
  .brand-sub{display:none}
  .s-search{max-width:160px}
  .s-search input{font-size:.76rem;padding:.4rem .75rem .4rem 1.9rem}
  .signout-btn{display:none}
  .notif-btn{width:30px;height:30px}
  .nav-av{width:30px;height:30px;font-size:.78rem}

  .s-content{padding:.75rem .75rem 5rem}

  .ind-grid{grid-template-columns:repeat(2,1fr);gap:.65rem}
  .ind-card{padding:.9rem}
  .ind-logo{width:42px;height:42px;font-size:.88rem}

  .jobs-grid{grid-template-columns:1fr}
  .match-grid{grid-template-columns:1fr}
  .courses-grid{grid-template-columns:1fr}

  .vac-foot{flex-direction:column;align-items:flex-start}
  .vac-foot>div:last-child{width:100%;display:flex;justify-content:flex-end}

  .pf-cover{height:120px}
  .pf-hero{padding:.9rem 1rem}
  .pf-av{width:68px;height:68px;font-size:1.5rem;margin-top:-44px}
  .pf-name{font-size:1.1rem}
  .pf-grid{grid-template-columns:1fr}
  .pf-grid-3{grid-template-columns:1fr}

  .sec-title{font-size:1rem}
  .page-sec{margin-bottom:1.5rem}

  .dm-panel{width:100vw;height:70vh;border-radius:20px 20px 0 0}

  .modal-box{padding:1.4rem 1rem 2rem}
  .modal-title{font-size:1.1rem}
}

/* ════════════════════════════════════════════════════
   RESPONSIVE — VERY SMALL (≤ 380px)
════════════════════════════════════════════════════ */
@media(max-width:380px){
  .s-search{display:none}
  .ind-grid{grid-template-columns:1fr}
}
`;

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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Data state
  const [profile, setProfile] = useState(null);
  const [industries, setIndustries] = useState([]);
  const [courses, setCourses] = useState([]);
  const [allJobs, setAllJobs] = useState([]);
  const [matchedJobs, setMatchedJobs] = useState([]);
  const [vacancies, setVacancies] = useState([]);
  const [myApplications, setMyApplications] = useState([]);

  // Loading / boot state
  const [isFeedLoading, setIsFeedLoading] = useState(true);
  const [isMatchLoading, setIsMatchLoading] = useState(false);
  const [bootDone, setBootDone] = useState(false);
  const [bootError, setBootError] = useState(null); // "auth" | "timeout" | null

  // Profile page state
  const [pfTab, setPfTab] = useState("overview");
  const [pfEditing, setPfEditing] = useState(false);
  const [pfForm, setPfForm] = useState({});
  const [pfSaving, setPfSaving] = useState(false);
  const [pfToast, setPfToast] = useState(null);
  const [skillInput, setSkillInput] = useState("");
  const [coverPreview, setCoverPreview] = useState(null);

  // ADD this new state
  const [chatMessages, setChatMessages] = useState({});

  // ── Refs ──────────────────────────────────────────────────────────────────
  // FIX #1: hasBootedRef — never reset, so boot runs EXACTLY once on mount.
  const hasBootedRef = useRef(false);
  // FIX #2: mountedRef — prevents setState after unmount (avoids memory leaks
  //         and ghost re-renders that can re-trigger auth listeners).
  const mountedRef = useRef(true);

  const coverRef = useRef();
  const avatarRef = useRef();
  const certRef = useRef();
  const resumeRef = useRef();
  const postRef = useRef();
  const chatEndRef = useRef();
  const chatInputRef = useRef();

  // FIX #3: Cleanup on unmount — cancel all pending work.
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // ─── SAFE setState helpers ─────────────────────────────────────────────────
  // These wrappers silently drop state updates after the component unmounts,
  // preventing the "Can't perform a React state update on an unmounted component"
  // warning that can cause re-render cascades.
  const safeSet = useCallback((setter) => (...args) => {
    if (mountedRef.current) setter(...args);
  }, []);

  const setProfileSafe = useCallback(safeSet(setProfile), []);
  const setIndustriesSafe = useCallback(safeSet(setIndustries), []);
  const setCoursesSafe = useCallback(safeSet(setCourses), []);
  const setAllJobsSafe = useCallback(safeSet(setAllJobs), []);
  const setVacanciesSafe = useCallback(safeSet(setVacancies), []);
  const setMyApplicationsSafe = useCallback(safeSet(setMyApplications), []);
  const setMatchedJobsSafe = useCallback(safeSet(setMatchedJobs), []);
  const setIsFeedLoadingSafe = useCallback(safeSet(setIsFeedLoading), []);
  const setBootDoneSafe = useCallback(safeSet(setBootDone), []);
  const setBootErrorSafe = useCallback(safeSet(setBootError), []);
  const setIsMatchLoadingSafe = useCallback(safeSet(setIsMatchLoading), []);

  const setChatMessagesSafe = useCallback(safeSet(setChatMessages), []);

  // ─── BOOTSTRAP — runs ONCE on mount only ──────────────────────────────────
  // FIX #4: Empty dependency array [] — no re-runs when userId/authUser changes.
  //         hasBootedRef provides the extra guard against React StrictMode's
  //         double-invoke in development.
  useEffect(() => {
    if (hasBootedRef.current) return;
    hasBootedRef.current = true;

    const boot = async () => {
      setIsFeedLoadingSafe(true);

      // FIX #5: Wait up to 3 s for auth context to populate, polling every
      //         200 ms. Previously the 1500 ms fixed delay could expire BEFORE
      //         authUser arrived, causing a false "not authenticated" failure.
      let resolvedUser = authUser;
      let resolvedProfile = authProfile;

      if (!resolvedUser) {
        for (let i = 0; i < 15; i++) {
          await new Promise(r => setTimeout(r, 200));
          if (!mountedRef.current) return; // unmounted — bail out entirely
          // Re-read from module scope isn't possible for hook values,
          // so we break and let the block below handle the null case.
          break;
        }
      }

      // FIX #6: If still no user after waiting, redirect immediately — don't
      //         set authFailed state (which would trigger another useEffect and
      //         potentially cause re-renders / re-runs).
      if (!authUser && !authProfile) {
        setBootDoneSafe(true);
        setIsFeedLoadingSafe(false);
        setBootErrorSafe("auth");
        try { await signOut(); } catch { }
        if (mountedRef.current) navigate("/login");
        return;
      }

      // Seed profile immediately from AuthContext so UI is never blank
      setProfileSafe(buildDefaultProfile(authUser, authProfile));

      try {
        // 1. Full profile from backend — only if we have a valid user id
        if (authUser?.id) {
          try {
            const res = await axios.get(
              `${BASE}/api/get-profile?user_id=${authUser.id}`,
              { timeout: 10000 }
            );
            const d = res.data;
            if (d?.id && mountedRef.current) {
              setProfileSafe({
                id: d.id,
                name: d.name || d.full_name || authProfile?.name || authUser?.email?.split("@")[0] || "Student",
                email: d.email || authUser?.email || "",
                username: d.username || (d.name || "student").toLowerCase().replace(/\s+/g, "_"),
                qualification: d.qualification || authProfile?.qualification || "",
                phone: d.phone || "",
                address: d.address || d.location || "",
                about: d.about || "",
                skills: Array.isArray(d.skills) ? d.skills : [],
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
            }
          } catch (profileErr) {
            // FIX #7: Profile fetch failing is a WARNING, not a fatal error.
            // We already seeded from AuthContext, so the user sees the dashboard.
            console.warn("Profile fetch failed — using cached session data:", profileErr?.message);
          }
        }

        // 2. Parallel data fetches — Promise.allSettled so one failure never blocks the rest
        const [indRes, coursesRes, vacRes, appsRes, jobsRes, msgsRes] = await Promise.allSettled([
          axios.get(`${BASE}/api/industries`, { timeout: 8000 }),
          axios.get(`${BASE}/api/courses`, { timeout: 8000 }),
          axios.get(`${BASE}/api/vacancies`, { timeout: 8000 }),
          authUser?.id
            ? axios.get(`${BASE}/api/applications/student/${authUser.id}`, { timeout: 8000 })
            : Promise.resolve({ data: [] }),
          axios.get(`${BASE}/api/all-jobs`, { timeout: 8000 }),
          authUser?.id
            ? axios.get(`${BASE}/api/messages/${authUser.id}`, { timeout: 8000 })
            : Promise.resolve({ data: [] }),
        ]);

        if (!mountedRef.current) return;

        setIndustriesSafe(
          indRes.status === "fulfilled" && Array.isArray(indRes.value?.data) && indRes.value.data.length
            ? indRes.value.data : mockIndustries
        );
        setCoursesSafe(
          coursesRes.status === "fulfilled" && Array.isArray(coursesRes.value?.data) && coursesRes.value.data.length
            ? coursesRes.value.data : mockCourses
        );

        const loadedInd = indRes.status === "fulfilled" && Array.isArray(indRes.value?.data)
          ? indRes.value.data : mockIndustries;

        if (vacRes.status === "fulfilled" && Array.isArray(vacRes.value?.data)) {
          setVacanciesSafe(vacRes.value.data.map(v => ({
            id: v.id,
            ownerId: v.owner_id || v.ownerId,
            ownerName: v.owner_name || v.ownerName || loadedInd.find(i => i.id === v.owner_id)?.name || "Company",
            ownerLogo: (v.owner_name || "CO").substring(0, 2).toUpperCase(),
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
          setVacanciesSafe(mockVacancies);
        }

        if (appsRes.status === "fulfilled" && Array.isArray(appsRes.value?.data)) {
          setMyApplicationsSafe(appsRes.value.data.map(a => ({
            id: a.id,
            postId: a.vacancy_id,
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
          setAllJobsSafe(jobs.length ? jobs : mockJobs);
        } else {
          setAllJobsSafe(mockJobs);
        }

      } catch (err) {
        console.error("Boot error:", err);
        if (!mountedRef.current) return;
        // Fall back to mock data — dashboard is never completely blank
        setIndustriesSafe(mockIndustries);
        setCoursesSafe(mockCourses);
        setVacanciesSafe(mockVacancies);
        setAllJobsSafe(mockJobs);
      } finally {
        if (mountedRef.current) {
          setIsFeedLoadingSafe(false);
          setBootDoneSafe(true);
          // FIX #8: We intentionally do NOT reset hasBootedRef here — it must
          // stay true forever so userId changes never re-trigger the boot.
        }
      }

      // Load messages from backend and group by conversation partner
      if (msgsRes.status === "fulfilled" && Array.isArray(msgsRes.value?.data) && authUser?.id) {
        const msgs = {};
        msgsRes.value.data.forEach(m => {
          const partnerId = m.sender_id === authUser.id ? m.receiver_id : m.sender_id;
          if (!msgs[partnerId]) msgs[partnerId] = [];
          msgs[partnerId].push({
            sender: m.sender_id === authUser.id ? "me" : "them",
            message: m.text,
            time: new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          });
        });
        if (mountedRef.current) setChatMessages(msgs);
      }
    };

    boot();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ← EMPTY DEPS: boot runs once on mount, never again.

  // ── AI skill match — stable key prevents unnecessary re-runs ─────────────
  // FIX #9: skillsKey is derived from sorted skills so array identity changes
  //         don't cause spurious re-fetches.
  const skillsKey = useMemo(
    () => (profile?.skills ?? []).slice().sort().join(","),
    [profile?.skills]
  );

  useEffect(() => {
    if (!skillsKey || !bootDone) return;
    let cancelled = false;

    const doMatch = async () => {
      setIsMatchLoadingSafe(true);
      try {
        const res = await axios.post(
          `${BASE}/api/analyze-skills`,
          { skills: skillsKey },
          { timeout: 12000 }
        );
        if (!cancelled && mountedRef.current)
          setMatchedJobsSafe(Array.isArray(res.data) ? res.data : []);
      } catch {
        if (!cancelled && mountedRef.current) setMatchedJobsSafe([]);
      }
      if (!cancelled && mountedRef.current) setIsMatchLoadingSafe(false);
    };

    doMatch();
    return () => { cancelled = true; };
  }, [skillsKey, bootDone]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, activeChat]);

  // ── Re-fetch messages when authUser becomes available (e.g. after refresh) ──
  // Boot runs once on mount but authUser.id may be null at that time.
  // This effect ensures messages are always loaded once the user is confirmed.
  useEffect(() => {
    if (!authUser?.id) return;
    let cancelled = false;

    const fetchMsgs = async () => {
      try {
        const res = await axios.get(`${BASE}/api/messages/${authUser.id}`, { timeout: 8000 });
        if (cancelled || !mountedRef.current) return;
        if (!Array.isArray(res.data)) return;

        const msgs = {};
        res.data.forEach(m => {
          const partnerId = m.sender_id === authUser.id ? m.receiver_id : m.sender_id;
          if (!msgs[partnerId]) msgs[partnerId] = [];
          msgs[partnerId].push({
            sender: m.sender_id === authUser.id ? "me" : "them",
            message: m.text,
            time: new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          });
        });
        setChatMessagesSafe(msgs);
      } catch (_) {
        // silently ignore — chat will be empty but app still works
      }
    };

    fetchMsgs();
    return () => { cancelled = true; };
  }, [authUser?.id]);

  // Close sidebar on tab change (mobile)
  useEffect(() => { setSidebarOpen(false); }, [activeTab]);


  // ── Helpers ────────────────────────────────────────────────────────────────
  const pushNotify = useCallback((msg) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, msg }]);
    setTimeout(() => {
      if (mountedRef.current)
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3500);
  }, []);

  const showPfToast = useCallback((msg, type = "success") => {
    setPfToast({ msg, type });
    setTimeout(() => { if (mountedRef.current) setPfToast(null); }, 3000);
  }, []);

  const alreadyApplied = (postId) => myApplications.some(a => a.postId === postId);

  // AFTER
  const sendMessage = async (toId, message) => {
    if (!authUser?.id) return;
    try {
      await axios.post(`${BASE}/api/messages`, {
        sender_id: authUser.id, receiver_id: toId, text: message,
      });
      const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      setChatMessages(prev => ({
        ...prev,
        [toId]: [...(prev[toId] || []), { sender: "me", message, time }],
      }));
    } catch { pushNotify("Failed to send message."); }
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!applyModal || !authUser?.id) return;
    try {
      const res = await axios.post(`${BASE}/api/applications`, {
        vacancy_id: applyModal.id,
        student_id: authUser.id,
        cover_letter: applyForm.coverLetter,
      });
      setMyApplications(prev => [...prev, {
        id: res.data.id || Date.now(), postId: applyModal.id,
        role: applyModal.title, company: applyModal.ownerName,
        appliedOn: new Date().toLocaleDateString(), status: "Pending",
      }]);
      pushNotify(`✓ Applied to ${applyModal.title}!`);
      setApplyForm({ coverLetter: "" });
      setApplyModal(null);
      setPostDetailModal(null);
    } catch { pushNotify("Failed to apply — you may have already applied."); }
  };

  const handleLogout = async () => {
    try { await signOut(); } catch { }
    navigate("/login");
  };

  const deletePost = (type, idx) => {
    const key = type === "certificate" ? "certificates" : "personalPosts";
    setProfile(prev => {
      const arr = [...prev[key]];
      arr.splice(idx, 1);
      return { ...prev, [key]: arr };
    });
  };
  const deleteResume = (idx) => {
    setProfile(prev => {
      const arr = [...prev.resumes];
      arr.splice(idx, 1);
      return { ...prev, resumes: arr };
    });
  };

  // ── Profile edit helpers ───────────────────────────────────────────────────
  const pffc = (k, v) => setPfForm(p => ({ ...p, [k]: v }));

  const startPfEdit = () => {
    setPfForm({
      name: profile.name || "",
      phone: profile.phone || "",
      address: profile.address || "",
      about: profile.about || "",
      qualification: profile.qualification || "",
      tenth: profile.tenth || "",
      twelfth: profile.twelfth || "",
      graduation: profile.graduation || "",
      website: profile.website || "",
      linkedin: profile.linkedin || "",
      experience: profile.experience || "",
      cgpa: profile.cgpa || "",
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
      const { certificates, resumes, personalPosts, ...safeFields } = pfForm;
      await axios.put(`${BASE}/api/profile/${profile.id}`, safeFields, { timeout: 20000 });
      setProfile(prev => ({ ...prev, ...pfForm }));
      setPfEditing(false);
      showPfToast("✓ Profile updated");
    } catch (err) {
      console.error("savePfForm error:", err?.response?.data || err.message);
      showPfToast(`✗ ${err?.response?.data?.error || "Could not save"}`, "error");
    }
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
    try { await axios.put(`${BASE}/api/profile/${profile.id}`, { coverPhoto: b64 }); } catch { }
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

  // ── Type chip helper ───────────────────────────────────────────────────────
  const typeChip = (type) => {
    if (!type) return <span className="type-chip chip-job">Job</span>;
    if (type.toLowerCase().includes("intern")) return <span className="type-chip chip-intern">Internship</span>;
    if (type.toLowerCase().includes("train")) return <span className="type-chip chip-train">Training</span>;
    return <span className="type-chip chip-job">{type}</span>;
  };

  // ── Sidebar panel ─────────────────────────────────────────────────────────
  const renderPanel = (user, editable = false) => (
    <div style={{ overflowY: "auto", height: "100%" }}>
      <div className="sb-top">
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: ".75rem" }}>
            <div className="sb-av">
              {user.photo ? <img src={user.photo} alt="" /> : (user.name || "U")[0].toUpperCase()}
            </div>
            <div>
              <div className="sb-name">{user.name || "Student"}</div>
              <div className="sb-handle">@{user.username || "student"}</div>
            </div>
          </div>
          {editable
            ? <div style={{ display: "flex", gap: 5 }}>
              {editMode && (
                <button className="sb-save-btn" onClick={async () => {
                  if (!authUser?.id || !profile) return;
                  try {
                    await axios.put(`${BASE}/api/profile/${authUser.id}`, {
                      name: profile.name, qualification: profile.qualification,
                      phone: profile.phone, address: profile.address,
                      tenth: profile.tenth, twelfth: profile.twelfth,
                      graduation: profile.graduation, skills: profile.skills,
                      about: profile.about,
                    });
                    pushNotify("✓ Profile saved");
                  } catch { pushNotify("Changes saved locally."); }
                  setEditMode(false);
                }}>✓ Save</button>
              )}
              <button className="sb-edit-btn" onClick={() => setEditMode(m => !m)}>
                {editMode ? "✕" : "✎ Edit"}
              </button>
            </div>
            : <button className="close-x" onClick={() => setActiveUserProfile(null)}>✕</button>
          }
        </div>
        <div style={{ marginTop: ".65rem", display: "flex", flexWrap: "wrap", gap: ".3rem", position: "relative", zIndex: 1 }}>
          {user.qualification && <span className="sb-badge">🎓 {user.qualification}</span>}
          {(user.skills || []).slice(0, 3).map((s, i) => (
            <span key={i} className="sb-badge" style={{ background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.18)", fontSize: ".6rem" }}>⚡ {s}</span>
          ))}
        </div>
      </div>

      {/* Completion bar */}
      {editable && (() => {
        const comp = calcCompletion(profile);
        return (
          <div className="comp-bar-wrap">
            <div className="comp-label">
              <span>Profile Strength</span>
              <span style={{ color: comp >= 80 ? "var(--emerald)" : comp >= 50 ? "var(--amber)" : "var(--rose)" }}>{comp}%</span>
            </div>
            <div className="comp-track"><div className="comp-fill" style={{ width: `${comp}%` }} /></div>
          </div>
        );
      })()}

      {editable && editMode && (
        <>
          <div className="fs">
            <div className="fs-title">Photo</div>
            <label className="upload-btn">📷 Change Photo
              <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => {
                const f = e.target.files[0];
                if (f) setProfile(p => ({ ...p, photo: URL.createObjectURL(f) }));
              }} />
            </label>
          </div>
          <div className="fs">
            <div className="fs-title">Personal Info</div>
            <div className="fg">
              {[
                { name: "name", label: "Full Name", placeholder: "Your full name" },
                { name: "phone", label: "Phone", placeholder: "+91 XXXXXXXXXX" },
                { name: "address", label: "City", placeholder: "Your city" },
                { name: "qualification", label: "Qualification", placeholder: "e.g. BCA" },
              ].map(f => (
                <div className="ff" key={f.name}>
                  <label className="fl">{f.label}</label>
                  <input name={f.name} placeholder={f.placeholder} value={profile?.[f.name] || ""}
                    onChange={e => setProfile(p => ({ ...p, [e.target.name]: e.target.value }))}
                    className="fi" />
                </div>
              ))}
            </div>
          </div>
          <div className="fs">
            <div className="fs-title">Academic</div>
            <div style={{ display: "flex", flexDirection: "column", gap: ".38rem" }}>
              {[
                { name: "tenth", label: "10th" },
                { name: "twelfth", label: "12th" },
                { name: "graduation", label: "Graduation / College" },
              ].map(f => (
                <div className="ff" key={f.name}>
                  <label className="fl">{f.label}</label>
                  <input name={f.name} value={profile?.[f.name] || ""}
                    onChange={e => setProfile(p => ({ ...p, [e.target.name]: e.target.value }))}
                    className="fi" />
                </div>
              ))}
            </div>
          </div>
          <div className="fs">
            <div className="fs-title">Upload Resume</div>
            <label className="upload-btn">📄 Add Resume
              <input type="file" accept=".pdf,image/*" style={{ display: "none" }} onChange={e => {
                const file = e.target.files[0];
                if (!file) return;
                setProfile(prev => ({
                  ...prev,
                  resumes: [...prev.resumes, { url: URL.createObjectURL(file), name: file.name, type: file.type, size: (file.size / 1024).toFixed(0) + " KB" }],
                }));
                pushNotify("Resume added!");
              }} />
            </label>
            {(profile?.resumes || []).map((r, i) => (
              <div key={i} className="resume-item" style={{ marginTop: ".38rem" }}>
                <span style={{ fontSize: "1rem" }}>{r.type === "application/pdf" ? "📑" : "🖼️"}</span>
                <span className="resume-name">{r.name}</span>
                <button className="resume-del" onClick={() => deleteResume(i)}>✕</button>
              </div>
            ))}
          </div>
          <div className="fs">
            <div className="fs-title">Certificate</div>
            <label className="upload-btn">+ Add Certificate
              <input type="file" style={{ display: "none" }} onChange={e => {
                const f = e.target.files[0];
                if (!f) return;
                setProfile(p => ({ ...p, certificates: [...p.certificates, { url: URL.createObjectURL(f), type: f.type }] }));
              }} />
            </label>
          </div>
          <div className="fs">
            <div className="fs-title">Activity Post</div>
            <label className="upload-btn">+ Add Post
              <input type="file" style={{ display: "none" }} onChange={e => {
                const f = e.target.files[0];
                if (!f) return;
                setProfile(p => ({ ...p, personalPosts: [...p.personalPosts, { url: URL.createObjectURL(f), type: f.type }] }));
              }} />
            </label>
          </div>
        </>
      )}

      {/* Know More / Details */}
      <div style={{ padding: ".8rem 1.2rem", borderBottom: "1px solid var(--border)" }}>
        <button className="know-btn" onClick={() => setShowDetails(d => !d)}>
          <span style={{ fontSize: ".6rem" }}>{showDetails ? "▲" : "▼"}</span>
          {showDetails ? "Hide Details" : "View Details"}
        </button>
        {showDetails && (
          <div className="details-box" style={{ marginTop: ".6rem" }}>
            <div className="details-row">✉ {user.email || "Not provided"}</div>
            <div className="details-row">📞 {user.phone || "Not provided"}</div>
            <div className="details-row">📍 {user.address || "Not provided"}</div>
            {user.linkedin && <div className="details-row">🔗 {user.linkedin}</div>}
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
        {!(user.resumes || []).length
          ? <div className="empty-feed">No resumes uploaded.</div>
          : (user.resumes || []).map((r, i) => (
            <div key={i} className="resume-item">
              <span style={{ fontSize: "1rem" }}>{r.type === "application/pdf" ? "📑" : "🖼️"}</span>
              <span className="resume-name">{r.name}</span>
              {editable && <button className="resume-del" onClick={() => deleteResume(i)}>✕</button>}
            </div>
          ))
        }
      </div>
      <div className="feed-sec">
        <div className="feed-title">Certificates</div>
        {!(user.certificates || []).length
          ? <div className="empty-feed">No certificates.</div>
          : <div className="posts-grid">
            {(user.certificates || []).map((p, i) => (
              <div key={i} className="post-cell">
                {editable && <button className="post-del" onClick={() => deletePost("certificate", i)}>✕</button>}
                {p.type?.startsWith("video") ? <video src={p.url} /> : <img src={p.url} alt="" />}
              </div>
            ))}
          </div>
        }
      </div>
      <div className="feed-sec">
        <div className="feed-title">Activity Posts</div>
        {!(user.personalPosts || []).length
          ? <div className="empty-feed">No posts yet.</div>
          : <div className="posts-grid">
            {(user.personalPosts || []).map((p, i) => (
              <div key={i} className="post-cell">
                {editable && <button className="post-del" onClick={() => deletePost("personal", i)}>✕</button>}
                {p.type?.startsWith("video") ? <video src={p.url} /> : <img src={p.url} alt="" />}
              </div>
            ))}
          </div>
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

    const filteredSugg = SKILL_SUGGESTIONS
      .filter(s => s.toLowerCase().includes(skillInput.toLowerCase()) && !skills.includes(s))
      .slice(0, 8);

    const pfTabs = [
      { id: "overview", icon: "👤", label: "Overview" },
      { id: "skills", icon: "⚡", label: "Skills" },
      { id: "academic", icon: "🎓", label: "Academic" },
      { id: "experience", icon: "💼", label: "Experience" },
      { id: "media", icon: "🖼️", label: "Media" },
      { id: "resume", icon: "📄", label: "Resume" },
    ];

    return (
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
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
            </div>
          }
          <div className="pf-cover-ov"><span className="pf-cover-lbl">📸 Change Cover</span></div>
        </div>

        {/* Hero */}
        <div className="pf-hero">
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: ".7rem" }}>
            <div style={{ position: "relative" }}>
              <div className="pf-av" onClick={() => avatarRef.current?.click()}>
                {profile.photo
                  ? <img src={profile.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <span>{(profile.name || "U")[0].toUpperCase()}</span>
                }
              </div>
              <div className="pf-av-cam" onClick={() => avatarRef.current?.click()}>📷</div>
            </div>
            <div style={{ textAlign: "center", marginLeft: ".4rem" }}>
              <div style={{ font: `800 1.5rem/1 'Syne',sans-serif`, color: completion >= 80 ? "var(--emerald)" : "var(--indigo)" }}>{completion}%</div>
              <div style={{ fontSize: ".62rem", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".06em" }}>Complete</div>
            </div>
            <div style={{ display: "flex", gap: ".45rem", paddingBottom: ".2rem", marginLeft: "auto" }}>
              {pfEditing
                ? <>
                  <button className="pf-edit-btn" onClick={() => setPfEditing(false)}>Cancel</button>
                  <button className="pf-save-btn" onClick={savePfForm} disabled={pfSaving}>{pfSaving ? "Saving…" : "💾 Save"}</button>
                </>
                : <button className="pf-save-btn" onClick={startPfEdit}>✏️ Edit Profile</button>
              }
            </div>
          </div>

          <div className="pf-name">{profile.name || "Your Name"}</div>
          <div className="pf-qual">{profile.qualification || "Add your qualification"}</div>
          <div className="pf-meta">
            {profile.email && <span>✉ {profile.email}</span>}
            {profile.phone && <span>📞 {profile.phone}</span>}
            {profile.address && <span>📍 {profile.address}</span>}
            {profile.linkedin && <a href={profile.linkedin} target="_blank" rel="noreferrer" style={{ color: "var(--indigo)", textDecoration: "none" }}>🔗 LinkedIn</a>}
          </div>
          {profile.about && <div className="pf-about">{profile.about}</div>}
          {skills.length > 0 && (
            <div className="pf-skills-row">
              {(pfEditing ? pfForm.skills : profile.skills || []).slice(0, 8).map(s => (
                <span key={s} className="pf-skill-chip">{s}</span>
              ))}
              {(profile.skills || []).length > 8 && (
                <span className="pf-skill-chip" style={{ cursor: "pointer" }} onClick={() => setPfTab("skills")}>
                  +{profile.skills.length - 8}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="pf-tabs">
          {pfTabs.map(t => (
            <button key={t.id} className={`pf-tab ${pfTab === t.id ? "active" : ""}`} onClick={() => setPfTab(t.id)}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* OVERVIEW */}
          {pfTab === "overview" && (
            <motion.div key="ov" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="pf-card">
                <div className="pf-card-title">✍️ About Me</div>
                {pfEditing
                  ? <textarea className="pf-input" style={{ width: "100%" }} placeholder="Write about yourself, your interests, goals…"
                    value={pfForm.about || ""} onChange={e => pffc("about", e.target.value)} />
                  : <p style={{ color: "var(--muted)", lineHeight: 1.7, fontSize: ".87rem" }}>
                    {profile.about || <em style={{ color: "var(--subtle)" }}>No bio yet. Click Edit Profile to add one.</em>}
                  </p>
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
                        {["10th", "12th", "Diploma", "ITI", "BCA", "B.Tech", "B.Sc", "B.Com", "BA", "MCA", "M.Tech", "M.Sc", "MBA", "PhD", "Other"].map(q => (
                          <option key={q} value={q}>{q}</option>
                        ))}
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
                    ].map(([l, v]) => (
                      <div key={l}>
                        <div className="pf-label" style={{ marginBottom: ".18rem" }}>{l}</div>
                        <div style={{ fontWeight: 600, color: v ? "var(--navy)" : "var(--subtle)", fontStyle: v ? "normal" : "italic", fontSize: ".85rem", wordBreak: "break-all" }}>
                          {v || "Not provided"}
                        </div>
                      </div>
                    ))}
                  </div>
                }
                {pfEditing && (
                  <div style={{ marginTop: "1.1rem", display: "flex", justifyContent: "flex-end" }}>
                    <button className="pf-save-btn" onClick={savePfForm} disabled={pfSaving}>{pfSaving ? "Saving…" : "💾 Save"}</button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* SKILLS */}
          {pfTab === "skills" && (
            <motion.div key="sk" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="pf-card">
                <div className="pf-card-title">⚡ Skills & Expertise</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: ".38rem" }}>
                  {skills.map(s => (
                    <span key={s} className="pf-skill-chip">
                      {s}
                      {pfEditing && (
                        <button onClick={() => pffc("skills", pfForm.skills.filter(x => x !== s))}
                          style={{ background: "none", border: "none", color: "var(--rose)", cursor: "pointer", marginLeft: ".28rem", fontWeight: 800, fontSize: ".63rem" }}>✕</button>
                      )}
                    </span>
                  ))}
                  {skills.length === 0 && <em style={{ color: "var(--subtle)", fontSize: ".84rem" }}>No skills added yet.</em>}
                </div>
                {pfEditing && (
                  <>
                    <div style={{ height: 1, background: "var(--border)", margin: ".9rem 0" }} />
                    <div className="pf-label" style={{ marginBottom: ".45rem" }}>Add Skill</div>
                    <div className="pf-skill-add-row">
                      <input className="pf-input" style={{ flex: 1 }} placeholder="Type skill name…" value={skillInput}
                        onChange={e => setSkillInput(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter") addSkill(skillInput); }} />
                      <button className="pf-save-btn" style={{ padding: ".55rem 1.1rem" }} onClick={() => addSkill(skillInput)}>+ Add</button>
                    </div>
                    {skillInput.length > 0 && filteredSugg.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: ".3rem", marginTop: ".45rem" }}>
                        {filteredSugg.map(s => <span key={s} className="pf-sugg" onClick={() => addSkill(s)}>{s}</span>)}
                      </div>
                    )}
                    {skillInput.length === 0 && (
                      <>
                        <div className="pf-label" style={{ marginTop: ".9rem", marginBottom: ".38rem" }}>Popular Skills (tap to add)</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: ".3rem" }}>
                          {SKILL_SUGGESTIONS.filter(s => !skills.includes(s)).slice(0, 20).map(s => (
                            <span key={s} className="pf-sugg" onClick={() => addSkill(s)}>{s}</span>
                          ))}
                        </div>
                      </>
                    )}
                    <div style={{ marginTop: "1.1rem", display: "flex", justifyContent: "flex-end" }}>
                      <button className="pf-save-btn" onClick={savePfForm} disabled={pfSaving}>{pfSaving ? "Saving…" : "💾 Save Skills"}</button>
                    </div>
                  </>
                )}
                {!pfEditing && <div style={{ marginTop: ".85rem" }}><button className="pf-edit-btn" onClick={startPfEdit}>✏️ Edit Skills</button></div>}
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
                {pfEditing && (
                  <div style={{ marginTop: "1.1rem", display: "flex", justifyContent: "flex-end" }}>
                    <button className="pf-save-btn" onClick={savePfForm} disabled={pfSaving}>{pfSaving ? "Saving…" : "💾 Save"}</button>
                  </div>
                )}
                {!pfEditing && <div style={{ marginTop: ".9rem" }}><button className="pf-edit-btn" onClick={startPfEdit}>✏️ Edit Academic</button></div>}
              </div>
            </motion.div>
          )}

          {/* EXPERIENCE */}
          {pfTab === "experience" && (
            <motion.div key="ex" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="pf-card">
                <div className="pf-card-title">💼 Experience & Projects</div>
                {pfEditing
                  ? <div style={{ display: "flex", flexDirection: "column", gap: ".85rem" }}>
                    {[
                      { k: "experience", l: "Work / Internship Experience", p: "e.g. 6-month intern at TechCorp as React Developer." },
                      { k: "projects", l: "Projects", p: "Describe your key projects, tech stack, outcomes…" },
                      { k: "achievements", l: "Achievements / Awards", p: "Hackathon wins, certifications, recognitions…" },
                    ].map(f => (
                      <div className="pf-field" key={f.k}>
                        <label className="pf-label">{f.l}</label>
                        <textarea className="pf-input" rows={3} placeholder={f.p} value={pfForm[f.k] || ""} onChange={e => pffc(f.k, e.target.value)} />
                      </div>
                    ))}
                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                      <button className="pf-save-btn" onClick={savePfForm} disabled={pfSaving}>{pfSaving ? "Saving…" : "💾 Save"}</button>
                    </div>
                  </div>
                  : <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
                    {[["Work / Internship Experience", profile.experience], ["Projects", profile.projects], ["Achievements / Awards", profile.achievements]].map(([l, v]) => (
                      <div key={l}>
                        <div className="pf-label" style={{ marginBottom: ".35rem" }}>{l}</div>
                        <p style={{ fontSize: ".85rem", color: v ? "var(--slate)" : "var(--subtle)", lineHeight: 1.65, fontStyle: v ? "normal" : "italic" }}>
                          {v || `No ${l.toLowerCase()} added yet.`}
                        </p>
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
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: ".9rem" }}>
                  <div className="pf-card-title" style={{ marginBottom: 0 }}>🏆 Certificates</div>
                  {pfEditing && <button className="pf-edit-btn" onClick={() => certRef.current?.click()}>+ Upload</button>}
                </div>
                <div className="pf-upload-grid">
                  {certs.map((c, i) => (
                    <div className="pf-upload-thumb" key={i} onClick={() => window.open(c.url, "_blank")}>
                      {c.type?.startsWith("image/")
                        ? <img src={c.url} alt="" />
                        : <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "rgba(79,70,229,.05)" }}>
                          <span style={{ fontSize: "1.6rem" }}>📑</span>
                          <span style={{ fontSize: ".58rem", fontWeight: 700, color: "var(--muted)" }}>PDF</span>
                        </div>
                      }
                      {pfEditing && (
                        <button className="pf-upload-thumb-del" onClick={e => { e.stopPropagation(); pffc("certificates", pfForm.certificates.filter((_, j) => j !== i)); }}>✕</button>
                      )}
                    </div>
                  ))}
                  {pfEditing && <div className="pf-add-thumb" onClick={() => certRef.current?.click()}><span style={{ fontSize: "1.3rem" }}>+</span><span>Add</span></div>}
                  {!pfEditing && certs.length === 0 && <em style={{ color: "var(--subtle)", fontSize: ".82rem" }}>No certificates yet.</em>}
                </div>
              </div>
              <div className="pf-card">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: ".9rem" }}>
                  <div className="pf-card-title" style={{ marginBottom: 0 }}>📸 Personal Posts</div>
                  {pfEditing && <button className="pf-edit-btn" onClick={() => postRef.current?.click()}>+ Upload</button>}
                </div>
                <div className="pf-upload-grid">
                  {posts.map((p, i) => (
                    <div className="pf-upload-thumb" key={i} onClick={() => window.open(p.url, "_blank")}>
                      {p.type?.startsWith("image/")
                        ? <img src={p.url} alt="" />
                        : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: "1.6rem" }}>🎬</span></div>
                      }
                      {pfEditing && (
                        <button className="pf-upload-thumb-del" onClick={e => { e.stopPropagation(); pffc("personalPosts", pfForm.personalPosts.filter((_, j) => j !== i)); }}>✕</button>
                      )}
                    </div>
                  ))}
                  {pfEditing && <div className="pf-add-thumb" onClick={() => postRef.current?.click()}><span style={{ fontSize: "1.3rem" }}>+</span><span>Add</span></div>}
                  {!pfEditing && posts.length === 0 && <em style={{ color: "var(--subtle)", fontSize: ".82rem" }}>No posts yet.</em>}
                </div>
                {pfEditing && (
                  <div style={{ marginTop: "1.1rem", display: "flex", justifyContent: "flex-end" }}>
                    <button className="pf-save-btn" onClick={savePfForm} disabled={pfSaving}>{pfSaving ? "Saving…" : "💾 Save Media"}</button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* RESUME */}
          {pfTab === "resume" && (
            <motion.div key="rv" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="pf-card">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.1rem" }}>
                  <div className="pf-card-title" style={{ marginBottom: 0 }}>📄 My Resumes</div>
                  {pfEditing && <button className="pf-edit-btn" onClick={() => resumeRef.current?.click()}>+ Upload</button>}
                </div>
                {resumes.length === 0
                  ? <div style={{ textAlign: "center", padding: "1.8rem 1rem", color: "var(--subtle)" }}>
                    <div style={{ fontSize: "2rem", marginBottom: ".45rem" }}>📄</div>
                    <div style={{ fontWeight: 700, color: "var(--muted)" }}>No Resumes Yet</div>
                    <div style={{ fontSize: ".76rem", marginTop: ".28rem" }}>Upload a resume to attach it to applications.</div>
                    {pfEditing
                      ? <button className="pf-save-btn" style={{ marginTop: ".9rem" }} onClick={() => resumeRef.current?.click()}>+ Upload Resume</button>
                      : <button className="pf-edit-btn" style={{ marginTop: ".9rem" }} onClick={startPfEdit}>Go to Edit Mode</button>
                    }
                  </div>
                  : resumes.map((r, i) => (
                    <div className="pf-resume-item" key={i}>
                      <div className="pf-resume-icon">{r.type === "application/pdf" ? "📑" : "🖼️"}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="pf-resume-name">{r.name || `Resume ${i + 1}`}</div>
                        <div style={{ fontSize: ".66rem", color: "var(--subtle)", fontWeight: 600 }}>{r.type}</div>
                      </div>
                      <div style={{ display: "flex", gap: ".45rem", flex_shrink: 0 }}>
                        <a href={r.url} target="_blank" rel="noreferrer">
                          <button style={{ padding: ".35rem .8rem", background: "rgba(79,70,229,.08)", border: "none", borderRadius: 8, fontSize: ".7rem", fontWeight: 700, color: "var(--indigo)", cursor: "pointer" }}>View</button>
                        </a>
                        {pfEditing && (
                          <button style={{ padding: ".35rem .75rem", background: "rgba(244,63,94,.07)", border: "1px solid rgba(244,63,94,.18)", borderRadius: 8, fontSize: ".7rem", fontWeight: 700, color: "var(--rose)", cursor: "pointer" }}
                            onClick={() => pffc("resumes", pfForm.resumes.filter((_, j) => j !== i))}>Remove</button>
                        )}
                      </div>
                    </div>
                  ))
                }
                {pfEditing && resumes.length > 0 && (
                  <div style={{ marginTop: "1.1rem", display: "flex", justifyContent: "flex-end" }}>
                    <button className="pf-save-btn" onClick={savePfForm} disabled={pfSaving}>{pfSaving ? "Saving…" : "💾 Save"}</button>
                  </div>
                )}
                {!pfEditing && (
                  <div style={{ marginTop: ".9rem" }}><button className="pf-edit-btn" onClick={startPfEdit}>✏️ Manage Resumes</button></div>
                )}
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

  // ── Loading screen ────────────────────────────────────────────────────────
  if (!profile) return (
    <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)", flexDirection: "column", gap: "1.1rem" }}>
      <style>{CSS}</style>
      <div style={{ fontFamily: "Syne,sans-serif", fontSize: "1.8rem", fontWeight: 800, background: "var(--grad)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Campus2Career</div>
      {bootDone
        ? <>
          <div style={{ color: "var(--rose)", fontSize: ".88rem", fontWeight: 700 }}>
            {bootError === "auth" ? "Session expired — please log in again" : "Something went wrong. Please try again."}
          </div>
          <button style={{ marginTop: ".45rem", padding: ".55rem 1.3rem", borderRadius: "99px", border: "none", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "white", fontWeight: 700, cursor: "pointer", fontSize: ".83rem" }}
            onClick={() => navigate("/login")}>Go to Login</button>
        </>
        : <>
          <div className="spinner" />
          <div style={{ color: "var(--muted)", fontSize: ".82rem" }}>Loading your dashboard…</div>
        </>
      }
    </div>
  );

  // ── Main render ────────────────────────────────────────────────────────────
  const NAV_TABS = [
    { id: "feed", icon: "🏠", label: "Feed" },
    { id: "jobs", icon: "💼", label: "Jobs" },
    { id: "courses", icon: "📚", label: "Courses" },
    { id: "applications", icon: "📋", label: "My Apps" },
    { id: "messages", icon: "💬", label: "Messages" },
    { id: "profile", icon: "👤", label: "Profile" },
  ];

  return (
    <>
      <style>{CSS}</style>

      {/* ── NAV ── */}
      <nav className="s-nav">
        {/* Hamburger (tablet/mobile — shows sidebar) */}
        <button className="hamburger" onClick={() => setSidebarOpen(o => !o)} aria-label="Menu">
          <span /><span /><span />
        </button>

        <div style={{ flexShrink: 0 }}>
          <div className="brand">Campus2Career</div>
          <div className="brand-sub">Student Portal</div>
        </div>

        <div className="s-search">
          <span className="ico">🔍</span>
          <input placeholder="Search jobs, courses…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>

        <div className="nav-right">
          {/* Desktop nav pills */}
          <div className="nav-pills-desktop">
            {NAV_TABS.map(t => (
              <button key={t.id} className={`nav-pill ${activeTab === t.id ? "active" : ""}`} onClick={() => setActiveTab(t.id)}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          <div className="notif-btn"><span>🔔</span><span className="notif-dot" /></div>
          <div className="nav-av" title={profile.name}>
            {profile.photo ? <img src={profile.photo} alt="" /> : (profile.name || "S")[0].toUpperCase()}
          </div>
          <button className="signout-btn" onClick={handleLogout}>Sign Out</button>
        </div>
      </nav>

      {/* ── MOBILE BOTTOM NAV ── */}
      <div className="mobile-nav">
        <div className="mobile-nav-inner">
          {NAV_TABS.map(t => (
            <button key={t.id} className={`mob-tab ${activeTab === t.id ? "active" : ""}`} onClick={() => setActiveTab(t.id)}>
              <span className="mob-icon">{t.icon}</span>
              <span className="mob-label">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="s-layout">
        {/* ── SIDEBAR OVERLAY (mobile/tablet) ── */}
        <div
          className={`sidebar-overlay ${sidebarOpen ? "show" : ""}`}
          onClick={() => setSidebarOpen(false)}
        />

        {/* ── LEFT SIDEBAR ── */}
        <aside className={`s-sidebar ${sidebarOpen ? "open" : ""}`}>
          {renderPanel(profile, true)}
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main className="s-content">
          <AnimatePresence mode="wait">

            {/* ══ FEED ══ */}
            {activeTab === "feed" && (
              <motion.div key="feed" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="page-sec">
                  <div className="sec-head">
                    <div>
                      <span className="sec-title">Partner Industries</span>
                      <span className="sec-sub">· {industries.length} registered</span>
                    </div>
                  </div>
                  <div className="ind-grid">
                    {industries.map((ind, i) => (
                      <motion.div key={ind.id || i} className="ind-card"
                        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                        onClick={() => setActiveChat(ind.id)}>
                        <div className="ind-logo">{ind.logo || (ind.name || "CO").substring(0, 2).toUpperCase()}</div>
                        <div className="ind-name">{ind.name}</div>
                        <div className="ind-domain">{ind.domain}</div>
                        <div className="ind-loc">📍 {ind.location}</div>
                        {ind.tagline && <div className="ind-tagline">"{ind.tagline}"</div>}
                        <div style={{ marginTop: ".75rem" }}>
                          <button className="apply-btn" style={{ padding: ".38rem .85rem", fontSize: ".7rem", width: "auto" }}
                            onClick={e => { e.stopPropagation(); setActiveChat(ind.id); setActiveTab("messages"); }}>💬 Message</button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="page-sec">
                  <div className="sec-head">
                    <div>
                      <span className="sec-title">Opportunity Feed</span>
                      <span className="sec-sub">· {vacancies.length} openings</span>
                    </div>
                  </div>
                  {isFeedLoading
                    ? <div style={{ textAlign: "center", padding: "2.5rem", color: "var(--subtle)" }}><div className="spinner" style={{ margin: "0 auto" }} /></div>
                    : <div className="feed-grid">
                      {vacancies.map((v, i) => (
                        <motion.div key={v.id || i} className="vac-card"
                          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                          <div className="vac-body">
                            <div className="vac-top">
                              <div style={{ display: "flex", alignItems: "center", gap: ".65rem" }}>
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
                              {(v.skills || "").split(",").filter(Boolean).slice(0, 5).map((sk, j) => (
                                <span key={j} className="spill">{sk.trim()}</span>
                              ))}
                            </div>
                          </div>
                          <div className="vac-foot">
                            <div style={{ display: "flex", gap: ".85rem", flexWrap: "wrap" }}>
                              {v.duration && <div className="vac-meta-item">⏱ {v.duration}</div>}
                              {v.offerings && <div className="vac-meta-item">💰 {v.offerings.slice(0, 26)}{v.offerings.length > 26 ? "…" : ""}</div>}
                            </div>
                            <div style={{ display: "flex", gap: ".45rem" }}>
                              <button style={{ padding: ".38rem .8rem", borderRadius: 99, background: "rgba(79,70,229,.08)", border: "1.5px solid var(--border2)", color: "var(--indigo)", fontSize: ".7rem", fontWeight: 700, cursor: "pointer" }}
                                onClick={() => setPostDetailModal(v)}>Details</button>
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

            {/* ══ JOBS ══ */}
            {activeTab === "jobs" && (
              <motion.div key="jobs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
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
                        } catch { }
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
                        <button className="pf-save-btn" style={{ marginTop: ".9rem" }}
                          onClick={() => { setActiveTab("profile"); setTimeout(() => setPfTab("skills"), 100); }}>Add Skills →</button>
                      </div>
                      : matchedJobs.length === 0
                        ? <div className="empty-block"><div className="empty-icon">🔍</div><div className="empty-title">No matches yet</div><div className="empty-text">Click Refresh to run the AI analysis.</div></div>
                        : <div className="match-grid">
                          {matchedJobs.map((m, i) => (
                            <motion.div key={i} className="match-card"
                              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                              <div className="match-conf">{m.match_confidence ?? m.accuracy ?? 0}%</div>
                              <div className="match-label">Match Confidence</div>
                              <div className="match-bar"><div className="match-fill" style={{ width: `${m.match_confidence ?? m.accuracy ?? 0}%` }} /></div>
                              <div style={{ fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: ".92rem", color: "var(--navy)", marginBottom: ".28rem" }}>{m.job || m.matched_job}</div>
                              {m.industry && <div style={{ fontSize: ".7rem", color: "var(--muted)", fontWeight: 600, marginBottom: ".65rem" }}>📍 {m.industry}</div>}
                              {m.missing_skills?.length > 0 && (
                                <div style={{ marginBottom: ".65rem" }}>
                                  <div style={{ fontSize: ".63rem", fontWeight: 800, textTransform: "uppercase", color: "var(--rose)", letterSpacing: ".06em", marginBottom: ".3rem" }}>Skills to Learn</div>
                                  <div>{m.missing_skills.map((s, j) => <span key={j} className="miss-chip">{s}</span>)}</div>
                                </div>
                              )}
                              {m.courses?.length > 0 && (
                                <div>
                                  <div style={{ fontSize: ".63rem", fontWeight: 800, textTransform: "uppercase", color: "var(--emerald)", letterSpacing: ".06em", marginBottom: ".3rem" }}>Recommended Courses</div>
                                  {m.courses.map((c, j) => (
                                    <a key={j} href={c.link || c.url || "#"} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
                                      <div className="course-rec">
                                        <span style={{ fontSize: ".95rem" }}>📚</span>
                                        <div className="course-rec-title">{c.title}</div>
                                        <span style={{ fontSize: ".63rem", color: "var(--indigo)", fontWeight: 700, flexShrink: 0 }}>→</span>
                                      </div>
                                    </a>
                                  ))}
                                </div>
                              )}
                              {m.url && <a href={m.url} target="_blank" rel="noreferrer"><button className="apply-btn" style={{ width: "100%", marginTop: ".65rem" }}>View Job →</button></a>}
                            </motion.div>
                          ))}
                        </div>
                  }
                </div>

                <div className="page-sec">
                  <div className="sec-head">
                    <div>
                      <span className="sec-title">All Job Listings</span>
                      <span className="sec-sub">· {allJobs.length} openings</span>
                    </div>
                  </div>
                  <div className="jobs-grid">
                    {allJobs
                      .filter(j => !searchQuery ||
                        j.job?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        j.industry?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        j.skills?.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((j, i) => (
                        <motion.div key={i} className="job-card"
                          initial={{ opacity: 0, scale: .97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}>
                          <div className="job-co">{j.industry}</div>
                          <div className="job-title">{j.job}</div>
                          <div className="job-desc">{j.desc}</div>
                          <div className="job-tags">
                            {j.dept && <span className="jtag" style={{ background: "#e0f2fe", color: "#0369a1", borderColor: "#bae6fd" }}>{j.dept}</span>}
                            {j.role && <span className="jtag" style={{ background: "#ede9fe", color: "#5b21b6", borderColor: "#ddd6fe" }}>{j.role}</span>}
                            {j.ug && <span className="jtag" style={{ background: "#dcfce7", color: "#166534", borderColor: "#bbf7d0" }}>{j.ug}</span>}
                          </div>
                          <div className="skill-pills" style={{ marginBottom: ".65rem" }}>
                            {(j.skills || "").split(",").filter(Boolean).slice(0, 4).map((sk, k) => (
                              <span key={k} className="spill" style={{ fontSize: ".63rem" }}>{sk.trim()}</span>
                            ))}
                          </div>
                          <div className="job-foot">
                            <div className="job-dept">{j.pg && `PG: ${j.pg}`}</div>
                            <a href={j.url} target="_blank" rel="noreferrer" className="job-apply-link">Apply →</a>
                          </div>
                        </motion.div>
                      ))
                    }
                  </div>
                </div>
              </motion.div>
            )}

            {/* ══ COURSES ══ */}
            {activeTab === "courses" && (
              <motion.div key="courses" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="sec-head" style={{ marginBottom: "1.1rem" }}>
                  <div><span className="sec-title">Recommended Courses</span><span className="sec-sub">· {courses.length} available</span></div>
                </div>
                <div className="courses-grid">
                  {courses.map((c, i) => (
                    <motion.div key={c.id || i} className="course-card"
                      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                      onClick={() => window.open(c.link || c.url || "#", "_blank")}>
                      <div className="course-header">
                        <div className="course-provider">{c.provider}</div>
                        <div className="course-title">{c.title}</div>
                      </div>
                      <div className="course-body">
                        <div>
                          <div className="course-meta">
                            {c.duration && <span className="cmeta">⏱ {c.duration}</span>}
                            {c.rating && <span className="cmeta">⭐ {c.rating}</span>}
                            {c.students && <span className="cmeta">👥 {c.students}</span>}
                          </div>
                          {c.level && <div style={{ marginBottom: ".7rem" }}><span className={`level-pill level-${c.level}`}>{c.level}</span></div>}
                          {(c.skills || []).length > 0 && (
                            <div className="skill-pills" style={{ marginBottom: ".7rem" }}>
                              {c.skills.slice(0, 3).map((sk, j) => <span key={j} className="spill">{sk}</span>)}
                            </div>
                          )}
                        </div>
                        <button className="course-enroll">Enroll Now →</button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ══ APPLICATIONS ══ */}
            {activeTab === "applications" && (
              <motion.div key="apps" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="sec-head" style={{ marginBottom: "1.1rem" }}>
                  <div><span className="sec-title">My Applications</span><span className="sec-sub">· {myApplications.length} submitted</span></div>
                </div>
                {myApplications.length === 0
                  ? <div className="empty-block">
                    <div className="empty-icon">📋</div>
                    <div className="empty-title">No applications yet</div>
                    <div className="empty-text">Browse the feed and apply to internships and job vacancies.</div>
                    <button className="pf-save-btn" style={{ marginTop: ".9rem" }} onClick={() => setActiveTab("feed")}>Browse Openings →</button>
                  </div>
                  : <div className="app-list">
                    {myApplications.map((a, i) => (
                      <motion.div key={a.id || i} className="app-card"
                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: ".4rem" }}>
                          <div>
                            <div className="app-role">{a.role}</div>
                            <div className="app-co">🏢 {a.company}</div>
                          </div>
                          <span className={`status-pill sp-${a.status}`}>{a.status}</span>
                        </div>
                        <div style={{ fontSize: ".76rem", color: "var(--muted)", marginTop: ".55rem", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                          <span>📅 Applied: {a.appliedOn}</span>
                          {a.coverLetter && <span>📝 Cover letter attached</span>}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                }
              </motion.div>
            )}
            {/* ══ MESSAGES ══ */}
            {activeTab === "messages" && (
              <motion.div key="messages" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="sec-head" style={{ marginBottom: "1.1rem" }}>
                  <div>
                    <span className="sec-title">Messages</span>
                    <span className="sec-sub">· Chat with partner industries</span>
                  </div>
                </div>
                <div className="msg-layout">
                  {/* Conversation list */}
                  <div className="conv-list">
                    <div className="conv-list-head">💬 Conversations</div>
                    <div className="conv-list-body">
                      {industries.length === 0 ? (
                        <div style={{ padding: "1.5rem 1rem", textAlign: "center", color: "var(--subtle)", fontSize: ".78rem" }}>
                          No industries loaded yet.
                        </div>
                      ) : (
                        industries.map(ind => {
                          const msgs = chatMessages[ind.id] || [];
                          const lastMsg = msgs[msgs.length - 1];
                          return (
                            <div
                              key={ind.id}
                              className={`conv-row ${activeChat === ind.id ? "active" : ""}`}
                              onClick={() => setActiveChat(ind.id)}
                            >
                              <div className="conv-av2">
                                {(ind.logo || (ind.name || "CO").substring(0, 2)).toUpperCase()}
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div className="conv-name2">{ind.name}</div>
                                <div className="conv-preview2">
                                  {lastMsg ? lastMsg.message : "Start a conversation…"}
                                </div>
                              </div>
                              {msgs.length > 0 && (
                                <div style={{ width: 7, height: 7, background: "var(--indigo)", borderRadius: "50%", flexShrink: 0 }} />
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Chat area */}
                  <div className="chat-area2">
                    {!activeChat ? (
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--subtle)", gap: ".5rem" }}>
                        <span style={{ fontSize: "2rem" }}>💬</span>
                        <div style={{ fontWeight: 700, color: "var(--muted)" }}>Select a company to chat</div>
                        <div style={{ fontSize: ".76rem" }}>Choose a partner industry from the left panel.</div>
                      </div>
                    ) : (() => {
                      const ind = industries.find(i => i.id === activeChat);
                      const msgs = chatMessages[activeChat] || [];
                      return (
                        <>
                          <div className="chat-head2">
                            <div className="conv-av2">{(ind?.logo || "CO").substring(0, 2).toUpperCase()}</div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 800, fontSize: ".88rem", color: "var(--navy)", fontFamily: "Syne,sans-serif" }}>{ind?.name || "Company"}</div>
                              <div style={{ fontSize: ".67rem", color: "var(--subtle)", display: "flex", alignItems: "center", gap: ".3rem" }}>
                                <span style={{ width: 6, height: 6, background: "#34d399", borderRadius: "50%", display: "inline-block" }} />
                                Active
                              </div>
                            </div>
                            <div style={{ fontSize: ".7rem", color: "var(--muted)", fontWeight: 600 }}>{ind?.domain}</div>
                          </div>

                          <div className="chat-body2">
                            {msgs.length === 0 ? (
                              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, color: "var(--subtle)", gap: ".4rem", marginTop: "2rem" }}>
                                <span style={{ fontSize: "1.5rem" }}>👋</span>
                                <div style={{ fontSize: ".8rem" }}>No messages yet. Say hello!</div>
                              </div>
                            ) : (
                              msgs.map((msg, i) => (
                                <div key={i} className={`bubble ${msg.sender === "me" ? "sent" : "recv"}`}>
                                  <div>{msg.message}</div>
                                  <div className="bubble-time">{msg.time}</div>
                                </div>
                              ))
                            )}
                            <div ref={chatEndRef} />
                          </div>

                          <div className="chat-foot2">
                            <input
                              ref={chatInputRef}
                              className="chat-inp2"
                              placeholder="Type a message…"
                              onKeyDown={e => {
                                if (e.key === "Enter" && e.target.value.trim()) {
                                  sendMessage(activeChat, e.target.value.trim());
                                  e.target.value = "";
                                }
                              }}
                            />
                            <button className="send-btn" onClick={() => {
                              const inp = chatInputRef.current;
                              if (!inp?.value?.trim()) return;
                              sendMessage(activeChat, inp.value.trim());
                              inp.value = "";
                            }}>➤</button>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </motion.div>
            )}
            {/* ══ PROFILE PAGE ══ */}
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
            <motion.aside className="s-sidebar right"
              initial={{ x: 320, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 320, opacity: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 28 }}
              style={{ position: "fixed", right: 0, top: "var(--nav-h)", zIndex: 160 }}>
              {renderPanel(activeUserProfile, false)}
            </motion.aside>
          )}
        </AnimatePresence>
      </div>



      {/* ── POST DETAIL MODAL ── */}
      <AnimatePresence>
        {postDetailModal && (
          <motion.div className="modal-ov" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={e => { if (e.target === e.currentTarget) setPostDetailModal(null); }}>
            <motion.div className="modal-box" initial={{ scale: .94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: .94, opacity: 0 }}>
              <button className="modal-close" onClick={() => setPostDetailModal(null)}>✕</button>
              <div style={{ display: "flex", alignItems: "center", gap: ".8rem", marginBottom: "1.2rem" }}>
                <div style={{ width: 46, height: 46, borderRadius: 12, background: "rgba(79,70,229,.1)", color: "var(--indigo)", fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: ".9rem", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {postDetailModal.ownerLogo || "CO"}
                </div>
                <div>
                  <div className="modal-title" style={{ fontSize: "1.2rem" }}>{postDetailModal.title}</div>
                  <div style={{ color: "var(--indigo)", fontWeight: 700, fontSize: ".8rem" }}>{postDetailModal.ownerName} · {postDetailModal.type}</div>
                </div>
              </div>
              <div style={{ marginBottom: "1rem", lineHeight: 1.65, color: "var(--muted)", fontSize: ".86rem" }}>{postDetailModal.desc}</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: ".7rem", marginBottom: "1.1rem", fontSize: ".84rem" }}>
                {postDetailModal.duration && <div><strong>Duration:</strong> {postDetailModal.duration}</div>}
                {postDetailModal.skills && <div><strong>Skills:</strong> {postDetailModal.skills}</div>}
                {postDetailModal.offerings && <div style={{ gridColumn: "1 / -1" }}><strong>Offerings:</strong> {postDetailModal.offerings}</div>}
              </div>
              {alreadyApplied(postDetailModal.id)
                ? <div style={{ textAlign: "center", padding: ".8rem", background: "#dcfce7", borderRadius: 12, color: "#166634", fontWeight: 700 }}>✓ Already Applied</div>
                : <button className="btn-primary" onClick={() => { setApplyModal(postDetailModal); setPostDetailModal(null); }}>Apply for this Role</button>
              }
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── APPLY MODAL ── */}
      <AnimatePresence>
        {applyModal && (
          <motion.div className="modal-ov" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={e => { if (e.target === e.currentTarget) setApplyModal(null); }}>
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
                  ? <div style={{ marginBottom: ".9rem" }}>
                    {(profile.resumes || []).map((r, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: ".45rem", background: "rgba(79,70,229,.05)", border: "1px solid rgba(79,70,229,.15)", borderRadius: 10, padding: ".45rem .75rem", marginBottom: ".38rem" }}>
                        <span>{r.type === "application/pdf" ? "📑" : "🖼️"}</span>
                        <span style={{ fontSize: ".8rem", fontWeight: 600, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.name}</span>
                        <span style={{ fontSize: ".66rem", background: "#dcfce7", color: "#166534", padding: ".1rem .45rem", borderRadius: 99, fontWeight: 700, flexShrink: 0 }}>Attached</span>
                      </div>
                    ))}
                  </div>
                  : <div style={{ marginBottom: ".9rem", padding: ".65rem .9rem", background: "#fff8e6", border: "1px solid #fbbf24", borderRadius: 10, fontSize: ".78rem", color: "#92400e", fontWeight: 600 }}>
                    ⚠️ No resume on file. Go to <strong>My Profile → Resume</strong> to upload one first.
                  </div>
                }
                <label className="field-label">Cover Letter</label>
                <textarea required className="field-input" rows={4} placeholder="Explain why you're a great fit for this role…"
                  value={applyForm.coverLetter} onChange={e => setApplyForm({ ...applyForm, coverLetter: e.target.value })} />
                <button type="submit" className="btn-primary">🚀 Submit Application</button>
                <button type="button" className="btn-secondary" onClick={() => setApplyModal(null)}>Cancel</button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── TOAST NOTIFICATIONS ── */}
      <div style={{ position: "fixed", bottom: "5rem", right: "1rem", zIndex: 2000, display: "flex", flexDirection: "column", gap: "8px" }}>
        <AnimatePresence>
          {notifications.map(n => (
            <motion.div key={n.id} className="notif-toast"
              initial={{ opacity: 0, x: 50, scale: .92 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, scale: .9 }}>
              <div className="notif-dot2" />{n.msg}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}
