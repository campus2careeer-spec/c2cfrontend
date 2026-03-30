import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import API_BASE_URL from '../apiConfig';

const BASE = API_BASE_URL;

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const SKILL_SUGGESTIONS = [
  'Python','JavaScript','React','Node.js','Django','Flask','Java','C++','TypeScript',
  'SQL','MongoDB','PostgreSQL','AWS','Docker','Kubernetes','Git','Machine Learning',
  'Deep Learning','TensorFlow','PyTorch','Figma','UI/UX','HTML','CSS','Spring Boot',
  'GraphQL','DevOps','REST APIs','Data Science','Excel','Power BI','Tableau',
  'Android','Flutter','Swift','Kotlin','PHP','Laravel','Vue.js','Angular',
];

const MOCK_INDUSTRIES = [
  { id: 1, name: 'TechNova Solutions', logo: 'TN', domain: 'Cloud Computing', location: 'Bangalore', tagline: 'Cloud Native Excellence' },
  { id: 2, name: 'Quantum AI', logo: 'QA', domain: 'Artificial Intelligence', location: 'Hyderabad', tagline: 'Pioneering AI' },
  { id: 3, name: 'Nexus Fintech', logo: 'NF', domain: 'Blockchain', location: 'Mumbai', tagline: 'Next-Gen Finance' },
  { id: 4, name: 'GreenEnergy Co', logo: 'GE', domain: 'Sustainability', location: 'Pune', tagline: 'Sustainable Power' },
];

const MOCK_COURSES = [
  { id: 1, title: 'React.js Complete Guide', provider: 'Udemy', duration: '40 hrs', level: 'Intermediate', link: '#', rating: 4.8, skills: ['React','JSX','Hooks'] },
  { id: 2, title: 'Data Structures & Algorithms', provider: 'Coursera', duration: '60 hrs', level: 'Advanced', link: '#', rating: 4.9, skills: ['DSA','C++'] },
  { id: 3, title: 'Machine Learning A-Z', provider: 'Udemy', duration: '55 hrs', level: 'Intermediate', link: '#', rating: 4.8, skills: ['Python','sklearn'] },
  { id: 4, title: 'System Design Fundamentals', provider: 'Coursera', duration: '45 hrs', level: 'Advanced', link: '#', rating: 4.9, skills: ['Architecture','SQL'] },
  { id: 5, title: 'Python for Data Science', provider: 'edX', duration: '35 hrs', level: 'Beginner', link: '#', rating: 4.7, skills: ['Python','Pandas'] },
];

const MOCK_VACANCIES = [
  { id: 101, ownerId: 1, ownerName: 'TechNova Solutions', ownerLogo: 'TN', type: 'Internship', title: 'MERN Stack Intern', desc: 'Seeking proactive students with React and Node.js expertise.', skills: 'React, Node.js, Express, MongoDB', duration: '6 Months', offerings: '₹20,000/month stipend', date: '2 hours ago', likes: 24 },
  { id: 102, ownerId: 2, ownerName: 'Quantum AI', ownerLogo: 'QA', type: 'Job Vacancy', title: 'AI Research Associate', desc: 'Join our neural network research team. Masters preferred.', skills: 'Python, PyTorch, Deep Learning', duration: 'Full-Time', offerings: 'Competitive Salary', date: '3 days ago', likes: 89 },
  { id: 103, ownerId: 3, ownerName: 'Nexus Fintech', ownerLogo: 'NF', type: 'Internship', title: 'Blockchain Developer Intern', desc: 'Work on Ethereum smart contracts and DApps.', skills: 'Solidity, Web3.js, JavaScript', duration: '3 Months', offerings: '₹15,000/month', date: '1 day ago', likes: 41 },
];

const MOCK_JOBS = [
  { industry: 'TechCorp India', job: 'Frontend Developer', desc: 'Build scalable React UIs.', role: 'SDE-1', ug: 'B.Tech/BCA', pg: 'Not Required', url: '#', dept: 'Engineering', skills: 'React, TypeScript, CSS' },
  { industry: 'Infosys Ltd.', job: 'Java Backend Engineer', desc: 'Develop REST APIs with Spring Boot.', role: 'Software Engineer', ug: 'B.Tech', pg: 'M.Tech preferred', url: '#', dept: 'Backend', skills: 'Java, Spring Boot, AWS' },
  { industry: 'Analytics Co.', job: 'Data Analyst', desc: 'Insights from large datasets.', role: 'Analyst', ug: 'Any Graduate', pg: 'MBA/MCA', url: '#', dept: 'Analytics', skills: 'Python, SQL, Tableau' },
  { industry: 'CloudSoft', job: 'DevOps Engineer', desc: 'CI/CD pipelines and cloud infra.', role: 'DevOps', ug: 'B.Tech/BCA', pg: 'Not Required', url: '#', dept: 'Infrastructure', skills: 'Docker, Kubernetes, AWS' },
  { industry: 'DataViz Inc.', job: 'ML Engineer', desc: 'Build and deploy ML models.', role: 'MLE', ug: 'B.Tech/MCA', pg: 'M.Tech preferred', url: '#', dept: 'AI/ML', skills: 'Python, TensorFlow, MLflow' },
  { industry: 'StartupHub', job: 'Full Stack Developer', desc: 'End-to-end feature development.', role: 'SDE-2', ug: 'Any CS Degree', pg: 'Not Required', url: '#', dept: 'Product', skills: 'React, Node.js, PostgreSQL' },
];

// ─── UTILS ────────────────────────────────────────────────────────────────────
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

function buildProfile(d, fallback = {}) {
  return {
    id: d.id || fallback.id || '',
    name: d.name || d.full_name || fallback.name || 'Student',
    email: d.email || fallback.email || '',
    username: d.username || (d.name || 'student').toLowerCase().replace(/\s+/g, '_'),
    qualification: d.qualification || fallback.qualification || '',
    phone: d.phone || '',
    address: d.address || d.location || '',
    about: d.about || '',
    skills: Array.isArray(d.skills) ? d.skills : [],
    photo: d.photo || null,
    coverPhoto: d.coverPhoto || null,
    tenth: d.tenth || '',
    twelfth: d.twelfth || '',
    graduation: d.graduation || '',
    certificates: Array.isArray(d.certificates) ? d.certificates : [],
    personalPosts: Array.isArray(d.personalPosts || d.personal_posts) ? (d.personalPosts || d.personal_posts) : [],
    resumes: Array.isArray(d.resumes) ? d.resumes : [],
    chats: d.chats || {},
    linkedin: d.linkedin || '',
    github: d.github || '',
    website: d.website || '',
    experience: d.experience || '',
    projects: d.projects || '',
    achievements: d.achievements || '',
    cgpa: d.cgpa || '',
  };
}

// ─── CSS ─────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&family=Clash+Display:wght@400;500;600;700&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

:root {
  --brand: #6366f1;
  --brand-dark: #4f46e5;
  --brand-light: #818cf8;
  --brand-xlight: #e0e7ff;
  --accent: #f472b6;
  --emerald: #10b981;
  --amber: #f59e0b;
  --rose: #f43f5e;
  --sky: #0ea5e9;

  --bg: #f8faff;
  --bg2: #f1f4fe;
  --surface: #ffffff;
  --surface2: #f8faff;
  --surface3: #f1f4fe;

  --text-primary: #0f172a;
  --text-secondary: #475569;
  --text-muted: #94a3b8;

  --border: rgba(99,102,241,0.1);
  --border-strong: rgba(99,102,241,0.2);

  --shadow-xs: 0 1px 3px rgba(15,23,42,0.06);
  --shadow-sm: 0 2px 8px rgba(99,102,241,0.08);
  --shadow-md: 0 4px 20px rgba(99,102,241,0.14);
  --shadow-lg: 0 12px 40px rgba(99,102,241,0.18);

  --grad: linear-gradient(135deg,#6366f1,#8b5cf6);
  --grad-soft: linear-gradient(135deg,rgba(99,102,241,0.12),rgba(139,92,246,0.08));
  --r: 16px;
  --r-sm: 10px;
  --r-xs: 6px;
  --nav-h: 64px;
  --sidebar-w: 300px;
}

body{font-family:'Plus Jakarta Sans',sans-serif;background:var(--bg);color:var(--text-primary);-webkit-font-smoothing:antialiased;line-height:1.5}
::selection{background:var(--brand-xlight);color:var(--brand-dark)}
::-webkit-scrollbar{width:3px;height:3px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:rgba(99,102,241,0.25);border-radius:99px}

/* ── NAV ── */
.s-nav {
  height:var(--nav-h);background:rgba(255,255,255,0.9);
  backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);
  border-bottom:1px solid var(--border);
  display:flex;align-items:center;justify-content:space-between;
  padding:0 2rem;position:sticky;top:0;z-index:300;
  box-shadow:var(--shadow-xs);
}
.brand-wrap{display:flex;align-items:center;gap:10px}
.brand-icon{width:34px;height:34px;border-radius:10px;background:var(--grad);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.brand-icon svg{width:18px;height:18px;fill:white}
.brand{font-family:'Clash Display',sans-serif;font-size:1.1rem;font-weight:600;letter-spacing:-0.02em;color:var(--text-primary)}
.brand span{color:var(--brand)}
.brand-sub{font-size:0.58rem;font-weight:600;color:var(--text-muted);letter-spacing:0.1em;text-transform:uppercase;margin-top:1px}

.s-search{position:relative;flex:1;max-width:320px;margin:0 2rem}
.s-search input{
  width:100%;padding:.5rem 1rem .5rem 2.4rem;
  border:1.5px solid var(--border-strong);border-radius:99px;
  background:var(--surface2);font-family:inherit;
  font-size:.82rem;color:var(--text-primary);outline:none;transition:.2s;
}
.s-search input:focus{border-color:var(--brand);background:white;box-shadow:0 0 0 4px rgba(99,102,241,.08)}
.s-search input::placeholder{color:var(--text-muted)}
.s-search-ico{position:absolute;left:.85rem;top:50%;transform:translateY(-50%);color:var(--text-muted);pointer-events:none;font-size:.85rem}

.nav-tabs{display:flex;gap:2px;background:var(--surface2);border:1px solid var(--border);border-radius:12px;padding:3px}
.nav-tab{
  padding:.38rem .9rem;border-radius:9px;font-size:.75rem;font-weight:600;
  color:var(--text-muted);cursor:pointer;border:none;background:transparent;
  font-family:inherit;transition:.18s;white-space:nowrap;
}
.nav-tab:hover{color:var(--text-secondary);background:rgba(99,102,241,.06)}
.nav-tab.active{background:white;color:var(--brand);box-shadow:var(--shadow-xs);font-weight:700}

.nav-actions{display:flex;align-items:center;gap:8px;flex-shrink:0}
.nav-btn{
  width:36px;height:36px;border-radius:10px;
  border:1px solid var(--border-strong);background:white;
  display:flex;align-items:center;justify-content:center;
  cursor:pointer;color:var(--text-secondary);font-size:1rem;
  position:relative;transition:.18s;
}
.nav-btn:hover{background:var(--surface2);border-color:var(--brand)}
.nav-btn .badge{
  position:absolute;top:5px;right:5px;width:8px;height:8px;
  background:var(--rose);border-radius:50%;border:2px solid white;
}
.nav-av{
  width:36px;height:36px;border-radius:10px;overflow:hidden;
  background:var(--grad);color:white;font-weight:700;font-size:.9rem;
  display:flex;align-items:center;justify-content:center;cursor:pointer;
  border:2px solid var(--brand-xlight);transition:.18s;flex-shrink:0;
}
.nav-av:hover{transform:scale(1.05)}
.nav-av img{width:100%;height:100%;object-fit:cover}
.signout-btn{
  padding:.38rem .85rem;border-radius:8px;
  background:rgba(244,63,94,.06);border:1px solid rgba(244,63,94,.2);
  color:var(--rose);font-size:.73rem;font-weight:700;cursor:pointer;
  font-family:inherit;transition:.18s;
}
.signout-btn:hover{background:var(--rose);color:white}

/* ── LAYOUT ── */
.s-layout{display:flex;height:calc(100vh - var(--nav-h));overflow:hidden}
.s-sidebar{
  width:var(--sidebar-w);min-width:var(--sidebar-w);
  background:white;border-right:1px solid var(--border);
  overflow-y:auto;flex-shrink:0;
}
.s-sidebar.right{border-right:none;border-left:1px solid var(--border)}
.s-content{flex:1;overflow-y:auto;padding:2rem 2.5rem;background:var(--bg)}

/* ── SIDEBAR TOP ── */
.sb-header{
  padding:1.5rem 1.4rem 1.2rem;
  background:linear-gradient(160deg,#6366f1 0%,#8b5cf6 100%);
  position:relative;overflow:hidden;
}
.sb-header::after{
  content:'';position:absolute;top:-40px;right:-40px;
  width:130px;height:130px;border-radius:50%;
  background:rgba(255,255,255,.07);pointer-events:none;
}
.sb-av-wrap{display:flex;align-items:center;gap:12px;position:relative;z-index:1}
.sb-av{
  width:50px;height:50px;border-radius:14px;overflow:hidden;flex-shrink:0;
  background:rgba(255,255,255,.2);border:2px solid rgba(255,255,255,.3);
  display:flex;align-items:center;justify-content:center;
  font-size:1.2rem;font-weight:800;color:white;
}
.sb-av img{width:100%;height:100%;object-fit:cover}
.sb-name{font-size:.97rem;font-weight:700;color:white;line-height:1.2}
.sb-handle{font-size:.65rem;color:rgba(255,255,255,.6);margin-top:2px}
.sb-edit-btn{
  margin-left:auto;padding:.28rem .7rem;border-radius:7px;
  border:1.5px solid rgba(255,255,255,.25);background:rgba(255,255,255,.12);
  color:rgba(255,255,255,.92);font-size:.7rem;font-weight:700;
  cursor:pointer;transition:.18s;font-family:inherit;flex-shrink:0;
}
.sb-edit-btn:hover{background:rgba(255,255,255,.25)}
.sb-save-btn{
  margin-left:auto;padding:.28rem .7rem;border-radius:7px;
  border:none;background:#10b981;color:white;
  font-size:.7rem;font-weight:700;cursor:pointer;font-family:inherit;
}
.sb-tags{display:flex;flex-wrap:wrap;gap:5px;margin-top:10px;position:relative;z-index:1}
.sb-tag{
  display:inline-flex;align-items:center;gap:3px;
  background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.18);
  border-radius:99px;padding:.18rem .6rem;font-size:.65rem;
  color:rgba(255,255,255,.9);font-weight:600;
}

/* ── COMPLETION BAR ── */
.comp-wrap{padding:.9rem 1.4rem;border-bottom:1px solid var(--border)}
.comp-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:.45rem;font-size:.68rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.07em}
.comp-num{font-size:.75rem;font-weight:800}
.comp-track{height:5px;background:var(--surface3);border-radius:99px;overflow:hidden}
.comp-fill{height:100%;background:var(--grad);border-radius:99px;transition:width .9s ease}

/* ── SIDEBAR EDIT FORM ── */
.sb-form-section{padding:.85rem 1.4rem;border-bottom:1px solid var(--border)}
.sb-form-label{font-size:.62rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.07em;margin-bottom:.55rem;display:block}
.sb-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:.4rem}
.sb-input{
  width:100%;padding:.45rem .75rem;border-radius:var(--r-xs);
  border:1.5px solid var(--border-strong);background:var(--surface2);
  font-family:inherit;font-size:.8rem;color:var(--text-primary);outline:none;transition:.18s;
}
.sb-input:focus{border-color:var(--brand);background:white;box-shadow:0 0 0 3px rgba(99,102,241,.08)}
.sb-input::placeholder{color:var(--text-muted)}
.sb-upload-btn{
  display:flex;align-items:center;justify-content:center;gap:.4rem;
  width:100%;padding:.5rem;border-radius:var(--r-xs);
  border:1.5px dashed rgba(99,102,241,.25);background:rgba(99,102,241,.03);
  color:var(--text-muted);font-size:.78rem;font-weight:600;cursor:pointer;
  transition:.18s;font-family:inherit;
}
.sb-upload-btn:hover{border-color:var(--brand);color:var(--brand);background:rgba(99,102,241,.06)}

/* ── SIDEBAR DETAILS ── */
.sb-details-btn{
  display:flex;align-items:center;gap:6px;
  background:none;border:none;font-family:inherit;
  font-size:.78rem;font-weight:700;color:var(--brand);
  cursor:pointer;padding:.9rem 1.4rem;width:100%;
  border-bottom:1px solid var(--border);transition:.18s;
}
.sb-details-btn:hover{background:var(--surface2)}
.details-box{background:var(--surface2);border-bottom:1px solid var(--border)}
.detail-row{display:flex;align-items:center;gap:8px;padding:.5rem 1.4rem;font-size:.78rem;color:var(--text-secondary);font-weight:500;border-bottom:1px solid var(--border)}
.detail-row:last-child{border-bottom:none}
.detail-row-label{font-size:.58rem;font-weight:800;color:var(--text-muted);text-transform:uppercase;letter-spacing:.08em;padding:.35rem 1.4rem .2rem;background:rgba(99,102,241,.04);border-bottom:1px solid var(--border)}

/* ── SIDEBAR MEDIA SECTION ── */
.sb-media-sec{padding:.85rem 1.4rem;border-bottom:1px solid var(--border)}
.sb-media-title{font-size:.62rem;font-weight:800;color:var(--brand);text-transform:uppercase;letter-spacing:.1em;margin-bottom:.65rem;opacity:.8}
.media-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:4px}
.media-cell{aspect-ratio:1;border-radius:7px;overflow:hidden;position:relative;background:var(--surface3);cursor:pointer}
.media-cell img,.media-cell video{width:100%;height:100%;object-fit:cover;transition:.2s}
.media-cell:hover img,.media-cell:hover video{transform:scale(1.05)}
.media-del{
  position:absolute;top:3px;right:3px;width:18px;height:18px;
  border-radius:4px;background:rgba(255,255,255,.95);border:none;
  color:var(--rose);font-size:.52rem;display:flex;align-items:center;
  justify-content:center;cursor:pointer;opacity:0;transition:.18s;
}
.media-cell:hover .media-del{opacity:1}
.resume-pill{
  display:flex;align-items:center;gap:8px;padding:.5rem .75rem;
  border-radius:var(--r-xs);background:rgba(99,102,241,.05);
  border:1px solid var(--border-strong);margin-bottom:.4rem;cursor:pointer;transition:.18s;
}
.resume-pill:hover{background:rgba(99,102,241,.1);border-color:var(--brand)}
.resume-pill-name{font-size:.75rem;font-weight:600;color:var(--text-primary);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.resume-del-btn{background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:.7rem;font-weight:700;padding:2px 4px;transition:.18s}
.resume-del-btn:hover{color:var(--rose)}

/* ── PAGE SECTION ── */
.page-sec{margin-bottom:2.5rem}
.sec-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:1.25rem}
.sec-title-wrap{}
.sec-title{font-family:'Clash Display',sans-serif;font-size:1.15rem;font-weight:600;color:var(--text-primary);letter-spacing:-0.02em}
.sec-sub{font-size:.75rem;color:var(--text-muted);margin-top:2px}
.sec-action-btn{padding:.35rem .9rem;border-radius:8px;background:white;border:1.5px solid var(--border-strong);font-size:.73rem;font-weight:700;color:var(--brand);cursor:pointer;font-family:inherit;transition:.18s}
.sec-action-btn:hover{background:var(--brand-xlight);border-color:var(--brand)}

/* ── INDUSTRY CARDS ── */
.ind-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:1rem}
.ind-card{
  background:white;border:1.5px solid var(--border);border-radius:var(--r);
  padding:1.3rem 1.1rem;cursor:pointer;transition:.22s;text-align:center;
  box-shadow:var(--shadow-xs);
}
.ind-card:hover{box-shadow:var(--shadow-md);border-color:var(--brand-light);transform:translateY(-3px)}
.ind-logo{
  width:52px;height:52px;border-radius:14px;background:var(--grad);
  color:white;font-family:'Clash Display',sans-serif;font-weight:600;font-size:1rem;
  display:flex;align-items:center;justify-content:center;
  margin:0 auto .85rem;box-shadow:0 6px 16px rgba(99,102,241,.25);
}
.ind-name{font-size:.88rem;font-weight:700;color:var(--text-primary);margin-bottom:.3rem}
.ind-domain-tag{
  display:inline-block;font-size:.67rem;font-weight:700;
  color:var(--brand);background:var(--brand-xlight);
  border-radius:99px;padding:.15rem .55rem;margin-bottom:.35rem;
}
.ind-loc{font-size:.7rem;color:var(--text-muted)}
.ind-tagline{font-size:.7rem;color:var(--text-muted);margin-top:.3rem;font-style:italic;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}
.msg-btn{
  margin-top:.85rem;width:100%;padding:.42rem;border-radius:8px;
  background:var(--grad-soft);border:1.5px solid var(--border-strong);
  font-size:.72rem;font-weight:700;color:var(--brand);cursor:pointer;
  font-family:inherit;transition:.18s;
}
.msg-btn:hover{background:var(--grad);color:white;border-color:transparent}

/* ── VACANCY CARDS ── */
.feed-grid{display:flex;flex-direction:column;gap:1rem}
.vac-card{background:white;border:1.5px solid var(--border);border-radius:var(--r);overflow:hidden;box-shadow:var(--shadow-xs);transition:.22s}
.vac-card:hover{box-shadow:var(--shadow-md);border-color:var(--brand-light)}
.vac-body{padding:1.35rem}
.vac-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:.9rem}
.vac-logo-wrap{display:flex;align-items:center;gap:.75rem}
.vac-logo{
  width:42px;height:42px;border-radius:11px;flex-shrink:0;
  background:var(--brand-xlight);color:var(--brand);
  font-family:'Clash Display',sans-serif;font-weight:600;font-size:.82rem;
  display:flex;align-items:center;justify-content:center;
}
.vac-company{font-size:.82rem;font-weight:700;color:var(--text-primary)}
.vac-date{font-size:.67rem;color:var(--text-muted);margin-top:1px}
.type-badge{padding:.2rem .65rem;border-radius:99px;font-size:.64rem;font-weight:800;letter-spacing:.03em}
.badge-intern{background:#ede9fe;color:#5b21b6}
.badge-job{background:#e0f2fe;color:#0369a1}
.badge-train{background:#dcfce7;color:#166534}
.badge-campus{background:#fef3c7;color:#92400e}
.vac-title{font-family:'Clash Display',sans-serif;font-size:1rem;font-weight:600;color:var(--text-primary);margin-bottom:.35rem;letter-spacing:-0.01em}
.vac-desc{font-size:.8rem;color:var(--text-secondary);margin-bottom:.85rem;line-height:1.55;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.skill-pills{display:flex;flex-wrap:wrap;gap:.3rem;margin-bottom:.85rem}
.s-pill{
  padding:.15rem .52rem;border-radius:5px;font-size:.67rem;font-weight:700;
  background:var(--brand-xlight);color:var(--brand);
}
.vac-foot{display:flex;align-items:center;justify-content:space-between;padding:.85rem 1.35rem;border-top:1px solid var(--border);background:var(--surface2)}
.vac-meta{display:flex;gap:1rem}
.vac-meta-item{font-size:.73rem;color:var(--text-muted);font-weight:500;display:flex;align-items:center;gap:4px}
.vac-actions{display:flex;gap:.5rem}
.detail-btn{padding:.42rem .85rem;border-radius:8px;background:white;border:1.5px solid var(--border-strong);font-size:.71rem;font-weight:700;color:var(--text-secondary);cursor:pointer;font-family:inherit;transition:.18s}
.detail-btn:hover{border-color:var(--brand);color:var(--brand)}
.apply-btn{padding:.42rem 1.1rem;border-radius:8px;border:none;background:var(--grad);color:white;font-size:.73rem;font-weight:700;cursor:pointer;font-family:inherit;transition:.18s;box-shadow:0 3px 10px rgba(99,102,241,.25)}
.apply-btn:hover{opacity:.88;transform:translateY(-1px)}
.apply-btn:disabled{opacity:.5;cursor:not-allowed;transform:none}
.applied-badge{padding:.42rem 1.1rem;border-radius:8px;background:#dcfce7;color:#166534;font-size:.73rem;font-weight:700}

/* ── JOB CARDS ── */
.jobs-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1rem}
.job-card{background:white;border:1.5px solid var(--border);border-radius:var(--r);padding:1.2rem;box-shadow:var(--shadow-xs);transition:.22s;cursor:pointer}
.job-card:hover{box-shadow:var(--shadow-md);border-color:var(--brand-light);transform:translateY(-2px)}
.job-company{font-size:.65rem;font-weight:800;color:var(--text-muted);text-transform:uppercase;letter-spacing:.07em;margin-bottom:.22rem}
.job-title{font-family:'Clash Display',sans-serif;font-size:.92rem;font-weight:600;color:var(--text-primary);margin-bottom:.42rem;letter-spacing:-0.01em;line-height:1.3}
.job-desc{font-size:.77rem;color:var(--text-secondary);line-height:1.5;margin-bottom:.65rem;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.job-tags{display:flex;gap:.28rem;flex-wrap:wrap;margin-bottom:.65rem}
.j-tag{padding:.13rem .48rem;border-radius:99px;font-size:.63rem;font-weight:700;border:1.5px solid}
.job-foot{display:flex;align-items:center;justify-content:space-between}
.job-pg{font-size:.68rem;color:var(--text-muted);font-weight:500}
.job-apply-link{padding:.38rem .9rem;border-radius:8px;border:none;background:var(--grad);color:white;font-size:.71rem;font-weight:700;cursor:pointer;text-decoration:none;display:inline-block;transition:.18s;font-family:inherit}
.job-apply-link:hover{opacity:.85}

/* ── AI MATCH CARDS ── */
.match-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1rem}
.match-card{background:white;border:1.5px solid var(--border);border-radius:var(--r);padding:1.3rem;box-shadow:var(--shadow-xs);transition:.22s}
.match-card:hover{box-shadow:var(--shadow-md);border-color:var(--brand-light);transform:translateY(-2px)}
.match-pct{font-family:'Clash Display',sans-serif;font-size:2rem;font-weight:700;color:var(--brand);line-height:1;margin-bottom:2px}
.match-lbl{font-size:.65rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.07em;margin-bottom:.6rem}
.match-bar-track{height:4px;background:var(--surface3);border-radius:99px;margin-bottom:.9rem;overflow:hidden}
.match-bar-fill{height:100%;background:var(--grad);border-radius:99px}
.match-job{font-family:'Clash Display',sans-serif;font-size:.95rem;font-weight:600;color:var(--text-primary);margin-bottom:.25rem;letter-spacing:-0.01em}
.match-industry{font-size:.7rem;color:var(--text-muted);font-weight:600;margin-bottom:.7rem}
.missing-label{font-size:.63rem;font-weight:800;text-transform:uppercase;color:var(--rose);letter-spacing:.06em;margin-bottom:.35rem}
.miss-chip{display:inline-block;padding:.14rem .5rem;border-radius:5px;font-size:.66rem;font-weight:700;background:rgba(244,63,94,.07);color:var(--rose);border:1px solid rgba(244,63,94,.15);margin:.2rem .2rem 0 0}
.course-rec-item{display:flex;align-items:center;gap:.5rem;padding:.5rem .7rem;background:var(--surface2);border:1px solid var(--border-strong);border-radius:var(--r-xs);margin-top:.4rem;cursor:pointer;transition:.18s;text-decoration:none}
.course-rec-item:hover{background:var(--brand-xlight);border-color:var(--brand)}
.course-rec-name{font-size:.76rem;font-weight:700;color:var(--text-primary);flex:1;overflow:hidden;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical}
.courses-rec-label{font-size:.63rem;font-weight:800;text-transform:uppercase;color:var(--emerald);letter-spacing:.06em;margin:.7rem 0 .35rem}

/* ── COURSE CARDS ── */
.courses-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:1rem}
.course-card{background:white;border:1.5px solid var(--border);border-radius:var(--r);overflow:hidden;cursor:pointer;box-shadow:var(--shadow-xs);transition:.22s}
.course-card:hover{box-shadow:var(--shadow-md);border-color:var(--brand-light);transform:translateY(-2px)}
.course-top{padding:1.2rem;background:var(--grad);position:relative;overflow:hidden}
.course-top::before{content:'';position:absolute;top:-25px;right:-25px;width:90px;height:90px;background:rgba(255,255,255,.08);border-radius:50%}
.course-provider{font-size:.63rem;font-weight:800;color:rgba(255,255,255,.65);letter-spacing:.1em;text-transform:uppercase;margin-bottom:.3rem}
.course-name{font-family:'Clash Display',sans-serif;font-size:.92rem;font-weight:600;color:white;line-height:1.3;position:relative;z-index:1}
.course-body{padding:1rem}
.course-meta-row{display:flex;gap:.5rem;flex-wrap:wrap;margin-bottom:.75rem}
.course-meta-item{font-size:.67rem;font-weight:600;color:var(--text-muted);display:flex;align-items:center;gap:3px}
.level-badge{display:inline-block;padding:.15rem .55rem;border-radius:5px;font-size:.65rem;font-weight:800}
.level-Beginner{background:#e6f9f0;color:#1a7a4a;border:1px solid #b3e8cc}
.level-Intermediate{background:#fef8e6;color:#92400e;border:1px solid #fcd34d}
.level-Advanced{background:#fef2f2;color:#b91c1c;border:1px solid #fca5a5}
.enroll-btn{width:100%;padding:.52rem;border-radius:8px;border:none;background:var(--grad);color:white;font-family:'Clash Display',sans-serif;font-size:.78rem;font-weight:600;cursor:pointer;box-shadow:0 3px 10px rgba(99,102,241,.2);transition:.18s}
.enroll-btn:hover{opacity:.88}

/* ── APPLICATIONS ── */
.apps-list{display:flex;flex-direction:column;gap:.85rem}
.app-card{background:white;border:1.5px solid var(--border);border-radius:var(--r);padding:1.2rem;box-shadow:var(--shadow-xs);transition:.18s}
.app-card:hover{border-color:var(--brand-light);box-shadow:var(--shadow-sm)}
.app-role{font-family:'Clash Display',sans-serif;font-size:1rem;font-weight:600;color:var(--text-primary);letter-spacing:-0.01em}
.app-company{font-size:.78rem;color:var(--text-muted);font-weight:600;margin-top:2px}
.status-badge{padding:.2rem .65rem;border-radius:99px;font-size:.68rem;font-weight:800}
.status-Pending{background:#fef3c7;color:#b45309}
.status-Shortlisted{background:#e0e7ff;color:#3730a3}
.status-Selected{background:#dcfce7;color:#166534}
.status-Rejected{background:#fee2e2;color:#b91c1c}
.app-meta{display:flex;gap:1.2rem;margin-top:.6rem;font-size:.75rem;color:var(--text-muted)}

/* ── PROFILE PAGE ── */
.pf-page{max-width:860px;margin:0 auto}
.pf-cover-wrap{width:100%;height:170px;border-radius:var(--r);overflow:hidden;cursor:pointer;position:relative;margin-bottom:0}
.pf-cover-wrap img,.pf-cover-default{width:100%;height:100%;object-fit:cover}
.pf-cover-default{background:linear-gradient(135deg,#6366f1 0%,#8b5cf6 50%,#06b6d4 100%)}
.pf-cover-ov{position:absolute;inset:0;background:rgba(0,0,0,0);display:flex;align-items:flex-end;justify-content:flex-end;padding:.7rem;transition:.2s}
.pf-cover-wrap:hover .pf-cover-ov{background:rgba(0,0,0,.2)}
.pf-cover-lbl{background:rgba(0,0,0,.6);color:white;font-size:.68rem;font-weight:700;padding:.28rem .65rem;border-radius:7px}

.pf-hero{background:white;border:1.5px solid var(--border);border-radius:0 0 var(--r) var(--r);padding:1.35rem 1.75rem;margin-bottom:1.5rem;box-shadow:var(--shadow-xs)}
.pf-av-wrap{position:relative;display:inline-block}
.pf-av{
  width:86px;height:86px;border-radius:22px;overflow:hidden;cursor:pointer;
  background:var(--grad);border:4px solid white;box-shadow:var(--shadow-md);
  display:flex;align-items:center;justify-content:center;
  font-family:'Clash Display',sans-serif;font-size:2rem;font-weight:700;color:white;
  margin-top:-52px;position:relative;
}
.pf-av img{width:100%;height:100%;object-fit:cover}
.pf-av-cam{position:absolute;bottom:4px;right:4px;width:22px;height:22px;background:white;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:.65rem;box-shadow:var(--shadow-xs);cursor:pointer}
.pf-hero-row{display:flex;align-items:flex-end;justify-content:space-between;flex-wrap:wrap;gap:.75rem}
.pf-name{font-family:'Clash Display',sans-serif;font-size:1.4rem;font-weight:700;color:var(--text-primary);margin-top:.55rem;letter-spacing:-0.02em}
.pf-qual-text{font-size:.82rem;font-weight:700;color:var(--brand);margin-top:.1rem}
.pf-meta-row{display:flex;flex-wrap:wrap;gap:.5rem 1.2rem;margin-top:.6rem;font-size:.76rem;color:var(--text-muted);font-weight:500}
.pf-meta-row a{color:var(--brand);text-decoration:none;font-weight:600}
.pf-meta-row a:hover{text-decoration:underline}
.pf-about-text{font-size:.83rem;color:var(--text-secondary);line-height:1.7;margin-top:.65rem}
.pf-skills-row{display:flex;flex-wrap:wrap;gap:.3rem;margin-top:.7rem}
.pf-skill-chip{padding:.2rem .65rem;border-radius:99px;font-size:.72rem;font-weight:700;background:var(--brand-xlight);color:var(--brand)}
.pf-completion-badge{text-align:center;padding:0 .5rem}
.pf-completion-num{font-family:'Clash Display',sans-serif;font-size:1.6rem;font-weight:700;line-height:1}
.pf-completion-lbl{font-size:.6rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.07em;margin-top:2px}

.pf-hero-actions{display:flex;gap:.5rem}
.pf-edit-btn{padding:.48rem 1.1rem;border-radius:9px;background:white;border:1.5px solid var(--border-strong);color:var(--brand);font-size:.78rem;font-weight:700;cursor:pointer;font-family:inherit;transition:.18s}
.pf-edit-btn:hover{background:var(--brand-xlight);border-color:var(--brand)}
.pf-save-btn{padding:.48rem 1.2rem;border-radius:9px;background:var(--grad);color:white;border:none;font-size:.78rem;font-weight:700;cursor:pointer;font-family:inherit;transition:.18s;box-shadow:0 3px 10px rgba(99,102,241,.25)}
.pf-save-btn:hover{opacity:.88;transform:translateY(-1px)}
.pf-save-btn:disabled{opacity:.5;cursor:not-allowed;transform:none}

.pf-tabs{display:flex;gap:.3rem;flex-wrap:wrap;margin-bottom:1.3rem;background:white;border:1px solid var(--border);border-radius:12px;padding:4px}
.pf-tab{padding:.42rem 1rem;border-radius:9px;font-size:.77rem;font-weight:600;cursor:pointer;border:none;background:transparent;color:var(--text-muted);font-family:inherit;transition:.18s;white-space:nowrap}
.pf-tab:hover{color:var(--text-secondary);background:var(--surface2)}
.pf-tab.active{background:var(--grad);color:white;box-shadow:0 2px 8px rgba(99,102,241,.3)}

.pf-card{background:white;border:1.5px solid var(--border);border-radius:var(--r);padding:1.5rem;margin-bottom:1rem;box-shadow:var(--shadow-xs)}
.pf-card-title{font-family:'Clash Display',sans-serif;font-size:.95rem;font-weight:600;color:var(--text-primary);margin-bottom:1rem;letter-spacing:-0.01em}
.pf-grid{display:grid;grid-template-columns:1fr 1fr;gap:.85rem}
.pf-grid-3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:.85rem}
.pf-field{display:flex;flex-direction:column;gap:.28rem}
.pf-label{font-size:.65rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.07em}
.pf-input{
  padding:.62rem .9rem;border-radius:var(--r-sm);
  border:1.5px solid var(--border-strong);background:var(--surface2);
  font-family:inherit;font-size:.83rem;color:var(--text-primary);outline:none;transition:.18s;width:100%;
}
.pf-input:focus{border-color:var(--brand);box-shadow:0 0 0 3px rgba(99,102,241,.08);background:white}
.pf-input::placeholder{color:var(--text-muted)}
select.pf-input{cursor:pointer}
textarea.pf-input{resize:vertical;min-height:88px}
.pf-acad-box{background:var(--surface2);border:1.5px solid var(--border-strong);border-radius:var(--r-sm);padding:1rem;text-align:center}
.pf-acad-lbl{font-size:.62rem;font-weight:800;text-transform:uppercase;letter-spacing:.08em;color:var(--brand);margin-bottom:.4rem}
.pf-acad-val{font-size:.83rem;font-weight:700;color:var(--text-primary)}

.pf-upload-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(95px,1fr));gap:.6rem}
.pf-thumb{aspect-ratio:1;border-radius:9px;overflow:hidden;cursor:pointer;position:relative;background:var(--surface3);border:1px solid var(--border-strong)}
.pf-thumb img{width:100%;height:100%;object-fit:cover}
.pf-thumb-del{position:absolute;top:3px;right:3px;width:20px;height:20px;border-radius:5px;background:rgba(255,255,255,.95);border:none;color:var(--rose);font-size:.52rem;display:flex;align-items:center;justify-content:center;cursor:pointer;opacity:0;transition:.15s}
.pf-thumb:hover .pf-thumb-del{opacity:1}
.pf-add-thumb{aspect-ratio:1;border-radius:9px;border:1.5px dashed rgba(99,102,241,.3);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.2rem;cursor:pointer;color:var(--brand);font-size:.66rem;font-weight:700;transition:.18s}
.pf-add-thumb:hover{background:var(--brand-xlight);border-color:var(--brand)}
.pf-resume-row{display:flex;align-items:center;gap:.75rem;padding:.9rem 1rem;background:var(--surface2);border:1.5px solid var(--border-strong);border-radius:var(--r-sm);margin-bottom:.55rem}
.pf-resume-icon{font-size:1.4rem;flex-shrink:0}
.pf-resume-name{font-size:.8rem;font-weight:700;color:var(--text-primary)}
.pf-resume-type{font-size:.65rem;color:var(--text-muted)}

.skill-add-row{display:flex;gap:.55rem;align-items:center;margin-top:.85rem}
.skill-sugg{padding:.2rem .6rem;border-radius:99px;font-size:.7rem;font-weight:700;background:var(--brand-xlight);color:var(--brand);border:1px solid rgba(99,102,241,.2);cursor:pointer;transition:.15s}
.skill-sugg:hover{background:var(--brand);color:white}

/* ── MODALS ── */
.modal-ov{position:fixed;inset:0;background:rgba(15,23,42,.6);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);display:flex;align-items:center;justify-content:center;z-index:9999;padding:1rem}
.modal-box{background:white;border-radius:20px;padding:2.25rem;width:100%;max-width:580px;max-height:90vh;overflow-y:auto;position:relative;box-shadow:0 32px 80px rgba(0,0,0,.25)}
.modal-close{position:absolute;top:1.1rem;right:1.1rem;width:30px;height:30px;background:var(--surface2);border:1px solid var(--border);border-radius:8px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--text-muted);font-size:.82rem;transition:.15s}
.modal-close:hover{background:#fee2e2;color:var(--rose)}
.modal-title{font-family:'Clash Display',sans-serif;font-size:1.3rem;font-weight:600;color:var(--text-primary);margin-bottom:.2rem;letter-spacing:-0.02em}
.modal-sub{font-size:.8rem;color:var(--text-muted);margin-bottom:1.5rem}
.field-label{display:block;font-size:.7rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.07em;margin-bottom:.3rem;margin-top:.85rem}
.field-input{width:100%;padding:.7rem .9rem;border:1.5px solid #e2e8f0;border-radius:var(--r-sm);font-family:inherit;font-size:.83rem;color:var(--text-primary);outline:none;transition:.18s;background:#fafbff}
.field-input:focus{border-color:var(--brand);box-shadow:0 0 0 3px rgba(99,102,241,.08);background:white}
textarea.field-input{resize:vertical;min-height:88px}
.modal-btn-primary{width:100%;padding:.8rem;border-radius:99px;border:none;background:var(--grad);color:white;font-family:'Clash Display',sans-serif;font-size:.88rem;font-weight:600;cursor:pointer;margin-top:.85rem;box-shadow:0 5px 18px rgba(99,102,241,.28);transition:.18s}
.modal-btn-primary:hover{opacity:.9;transform:translateY(-1px)}
.modal-btn-secondary{width:100%;padding:.7rem;border-radius:99px;border:1.5px solid #e2e8f0;background:white;color:var(--text-muted);font-family:inherit;font-size:.83rem;font-weight:700;cursor:pointer;margin-top:.45rem;transition:.18s}
.modal-btn-secondary:hover{border-color:var(--brand);color:var(--brand)}

/* ── DM PANEL ── */
.dm-panel{position:fixed;bottom:0;right:2rem;width:350px;height:470px;background:white;border:1px solid var(--border);border-radius:18px 18px 0 0;box-shadow:var(--shadow-lg);display:flex;flex-direction:column;z-index:500;overflow:hidden}
.dm-head{padding:.9rem 1.2rem;background:var(--grad);display:flex;align-items:center;justify-content:space-between;color:white}
.dm-recipient-name{font-family:'Clash Display',sans-serif;font-weight:600;font-size:.9rem}
.dm-status-row{font-size:.68rem;color:rgba(255,255,255,.7);display:flex;align-items:center;gap:.3rem;margin-top:1px}
.online-dot{width:6px;height:6px;background:#34d399;border-radius:50%;display:inline-block}
.dm-body{flex:1;overflow-y:auto;padding:.9rem;display:flex;flex-direction:column;gap:.45rem;background:var(--bg)}
.dm-empty-state{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:.5rem;color:var(--text-muted);font-size:.8rem;text-align:center}
.bubble{max-width:72%;padding:.52rem .82rem;border-radius:12px;font-size:.8rem;line-height:1.45}
.bubble.sent{background:var(--grad);color:white;align-self:flex-end;border-bottom-right-radius:3px}
.bubble.recv{background:white;color:var(--text-primary);align-self:flex-start;border-bottom-left-radius:3px;box-shadow:var(--shadow-xs)}
.bubble-time{font-size:.58rem;opacity:.55;margin-top:2px;text-align:right}
.dm-foot{padding:.65rem .9rem;border-top:1px solid var(--border);display:flex;gap:.45rem;background:white}
.dm-input{flex:1;padding:.52rem .82rem;border-radius:99px;border:1.5px solid var(--border-strong);font-family:inherit;font-size:.8rem;color:var(--text-primary);outline:none;transition:.18s}
.dm-input:focus{border-color:var(--brand)}
.dm-send-btn{width:34px;height:34px;border-radius:50%;background:var(--grad);border:none;color:white;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:.8rem;flex-shrink:0}
.dm-close-btn{padding:.22rem .65rem;border-radius:7px;border:1.5px solid rgba(255,255,255,.2);background:rgba(255,255,255,.1);color:rgba(255,255,255,.85);font-size:.67rem;cursor:pointer;font-family:inherit;transition:.18s}
.dm-close-btn:hover{background:rgba(220,38,38,.4)}

/* ── TOAST ── */
.toast-stack{position:fixed;bottom:2rem;right:2rem;z-index:2000;display:flex;flex-direction:column;gap:8px;pointer-events:none}
.toast{background:#0f172a;color:white;padding:.8rem 1.3rem;border-radius:12px;box-shadow:var(--shadow-lg);font-size:.82rem;font-weight:600;display:flex;align-items:center;gap:.55rem;pointer-events:auto}
.toast-dot{width:7px;height:7px;background:var(--brand-light);border-radius:50%;flex-shrink:0}

/* ── EMPTY STATE ── */
.empty-state{text-align:center;padding:3rem 1rem;color:var(--text-muted)}
.empty-icon{font-size:2.5rem;margin-bottom:.7rem;opacity:.45}
.empty-title{font-size:.9rem;font-weight:700;color:var(--text-secondary);margin-bottom:.35rem}
.empty-text{font-size:.77rem;line-height:1.6}

/* ── SPINNER ── */
.spinner{width:30px;height:30px;border:3px solid rgba(99,102,241,.15);border-top-color:var(--brand);border-radius:50%;animation:spin .7s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}

/* ── PF TOAST ── */
.pf-toast{position:fixed;bottom:2rem;right:2rem;padding:.82rem 1.4rem;border-radius:12px;font-size:.82rem;font-weight:700;box-shadow:var(--shadow-lg);z-index:3000;display:flex;align-items:center;gap:.5rem}
.pf-toast-success{background:#0f172a;color:white}
.pf-toast-error{background:#fef2f2;color:#b91c1c;border:1px solid #fecaca}

/* ── RESPONSIVE ADJUSTMENTS ── */
@media(max-width:1100px){.s-search{max-width:200px}}
@media(max-width:900px){
  .s-sidebar{display:none}
  .s-content{padding:1.5rem}
  .nav-tabs{display:none}
}
`;

// ─── COMPONENT ────────────────────────────────────────────────────────────────
export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user: authUser, profile: authProfile, signOut } = useAuth();

  // ── UI state ──────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab]           = useState('feed');
  const [pfTab, setPfTab]                   = useState('overview');
  const [pfEditing, setPfEditing]           = useState(false);
  const [pfSaving, setPfSaving]             = useState(false);
  const [pfForm, setPfForm]                 = useState({});
  const [pfToast, setPfToast]               = useState(null);
  const [skillInput, setSkillInput]         = useState('');
  const [showDetails, setShowDetails]       = useState(false);
  const [sidebarEditMode, setSidebarEditMode] = useState(false);
  const [coverPreview, setCoverPreview]     = useState(null);

  // ── Data state ────────────────────────────────────────────────────────────
  const [profile, setProfile]             = useState(null);
  const [industries, setIndustries]       = useState([]);
  const [courses, setCourses]             = useState([]);
  const [allJobs, setAllJobs]             = useState([]);
  const [matchedJobs, setMatchedJobs]     = useState([]);
  const [vacancies, setVacancies]         = useState([]);
  const [myApplications, setMyApplications] = useState([]);

  // ── Modal / overlay state ─────────────────────────────────────────────────
  const [applyModal, setApplyModal]         = useState(null);
  const [detailModal, setDetailModal]       = useState(null);
  const [coverLetter, setCoverLetter]       = useState('');
  const [activeChat, setActiveChat]         = useState(null);
  const [chatInput, setChatInput]           = useState('');

  // ── Loading flags ─────────────────────────────────────────────────────────
  const [feedLoading, setFeedLoading]   = useState(true);
  const [matchLoading, setMatchLoading] = useState(false);

  // ── Search ────────────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');

  // ── Notifications ─────────────────────────────────────────────────────────
  const [toasts, setToasts] = useState([]);

  // ── Refs ──────────────────────────────────────────────────────────────────
  const coverRef   = useRef();
  const avatarRef  = useRef();
  const certRef    = useRef();
  const resumeRef  = useRef();
  const postRef    = useRef();
  const chatEndRef = useRef();
  const chatInputRef = useRef();
  const matchFetched = useRef(false); // ← FIX: prevents re-fetch loop

  // ── Toast helper ──────────────────────────────────────────────────────────
  const toast = useCallback((msg) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  const showPfToast = useCallback((msg, type = 'success') => {
    setPfToast({ msg, type });
    setTimeout(() => setPfToast(null), 3000);
  }, []);

  // ── BOOT: load profile + feed data ───────────────────────────────────────
  // FIX: only runs once on mount (authUser?.id stable), no re-trigger loops
  useEffect(() => {
    if (!authUser?.id) return;

    // Seed from authContext immediately (no loading flash)
    if (authProfile) {
      setProfile(buildProfile(authProfile, { email: authUser.email }));
    }

    let cancelled = false;

    const boot = async () => {
      setFeedLoading(true);
      try {
        // 1. Full profile
        try {
          const url = `${BASE}/api/get-profile?user_id=${authUser.id}`;
          const res = await axios.get(url, { timeout: 7000 });
          if (!cancelled && res.data) {
            setProfile(buildProfile(res.data, { email: authUser.email }));
          }
        } catch {/* keep seed */}

        // 2. All feed data in parallel
        const [indR, courseR, vacR, appR, jobR] = await Promise.allSettled([
          axios.get(`${BASE}/api/industries`, { timeout: 8000 }),
          axios.get(`${BASE}/api/courses`, { timeout: 8000 }),
          axios.get(`${BASE}/api/vacancies`, { timeout: 8000 }),
          axios.get(`${BASE}/api/applications/student/${authUser.id}`, { timeout: 8000 }),
          axios.get(`${BASE}/api/all-jobs`, { timeout: 8000 }),
        ]);

        if (cancelled) return;

        // Industries
        const indData = indR.status === 'fulfilled' && Array.isArray(indR.value?.data) && indR.value.data.length
          ? indR.value.data : MOCK_INDUSTRIES;
        setIndustries(indData);

        // Courses
        const courseData = courseR.status === 'fulfilled' && Array.isArray(courseR.value?.data) && courseR.value.data.length
          ? courseR.value.data : MOCK_COURSES;
        setCourses(courseData);

        // Vacancies
        if (vacR.status === 'fulfilled' && Array.isArray(vacR.value?.data)) {
          setVacancies(vacR.value.data.map(v => ({
            id: v.id,
            ownerId: v.owner_id,
            ownerName: v.owner_name || indData.find(i => i.id === v.owner_id)?.name || 'Company',
            ownerLogo: (v.owner_name || 'CO').substring(0, 2).toUpperCase(),
            type: v.type || 'Job Vacancy',
            title: v.title,
            desc: v.description || v.desc || '',
            skills: v.skills || '',
            duration: v.duration || 'Full-Time',
            offerings: v.offerings || '',
            date: v.created_at ? new Date(v.created_at).toLocaleDateString() : 'Recent',
            likes: v.likes || 0,
          })));
        } else {
          setVacancies(MOCK_VACANCIES);
        }

        // Applications
        if (appR.status === 'fulfilled' && Array.isArray(appR.value?.data)) {
          setMyApplications(appR.value.data.map(a => ({
            id: a.id,
            postId: a.vacancy_id,
            role: a.vacancies?.title || 'Role',
            company: a.vacancies?.owner_name || 'Company',
            appliedOn: new Date(a.created_at).toLocaleDateString(),
            status: a.status || 'Pending',
            coverLetter: a.cover_letter,
          })));
        }

        // Jobs
        if (jobR.status === 'fulfilled') {
          let raw = jobR.value?.data || [];
          if (typeof raw === 'string') { try { raw = JSON.parse(raw); } catch { raw = []; } }
          if (!Array.isArray(raw)) raw = [];
          const jobs = raw.map(j => ({
            industry: j.industry || j.company || 'Company',
            job: j.job || j.title || 'Job Opening',
            desc: j.desc || j.description || '',
            role: j.role || '',
            ug: j.ug || j.education || '',
            pg: j.pg || '',
            url: j.url || j.link || '#',
            dept: j.dept || j.department || '',
            skills: j.skills || '',
          }));
          setAllJobs(jobs.length ? jobs : MOCK_JOBS);
        } else {
          setAllJobs(MOCK_JOBS);
        }
      } catch (err) {
        console.error('Boot error:', err);
      } finally {
        if (!cancelled) setFeedLoading(false);
      }
    };

    boot();
    return () => { cancelled = true; };
  }, [authUser?.id]); // ← FIX: only depend on stable ID, not authProfile object

  // ── AI skill match: run once after profile loads with skills ──────────────
  // FIX: use a ref to prevent re-triggering every render
  useEffect(() => {
    if (!profile?.skills?.length || matchFetched.current) return;
    matchFetched.current = true;

    const doMatch = async () => {
      setMatchLoading(true);
      try {
        const res = await axios.post(
          `${BASE}/api/analyze-skills`,
          { skills: profile.skills.join(', ') },
          { timeout: 12000 }
        );
        setMatchedJobs(Array.isArray(res.data) ? res.data : []);
      } catch {
        setMatchedJobs([]);
      }
      setMatchLoading(false);
    };
    doMatch();
  }, [profile?.skills?.length]); // ← FIX: depend on length, not joined string

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [profile?.chats, activeChat]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const alreadyApplied = useCallback(
    (postId) => myApplications.some(a => a.postId === postId),
    [myApplications]
  );

  const refreshMatch = async () => {
    if (!profile?.skills?.length) return;
    matchFetched.current = true;
    setMatchLoading(true);
    try {
      const res = await axios.post(`${BASE}/api/analyze-skills`, { skills: profile.skills.join(', ') }, { timeout: 12000 });
      setMatchedJobs(Array.isArray(res.data) ? res.data : []);
    } catch { setMatchedJobs([]); }
    setMatchLoading(false);
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!applyModal || !authUser?.id) return;
    try {
      const res = await axios.post(`${BASE}/api/applications`, {
        vacancy_id: applyModal.id,
        student_id: authUser.id,
        cover_letter: coverLetter,
      });
      setMyApplications(prev => [...prev, {
        id: res.data?.id || Date.now(),
        postId: applyModal.id,
        role: applyModal.title,
        company: applyModal.ownerName,
        appliedOn: new Date().toLocaleDateString(),
        status: 'Pending',
      }]);
      toast(`✓ Applied to ${applyModal.title}!`);
      setCoverLetter('');
      setApplyModal(null);
      setDetailModal(null);
    } catch {
      toast('Failed to apply — you may have already applied.');
    }
  };

  const sendMessage = async (toId, text) => {
    if (!authUser?.id || !text.trim()) return;
    try {
      await axios.post(`${BASE}/api/messages`, {
        sender_id: authUser.id, receiver_id: toId, text,
      });
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setProfile(prev => ({
        ...prev,
        chats: {
          ...prev.chats,
          [toId]: [...(prev.chats?.[toId] || []), { sender: prev.name, message: text, time }],
        },
      }));
    } catch {
      toast('Failed to send message.');
    }
  };

  const handleLogout = async () => {
    try { await signOut(); } catch { /* ignore */ }
    navigate('/login');
  };

  // ── Profile save ──────────────────────────────────────────────────────────
  const startEdit = () => {
    setPfForm({
      name: profile?.name || '',
      phone: profile?.phone || '',
      address: profile?.address || '',
      about: profile?.about || '',
      qualification: profile?.qualification || '',
      tenth: profile?.tenth || '',
      twelfth: profile?.twelfth || '',
      graduation: profile?.graduation || '',
      website: profile?.website || '',
      linkedin: profile?.linkedin || '',
      github: profile?.github || '',
      experience: profile?.experience || '',
      projects: profile?.projects || '',
      achievements: profile?.achievements || '',
      cgpa: profile?.cgpa || '',
      skills: [...(profile?.skills || [])],
      certificates: [...(profile?.certificates || [])],
      resumes: [...(profile?.resumes || [])],
      personalPosts: [...(profile?.personalPosts || [])],
    });
    setPfEditing(true);
    setPfTab('overview');
  };

  const cancelEdit = () => {
    setPfEditing(false);
    setPfForm({});
  };

  const saveProfile = async () => {
    if (!profile?.id) return;
    setPfSaving(true);
    try {
      await axios.put(`${BASE}/api/profile/${profile.id}`, pfForm);
      setProfile(prev => ({ ...prev, ...pfForm }));
      setPfEditing(false);
      setPfForm({});
      showPfToast('✓ Profile saved');
    } catch {
      showPfToast('✗ Could not save — changes stored locally', 'error');
      setProfile(prev => ({ ...prev, ...pfForm }));
      setPfEditing(false);
    }
    setPfSaving(false);
  };

  const pfSet = (k, v) => setPfForm(p => ({ ...p, [k]: v }));

  const addSkill = (s) => {
    const sk = s.trim();
    if (!sk || pfForm.skills?.includes(sk)) return;
    pfSet('skills', [...(pfForm.skills || []), sk]);
    setSkillInput('');
  };

  const removeSkill = (s) => pfSet('skills', pfForm.skills.filter(x => x !== s));

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const b64 = await toBase64(file);
    try {
      await axios.put(`${BASE}/api/profile/${profile.id}`, { photo: b64 });
      setProfile(p => ({ ...p, photo: b64 }));
      showPfToast('✓ Photo updated');
    } catch {
      showPfToast('✗ Upload failed', 'error');
    }
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const b64 = await toBase64(file);
    setCoverPreview(b64);
    try { await axios.put(`${BASE}/api/profile/${profile.id}`, { coverPhoto: b64 }); } catch { /* local only */ }
  };

  const handleCertUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    const results = await Promise.all(files.map(async f => ({ url: await toBase64(f), type: f.type, name: f.name })));
    pfSet('certificates', [...(pfForm.certificates || []), ...results]);
  };

  const handleResumeUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    const results = await Promise.all(files.map(async f => ({ url: await toBase64(f), type: f.type, name: f.name })));
    pfSet('resumes', [...(pfForm.resumes || []), ...results]);
  };

  const handlePostUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    const results = await Promise.all(files.map(async f => ({ url: await toBase64(f), type: f.type, name: f.name })));
    pfSet('personalPosts', [...(pfForm.personalPosts || []), ...results]);
  };

  // ── Sidebar quick-save ────────────────────────────────────────────────────
  const saveSidebarEdits = async () => {
    if (!authUser?.id || !profile) return;
    try {
      await axios.put(`${BASE}/api/profile/${authUser.id}`, {
        name: profile.name, qualification: profile.qualification,
        phone: profile.phone, address: profile.address,
        tenth: profile.tenth, twelfth: profile.twelfth,
        graduation: profile.graduation, skills: profile.skills, about: profile.about,
      });
      toast('✓ Profile saved');
    } catch {
      toast('Changes saved locally.');
    }
    setSidebarEditMode(false);
  };

  // ── Computed ──────────────────────────────────────────────────────────────
  const completion = useMemo(() => calcCompletion(profile), [profile]);

  const filteredJobs = useMemo(() =>
    allJobs.filter(j =>
      !searchQuery ||
      j.job?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.industry?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.skills?.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    [allJobs, searchQuery]
  );

  const filteredSugg = useMemo(() =>
    SKILL_SUGGESTIONS.filter(
      s => s.toLowerCase().includes(skillInput.toLowerCase()) &&
           !(pfForm.skills || []).includes(s)
    ).slice(0, 8),
    [skillInput, pfForm.skills]
  );

  // ── Type badge helper ─────────────────────────────────────────────────────
  const TypeBadge = ({ type }) => {
    if (!type) return <span className="type-badge badge-job">Job</span>;
    const t = type.toLowerCase();
    if (t.includes('intern'))  return <span className="type-badge badge-intern">Internship</span>;
    if (t.includes('train'))   return <span className="type-badge badge-train">Training</span>;
    if (t.includes('campus'))  return <span className="type-badge badge-campus">Campus Drive</span>;
    return <span className="type-badge badge-job">{type}</span>;
  };

  // ── Loading guard (profile not yet ready) ─────────────────────────────────
  if (!profile) {
    return (
      <div style={{ height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f8faff', flexDirection:'column', gap:'1.2rem', fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
        <style>{CSS}</style>
        <div style={{ fontFamily:"'Clash Display',sans-serif", fontSize:'1.6rem', fontWeight:700, color:'#0f172a' }}>
          Campus<span style={{ color:'#6366f1' }}>2</span>Career
        </div>
        <div className="spinner" />
        <div style={{ fontSize:'.82rem', color:'#94a3b8' }}>Loading your dashboard…</div>
      </div>
    );
  }

  // ── SIDEBAR PANEL ─────────────────────────────────────────────────────────
  const SidebarPanel = () => (
    <div style={{ height:'100%', overflowY:'auto' }}>
      {/* Header */}
      <div className="sb-header">
        <div className="sb-av-wrap">
          <div className="sb-av" onClick={() => avatarRef.current?.click()} style={{ cursor:'pointer' }}>
            {profile.photo ? <img src={profile.photo} alt="" /> : (profile.name || 'S')[0].toUpperCase()}
          </div>
          <input ref={avatarRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleAvatarUpload} />
          <div style={{ flex:1, minWidth:0 }}>
            <div className="sb-name">{profile.name || 'Student'}</div>
            <div className="sb-handle">@{profile.username || 'student'}</div>
          </div>
          {sidebarEditMode
            ? <button className="sb-save-btn" onClick={saveSidebarEdits}>✓ Save</button>
            : <button className="sb-edit-btn" onClick={() => setSidebarEditMode(true)}>✎ Edit</button>}
        </div>
        <div className="sb-tags">
          {profile.qualification && <span className="sb-tag">🎓 {profile.qualification}</span>}
          {(profile.skills || []).slice(0, 3).map((s, i) => (
            <span key={i} className="sb-tag">⚡ {s}</span>
          ))}
        </div>
      </div>

      {/* Completion */}
      <div className="comp-wrap">
        <div className="comp-head">
          <span>Profile strength</span>
          <span className="comp-num" style={{ color: completion >= 80 ? '#10b981' : completion >= 50 ? '#f59e0b' : '#f43f5e' }}>
            {completion}%
          </span>
        </div>
        <div className="comp-track">
          <div className="comp-fill" style={{ width: `${completion}%` }} />
        </div>
      </div>

      {/* Sidebar quick-edit */}
      {sidebarEditMode && (
        <>
          <div className="sb-form-section">
            <span className="sb-form-label">Personal Info</span>
            <div className="sb-form-grid">
              {[
                { k:'name', label:'Full Name' },
                { k:'phone', label:'Phone' },
                { k:'address', label:'City' },
                { k:'qualification', label:'Qualification' },
              ].map(f => (
                <input key={f.k} className="sb-input" placeholder={f.label}
                  value={profile[f.k] || ''}
                  onChange={e => setProfile(p => ({ ...p, [f.k]: e.target.value }))} />
              ))}
            </div>
          </div>
          <div className="sb-form-section">
            <span className="sb-form-label">Academic</span>
            {[
              { k:'tenth', label:'10th Board / %' },
              { k:'twelfth', label:'12th Board / %' },
              { k:'graduation', label:'Graduation / College' },
            ].map(f => (
              <input key={f.k} className="sb-input" placeholder={f.label} style={{ marginBottom:'.35rem' }}
                value={profile[f.k] || ''}
                onChange={e => setProfile(p => ({ ...p, [f.k]: e.target.value }))} />
            ))}
          </div>
          <div className="sb-form-section">
            <span className="sb-form-label">Resume</span>
            <label className="sb-upload-btn">
              📄 Upload Resume
              <input type="file" accept=".pdf,image/*" style={{ display:'none' }}
                onChange={e => {
                  const file = e.target.files[0];
                  if (!file) return;
                  setProfile(prev => ({
                    ...prev,
                    resumes: [...prev.resumes, {
                      url: URL.createObjectURL(file),
                      name: file.name, type: file.type,
                      size: (file.size / 1024).toFixed(0) + ' KB',
                    }],
                  }));
                  toast('Resume added');
                }} />
            </label>
            {(profile.resumes || []).map((r, i) => (
              <div key={i} className="resume-pill" style={{ marginTop:'.35rem' }}>
                <span>{r.type === 'application/pdf' ? '📑' : '🖼️'}</span>
                <span className="resume-pill-name">{r.name}</span>
                <button className="resume-del-btn" onClick={() => setProfile(p => ({ ...p, resumes: p.resumes.filter((_, j) => j !== i) }))}>✕</button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Details toggle */}
      <button className="sb-details-btn" onClick={() => setShowDetails(d => !d)}>
        <span style={{ fontSize:'.62rem' }}>{showDetails ? '▲' : '▼'}</span>
        {showDetails ? 'Hide Details' : 'View Full Details'}
      </button>
      {showDetails && (
        <div className="details-box">
          {[
            ['✉', profile.email],
            ['📞', profile.phone || 'Not provided'],
            ['📍', profile.address || 'Not provided'],
          ].map(([icon, val], i) => (
            <div key={i} className="detail-row">{icon} {val}</div>
          ))}
          {profile.linkedin && <div className="detail-row">🔗 <a href={profile.linkedin} target="_blank" rel="noreferrer" style={{ color:'var(--brand)', textDecoration:'none' }}>{profile.linkedin}</a></div>}
          {profile.github && <div className="detail-row">🐙 <a href={profile.github} target="_blank" rel="noreferrer" style={{ color:'var(--brand)', textDecoration:'none' }}>{profile.github}</a></div>}
          <div className="detail-row-label">Academic</div>
          <div className="detail-row">10th — {profile.tenth || '—'}</div>
          <div className="detail-row">12th — {profile.twelfth || '—'}</div>
          <div className="detail-row">Graduation — {profile.graduation || '—'}</div>
          {profile.cgpa && <div className="detail-row">CGPA — {profile.cgpa}</div>}
        </div>
      )}

      {/* Resumes */}
      <div className="sb-media-sec">
        <div className="sb-media-title">Resumes ({(profile.resumes || []).length})</div>
        {(profile.resumes || []).length === 0
          ? <div style={{ fontSize:'.74rem', color:'var(--text-muted)' }}>No resumes uploaded.</div>
          : (profile.resumes || []).map((r, i) => (
            <div key={i} className="resume-pill">
              <span>{r.type === 'application/pdf' ? '📑' : '🖼️'}</span>
              <span className="resume-pill-name">{r.name}</span>
              <button className="resume-del-btn" onClick={() => setProfile(p => ({ ...p, resumes: p.resumes.filter((_, j) => j !== i) }))}>✕</button>
            </div>
          ))
        }
      </div>

      {/* Certificates */}
      <div className="sb-media-sec">
        <div className="sb-media-title">Certificates ({(profile.certificates || []).length})</div>
        {(profile.certificates || []).length === 0
          ? <div style={{ fontSize:'.74rem', color:'var(--text-muted)' }}>No certificates.</div>
          : <div className="media-grid">
              {(profile.certificates || []).map((c, i) => (
                <div key={i} className="media-cell" onClick={() => window.open(c.url, '_blank')}>
                  <img src={c.url} alt="" />
                </div>
              ))}
            </div>
        }
      </div>

      {/* Activity posts */}
      <div className="sb-media-sec">
        <div className="sb-media-title">Activity Posts ({(profile.personalPosts || []).length})</div>
        {(profile.personalPosts || []).length === 0
          ? <div style={{ fontSize:'.74rem', color:'var(--text-muted)' }}>No posts yet.</div>
          : <div className="media-grid">
              {(profile.personalPosts || []).map((p, i) => (
                <div key={i} className="media-cell" onClick={() => window.open(p.url, '_blank')}>
                  {p.type?.startsWith('video') ? <video src={p.url} /> : <img src={p.url} alt="" />}
                </div>
              ))}
            </div>
        }
      </div>
    </div>
  );

  // ── PROFILE PAGE ──────────────────────────────────────────────────────────
  const ProfilePage = () => {
    const data = pfEditing ? pfForm : profile;
    const skills = data?.skills || [];
    const certs = data?.certificates || [];
    const resumes = data?.resumes || [];
    const posts = data?.personalPosts || [];

    return (
      <div className="pf-page">
        {/* Hidden inputs */}
        <input ref={coverRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleCoverUpload} />
        <input ref={avatarRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleAvatarUpload} />
        <input ref={certRef} type="file" accept="image/*,application/pdf" multiple style={{ display:'none' }} onChange={handleCertUpload} />
        <input ref={resumeRef} type="file" accept="application/pdf,image/*" multiple style={{ display:'none' }} onChange={handleResumeUpload} />
        <input ref={postRef} type="file" accept="image/*,video/*" multiple style={{ display:'none' }} onChange={handlePostUpload} />

        {/* Cover */}
        <div className="pf-cover-wrap" onClick={() => coverRef.current?.click()}>
          {(coverPreview || profile.coverPhoto)
            ? <img src={coverPreview || profile.coverPhoto} alt="cover" />
            : <div className="pf-cover-default" />}
          <div className="pf-cover-ov"><span className="pf-cover-lbl">📸 Change Cover</span></div>
        </div>

        {/* Hero */}
        <div className="pf-hero">
          <div className="pf-hero-row">
            <div className="pf-av-wrap">
              <div className="pf-av" onClick={() => avatarRef.current?.click()}>
                {profile.photo
                  ? <img src={profile.photo} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                  : (profile.name || 'S')[0].toUpperCase()}
              </div>
              <div className="pf-av-cam" onClick={() => avatarRef.current?.click()}>📷</div>
            </div>

            <div className="pf-completion-badge">
              <div className="pf-completion-num" style={{ color: completion >= 80 ? '#10b981' : '#6366f1' }}>{completion}%</div>
              <div className="pf-completion-lbl">Complete</div>
            </div>

            <div className="pf-hero-actions" style={{ marginLeft:'auto' }}>
              {pfEditing
                ? <>
                    <button className="pf-edit-btn" onClick={cancelEdit}>Cancel</button>
                    <button className="pf-save-btn" onClick={saveProfile} disabled={pfSaving}>{pfSaving ? 'Saving…' : '💾 Save'}</button>
                  </>
                : <button className="pf-save-btn" onClick={startEdit}>✏️ Edit Profile</button>
              }
            </div>
          </div>

          <div className="pf-name">{profile.name || 'Your Name'}</div>
          <div className="pf-qual-text">{profile.qualification || 'Add your qualification'}</div>
          <div className="pf-meta-row">
            {profile.email && <span>✉ {profile.email}</span>}
            {profile.phone && <span>📞 {profile.phone}</span>}
            {profile.address && <span>📍 {profile.address}</span>}
            {profile.linkedin && <a href={profile.linkedin} target="_blank" rel="noreferrer">🔗 LinkedIn</a>}
            {profile.github && <a href={profile.github} target="_blank" rel="noreferrer">🐙 GitHub</a>}
          </div>
          {profile.about && <div className="pf-about-text">{profile.about}</div>}
          {(profile.skills || []).length > 0 && (
            <div className="pf-skills-row">
              {(profile.skills || []).slice(0, 8).map(s => <span key={s} className="pf-skill-chip">{s}</span>)}
              {(profile.skills || []).length > 8 && (
                <span className="pf-skill-chip" style={{ cursor:'pointer' }} onClick={() => setPfTab('skills')}>
                  +{profile.skills.length - 8}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="pf-tabs">
          {[
            { id:'overview', label:'👤 Overview' },
            { id:'skills', label:'⚡ Skills' },
            { id:'academic', label:'🎓 Academic' },
            { id:'experience', label:'💼 Experience' },
            { id:'media', label:'🖼️ Media' },
            { id:'resume', label:'📄 Resume' },
          ].map(t => (
            <button key={t.id} className={`pf-tab ${pfTab === t.id ? 'active' : ''}`} onClick={() => setPfTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* OVERVIEW */}
          {pfTab === 'overview' && (
            <motion.div key="ov" initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
              <div className="pf-card">
                <div className="pf-card-title">✍️ About Me</div>
                {pfEditing
                  ? <textarea className="pf-input" style={{ width:'100%' }} rows={4}
                      placeholder="Write about yourself, interests, goals…"
                      value={pfForm.about || ''}
                      onChange={e => pfSet('about', e.target.value)} />
                  : <p style={{ color:'var(--text-secondary)', lineHeight:1.7, fontSize:'.85rem' }}>
                      {profile.about || <em style={{ color:'var(--text-muted)' }}>No bio yet. Click Edit Profile to add one.</em>}
                    </p>
                }
              </div>

              <div className="pf-card">
                <div className="pf-card-title">📋 Personal Information</div>
                {pfEditing
                  ? <div className="pf-grid">
                      {[
                        { k:'name', l:'Full Name', p:'Your full name' },
                        { k:'phone', l:'Phone', p:'+91 XXXXXXXXXX' },
                        { k:'address', l:'City / Location', p:'Your city' },
                        { k:'cgpa', l:'CGPA / %', p:'e.g. 8.5' },
                        { k:'experience', l:'Experience', p:'e.g. 6-month intern at XYZ' },
                        { k:'website', l:'Portfolio', p:'https://...' },
                        { k:'linkedin', l:'LinkedIn', p:'linkedin.com/in/...' },
                        { k:'github', l:'GitHub', p:'github.com/username' },
                      ].map(f => (
                        <div className="pf-field" key={f.k}>
                          <label className="pf-label">{f.l}</label>
                          <input className="pf-input" placeholder={f.p} value={pfForm[f.k] || ''} onChange={e => pfSet(f.k, e.target.value)} />
                        </div>
                      ))}
                      <div className="pf-field">
                        <label className="pf-label">Qualification</label>
                        <select className="pf-input" value={pfForm.qualification || ''} onChange={e => pfSet('qualification', e.target.value)}>
                          <option value="">Select…</option>
                          {['10th','12th','Diploma','ITI','BCA','B.Tech','B.Sc','B.Com','BA','MCA','M.Tech','M.Sc','MBA','PhD','Other'].map(q => (
                            <option key={q} value={q}>{q}</option>
                          ))}
                        </select>
                      </div>
                      <div className="pf-field">
                        <label className="pf-label">Email (read-only)</label>
                        <input className="pf-input" value={profile.email || ''} readOnly style={{ opacity:.6, cursor:'not-allowed' }} />
                      </div>
                    </div>
                  : <div className="pf-grid">
                      {[
                        ['Full Name', profile.name], ['Email', profile.email],
                        ['Phone', profile.phone], ['Location', profile.address],
                        ['Qualification', profile.qualification], ['CGPA / %', profile.cgpa],
                        ['Experience', profile.experience], ['Portfolio', profile.website],
                        ['LinkedIn', profile.linkedin], ['GitHub', profile.github],
                      ].map(([l, v]) => (
                        <div key={l}>
                          <div className="pf-label" style={{ marginBottom:'.2rem' }}>{l}</div>
                          <div style={{ fontSize:'.85rem', fontWeight:600, color: v ? 'var(--text-primary)' : 'var(--text-muted)', fontStyle: v ? 'normal' : 'italic', wordBreak:'break-all' }}>
                            {v || 'Not provided'}
                          </div>
                        </div>
                      ))}
                    </div>
                }
                {pfEditing && (
                  <div style={{ display:'flex', justifyContent:'flex-end', marginTop:'1.2rem' }}>
                    <button className="pf-save-btn" onClick={saveProfile} disabled={pfSaving}>{pfSaving ? 'Saving…' : '💾 Save'}</button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* SKILLS */}
          {pfTab === 'skills' && (
            <motion.div key="sk" initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
              <div className="pf-card">
                <div className="pf-card-title">⚡ Skills & Expertise</div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:'.35rem' }}>
                  {skills.map(s => (
                    <span key={s} className="pf-skill-chip" style={{ display:'inline-flex', alignItems:'center', gap:4 }}>
                      {s}
                      {pfEditing && (
                        <button onClick={() => removeSkill(s)} style={{ background:'none', border:'none', color:'var(--rose)', cursor:'pointer', fontWeight:800, fontSize:'.6rem', lineHeight:1, padding:0 }}>✕</button>
                      )}
                    </span>
                  ))}
                  {skills.length === 0 && <em style={{ color:'var(--text-muted)', fontSize:'.83rem' }}>No skills added yet.</em>}
                </div>

                {pfEditing && (
                  <>
                    <div style={{ height:1, background:'var(--border)', margin:'1rem 0' }} />
                    <div className="pf-label" style={{ marginBottom:'.45rem' }}>Add Skill</div>
                    <div className="skill-add-row">
                      <input className="pf-input" style={{ flex:1 }} placeholder="Type skill name…"
                        value={skillInput}
                        onChange={e => setSkillInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(skillInput); } }} />
                      <button className="pf-save-btn" style={{ padding:'.62rem 1.2rem', whiteSpace:'nowrap' }} onClick={() => addSkill(skillInput)}>+ Add</button>
                    </div>
                    {skillInput && filteredSugg.length > 0 && (
                      <div style={{ display:'flex', flexWrap:'wrap', gap:'.3rem', marginTop:'.5rem' }}>
                        {filteredSugg.map(s => <span key={s} className="skill-sugg" onClick={() => addSkill(s)}>{s}</span>)}
                      </div>
                    )}
                    {!skillInput && (
                      <>
                        <div className="pf-label" style={{ marginTop:'.9rem', marginBottom:'.4rem' }}>Quick add</div>
                        <div style={{ display:'flex', flexWrap:'wrap', gap:'.3rem' }}>
                          {SKILL_SUGGESTIONS.filter(s => !skills.includes(s)).slice(0, 20).map(s => (
                            <span key={s} className="skill-sugg" onClick={() => addSkill(s)}>{s}</span>
                          ))}
                        </div>
                      </>
                    )}
                    <div style={{ display:'flex', justifyContent:'flex-end', marginTop:'1.2rem' }}>
                      <button className="pf-save-btn" onClick={saveProfile} disabled={pfSaving}>{pfSaving ? 'Saving…' : '💾 Save Skills'}</button>
                    </div>
                  </>
                )}
                {!pfEditing && (
                  <div style={{ marginTop:'.9rem' }}>
                    <button className="pf-edit-btn" onClick={startEdit}>✏️ Edit Skills</button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ACADEMIC */}
          {pfTab === 'academic' && (
            <motion.div key="ac" initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
              <div className="pf-card">
                <div className="pf-card-title">🎓 Academic Background</div>
                {pfEditing
                  ? <div className="pf-grid-3">
                      {[
                        { k:'tenth', l:'10th', p:'Board / School / %' },
                        { k:'twelfth', l:'12th', p:'Board / School / %' },
                        { k:'graduation', l:'Graduation', p:'College / Degree / CGPA' },
                      ].map(f => (
                        <div className="pf-field" key={f.k}>
                          <label className="pf-label">{f.l}</label>
                          <input className="pf-input" placeholder={f.p} value={pfForm[f.k] || ''} onChange={e => pfSet(f.k, e.target.value)} />
                        </div>
                      ))}
                    </div>
                  : <div className="pf-grid-3">
                      {[['10th Standard', profile.tenth], ['12th Standard', profile.twelfth], ['Graduation', profile.graduation]].map(([l, v]) => (
                        <div className="pf-acad-box" key={l}>
                          <div className="pf-acad-lbl">{l}</div>
                          <div className="pf-acad-val">{v || <em style={{ color:'var(--text-muted)', fontStyle:'italic', fontSize:'.8rem' }}>Not added</em>}</div>
                        </div>
                      ))}
                    </div>
                }
                {pfEditing && (
                  <div style={{ display:'flex', justifyContent:'flex-end', marginTop:'1.2rem' }}>
                    <button className="pf-save-btn" onClick={saveProfile} disabled={pfSaving}>{pfSaving ? 'Saving…' : '💾 Save'}</button>
                  </div>
                )}
                {!pfEditing && <div style={{ marginTop:'1rem' }}><button className="pf-edit-btn" onClick={startEdit}>✏️ Edit Academic</button></div>}
              </div>
            </motion.div>
          )}

          {/* EXPERIENCE */}
          {pfTab === 'experience' && (
            <motion.div key="ex" initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
              <div className="pf-card">
                <div className="pf-card-title">💼 Experience & Projects</div>
                {pfEditing
                  ? <div style={{ display:'flex', flexDirection:'column', gap:'.85rem' }}>
                      {[
                        { k:'experience', l:'Work / Internship Experience', p:'e.g. 6-month intern at TechCorp…', rows:4 },
                        { k:'projects', l:'Projects', p:'Describe your key projects, tech stack, outcomes…', rows:4 },
                        { k:'achievements', l:'Achievements / Awards', p:'Hackathon wins, certifications…', rows:3 },
                      ].map(f => (
                        <div className="pf-field" key={f.k}>
                          <label className="pf-label">{f.l}</label>
                          <textarea className="pf-input" rows={f.rows} placeholder={f.p}
                            value={pfForm[f.k] || ''} onChange={e => pfSet(f.k, e.target.value)} />
                        </div>
                      ))}
                      <div style={{ display:'flex', justifyContent:'flex-end' }}>
                        <button className="pf-save-btn" onClick={saveProfile} disabled={pfSaving}>{pfSaving ? 'Saving…' : '💾 Save'}</button>
                      </div>
                    </div>
                  : <div style={{ display:'flex', flexDirection:'column', gap:'1.2rem' }}>
                      {[
                        ['Work / Internship Experience', profile.experience],
                        ['Projects', profile.projects],
                        ['Achievements / Awards', profile.achievements],
                      ].map(([l, v]) => (
                        <div key={l}>
                          <div className="pf-label" style={{ marginBottom:'.4rem' }}>{l}</div>
                          <p style={{ fontSize:'.85rem', color: v ? 'var(--text-secondary)' : 'var(--text-muted)', lineHeight:1.65, fontStyle: v ? 'normal' : 'italic' }}>
                            {v || `No ${l.toLowerCase()} added yet.`}
                          </p>
                        </div>
                      ))}
                      <button className="pf-edit-btn" onClick={startEdit}>✏️ Add Experience</button>
                    </div>
                }
              </div>
            </motion.div>
          )}

          {/* MEDIA */}
          {pfTab === 'media' && (
            <motion.div key="md" initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
              {/* Certificates */}
              <div className="pf-card">
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem' }}>
                  <div className="pf-card-title" style={{ marginBottom:0 }}>🏆 Certificates</div>
                  {pfEditing && <button className="pf-edit-btn" onClick={() => certRef.current?.click()}>+ Upload</button>}
                </div>
                <div className="pf-upload-grid">
                  {certs.map((c, i) => (
                    <div className="pf-thumb" key={i} onClick={() => window.open(c.url, '_blank')}>
                      {c.type?.startsWith('image/')
                        ? <img src={c.url} alt="" />
                        : <div style={{ width:'100%', height:'100%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'var(--surface2)' }}>
                            <span style={{ fontSize:'1.6rem' }}>📑</span>
                            <span style={{ fontSize:'.58rem', fontWeight:700, color:'var(--text-muted)', marginTop:2 }}>PDF</span>
                          </div>
                      }
                      {pfEditing && (
                        <button className="pf-thumb-del" onClick={e => { e.stopPropagation(); pfSet('certificates', pfForm.certificates.filter((_, j) => j !== i)); }}>✕</button>
                      )}
                    </div>
                  ))}
                  {pfEditing && (
                    <div className="pf-add-thumb" onClick={() => certRef.current?.click()}>
                      <span style={{ fontSize:'1.3rem' }}>+</span>
                      <span>Add</span>
                    </div>
                  )}
                  {!pfEditing && certs.length === 0 && <em style={{ color:'var(--text-muted)', fontSize:'.8rem' }}>No certificates yet.</em>}
                </div>
              </div>

              {/* Personal Posts */}
              <div className="pf-card">
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem' }}>
                  <div className="pf-card-title" style={{ marginBottom:0 }}>📸 Activity Posts</div>
                  {pfEditing && <button className="pf-edit-btn" onClick={() => postRef.current?.click()}>+ Upload</button>}
                </div>
                <div className="pf-upload-grid">
                  {posts.map((p, i) => (
                    <div className="pf-thumb" key={i} onClick={() => window.open(p.url, '_blank')}>
                      {p.type?.startsWith('image/')
                        ? <img src={p.url} alt="" />
                        : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--surface2)' }}>
                            <span style={{ fontSize:'1.6rem' }}>🎬</span>
                          </div>
                      }
                      {pfEditing && (
                        <button className="pf-thumb-del" onClick={e => { e.stopPropagation(); pfSet('personalPosts', pfForm.personalPosts.filter((_, j) => j !== i)); }}>✕</button>
                      )}
                    </div>
                  ))}
                  {pfEditing && (
                    <div className="pf-add-thumb" onClick={() => postRef.current?.click()}>
                      <span style={{ fontSize:'1.3rem' }}>+</span>
                      <span>Add</span>
                    </div>
                  )}
                  {!pfEditing && posts.length === 0 && <em style={{ color:'var(--text-muted)', fontSize:'.8rem' }}>No posts yet.</em>}
                </div>
                {pfEditing && (
                  <div style={{ display:'flex', justifyContent:'flex-end', marginTop:'1.1rem' }}>
                    <button className="pf-save-btn" onClick={saveProfile} disabled={pfSaving}>{pfSaving ? 'Saving…' : '💾 Save Media'}</button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* RESUME */}
          {pfTab === 'resume' && (
            <motion.div key="rv" initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
              <div className="pf-card">
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.2rem' }}>
                  <div className="pf-card-title" style={{ marginBottom:0 }}>📄 My Resumes</div>
                  {pfEditing && <button className="pf-edit-btn" onClick={() => resumeRef.current?.click()}>+ Upload</button>}
                </div>
                {resumes.length === 0
                  ? <div style={{ textAlign:'center', padding:'2rem 1rem', color:'var(--text-muted)' }}>
                      <div style={{ fontSize:'2rem', marginBottom:'.5rem' }}>📄</div>
                      <div style={{ fontWeight:700, color:'var(--text-secondary)', marginBottom:'.3rem' }}>No resumes yet</div>
                      <div style={{ fontSize:'.75rem', marginBottom:'1rem' }}>Upload a resume to attach to your applications.</div>
                      {pfEditing
                        ? <button className="pf-save-btn" onClick={() => resumeRef.current?.click()}>+ Upload Resume</button>
                        : <button className="pf-edit-btn" onClick={startEdit}>Go to Edit Mode</button>
                      }
                    </div>
                  : resumes.map((r, i) => (
                    <div className="pf-resume-row" key={i}>
                      <div className="pf-resume-icon">{r.type === 'application/pdf' ? '📑' : '🖼️'}</div>
                      <div style={{ flex:1 }}>
                        <div className="pf-resume-name">{r.name || `Resume ${i + 1}`}</div>
                        <div className="pf-resume-type">{r.type}</div>
                      </div>
                      <div style={{ display:'flex', gap:'.4rem' }}>
                        <a href={r.url} target="_blank" rel="noreferrer">
                          <button style={{ padding:'.35rem .8rem', background:'var(--brand-xlight)', border:'none', borderRadius:7, fontSize:'.7rem', fontWeight:700, color:'var(--brand)', cursor:'pointer' }}>View</button>
                        </a>
                        {pfEditing && (
                          <button style={{ padding:'.35rem .75rem', background:'rgba(244,63,94,.07)', border:'1px solid rgba(244,63,94,.2)', borderRadius:7, fontSize:'.7rem', fontWeight:700, color:'var(--rose)', cursor:'pointer' }}
                            onClick={() => pfSet('resumes', pfForm.resumes.filter((_, j) => j !== i))}>
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                }
                {pfEditing && resumes.length > 0 && (
                  <div style={{ display:'flex', justifyContent:'flex-end', marginTop:'1.1rem' }}>
                    <button className="pf-save-btn" onClick={saveProfile} disabled={pfSaving}>{pfSaving ? 'Saving…' : '💾 Save'}</button>
                  </div>
                )}
                {!pfEditing && resumes.length > 0 && (
                  <div style={{ marginTop:'.9rem' }}><button className="pf-edit-btn" onClick={startEdit}>✏️ Manage Resumes</button></div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* PF Toast */}
        <AnimatePresence>
          {pfToast && (
            <motion.div
              className={`pf-toast ${pfToast.type === 'error' ? 'pf-toast-error' : 'pf-toast-success'}`}
              initial={{ opacity:0, y:14, scale:.95 }}
              animate={{ opacity:1, y:0, scale:1 }}
              exit={{ opacity:0 }}
            >
              {pfToast.msg}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  // ── MAIN RENDER ───────────────────────────────────────────────────────────
  return (
    <>
      <style>{CSS}</style>

      {/* NAV */}
      <nav className="s-nav">
        <div className="brand-wrap">
          <div className="brand-icon">
            <svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          </div>
          <div>
            <div className="brand">Campus<span>2</span>Career</div>
            <div className="brand-sub">Student Portal</div>
          </div>
        </div>

        <div className="s-search">
          <span className="s-search-ico">🔍</span>
          <input
            placeholder="Search jobs, skills, companies…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="nav-tabs">
          {[
            { id:'feed', label:'🏠 Feed' },
            { id:'jobs', label:'💼 Jobs' },
            { id:'courses', label:'📚 Courses' },
            { id:'applications', label:'📋 Applications' },
            { id:'profile', label:'👤 Profile' },
          ].map(t => (
            <button key={t.id} className={`nav-tab ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="nav-actions">
          <div className="nav-btn" title="Notifications">
            🔔<span className="badge" />
          </div>
          <div className="nav-av" title={profile.name}>
            {profile.photo ? <img src={profile.photo} alt="" /> : (profile.name || 'S')[0].toUpperCase()}
          </div>
          <button className="signout-btn" onClick={handleLogout}>Sign Out</button>
        </div>
      </nav>

      <div className="s-layout">
        {/* Sidebar */}
        <aside className="s-sidebar">
          <SidebarPanel />
        </aside>

        {/* Main content */}
        <main className="s-content">
          <AnimatePresence mode="wait">

            {/* ══ FEED ══════════════════════════════════════════════════════ */}
            {activeTab === 'feed' && (
              <motion.div key="feed" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>

                {/* Industries */}
                <div className="page-sec">
                  <div className="sec-head">
                    <div className="sec-title-wrap">
                      <div className="sec-title">Partner Industries</div>
                      <div className="sec-sub">{industries.length} registered companies</div>
                    </div>
                  </div>
                  <div className="ind-grid">
                    {industries.map((ind, i) => (
                      <motion.div key={ind.id || i} className="ind-card"
                        initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay: i * 0.06 }}>
                        <div className="ind-logo">{ind.logo || (ind.name || 'CO').substring(0, 2).toUpperCase()}</div>
                        <div className="ind-name">{ind.name}</div>
                        <div className="ind-domain-tag">{ind.domain}</div>
                        <div className="ind-loc">📍 {ind.location}</div>
                        {ind.tagline && <div className="ind-tagline">"{ind.tagline}"</div>}
                        <button className="msg-btn" onClick={() => setActiveChat(ind)}>💬 Message</button>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Vacancies */}
                <div className="page-sec">
                  <div className="sec-head">
                    <div className="sec-title-wrap">
                      <div className="sec-title">Opportunity Feed</div>
                      <div className="sec-sub">{vacancies.length} openings available</div>
                    </div>
                  </div>
                  {feedLoading
                    ? <div style={{ textAlign:'center', padding:'3rem' }}><div className="spinner" style={{ margin:'0 auto' }} /></div>
                    : <div className="feed-grid">
                        {vacancies.map((v, i) => (
                          <motion.div key={v.id || i} className="vac-card"
                            initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay: i * 0.05 }}>
                            <div className="vac-body">
                              <div className="vac-top">
                                <div className="vac-logo-wrap">
                                  <div className="vac-logo">{v.ownerLogo}</div>
                                  <div>
                                    <div className="vac-company">{v.ownerName}</div>
                                    <div className="vac-date">{v.date}</div>
                                  </div>
                                </div>
                                <TypeBadge type={v.type} />
                              </div>
                              <div className="vac-title">{v.title}</div>
                              <div className="vac-desc">{v.desc}</div>
                              <div className="skill-pills">
                                {(v.skills || '').split(',').filter(Boolean).slice(0, 5).map((sk, j) => (
                                  <span key={j} className="s-pill">{sk.trim()}</span>
                                ))}
                              </div>
                            </div>
                            <div className="vac-foot">
                              <div className="vac-meta">
                                {v.duration && <span className="vac-meta-item">⏱ {v.duration}</span>}
                                {v.offerings && <span className="vac-meta-item">💰 {v.offerings.slice(0, 28)}{v.offerings.length > 28 ? '…' : ''}</span>}
                              </div>
                              <div className="vac-actions">
                                <button className="detail-btn" onClick={() => setDetailModal(v)}>Details</button>
                                {alreadyApplied(v.id)
                                  ? <span className="applied-badge">✓ Applied</span>
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
            {activeTab === 'jobs' && (
              <motion.div key="jobs" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>

                {/* AI Matches */}
                <div className="page-sec">
                  <div className="sec-head">
                    <div className="sec-title-wrap">
                      <div className="sec-title">🤖 AI Skill Matches</div>
                      <div className="sec-sub">Based on your skill profile</div>
                    </div>
                    <button className="sec-action-btn" onClick={refreshMatch} disabled={matchLoading}>
                      {matchLoading ? '…' : '↺ Refresh'}
                    </button>
                  </div>

                  {matchLoading
                    ? <div style={{ textAlign:'center', padding:'2rem' }}><div className="spinner" style={{ margin:'0 auto' }} /></div>
                    : !profile.skills?.length
                      ? <div className="empty-state">
                          <div className="empty-icon">⚡</div>
                          <div className="empty-title">No skills added yet</div>
                          <div className="empty-text">Add skills to your profile to unlock AI-powered job matches.</div>
                          <button className="pf-save-btn" style={{ marginTop:'1rem' }} onClick={() => { setActiveTab('profile'); setTimeout(() => setPfTab('skills'), 100); }}>
                            Add Skills →
                          </button>
                        </div>
                      : matchedJobs.length === 0
                        ? <div className="empty-state">
                            <div className="empty-icon">🔍</div>
                            <div className="empty-title">No matches yet</div>
                            <div className="empty-text">Click Refresh to run the AI skill analysis.</div>
                          </div>
                        : <div className="match-grid">
                            {matchedJobs.map((m, i) => (
                              <motion.div key={i} className="match-card"
                                initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay: i * 0.07 }}>
                                <div className="match-pct">{m.match_confidence ?? m.accuracy ?? 0}%</div>
                                <div className="match-lbl">Match Confidence</div>
                                <div className="match-bar-track">
                                  <div className="match-bar-fill" style={{ width:`${m.match_confidence ?? m.accuracy ?? 0}%` }} />
                                </div>
                                <div className="match-job">{m.job || m.matched_job}</div>
                                {m.industry && <div className="match-industry">📍 {m.industry}</div>}
                                {m.missing_skills?.length > 0 && (
                                  <div style={{ marginBottom:'.65rem' }}>
                                    <div className="missing-label">Skills to Learn</div>
                                    <div>{m.missing_skills.map((s, j) => <span key={j} className="miss-chip">{s}</span>)}</div>
                                  </div>
                                )}
                                {m.courses?.length > 0 && (
                                  <div>
                                    <div className="courses-rec-label">Recommended Courses</div>
                                    {m.courses.map((c, j) => (
                                      <a key={j} href={c.link || c.url || '#'} target="_blank" rel="noreferrer" className="course-rec-item">
                                        <span style={{ fontSize:'.9rem' }}>📚</span>
                                        <span className="course-rec-name">{c.title}</span>
                                        <span style={{ fontSize:'.65rem', color:'var(--brand)', fontWeight:700 }}>→</span>
                                      </a>
                                    ))}
                                  </div>
                                )}
                                {m.url && (
                                  <a href={m.url} target="_blank" rel="noreferrer">
                                    <button className="apply-btn" style={{ width:'100%', marginTop:'.7rem' }}>View Job →</button>
                                  </a>
                                )}
                              </motion.div>
                            ))}
                          </div>
                  }
                </div>

                {/* All jobs */}
                <div className="page-sec">
                  <div className="sec-head">
                    <div className="sec-title-wrap">
                      <div className="sec-title">All Job Listings</div>
                      <div className="sec-sub">{filteredJobs.length} of {allJobs.length} openings</div>
                    </div>
                  </div>
                  <div className="jobs-grid">
                    {filteredJobs.map((j, i) => (
                      <motion.div key={i} className="job-card"
                        initial={{ opacity:0, scale:.97 }} animate={{ opacity:1, scale:1 }} transition={{ delay: i * 0.04 }}>
                        <div className="job-company">{j.industry}</div>
                        <div className="job-title">{j.job}</div>
                        <div className="job-desc">{j.desc}</div>
                        <div className="job-tags">
                          {j.dept && <span className="j-tag" style={{ background:'#e0f2fe', color:'#0369a1', borderColor:'#bae6fd' }}>{j.dept}</span>}
                          {j.role && <span className="j-tag" style={{ background:'#ede9fe', color:'#5b21b6', borderColor:'#ddd6fe' }}>{j.role}</span>}
                          {j.ug && <span className="j-tag" style={{ background:'#dcfce7', color:'#166534', borderColor:'#bbf7d0' }}>{j.ug}</span>}
                        </div>
                        <div className="skill-pills" style={{ marginBottom:'.65rem' }}>
                          {(j.skills || '').split(',').filter(Boolean).slice(0, 4).map((sk, k) => (
                            <span key={k} className="s-pill" style={{ fontSize:'.64rem' }}>{sk.trim()}</span>
                          ))}
                        </div>
                        <div className="job-foot">
                          <span className="job-pg">{j.pg && `PG: ${j.pg}`}</span>
                          <a href={j.url} target="_blank" rel="noreferrer" className="job-apply-link">Apply →</a>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ══ COURSES ═══════════════════════════════════════════════════ */}
            {activeTab === 'courses' && (
              <motion.div key="courses" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
                <div className="sec-head" style={{ marginBottom:'1.3rem' }}>
                  <div className="sec-title-wrap">
                    <div className="sec-title">Recommended Courses</div>
                    <div className="sec-sub">{courses.length} courses available</div>
                  </div>
                </div>
                <div className="courses-grid">
                  {courses.map((c, i) => (
                    <motion.div key={c.id || i} className="course-card"
                      initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay: i * 0.06 }}
                      onClick={() => window.open(c.link || c.url || '#', '_blank')}>
                      <div className="course-top">
                        <div className="course-provider">{c.provider}</div>
                        <div className="course-name">{c.title}</div>
                      </div>
                      <div className="course-body">
                        <div className="course-meta-row">
                          {c.duration && <span className="course-meta-item">⏱ {c.duration}</span>}
                          {c.rating && <span className="course-meta-item">⭐ {c.rating}</span>}
                        </div>
                        {c.level && (
                          <div style={{ marginBottom:'.7rem' }}>
                            <span className={`level-badge level-${c.level}`}>{c.level}</span>
                          </div>
                        )}
                        {(c.skills || []).length > 0 && (
                          <div className="skill-pills" style={{ marginBottom:'.7rem' }}>
                            {c.skills.slice(0, 3).map((sk, j) => <span key={j} className="s-pill">{sk}</span>)}
                          </div>
                        )}
                        <button className="enroll-btn">Enroll Now →</button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ══ APPLICATIONS ══════════════════════════════════════════════ */}
            {activeTab === 'applications' && (
              <motion.div key="apps" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
                <div className="sec-head" style={{ marginBottom:'1.3rem' }}>
                  <div className="sec-title-wrap">
                    <div className="sec-title">My Applications</div>
                    <div className="sec-sub">{myApplications.length} submitted</div>
                  </div>
                </div>
                {myApplications.length === 0
                  ? <div className="empty-state">
                      <div className="empty-icon">📋</div>
                      <div className="empty-title">No applications yet</div>
                      <div className="empty-text">Browse the feed and apply to internships and vacancies.</div>
                      <button className="pf-save-btn" style={{ marginTop:'1rem' }} onClick={() => setActiveTab('feed')}>Browse Openings →</button>
                    </div>
                  : <div className="apps-list">
                      {myApplications.map((a, i) => (
                        <motion.div key={a.id || i} className="app-card"
                          initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} transition={{ delay: i * 0.05 }}>
                          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                            <div>
                              <div className="app-role">{a.role}</div>
                              <div className="app-company">🏢 {a.company}</div>
                            </div>
                            <span className={`status-badge status-${a.status}`}>{a.status}</span>
                          </div>
                          <div className="app-meta">
                            <span>📅 Applied: {a.appliedOn}</span>
                            {a.coverLetter && <span>📝 Cover letter attached</span>}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                }
              </motion.div>
            )}

            {/* ══ PROFILE ═══════════════════════════════════════════════════ */}
            {activeTab === 'profile' && (
              <motion.div key="profile" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
                <ProfilePage />
              </motion.div>
            )}

          </AnimatePresence>
        </main>
      </div>

      {/* ── DM PANEL ── */}
      <AnimatePresence>
        {activeChat && (
          <motion.div className="dm-panel"
            initial={{ y:20, opacity:0 }} animate={{ y:0, opacity:1 }} exit={{ y:20, opacity:0 }}
            transition={{ type:'spring', stiffness:280, damping:28 }}>
            <div className="dm-head">
              <div>
                <div className="dm-recipient-name">{activeChat.name || 'Company'}</div>
                <div className="dm-status-row"><span className="online-dot" /> Active now</div>
              </div>
              <button className="dm-close-btn" onClick={() => setActiveChat(null)}>✕</button>
            </div>
            <div className="dm-body">
              {!(profile.chats?.[activeChat.id] || []).length
                ? <div className="dm-empty-state">
                    <span style={{ fontSize:'1.8rem' }}>💬</span>
                    <span>No messages yet. Say hello!</span>
                  </div>
                : (profile.chats?.[activeChat.id] || []).map((msg, i) => (
                  <div key={i} className={`bubble ${msg.sender === profile.name ? 'sent' : 'recv'}`}>
                    <div>{msg.message}</div>
                    <div className="bubble-time">{msg.time}</div>
                  </div>
                ))
              }
              <div ref={chatEndRef} />
            </div>
            <div className="dm-foot">
              <input ref={chatInputRef} className="dm-input" placeholder="Type a message…"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && chatInput.trim()) {
                    sendMessage(activeChat.id, chatInput.trim());
                    setChatInput('');
                  }
                }} />
              <button className="dm-send-btn" onClick={() => {
                if (!chatInput.trim()) return;
                sendMessage(activeChat.id, chatInput.trim());
                setChatInput('');
              }}>➤</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── DETAIL MODAL ── */}
      <AnimatePresence>
        {detailModal && (
          <motion.div className="modal-ov" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            onClick={e => { if (e.target === e.currentTarget) setDetailModal(null); }}>
            <motion.div className="modal-box" initial={{ scale:.94, opacity:0 }} animate={{ scale:1, opacity:1 }} exit={{ scale:.94, opacity:0 }}>
              <button className="modal-close" onClick={() => setDetailModal(null)}>✕</button>
              <div style={{ display:'flex', alignItems:'center', gap:'.85rem', marginBottom:'1.35rem' }}>
                <div style={{ width:48, height:48, borderRadius:13, background:'var(--brand-xlight)', color:'var(--brand)', fontFamily:"'Clash Display',sans-serif", fontWeight:700, fontSize:'.9rem', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  {detailModal.ownerLogo}
                </div>
                <div>
                  <div className="modal-title" style={{ fontSize:'1.2rem' }}>{detailModal.title}</div>
                  <div style={{ color:'var(--brand)', fontWeight:700, fontSize:'.8rem' }}>{detailModal.ownerName} · {detailModal.type}</div>
                </div>
              </div>
              <p style={{ fontSize:'.85rem', color:'var(--text-secondary)', lineHeight:1.65, marginBottom:'1rem' }}>{detailModal.desc}</p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'.7rem', marginBottom:'1.2rem', fontSize:'.83rem' }}>
                {detailModal.duration && <div><strong>Duration:</strong> {detailModal.duration}</div>}
                {detailModal.skills && <div><strong>Skills:</strong> {detailModal.skills}</div>}
                {detailModal.offerings && <div style={{ gridColumn:'1 / -1' }}><strong>Offerings:</strong> {detailModal.offerings}</div>}
              </div>
              {alreadyApplied(detailModal.id)
                ? <div style={{ textAlign:'center', padding:'.8rem', background:'#dcfce7', borderRadius:11, color:'#166534', fontWeight:700 }}>✓ Already Applied</div>
                : <button className="modal-btn-primary" onClick={() => { setApplyModal(detailModal); setDetailModal(null); }}>Apply for this Role</button>
              }
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── APPLY MODAL ── */}
      <AnimatePresence>
        {applyModal && (
          <motion.div className="modal-ov" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            onClick={e => { if (e.target === e.currentTarget) setApplyModal(null); }}>
            <motion.div className="modal-box" initial={{ y:30, opacity:0 }} animate={{ y:0, opacity:1 }} exit={{ y:30, opacity:0 }}>
              <button className="modal-close" onClick={() => setApplyModal(null)}>✕</button>
              <div className="modal-title">Apply Now</div>
              <div className="modal-sub">
                Applying to <strong>{applyModal?.ownerName}</strong> for <strong>{applyModal?.title}</strong>
              </div>
              <form onSubmit={handleApplySubmit}>
                <label className="field-label">Your Name</label>
                <input className="field-input" value={profile?.name || ''} readOnly style={{ opacity:.7, cursor:'not-allowed' }} />

                <label className="field-label">Email</label>
                <input className="field-input" value={profile?.email || ''} readOnly style={{ opacity:.7, cursor:'not-allowed' }} />

                <label className="field-label">Resume</label>
                {(profile?.resumes || []).length > 0
                  ? <div style={{ marginBottom:'1rem' }}>
                      {(profile.resumes || []).map((r, i) => (
                        <div key={i} style={{ display:'flex', alignItems:'center', gap:'.5rem', background:'var(--brand-xlight)', borderRadius:9, padding:'.5rem .8rem', marginBottom:'.35rem' }}>
                          <span>{r.type === 'application/pdf' ? '📑' : '🖼️'}</span>
                          <span style={{ fontSize:'.8rem', fontWeight:600, flex:1 }}>{r.name}</span>
                          <span style={{ fontSize:'.65rem', background:'#dcfce7', color:'#166534', padding:'.1rem .5rem', borderRadius:99, fontWeight:700 }}>Attached</span>
                        </div>
                      ))}
                    </div>
                  : <div style={{ marginBottom:'1rem', padding:'.65rem .9rem', background:'#fffbeb', border:'1px solid #fcd34d', borderRadius:9, fontSize:'.78rem', color:'#92400e', fontWeight:600 }}>
                      ⚠️ No resume on file. Go to <strong>Profile → Resume</strong> to upload one.
                    </div>
                }

                <label className="field-label">Cover Letter</label>
                <textarea required className="field-input" rows={4}
                  placeholder="Explain why you're a great fit for this role…"
                  value={coverLetter}
                  onChange={e => setCoverLetter(e.target.value)} />

                <button type="submit" className="modal-btn-primary">🚀 Submit Application</button>
                <button type="button" className="modal-btn-secondary" onClick={() => setApplyModal(null)}>Cancel</button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── TOAST NOTIFICATIONS ── */}
      <div className="toast-stack">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div key={t.id} className="toast"
              initial={{ opacity:0, x:50, scale:.92 }}
              animate={{ opacity:1, x:0, scale:1 }}
              exit={{ opacity:0, scale:.9 }}>
              <div className="toast-dot" />{t.msg}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}
