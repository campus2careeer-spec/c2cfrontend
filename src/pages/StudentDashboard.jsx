// ─── StudentDashboard.jsx — Complete Redesign ────────────────────────────────
// CHANGES:
//  1. Jobs posted by industry now appear in real-time from Supabase vacancies table
//  2. Full Chat section added (real messages via API + live UI)
//  3. Completely redesigned professional dark UI (matching IndustryDashboard quality)
//  4. Back button guard + beforeunload preserved
//  5. AI skill match + course recommendations preserved

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import API_BASE_URL from '../apiConfig';

const API = `${API_BASE_URL}/api`;

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const SKILL_SUGGESTIONS = [
  'Python','JavaScript','React','Node.js','Django','Flask','Java','C++','TypeScript',
  'SQL','MongoDB','PostgreSQL','AWS','Docker','Kubernetes','Git','Machine Learning',
  'Deep Learning','TensorFlow','PyTorch','Figma','UI/UX','HTML','CSS','Spring Boot',
  'GraphQL','DevOps','REST APIs','Data Science','Excel','Power BI','Tableau',
  'Android','Flutter','Swift','Kotlin','PHP','Laravel','Vue.js','Angular',
];

const MOCK_COURSES = [
  { id: 1, title: 'React.js Complete Guide', provider: 'Udemy', duration: '40 hrs', level: 'Intermediate', link: '#', rating: 4.8, skills: ['React','JSX','Hooks'] },
  { id: 2, title: 'Data Structures & Algorithms', provider: 'Coursera', duration: '60 hrs', level: 'Advanced', link: '#', rating: 4.9, skills: ['DSA','C++'] },
  { id: 3, title: 'Machine Learning A-Z', provider: 'Udemy', duration: '55 hrs', level: 'Intermediate', link: '#', rating: 4.8, skills: ['Python','sklearn'] },
  { id: 4, title: 'System Design Fundamentals', provider: 'Coursera', duration: '45 hrs', level: 'Advanced', link: '#', rating: 4.9, skills: ['Architecture','SQL'] },
  { id: 5, title: 'Python for Data Science', provider: 'edX', duration: '35 hrs', level: 'Beginner', link: '#', rating: 4.7, skills: ['Python','Pandas'] },
];

const MOCK_JOBS = [
  { industry: 'TechCorp India', job: 'Frontend Developer', desc: 'Build scalable React UIs.', role: 'SDE-1', ug: 'B.Tech/BCA', pg: 'Not Required', url: '#', dept: 'Engineering', skills: 'React, TypeScript, CSS' },
  { industry: 'Infosys Ltd.', job: 'Java Backend Engineer', desc: 'Develop REST APIs with Spring Boot.', role: 'Software Engineer', ug: 'B.Tech', pg: 'M.Tech preferred', url: '#', dept: 'Backend', skills: 'Java, Spring Boot, AWS' },
  { industry: 'Analytics Co.', job: 'Data Analyst', desc: 'Insights from large datasets.', role: 'Analyst', ug: 'Any Graduate', pg: 'MBA/MCA', url: '#', dept: 'Analytics', skills: 'Python, SQL, Tableau' },
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
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

function buildProfile(d, fallback = {}) {
  return {
    id: d.id || fallback.id || '',
    name: d.name || d.full_name || fallback.name || 'Student',
    email: d.email || fallback.email || '',
    username: d.username || (d.name || 'student').toLowerCase().replace(/\s+/g, '_'),
    qualification: d.qualification || '',
    phone: d.phone || '',
    address: d.address || d.location || '',
    about: d.about || '',
    skills: Array.isArray(d.skills) ? d.skills : [],
    photo: d.photo || null,
    tenth: d.tenth || '',
    twelfth: d.twelfth || '',
    graduation: d.graduation || '',
    certificates: Array.isArray(d.certificates) ? d.certificates : [],
    personalPosts: Array.isArray(d.personalPosts || d.personal_posts) ? (d.personalPosts || d.personal_posts) : [],
    resumes: Array.isArray(d.resumes) ? d.resumes : [],
    linkedin: d.linkedin || '',
    github: d.github || '',
    website: d.website || '',
    experience: d.experience || '',
    projects: d.projects || '',
    achievements: d.achievements || '',
    cgpa: d.cgpa || '',
  };
}

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cabinet+Grotesk:wght@400;500;600;700;800;900&family=Instrument+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

:root{
  --bg:#07090f;
  --surface:#0d1117;
  --surface2:#131923;
  --surface3:#1a2332;
  --surface4:#202d40;
  --border:rgba(255,255,255,0.06);
  --border2:rgba(255,255,255,0.1);
  --border3:rgba(255,255,255,0.18);
  --accent:#6366f1;
  --accent2:#818cf8;
  --accent3:rgba(99,102,241,0.12);
  --accent-glow:rgba(99,102,241,0.2);
  --green:#10b981;
  --green2:rgba(16,185,129,0.12);
  --amber:#f59e0b;
  --amber2:rgba(245,158,11,0.12);
  --red:#ef4444;
  --red2:rgba(239,68,68,0.12);
  --violet:#8b5cf6;
  --violet2:rgba(139,92,246,0.12);
  --cyan:#06b6d4;
  --cyan2:rgba(6,182,212,0.1);
  --text:#f1f5f9;
  --text2:#94a3b8;
  --text3:#4b5a6b;
  --r:14px;
  --r-lg:20px;
  --shadow:0 4px 24px rgba(0,0,0,0.4);
  --shadow-accent:0 4px 24px rgba(99,102,241,0.18);
}

html,body{height:100%}
body{font-family:'Instrument Sans',sans-serif;background:var(--bg);color:var(--text);-webkit-font-smoothing:antialiased;line-height:1.5}
::-webkit-scrollbar{width:3px;height:3px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:rgba(99,102,241,0.25);border-radius:99px}
::selection{background:rgba(99,102,241,0.3);color:var(--text)}

/* ── LAYOUT ── */
.sd-root{display:flex;height:100vh;overflow:hidden}

/* ── SIDEBAR ── */
.sd-sidebar{
  width:240px;flex-shrink:0;
  background:var(--surface);
  border-right:1px solid var(--border);
  display:flex;flex-direction:column;
  height:100vh;overflow:hidden;
}
.sidebar-brand{
  padding:1.4rem 1.4rem 1rem;
  border-bottom:1px solid var(--border);
}
.brand-logo{
  font-family:'Cabinet Grotesk',sans-serif;
  font-size:1.2rem;font-weight:900;
  letter-spacing:-0.03em;
  background:linear-gradient(135deg,var(--accent2),var(--violet));
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
}
.brand-tag{font-size:0.6rem;font-weight:600;color:var(--text3);letter-spacing:0.1em;text-transform:uppercase;margin-top:2px}

.sidebar-nav{flex:1;padding:0.75rem 0.6rem;overflow-y:auto}
.nav-group-label{font-size:0.55rem;font-weight:700;color:var(--text3);letter-spacing:0.12em;text-transform:uppercase;padding:0.6rem 0.8rem 0.3rem}
.nav-item{
  display:flex;align-items:center;gap:9px;
  padding:0.62rem 0.85rem;border-radius:10px;
  font-size:0.82rem;font-weight:500;color:var(--text2);
  cursor:pointer;margin-bottom:2px;
  transition:all 0.15s ease;position:relative;
}
.nav-item:hover{background:var(--surface3);color:var(--text)}
.nav-item.active{background:var(--accent3);color:var(--accent2);font-weight:600}
.nav-item.active::before{
  content:'';position:absolute;left:0;top:22%;bottom:22%;
  width:2.5px;background:var(--accent);border-radius:0 2px 2px 0;
}
.nav-icon{width:18px;text-align:center;font-size:0.85rem;flex-shrink:0}
.nav-badge{
  margin-left:auto;background:var(--accent);
  color:white;font-size:0.58rem;font-weight:800;
  min-width:17px;height:17px;border-radius:8px;
  display:flex;align-items:center;justify-content:center;padding:0 4px;
}
.nav-badge.green{background:var(--green)}
.nav-badge.amber{background:var(--amber)}

.sidebar-footer{padding:0.8rem 0.6rem;border-top:1px solid var(--border)}
.sidebar-user{
  display:flex;align-items:center;gap:9px;
  padding:0.7rem 0.85rem;background:var(--surface3);
  border-radius:10px;cursor:pointer;transition:0.15s;
}
.sidebar-user:hover{background:var(--surface4)}
.s-avatar{
  width:32px;height:32px;border-radius:9px;flex-shrink:0;
  display:flex;align-items:center;justify-content:center;
  background:var(--accent3);font-size:0.75rem;font-weight:800;color:var(--accent2);overflow:hidden;
}
.s-avatar img{width:100%;height:100%;object-fit:cover}
.s-name{font-size:0.78rem;font-weight:700;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:120px}
.s-role{font-size:0.6rem;color:var(--text3);margin-top:1px}
.logout-btn{
  margin-top:6px;width:100%;padding:0.48rem;
  border-radius:9px;background:var(--red2);
  color:var(--red);border:1px solid rgba(239,68,68,0.15);
  font-size:0.74rem;font-weight:700;cursor:pointer;
  transition:0.15s;font-family:inherit;
}
.logout-btn:hover{background:var(--red);color:white}

/* ── MAIN ── */
.sd-main{flex:1;display:flex;flex-direction:column;overflow:hidden}

.topbar{
  height:58px;background:rgba(7,9,15,0.9);backdrop-filter:blur(20px);
  border-bottom:1px solid var(--border);padding:0 2rem;
  display:flex;align-items:center;gap:1rem;flex-shrink:0;z-index:50;
}
.topbar-title{font-family:'Cabinet Grotesk',sans-serif;font-size:1rem;font-weight:700;flex:1}
.search-box{
  display:flex;align-items:center;gap:8px;
  background:var(--surface2);border:1px solid var(--border2);
  border-radius:10px;padding:0.45rem 0.9rem;width:240px;
  transition:0.15s;
}
.search-box:focus-within{border-color:var(--accent);box-shadow:0 0 0 3px var(--accent3)}
.search-box input{background:none;border:none;outline:none;font-family:inherit;font-size:0.82rem;color:var(--text);flex:1}
.search-box input::placeholder{color:var(--text3)}
.topbar-actions{display:flex;align-items:center;gap:8px}
.icon-btn{
  width:36px;height:36px;border-radius:9px;
  background:var(--surface2);border:1px solid var(--border);
  display:flex;align-items:center;justify-content:center;
  cursor:pointer;transition:0.15s;color:var(--text2);font-size:0.9rem;position:relative;
}
.icon-btn:hover{background:var(--surface3);color:var(--text)}
.notif-dot{position:absolute;top:7px;right:7px;width:6px;height:6px;background:var(--accent);border-radius:50%;border:1.5px solid var(--surface)}

.content-area{flex:1;overflow-y:auto}
.page{padding:2rem}

/* ── BUTTONS ── */
.btn{display:inline-flex;align-items:center;gap:6px;padding:0.55rem 1.1rem;border-radius:9px;font-family:inherit;font-size:0.8rem;font-weight:600;cursor:pointer;border:none;transition:all 0.15s;white-space:nowrap}
.btn-primary{background:var(--accent);color:white}
.btn-primary:hover{background:#4f46e5;transform:translateY(-1px);box-shadow:var(--shadow-accent)}
.btn-ghost{background:var(--surface3);color:var(--text2);border:1px solid var(--border2)}
.btn-ghost:hover{background:var(--surface4);color:var(--text)}
.btn-danger{background:var(--red2);color:var(--red);border:1px solid rgba(239,68,68,0.2)}
.btn-danger:hover{background:var(--red);color:white}
.btn-success{background:var(--green2);color:var(--green);border:1px solid rgba(16,185,129,0.2)}
.btn-success:hover{background:var(--green);color:white}
.btn-sm{padding:0.35rem 0.75rem;font-size:0.75rem;border-radius:7px}
.btn-xs{padding:0.25rem 0.6rem;font-size:0.68rem;border-radius:6px}
.btn:disabled{opacity:0.5;cursor:not-allowed;transform:none!important}

/* ── CARDS ── */
.card{background:var(--surface);border:1px solid var(--border);border-radius:var(--r-lg)}
.card-p{padding:1.5rem}
.card-hover{transition:all 0.18s}
.card-hover:hover{border-color:var(--border2);transform:translateY(-1px);box-shadow:var(--shadow)}

/* ── STATS GRID ── */
.stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1rem;margin-bottom:1.8rem}
.stat-card{
  background:var(--surface);border:1px solid var(--border);border-radius:var(--r-lg);
  padding:1.4rem;position:relative;overflow:hidden;transition:0.18s;
}
.stat-card:hover{border-color:var(--border2);transform:translateY(-2px)}
.stat-label{font-size:0.65rem;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:0.65rem}
.stat-value{font-family:'Cabinet Grotesk',sans-serif;font-size:2rem;font-weight:900;line-height:1;margin-bottom:0.45rem}
.stat-badge{display:inline-flex;align-items:center;gap:3px;font-size:0.68rem;font-weight:700;padding:2px 7px;border-radius:5px}
.stat-icon{position:absolute;top:1.1rem;right:1.1rem;font-size:1.3rem;opacity:0.25}

/* ── SECTION ── */
.section-hd{display:flex;align-items:center;justify-content:space-between;margin-bottom:1.1rem}
.section-title{font-family:'Cabinet Grotesk',sans-serif;font-size:1rem;font-weight:800}
.section-sub{font-size:0.72rem;color:var(--text3);margin-top:2px}

/* ── FEED / VACANCY CARDS ── */
.feed-grid{display:flex;flex-direction:column;gap:0.9rem}
.vac-card{
  background:var(--surface);border:1px solid var(--border);border-radius:var(--r-lg);
  overflow:hidden;transition:0.18s;position:relative;
}
.vac-card:hover{border-color:rgba(99,102,241,0.3);box-shadow:var(--shadow)}
.vac-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:var(--line,transparent);border-radius:var(--r-lg) var(--r-lg) 0 0}
.vac-body{padding:1.3rem}
.vac-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:0.8rem}
.vac-logo-wrap{display:flex;align-items:center;gap:0.7rem}
.vac-logo{
  width:40px;height:40px;border-radius:10px;flex-shrink:0;
  background:var(--accent3);color:var(--accent2);
  font-family:'Cabinet Grotesk',sans-serif;font-weight:700;font-size:0.82rem;
  display:flex;align-items:center;justify-content:center;
}
.vac-company{font-size:0.82rem;font-weight:700;color:var(--text)}
.vac-date{font-size:0.65rem;color:var(--text3);margin-top:1px}
.type-chip{font-size:0.62rem;font-weight:800;padding:3px 9px;border-radius:5px;text-transform:uppercase;letter-spacing:0.05em}
.chip-vacancy{background:var(--accent3);color:var(--accent2)}
.chip-internship{background:var(--violet2);color:#c4b5fd}
.chip-training{background:var(--green2);color:#6ee7b7}
.chip-campus{background:var(--amber2);color:#fcd34d}
.vac-title{font-family:'Cabinet Grotesk',sans-serif;font-size:1rem;font-weight:800;color:var(--text);margin-bottom:0.35rem;line-height:1.3}
.vac-desc{font-size:0.8rem;color:var(--text2);margin-bottom:0.8rem;line-height:1.55;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.skill-pills{display:flex;flex-wrap:wrap;gap:5px;margin-bottom:0.8rem}
.s-pill{background:var(--surface3);color:var(--text2);border:1px solid var(--border2);padding:2px 8px;border-radius:5px;font-size:0.66rem;font-weight:600}
.vac-foot{display:flex;align-items:center;justify-content:space-between;padding:0.85rem 1.3rem;border-top:1px solid var(--border);background:rgba(255,255,255,0.01)}
.vac-meta{display:flex;gap:1rem}
.vac-meta-item{font-size:0.72rem;color:var(--text3);display:flex;align-items:center;gap:4px;font-weight:500}
.vac-actions{display:flex;gap:0.45rem}
.apply-btn{padding:0.42rem 1rem;border-radius:8px;border:none;background:var(--accent);color:white;font-size:0.73rem;font-weight:700;cursor:pointer;font-family:inherit;transition:0.15s;box-shadow:0 3px 10px rgba(99,102,241,0.25)}
.apply-btn:hover{background:#4f46e5;transform:translateY(-1px)}
.apply-btn:disabled{opacity:0.5;cursor:not-allowed;transform:none}
.applied-badge{padding:0.42rem 1rem;border-radius:8px;background:var(--green2);color:var(--green);font-size:0.73rem;font-weight:700;border:1px solid rgba(16,185,129,0.2)}

/* ── JOBS GRID ── */
.jobs-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1rem}
.job-card{
  background:var(--surface);border:1px solid var(--border);border-radius:var(--r-lg);
  padding:1.2rem;transition:0.18s;cursor:pointer;position:relative;overflow:hidden;
}
.job-card:hover{border-color:rgba(99,102,241,0.25);transform:translateY(-2px);box-shadow:var(--shadow)}
.job-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:var(--line,transparent);border-radius:var(--r-lg) var(--r-lg) 0 0}
.job-company{font-size:0.65rem;font-weight:800;color:var(--text3);text-transform:uppercase;letter-spacing:0.07em;margin-bottom:0.22rem}
.job-title{font-family:'Cabinet Grotesk',sans-serif;font-size:0.95rem;font-weight:800;color:var(--text);margin-bottom:0.38rem;line-height:1.3}
.job-desc{font-size:0.77rem;color:var(--text2);line-height:1.5;margin-bottom:0.65rem;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.job-tags{display:flex;gap:5px;flex-wrap:wrap;margin-bottom:0.65rem}
.j-tag{padding:2px 8px;border-radius:5px;font-size:0.63rem;font-weight:700;border:1px solid var(--border2);color:var(--text2);background:var(--surface3)}
.job-foot{display:flex;align-items:center;justify-content:space-between;padding-top:0.8rem;border-top:1px solid var(--border)}

/* ── MATCH CARDS ── */
.match-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1rem}
.match-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--r-lg);padding:1.3rem;transition:0.18s}
.match-card:hover{border-color:rgba(99,102,241,0.25);transform:translateY(-2px);box-shadow:var(--shadow)}
.match-pct{font-family:'Cabinet Grotesk',sans-serif;font-size:2rem;font-weight:900;color:var(--accent2);line-height:1;margin-bottom:2px}
.match-lbl{font-size:0.65rem;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:0.07em;margin-bottom:0.6rem}
.match-bar-track{height:4px;background:var(--surface3);border-radius:99px;margin-bottom:0.9rem;overflow:hidden}
.match-bar-fill{height:100%;background:linear-gradient(90deg,var(--accent),var(--violet));border-radius:99px}
.match-job{font-family:'Cabinet Grotesk',sans-serif;font-size:0.95rem;font-weight:800;color:var(--text);margin-bottom:0.25rem}
.match-industry{font-size:0.7rem;color:var(--text3);font-weight:600;margin-bottom:0.7rem}
.miss-chip{display:inline-block;padding:2px 8px;border-radius:5px;font-size:0.66rem;font-weight:700;background:var(--red2);color:var(--red);border:1px solid rgba(239,68,68,0.2);margin:0.15rem 0.15rem 0 0}
.course-rec-item{display:flex;align-items:center;gap:0.5rem;padding:0.5rem 0.7rem;background:var(--surface2);border:1px solid var(--border2);border-radius:8px;margin-top:0.4rem;cursor:pointer;transition:0.15s;text-decoration:none}
.course-rec-item:hover{background:var(--accent3);border-color:var(--accent)}
.course-rec-name{font-size:0.76rem;font-weight:700;color:var(--text);flex:1;overflow:hidden;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical}

/* ── COURSES ── */
.courses-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:1rem}
.course-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--r-lg);overflow:hidden;cursor:pointer;transition:0.18s}
.course-card:hover{border-color:rgba(99,102,241,0.25);transform:translateY(-2px);box-shadow:var(--shadow)}
.course-top{padding:1.2rem;background:linear-gradient(135deg,#1a2040 0%,#1a2332 100%);position:relative;overflow:hidden}
.course-top::before{content:'';position:absolute;top:-25px;right:-25px;width:90px;height:90px;background:rgba(99,102,241,0.08);border-radius:50%}
.course-provider{font-size:0.63rem;font-weight:800;color:var(--text3);letter-spacing:0.1em;text-transform:uppercase;margin-bottom:0.3rem}
.course-name{font-family:'Cabinet Grotesk',sans-serif;font-size:0.92rem;font-weight:700;color:var(--text);line-height:1.3;position:relative;z-index:1}
.course-body{padding:1rem}
.course-meta-row{display:flex;gap:0.5rem;flex-wrap:wrap;margin-bottom:0.75rem}
.course-meta-item{font-size:0.67rem;font-weight:600;color:var(--text3)}
.level-badge{display:inline-block;padding:2px 8px;border-radius:5px;font-size:0.65rem;font-weight:800}
.level-Beginner{background:var(--green2);color:var(--green);border:1px solid rgba(16,185,129,0.2)}
.level-Intermediate{background:var(--amber2);color:var(--amber);border:1px solid rgba(245,158,11,0.2)}
.level-Advanced{background:var(--red2);color:var(--red);border:1px solid rgba(239,68,68,0.2)}
.enroll-btn{width:100%;padding:0.52rem;border-radius:8px;border:none;background:var(--accent);color:white;font-family:'Cabinet Grotesk',sans-serif;font-size:0.78rem;font-weight:700;cursor:pointer;transition:0.15s}
.enroll-btn:hover{background:#4f46e5}

/* ── APPLICATIONS ── */
.apps-list{display:flex;flex-direction:column;gap:0.8rem}
.app-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--r-lg);padding:1.2rem;transition:0.18s}
.app-card:hover{border-color:var(--border2);box-shadow:var(--shadow)}
.app-role{font-family:'Cabinet Grotesk',sans-serif;font-size:0.98rem;font-weight:800;color:var(--text)}
.app-company{font-size:0.78rem;color:var(--text3);font-weight:600;margin-top:2px}
.status-chip{padding:3px 9px;border-radius:5px;font-size:0.65rem;font-weight:800;display:inline-block;text-transform:uppercase;letter-spacing:0.04em}
.s-pending{background:var(--amber2);color:var(--amber)}
.s-shortlisted{background:var(--accent3);color:var(--accent2)}
.s-selected{background:var(--green2);color:var(--green)}
.s-rejected{background:var(--red2);color:var(--red)}

/* ── PROFILE PAGE ── */
.pf-page{max-width:860px;margin:0 auto}
.pf-cover{
  background:linear-gradient(135deg,#1e3a5f 0%,#0f2040 50%,#0a0c14 100%);
  border-radius:var(--r-lg);padding:2rem;margin-bottom:4.5rem;
  position:relative;overflow:hidden;border:1px solid var(--border);
}
.pf-cover::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 70% 30%,rgba(99,102,241,0.15) 0%,transparent 60%),radial-gradient(ellipse at 20% 80%,rgba(139,92,246,0.1) 0%,transparent 50%)}
.pf-av-wrap{position:absolute;bottom:-45px;left:2rem;width:100px;height:100px;border-radius:20px;border:3px solid var(--surface);overflow:hidden;background:var(--surface2);cursor:pointer;z-index:2}
.pf-av-wrap img{width:100%;height:100%;object-fit:cover}
.pf-av-initial{width:100%;height:100%;background:var(--accent3);display:flex;align-items:center;justify-content:center;font-family:'Cabinet Grotesk',sans-serif;font-size:2.2rem;font-weight:900;color:var(--accent2)}
.pf-hero{background:var(--surface);border:1px solid var(--border);border-radius:0 0 var(--r-lg) var(--r-lg);padding:1.4rem 1.6rem;margin-bottom:1.4rem}
.pf-name{font-family:'Cabinet Grotesk',sans-serif;font-size:1.4rem;font-weight:900;color:var(--text);margin-top:0.5rem;letter-spacing:-0.02em}
.pf-qual{font-size:0.82rem;font-weight:700;color:var(--accent2);margin-top:0.1rem}
.pf-meta-row{display:flex;flex-wrap:wrap;gap:0.5rem 1.2rem;margin-top:0.6rem;font-size:0.76rem;color:var(--text3)}
.pf-meta-row a{color:var(--accent2);text-decoration:none;font-weight:600}
.pf-skills-row{display:flex;flex-wrap:wrap;gap:5px;margin-top:0.7rem}
.pf-skill-chip{padding:3px 10px;border-radius:5px;font-size:0.72rem;font-weight:700;background:var(--accent3);color:var(--accent2);border:1px solid rgba(99,102,241,0.2)}
.pf-tabs{display:flex;gap:4px;flex-wrap:wrap;margin-bottom:1.3rem;background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:4px}
.pf-tab{padding:0.42rem 1rem;border-radius:9px;font-size:0.77rem;font-weight:600;cursor:pointer;border:none;background:transparent;color:var(--text2);font-family:inherit;transition:0.15s;white-space:nowrap}
.pf-tab:hover{color:var(--text);background:var(--surface3)}
.pf-tab.active{background:var(--accent);color:white;box-shadow:0 2px 8px rgba(99,102,241,0.3)}
.pf-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--r-lg);padding:1.5rem;margin-bottom:1rem}
.pf-card-title{font-family:'Cabinet Grotesk',sans-serif;font-size:0.95rem;font-weight:800;color:var(--text);margin-bottom:1rem}
.pf-grid{display:grid;grid-template-columns:1fr 1fr;gap:0.85rem}
.pf-grid-3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:0.85rem}
.pf-field{display:flex;flex-direction:column;gap:0.28rem}
.pf-label{font-size:0.65rem;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:0.07em}
.pf-input{padding:0.62rem 0.9rem;border-radius:9px;border:1px solid var(--border2);background:var(--surface2);font-family:inherit;font-size:0.83rem;color:var(--text);outline:none;transition:0.15s;width:100%}
.pf-input:focus{border-color:var(--accent);box-shadow:0 0 0 3px var(--accent3);background:var(--surface3)}
.pf-input::placeholder{color:var(--text3)}
select.pf-input{cursor:pointer}
textarea.pf-input{resize:vertical;min-height:88px}
.pf-acad-box{background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:1rem;text-align:center}
.pf-acad-lbl{font-size:0.62rem;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;color:var(--accent2);margin-bottom:0.4rem}
.pf-acad-val{font-size:0.83rem;font-weight:700;color:var(--text)}
.pf-thumb{aspect-ratio:1;border-radius:9px;overflow:hidden;cursor:pointer;position:relative;background:var(--surface3);border:1px solid var(--border)}
.pf-thumb img{width:100%;height:100%;object-fit:cover}
.pf-thumb-del{position:absolute;top:3px;right:3px;width:20px;height:20px;border-radius:5px;background:rgba(0,0,0,0.8);border:none;color:var(--red);font-size:0.52rem;display:flex;align-items:center;justify-content:center;cursor:pointer;opacity:0;transition:0.15s}
.pf-thumb:hover .pf-thumb-del{opacity:1}
.pf-add-thumb{aspect-ratio:1;border-radius:9px;border:1.5px dashed var(--border2);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:0.2rem;cursor:pointer;color:var(--accent2);font-size:0.66rem;font-weight:700;transition:0.18s}
.pf-add-thumb:hover{background:var(--accent3);border-color:var(--accent)}
.skill-sugg{padding:3px 10px;border-radius:5px;font-size:0.7rem;font-weight:700;background:var(--surface3);color:var(--text2);border:1px solid var(--border2);cursor:pointer;transition:0.15s;font-family:inherit}
.skill-sugg:hover{background:var(--accent);color:white;border-color:var(--accent)}

/* ── CHAT SECTION ── */
.chat-layout{display:grid;grid-template-columns:280px 1fr;background:var(--surface);border:1px solid var(--border);border-radius:var(--r-lg);overflow:hidden;height:calc(100vh - 58px - 4rem)}
.conv-list{border-right:1px solid var(--border);display:flex;flex-direction:column;overflow:hidden}
.conv-list-head{padding:1rem 1.2rem;font-weight:700;font-size:0.85rem;border-bottom:1px solid var(--border);flex-shrink:0;font-family:'Cabinet Grotesk',sans-serif}
.conv-search{padding:0.6rem 1rem;border-bottom:1px solid var(--border);flex-shrink:0}
.conv-search input{width:100%;background:var(--surface2);border:1px solid var(--border2);border-radius:8px;padding:0.42rem 0.75rem;color:var(--text);font-family:inherit;font-size:0.78rem;outline:none;transition:0.15s}
.conv-search input:focus{border-color:var(--accent)}
.conv-search input::placeholder{color:var(--text3)}
.conv-list-body{flex:1;overflow-y:auto}
.conv-row{display:flex;align-items:center;gap:9px;padding:0.85rem 1.2rem;cursor:pointer;border-bottom:1px solid var(--border);transition:0.12s}
.conv-row:hover{background:var(--surface2)}
.conv-row.active{background:var(--accent3)}
.conv-av{width:36px;height:36px;border-radius:10px;background:var(--surface3);display:flex;align-items:center;justify-content:center;font-size:0.78rem;font-weight:800;color:var(--text2);flex-shrink:0;overflow:hidden}
.conv-av img{width:100%;height:100%;object-fit:cover}
.conv-name{font-size:0.8rem;font-weight:700;color:var(--text)}
.conv-preview{font-size:0.68rem;color:var(--text3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:150px}
.conv-time{font-size:0.6rem;color:var(--text3);flex-shrink:0;margin-left:auto}
.unread-dot{width:7px;height:7px;background:var(--accent);border-radius:50%;flex-shrink:0;margin-left:auto}

.chat-area{display:flex;flex-direction:column;overflow:hidden}
.chat-head{padding:1rem 1.4rem;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;flex-shrink:0;background:var(--surface)}
.chat-head-name{font-family:'Cabinet Grotesk',sans-serif;font-weight:800;font-size:0.9rem}
.chat-head-role{font-size:0.68rem;color:var(--text3);margin-top:1px}
.online-badge{display:inline-flex;align-items:center;gap:4px;font-size:0.65rem;font-weight:700;color:var(--green)}
.online-dot{width:6px;height:6px;background:var(--green);border-radius:50%;display:inline-block}
.chat-body{flex:1;overflow-y:auto;padding:1.2rem;display:flex;flex-direction:column;gap:8px;background:var(--bg)}
.chat-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:0.5rem;color:var(--text3);font-size:0.8rem;text-align:center}
.bubble{max-width:65%;padding:0.55rem 0.9rem;border-radius:14px;font-size:0.8rem;line-height:1.5}
.bubble.sent{background:var(--accent);color:white;align-self:flex-end;border-bottom-right-radius:3px}
.bubble.recv{background:var(--surface2);color:var(--text);align-self:flex-start;border-bottom-left-radius:3px;border:1px solid var(--border)}
.bubble-time{font-size:0.58rem;opacity:0.55;margin-top:2px;text-align:right}
.chat-foot{padding:0.8rem 1.2rem;border-top:1px solid var(--border);display:flex;gap:8px;flex-shrink:0;background:var(--surface)}
.chat-input{flex:1;background:var(--surface2);border:1px solid var(--border2);border-radius:10px;padding:0.6rem 0.9rem;color:var(--text);font-family:inherit;font-size:0.82rem;outline:none;transition:0.15s;resize:none}
.chat-input:focus{border-color:var(--accent);box-shadow:0 0 0 3px var(--accent3)}
.chat-input::placeholder{color:var(--text3)}
.chat-send-btn{width:38px;height:38px;border-radius:10px;background:var(--accent);border:none;color:white;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:0.15s;flex-shrink:0}
.chat-send-btn:hover{background:#4f46e5}

/* ── MODAL ── */
.modal-ov{position:fixed;inset:0;background:rgba(0,0,0,0.75);backdrop-filter:blur(12px);display:flex;align-items:center;justify-content:center;z-index:9000;padding:1rem}
.modal-box{background:var(--surface);border:1px solid var(--border2);border-radius:20px;padding:2rem;width:100%;max-width:560px;max-height:90vh;overflow-y:auto;position:relative;box-shadow:0 32px 80px rgba(0,0,0,0.6)}
.modal-close{position:absolute;top:1.1rem;right:1.1rem;width:30px;height:30px;background:var(--surface3);border:1px solid var(--border);border-radius:7px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--text2);transition:0.15s;font-size:0.8rem}
.modal-close:hover{background:var(--red2);color:var(--red)}
.modal-title{font-family:'Cabinet Grotesk',sans-serif;font-size:1.3rem;font-weight:800;margin-bottom:0.2rem;color:var(--text)}
.modal-sub{font-size:0.78rem;color:var(--text3);margin-bottom:1.5rem}
.field-label{display:block;font-size:0.68rem;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:0.07em;margin-bottom:0.35rem;margin-top:0.9rem}
.field-input{width:100%;background:var(--surface2);border:1px solid var(--border2);border-radius:9px;padding:0.65rem 0.9rem;color:var(--text);font-family:inherit;font-size:0.82rem;outline:none;transition:0.15s}
.field-input:focus{border-color:var(--accent);box-shadow:0 0 0 3px var(--accent3)}
.field-input::placeholder{color:var(--text3)}
textarea.field-input{resize:vertical;min-height:88px}
.modal-btn-primary{width:100%;padding:0.8rem;border-radius:99px;border:none;background:var(--accent);color:white;font-family:'Cabinet Grotesk',sans-serif;font-size:0.88rem;font-weight:700;cursor:pointer;margin-top:0.85rem;box-shadow:0 5px 18px rgba(99,102,241,0.28);transition:0.18s}
.modal-btn-primary:hover{opacity:0.9;transform:translateY(-1px)}
.modal-btn-secondary{width:100%;padding:0.7rem;border-radius:99px;border:1px solid var(--border2);background:transparent;color:var(--text2);font-family:inherit;font-size:0.83rem;font-weight:700;cursor:pointer;margin-top:0.45rem;transition:0.15s}
.modal-btn-secondary:hover{border-color:var(--accent);color:var(--accent2)}

/* ── INDUSTRIES ── */
.ind-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:1rem}
.ind-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--r-lg);padding:1.3rem 1.1rem;cursor:pointer;transition:0.18s;text-align:center}
.ind-card:hover{box-shadow:var(--shadow);border-color:rgba(99,102,241,0.3);transform:translateY(-3px)}
.ind-logo{width:50px;height:50px;border-radius:13px;background:var(--accent3);color:var(--accent2);font-family:'Cabinet Grotesk',sans-serif;font-weight:900;font-size:0.95rem;display:flex;align-items:center;justify-content:center;margin:0 auto 0.85rem}
.ind-name{font-size:0.88rem;font-weight:700;color:var(--text);margin-bottom:0.3rem}
.ind-domain-tag{display:inline-block;font-size:0.67rem;font-weight:700;color:var(--accent2);background:var(--accent3);border-radius:99px;padding:2px 9px;margin-bottom:0.35rem;border:1px solid rgba(99,102,241,0.2)}
.ind-loc{font-size:0.7rem;color:var(--text3)}
.ind-tagline{font-size:0.7rem;color:var(--text3);margin-top:0.3rem;font-style:italic;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}
.msg-btn{margin-top:0.85rem;width:100%;padding:0.42rem;border-radius:8px;background:var(--surface3);border:1px solid var(--border2);font-size:0.72rem;font-weight:700;color:var(--text2);cursor:pointer;font-family:inherit;transition:0.15s}
.msg-btn:hover{background:var(--accent);color:white;border-color:var(--accent)}

/* ── TOAST ── */
.toast-stack{position:fixed;bottom:1.5rem;right:1.5rem;z-index:9999;display:flex;flex-direction:column;gap:8px}
.toast{background:var(--surface2);border:1px solid var(--border2);color:var(--text);padding:0.75rem 1.2rem;border-radius:12px;box-shadow:var(--shadow);font-size:0.8rem;font-weight:600;display:flex;align-items:center;gap:8px;min-width:260px}
.toast-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0}

/* ── EMPTY STATE ── */
.empty-state{text-align:center;padding:3.5rem 2rem;color:var(--text3)}
.empty-icon{font-size:2.2rem;margin-bottom:0.75rem;opacity:0.35}
.empty-title{font-size:0.9rem;font-weight:700;color:var(--text2);margin-bottom:0.4rem}
.empty-text{font-size:0.78rem;line-height:1.6}

/* ── SPINNER ── */
.spinner{width:30px;height:30px;border:3px solid rgba(99,102,241,0.15);border-top-color:var(--accent);border-radius:50%;animation:spin 0.7s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}

/* ── EXIT CONFIRM ── */
.exit-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.8);backdrop-filter:blur(20px);display:flex;align-items:center;justify-content:center;z-index:99999;padding:1rem}
.exit-box{background:var(--surface);border:1px solid var(--border2);border-radius:20px;padding:2rem;width:100%;max-width:380px;box-shadow:0 32px 80px rgba(0,0,0,0.6);text-align:center}
.exit-icon{font-size:2.5rem;margin-bottom:0.75rem}
.exit-title{font-family:'Cabinet Grotesk',sans-serif;font-size:1.2rem;font-weight:900;color:var(--text);margin-bottom:0.4rem}
.exit-sub{font-size:0.82rem;color:var(--text3);line-height:1.55;margin-bottom:1.5rem}
.exit-btn-row{display:flex;gap:0.65rem}
.exit-btn-stay{flex:1;padding:0.72rem;border-radius:10px;border:1px solid var(--border2);background:var(--surface3);color:var(--text2);font-family:inherit;font-size:0.82rem;font-weight:700;cursor:pointer;transition:0.15s}
.exit-btn-stay:hover{background:var(--surface4);color:var(--text)}
.exit-btn-leave{flex:1;padding:0.72rem;border-radius:10px;border:none;background:var(--accent);color:white;font-family:inherit;font-size:0.82rem;font-weight:700;cursor:pointer;transition:0.15s;box-shadow:0 3px 12px rgba(99,102,241,0.3)}
.exit-btn-leave:hover{opacity:0.88}

/* ── RESPONSIVE ── */
@media(max-width:1100px){.stats-grid{grid-template-columns:repeat(2,1fr)}}
@media(max-width:900px){
  .sd-sidebar{width:64px}
  .brand-tag,.nav-item span:not(.nav-icon),.nav-badge,.s-name,.s-role,.logout-btn{display:none}
  .nav-item{justify-content:center}
  .sidebar-brand{display:flex;justify-content:center;padding:1.2rem 0}
}
`;

// ─── COMPONENT ────────────────────────────────────────────────────────────────
export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user: authUser, profile: authProfile, signOut } = useAuth();

  // ── UI state ──────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab]             = useState('feed');
  const [pfTab, setPfTab]                     = useState('overview');
  const [pfEditing, setPfEditing]             = useState(false);
  const [pfSaving, setPfSaving]               = useState(false);
  const [pfForm, setPfForm]                   = useState({});
  const [skillInput, setSkillInput]           = useState('');
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const pendingNavRef                          = useRef(null);

  // ── Data state ────────────────────────────────────────────────────────────
  const [profile, setProfile]               = useState(null);
  const [industries, setIndustries]         = useState([]);
  const [courses, setCourses]               = useState([]);
  const [allJobs, setAllJobs]               = useState([]);
  const [matchedJobs, setMatchedJobs]       = useState([]);
  const [vacancies, setVacancies]           = useState([]);
  const [myApplications, setMyApplications] = useState([]);

  // ── Chat state ────────────────────────────────────────────────────────────
  const [conversations, setConversations]   = useState([]); // list of {id, name, logo, domain, lastMsg, time}
  const [activeChat, setActiveChat]         = useState(null);
  const [chatMessages, setChatMessages]     = useState({}); // {partnerId: [{text, mine, time}]}
  const [chatInput, setChatInput]           = useState('');
  const [convSearch, setConvSearch]         = useState('');

  // ── Modal state ───────────────────────────────────────────────────────────
  const [applyModal, setApplyModal]   = useState(null);
  const [detailModal, setDetailModal] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');

  // ── Loading flags ─────────────────────────────────────────────────────────
  const [feedLoading, setFeedLoading]   = useState(true);
  const [matchLoading, setMatchLoading] = useState(false);
  const [toasts, setToasts]             = useState([]);
  const [searchQuery, setSearchQuery]   = useState('');

  // ── Refs ──────────────────────────────────────────────────────────────────
  const avatarRef    = useRef();
  const certRef      = useRef();
  const resumeRef    = useRef();
  const postRef      = useRef();
  const chatEndRef   = useRef();
  const matchFetched = useRef(false);

  // ── Toast ──────────────────────────────────────────────────────────────────
  const toast = useCallback((msg, color = 'var(--accent2)') => {
    const id = Date.now();
    setToasts(p => [...p, { id, msg, color }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500);
  }, []);

  // ─────────────────────────────────────────────────────────────────────────────
  // BOOT: seed profile immediately, then load all data
  // ─────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!authUser?.id) return;

    const seed = authProfile
      ? buildProfile(authProfile, { email: authUser.email, id: authUser.id })
      : buildProfile({ id: authUser.id, email: authUser.email, name: authUser.email?.split('@')[0] || 'Student' });
    setProfile(seed);

    let cancelled = false;

    const boot = async () => {
      setFeedLoading(true);
      try {
        // Full profile from API
        try {
          const res = await axios.get(`${API}/get-profile?user_id=${authUser.id}`, { timeout: 5000 });
          if (!cancelled && res.data?.id) setProfile(buildProfile(res.data, { email: authUser.email }));
        } catch (_) {}

        // All feed data
        const [indR, courseR, vacR, appR, jobR, msgR] = await Promise.allSettled([
          axios.get(`${API}/industries`, { timeout: 8000 }),
          axios.get(`${API}/courses`, { timeout: 8000 }),
          // KEY FIX: fetch ALL vacancies - these are posted by industry dashboard
          axios.get(`${API}/vacancies`, { timeout: 8000 }),
          axios.get(`${API}/applications/student/${authUser.id}`, { timeout: 8000 }),
          axios.get(`${API}/all-jobs`, { timeout: 8000 }),
          axios.get(`${API}/messages/${authUser.id}`, { timeout: 8000 }),
        ]);

        if (cancelled) return;

        // Industries
        const indData = (indR.status === 'fulfilled' && Array.isArray(indR.value?.data) && indR.value.data.length)
          ? indR.value.data : [];
        setIndustries(indData);

        // Courses
        const courseData = (courseR.status === 'fulfilled' && Array.isArray(courseR.value?.data) && courseR.value.data.length)
          ? courseR.value.data : MOCK_COURSES;
        setCourses(courseData);

        // Vacancies (from industry dashboard — KEY FIX)
        if (vacR.status === 'fulfilled' && Array.isArray(vacR.value?.data)) {
          setVacancies(vacR.value.data.map(v => ({
            id: v.id,
            ownerId: v.owner_id,
            ownerName: v.owner_name || 'Company',
            ownerLogo: (v.owner_name || 'CO').substring(0, 2).toUpperCase(),
            type: v.type || 'Job Vacancy',
            title: v.title || 'Opening',
            desc: v.description || v.desc || '',
            skills: v.skills || '',
            duration: v.duration || '',
            offerings: v.offerings || '',
            location: v.location || '',
            date: v.created_at ? timeAgo(v.created_at) : 'Recent',
            likes: v.likes || 0,
          })));
        }

        // My applications
        if (appR.status === 'fulfilled' && Array.isArray(appR.value?.data)) {
          setMyApplications(appR.value.data.map(a => ({
            id: a.id,
            postId: a.vacancy_id,
            role: a.vacancies?.title || a.vacancy_title || 'Role',
            company: a.vacancies?.owner_name || a.owner_name || 'Company',
            appliedOn: a.created_at ? new Date(a.created_at).toLocaleDateString() : 'Recent',
            status: a.status || 'Pending',
            coverLetter: a.cover_letter,
          })));
        }

        // All jobs board
        if (jobR.status === 'fulfilled') {
          let raw = jobR.value?.data || [];
          if (typeof raw === 'string') { try { raw = JSON.parse(raw); } catch { raw = []; } }
          if (!Array.isArray(raw)) raw = [];
          setAllJobs(raw.length ? raw.map(j => ({
            industry: j.industry || j.company || 'Company',
            job: j.job || j.title || 'Opening',
            desc: j.desc || j.description || '',
            role: j.role || '',
            ug: j.ug || j.education || '',
            pg: j.pg || '',
            url: j.url || j.link || '#',
            dept: j.dept || j.department || '',
            skills: j.skills || '',
          })) : MOCK_JOBS);
        } else { setAllJobs(MOCK_JOBS); }

        // Messages → build conversation list
        if (msgR.status === 'fulfilled' && Array.isArray(msgR.value?.data)) {
          const msgs = {};
          msgR.value.data.forEach(m => {
            const pid = m.sender_id === authUser.id ? m.receiver_id : m.sender_id;
            if (!msgs[pid]) msgs[pid] = [];
            msgs[pid].push({
              mine: m.sender_id === authUser.id,
              text: m.text,
              time: m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
            });
          });
          setChatMessages(msgs);

          // Build conversations list from industries we've chatted with
          const convList = Object.keys(msgs).map(pid => {
            const ind = indData.find(i => String(i.id) === pid);
            const lastMsg = msgs[pid].at(-1);
            return {
              id: pid,
              name: ind?.name || 'Company',
              logo: ind?.logo || (ind?.name || 'CO').substring(0, 2).toUpperCase(),
              domain: ind?.domain || '',
              lastMsg: lastMsg?.text || '',
              time: lastMsg?.time || '',
              mine: lastMsg?.mine,
            };
          });
          setConversations(convList);
        }

      } catch (err) {
        console.error('Boot error:', err);
        setCourses(MOCK_COURSES);
        setAllJobs(MOCK_JOBS);
      } finally {
        if (!cancelled) setFeedLoading(false);
      }
    };

    boot();
    return () => { cancelled = true; };
  }, [authUser?.id]); // eslint-disable-line

  // AI skill match
  useEffect(() => {
    if (!profile?.skills?.length || matchFetched.current) return;
    matchFetched.current = true;
    const doMatch = async () => {
      setMatchLoading(true);
      try {
        const res = await axios.post(`${API}/analyze-skills`, { skills: profile.skills.join(', ') }, { timeout: 12000 });
        setMatchedJobs(Array.isArray(res.data) ? res.data : []);
      } catch (_) { setMatchedJobs([]); }
      setMatchLoading(false);
    };
    doMatch();
  }, [profile?.skills?.length]);

  // Scroll chat
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMessages, activeChat]);

  // Back guard
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

  // ── Helpers ───────────────────────────────────────────────────────────────
  const alreadyApplied = useCallback(pid => myApplications.some(a => a.postId === pid), [myApplications]);
  const safeProfile = profile || buildProfile({ id: authUser?.id, email: authUser?.email });
  const completion = useMemo(() => calcCompletion(safeProfile), [safeProfile]);

  const filteredJobs = useMemo(() =>
    allJobs.filter(j =>
      !searchQuery ||
      j.job?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.industry?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.skills?.toLowerCase().includes(searchQuery.toLowerCase())
    ), [allJobs, searchQuery]);

  const filteredSugg = useMemo(() =>
    SKILL_SUGGESTIONS.filter(s =>
      s.toLowerCase().includes(skillInput.toLowerCase()) && !(pfForm.skills || []).includes(s)
    ).slice(0, 8), [skillInput, pfForm.skills]);

  const filteredConvs = useMemo(() =>
    conversations.filter(c => c.name.toLowerCase().includes(convSearch.toLowerCase())),
    [conversations, convSearch]);

  function timeAgo(dateStr) {
    const d = new Date(dateStr), now = new Date();
    const mins = Math.floor((now - d) / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }

  function lineColor(type) {
    if (!type) return 'var(--accent)';
    const t = type.toLowerCase();
    if (t.includes('intern')) return 'var(--violet)';
    if (t.includes('train')) return 'var(--green)';
    if (t.includes('campus')) return 'var(--amber)';
    return 'var(--accent)';
  }

  // ── Chat actions ──────────────────────────────────────────────────────────
  const openChat = useCallback((industry) => {
    setActiveChat(industry);
    setActiveTab('chat');
    // Add to convs if not present
    setConversations(prev => {
      if (prev.find(c => String(c.id) === String(industry.id))) return prev;
      return [...prev, { id: String(industry.id), name: industry.name, logo: industry.logo, domain: industry.domain, lastMsg: '', time: '', mine: false }];
    });
  }, []);

  const sendMessage = async () => {
    if (!chatInput.trim() || !activeChat || !authUser?.id) return;
    const text = chatInput.trim();
    const pid = String(activeChat.id);
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setChatMessages(prev => ({ ...prev, [pid]: [...(prev[pid] || []), { mine: true, text, time }] }));
    setConversations(prev => prev.map(c => String(c.id) === pid ? { ...c, lastMsg: text, time, mine: true } : c));
    setChatInput('');
    try {
      await axios.post(`${API}/messages`, { sender_id: authUser.id, receiver_id: pid, text });
    } catch (_) {}
  };

  // ── Apply ──────────────────────────────────────────────────────────────────
  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!applyModal || !authUser?.id) return;
    try {
      const res = await axios.post(`${API}/applications`, {
        vacancy_id: applyModal.id, student_id: authUser.id, cover_letter: coverLetter,
      });
      setMyApplications(prev => [...prev, {
        id: res.data?.id || Date.now(), postId: applyModal.id,
        role: applyModal.title, company: applyModal.ownerName,
        appliedOn: new Date().toLocaleDateString(), status: 'Pending',
      }]);
      toast(`✓ Applied to ${applyModal.title}!`, 'var(--green)');
      setCoverLetter(''); setApplyModal(null); setDetailModal(null);
    } catch (_) { toast('Failed to apply — check if already applied.', 'var(--red)'); }
  };

  // ── Profile edit ──────────────────────────────────────────────────────────
  const startEdit = () => {
    setPfForm({
      name: safeProfile.name || '', phone: safeProfile.phone || '', address: safeProfile.address || '',
      about: safeProfile.about || '', qualification: safeProfile.qualification || '',
      tenth: safeProfile.tenth || '', twelfth: safeProfile.twelfth || '', graduation: safeProfile.graduation || '',
      website: safeProfile.website || '', linkedin: safeProfile.linkedin || '', github: safeProfile.github || '',
      experience: safeProfile.experience || '', projects: safeProfile.projects || '',
      achievements: safeProfile.achievements || '', cgpa: safeProfile.cgpa || '',
      skills: [...(safeProfile.skills || [])],
      certificates: [...(safeProfile.certificates || [])],
      resumes: [...(safeProfile.resumes || [])],
      personalPosts: [...(safeProfile.personalPosts || [])],
    });
    setPfEditing(true); setPfTab('overview');
  };

  const cancelEdit = () => { setPfEditing(false); setPfForm({}); };

  const saveProfile = async () => {
    if (!safeProfile.id) return;
    setPfSaving(true);
    try {
      await axios.put(`${API}/profile/${safeProfile.id}`, pfForm);
      setProfile(prev => ({ ...prev, ...pfForm }));
      setPfEditing(false); setPfForm({});
      toast('✓ Profile saved', 'var(--green)');
    } catch (_) {
      setProfile(prev => ({ ...prev, ...pfForm }));
      setPfEditing(false);
      toast('Changes saved locally', 'var(--amber)');
    }
    setPfSaving(false);
  };

  const pfSet = (k, v) => setPfForm(p => ({ ...p, [k]: v }));
  const addSkill = (s) => { const sk = s.trim(); if (!sk || pfForm.skills?.includes(sk)) return; pfSet('skills', [...(pfForm.skills || []), sk]); setSkillInput(''); };
  const removeSkill = (s) => pfSet('skills', pfForm.skills.filter(x => x !== s));

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    const b64 = await toBase64(file);
    try { await axios.put(`${API}/profile/${safeProfile.id}`, { photo: b64 }); setProfile(p => ({ ...p, photo: b64 })); toast('✓ Photo updated', 'var(--green)'); }
    catch (_) { toast('Upload failed', 'var(--red)'); }
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

  const handleLogout = async () => {
    try { await signOut(); } catch (_) {}
    navigate('/login');
  };

  const refreshMatch = async () => {
    if (!safeProfile.skills?.length) return;
    matchFetched.current = true; setMatchLoading(true);
    try {
      const res = await axios.post(`${API}/analyze-skills`, { skills: safeProfile.skills.join(', ') }, { timeout: 12000 });
      setMatchedJobs(Array.isArray(res.data) ? res.data : []);
    } catch (_) { setMatchedJobs([]); }
    setMatchLoading(false);
  };

  // ── TypeChip ──────────────────────────────────────────────────────────────
  const TypeChip = ({ type }) => {
    if (!type) return <span className="type-chip chip-vacancy">Vacancy</span>;
    const t = type.toLowerCase();
    if (t.includes('intern')) return <span className="type-chip chip-internship">Internship</span>;
    if (t.includes('train')) return <span className="type-chip chip-training">Training</span>;
    if (t.includes('campus')) return <span className="type-chip chip-campus">Campus</span>;
    return <span className="type-chip chip-vacancy">{type}</span>;
  };

  // ── StatusChip ────────────────────────────────────────────────────────────
  const StatusChip = ({ status }) => {
    const map = { Pending: 's-pending', Shortlisted: 's-shortlisted', Selected: 's-selected', Rejected: 's-rejected' };
    return <span className={`status-chip ${map[status] || 's-pending'}`}>{status || 'Pending'}</span>;
  };

  // ── Nav items ─────────────────────────────────────────────────────────────
  const navItems = [
    { id: 'feed',         icon: '⬛', label: 'Opportunity Feed', badge: vacancies.length || null, badgeColor: '' },
    { id: 'jobs',         icon: '💼', label: 'Jobs Board' },
    { id: 'matches',      icon: '🤖', label: 'AI Matches', badge: matchedJobs.length || null, badgeColor: '' },
    { id: 'courses',      icon: '📚', label: 'Courses' },
    { id: 'chat',         icon: '💬', label: 'Messages', badge: Object.keys(chatMessages).length || null, badgeColor: 'green' },
    { id: 'applications', icon: '📋', label: 'Applications', badge: myApplications.length || null, badgeColor: 'amber' },
    { id: 'profile',      icon: '👤', label: 'My Profile' },
  ];

  // ── Auth guard ────────────────────────────────────────────────────────────
  if (!authUser?.id) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#07090f', flexDirection: 'column', gap: '1.2rem', fontFamily: "'Instrument Sans',sans-serif" }}>
        <style>{CSS}</style>
        <div style={{ fontFamily: "'Cabinet Grotesk',sans-serif", fontSize: '1.6rem', fontWeight: 900, background: 'linear-gradient(135deg,#818cf8,#8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Campus2Career</div>
        <div className="spinner" />
        <div style={{ fontSize: '.82rem', color: '#4b5a6b' }}>Authenticating…</div>
      </div>
    );
  }

  // ── ProfilePage ───────────────────────────────────────────────────────────
  const ProfilePage = () => {
    const data = pfEditing ? pfForm : safeProfile;
    const skills = data?.skills || [];
    const certs = data?.certificates || [];
    const resumes = data?.resumes || [];
    const posts = data?.personalPosts || [];

    return (
      <div className="pf-page">
        <input ref={avatarRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload} />
        <input ref={certRef} type="file" accept="image/*,application/pdf" multiple style={{ display: 'none' }} onChange={handleCertUpload} />
        <input ref={resumeRef} type="file" accept="application/pdf,image/*" multiple style={{ display: 'none' }} onChange={handleResumeUpload} />
        <input ref={postRef} type="file" accept="image/*,video/*" multiple style={{ display: 'none' }} onChange={handlePostUpload} />

        {/* Cover */}
        <div className="pf-cover">
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>Student Profile</div>
            <div style={{ fontFamily: "'Cabinet Grotesk',sans-serif", fontSize: '1.8rem', fontWeight: 900, color: 'white' }}>{safeProfile.name || 'Your Name'}</div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginTop: '0.4rem' }}>{safeProfile.qualification} · {safeProfile.graduation}</div>
          </div>
          <div className="pf-av-wrap" onClick={() => avatarRef.current?.click()}>
            {safeProfile.photo ? <img src={safeProfile.photo} alt="" /> : <div className="pf-av-initial">{(safeProfile.name || 'S')[0].toUpperCase()}</div>}
          </div>
        </div>

        {/* Hero */}
        <div className="pf-hero">
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginTop: '0.5rem' }}>
            <div style={{ flex: 1 }}>
              <div className="pf-name">{safeProfile.name || 'Your Name'}</div>
              <div className="pf-qual">{safeProfile.qualification || 'Add your qualification'}</div>
              <div className="pf-meta-row">
                {safeProfile.email && <span>✉ {safeProfile.email}</span>}
                {safeProfile.phone && <span>📞 {safeProfile.phone}</span>}
                {safeProfile.address && <span>📍 {safeProfile.address}</span>}
                {safeProfile.linkedin && <a href={safeProfile.linkedin} target="_blank" rel="noreferrer">🔗 LinkedIn</a>}
                {safeProfile.github && <a href={safeProfile.github} target="_blank" rel="noreferrer">🐙 GitHub</a>}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
              <div style={{ textAlign: 'center', background: 'var(--surface2)', borderRadius: '12px', padding: '0.75rem 1.2rem', border: '1px solid var(--border)' }}>
                <div style={{ fontFamily: "'Cabinet Grotesk',sans-serif", fontSize: '1.6rem', fontWeight: 900, color: completion >= 80 ? 'var(--green)' : 'var(--accent2)', lineHeight: 1 }}>{completion}%</div>
                <div style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginTop: 2 }}>Complete</div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {pfEditing
                  ? <><button className="btn btn-ghost btn-sm" onClick={cancelEdit}>Cancel</button><button className="btn btn-primary btn-sm" onClick={saveProfile} disabled={pfSaving}>{pfSaving ? 'Saving…' : '💾 Save'}</button></>
                  : <button className="btn btn-primary btn-sm" onClick={startEdit}>✏️ Edit Profile</button>}
              </div>
            </div>
          </div>
          {safeProfile.about && <p style={{ color: 'var(--text2)', lineHeight: 1.7, fontSize: '0.83rem', marginTop: '0.75rem' }}>{safeProfile.about}</p>}
          {safeProfile.skills?.length > 0 && (
            <div className="pf-skills-row" style={{ marginTop: '0.75rem' }}>
              {safeProfile.skills.slice(0, 8).map(s => <span key={s} className="pf-skill-chip">{s}</span>)}
              {safeProfile.skills.length > 8 && <span className="pf-skill-chip" onClick={() => setPfTab('skills')} style={{ cursor: 'pointer' }}>+{safeProfile.skills.length - 8}</span>}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="pf-tabs">
          {[{id:'overview',label:'👤 Overview'},{id:'skills',label:'⚡ Skills'},{id:'academic',label:'🎓 Academic'},{id:'experience',label:'💼 Experience'},{id:'media',label:'🖼 Media'},{id:'resume',label:'📄 Resume'}].map(t => (
            <button key={t.id} className={`pf-tab ${pfTab === t.id ? 'active' : ''}`} onClick={() => setPfTab(t.id)}>{t.label}</button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Overview */}
          {pfTab === 'overview' && (
            <motion.div key="ov" initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
              <div className="pf-card">
                <div className="pf-card-title">✍️ About Me</div>
                {pfEditing
                  ? <textarea className="pf-input" rows={4} placeholder="Write about yourself…" value={pfForm.about || ''} onChange={e => pfSet('about', e.target.value)} />
                  : <p style={{ color:'var(--text2)', lineHeight:1.7, fontSize:'0.85rem' }}>{safeProfile.about || <em style={{ color:'var(--text3)' }}>No bio yet. Click Edit Profile to add one.</em>}</p>}
              </div>
              <div className="pf-card">
                <div className="pf-card-title">📋 Personal Information</div>
                {pfEditing
                  ? <div className="pf-grid">
                      {[{k:'name',l:'Full Name',p:'Your full name'},{k:'phone',l:'Phone',p:'+91 XXXXXXXXXX'},{k:'address',l:'City',p:'Your city'},{k:'cgpa',l:'CGPA / %',p:'e.g. 8.5'},{k:'experience',l:'Experience',p:'e.g. 6-month intern'},{k:'website',l:'Portfolio',p:'https://'},{k:'linkedin',l:'LinkedIn',p:'linkedin.com/in/'},{k:'github',l:'GitHub',p:'github.com/username'}].map(f => (
                        <div className="pf-field" key={f.k}>
                          <label className="pf-label">{f.l}</label>
                          <input className="pf-input" placeholder={f.p} value={pfForm[f.k] || ''} onChange={e => pfSet(f.k, e.target.value)} />
                        </div>
                      ))}
                      <div className="pf-field">
                        <label className="pf-label">Qualification</label>
                        <select className="pf-input" value={pfForm.qualification || ''} onChange={e => pfSet('qualification', e.target.value)}>
                          <option value="">Select…</option>
                          {['10th','12th','Diploma','ITI','BCA','B.Tech','B.Sc','B.Com','BA','MCA','M.Tech','M.Sc','MBA','PhD','Other'].map(q => <option key={q} value={q}>{q}</option>)}
                        </select>
                      </div>
                      <div className="pf-field">
                        <label className="pf-label">Email (read-only)</label>
                        <input className="pf-input" value={safeProfile.email || ''} readOnly style={{ opacity:0.5, cursor:'not-allowed' }} />
                      </div>
                      <div style={{ gridColumn:'1/-1', display:'flex', justifyContent:'flex-end', marginTop:'0.5rem' }}>
                        <button className="btn btn-primary btn-sm" onClick={saveProfile} disabled={pfSaving}>{pfSaving?'Saving…':'💾 Save'}</button>
                      </div>
                    </div>
                  : <div className="pf-grid">
                      {[['Full Name',safeProfile.name],['Email',safeProfile.email],['Phone',safeProfile.phone],['Location',safeProfile.address],['Qualification',safeProfile.qualification],['CGPA',safeProfile.cgpa],['Experience',safeProfile.experience],['Portfolio',safeProfile.website]].map(([l,v]) => (
                        <div key={l}>
                          <div className="pf-label" style={{ marginBottom:'0.2rem' }}>{l}</div>
                          <div style={{ fontSize:'0.85rem', fontWeight:600, color: v ? 'var(--text)' : 'var(--text3)', fontStyle: v ? 'normal' : 'italic', wordBreak:'break-all' }}>{v || 'Not provided'}</div>
                        </div>
                      ))}
                    </div>}
              </div>
            </motion.div>
          )}

          {/* Skills */}
          {pfTab === 'skills' && (
            <motion.div key="sk" initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
              <div className="pf-card">
                <div className="pf-card-title">⚡ Skills & Expertise</div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:'5px' }}>
                  {skills.map(s => (
                    <span key={s} className="pf-skill-chip" style={{ display:'inline-flex', alignItems:'center', gap:4 }}>
                      {s}
                      {pfEditing && <button onClick={() => removeSkill(s)} style={{ background:'none', border:'none', color:'var(--red)', cursor:'pointer', fontWeight:800, fontSize:'0.6rem', lineHeight:1, padding:0 }}>✕</button>}
                    </span>
                  ))}
                  {skills.length === 0 && <em style={{ color:'var(--text3)', fontSize:'0.83rem' }}>No skills added yet.</em>}
                </div>
                {pfEditing && (
                  <>
                    <div style={{ height:1, background:'var(--border)', margin:'1rem 0' }} />
                    <div className="pf-label" style={{ marginBottom:'0.45rem' }}>Add Skill</div>
                    <div style={{ display:'flex', gap:'0.55rem' }}>
                      <input className="pf-input" style={{ flex:1 }} placeholder="Type skill name…" value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(skillInput); } }} />
                      <button className="btn btn-primary btn-sm" onClick={() => addSkill(skillInput)}>+ Add</button>
                    </div>
                    {skillInput && filteredSugg.length > 0 && <div style={{ display:'flex', flexWrap:'wrap', gap:'5px', marginTop:'0.5rem' }}>{filteredSugg.map(s => <button key={s} className="skill-sugg" onClick={() => addSkill(s)}>{s}</button>)}</div>}
                    {!skillInput && (
                      <>
                        <div className="pf-label" style={{ marginTop:'0.9rem', marginBottom:'0.4rem' }}>Quick add</div>
                        <div style={{ display:'flex', flexWrap:'wrap', gap:'5px' }}>{SKILL_SUGGESTIONS.filter(s => !skills.includes(s)).slice(0, 20).map(s => <button key={s} className="skill-sugg" onClick={() => addSkill(s)}>{s}</button>)}</div>
                      </>
                    )}
                    <div style={{ display:'flex', justifyContent:'flex-end', marginTop:'1.2rem' }}><button className="btn btn-primary btn-sm" onClick={saveProfile} disabled={pfSaving}>{pfSaving?'Saving…':'💾 Save Skills'}</button></div>
                  </>
                )}
                {!pfEditing && <div style={{ marginTop:'0.9rem' }}><button className="btn btn-ghost btn-sm" onClick={startEdit}>✏️ Edit Skills</button></div>}
              </div>
            </motion.div>
          )}

          {/* Academic */}
          {pfTab === 'academic' && (
            <motion.div key="ac" initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
              <div className="pf-card">
                <div className="pf-card-title">🎓 Academic Background</div>
                {pfEditing
                  ? <><div className="pf-grid-3">{[{k:'tenth',l:'10th',p:'Board / School / %'},{k:'twelfth',l:'12th',p:'Board / School / %'},{k:'graduation',l:'Graduation',p:'College / Degree / CGPA'}].map(f => (
                      <div className="pf-field" key={f.k}><label className="pf-label">{f.l}</label><input className="pf-input" placeholder={f.p} value={pfForm[f.k] || ''} onChange={e => pfSet(f.k, e.target.value)} /></div>
                    ))}</div><div style={{ display:'flex', justifyContent:'flex-end', marginTop:'1.2rem' }}><button className="btn btn-primary btn-sm" onClick={saveProfile} disabled={pfSaving}>{pfSaving?'Saving…':'💾 Save'}</button></div></>
                  : <div className="pf-grid-3">{[['10th Standard',safeProfile.tenth],['12th Standard',safeProfile.twelfth],['Graduation',safeProfile.graduation]].map(([l,v]) => (
                      <div className="pf-acad-box" key={l}><div className="pf-acad-lbl">{l}</div><div className="pf-acad-val">{v || <em style={{ color:'var(--text3)', fontStyle:'italic', fontSize:'0.8rem' }}>Not added</em>}</div></div>
                    ))}</div>}
                {!pfEditing && <div style={{ marginTop:'1rem' }}><button className="btn btn-ghost btn-sm" onClick={startEdit}>✏️ Edit Academic</button></div>}
              </div>
            </motion.div>
          )}

          {/* Experience */}
          {pfTab === 'experience' && (
            <motion.div key="ex" initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
              <div className="pf-card">
                <div className="pf-card-title">💼 Experience & Projects</div>
                {pfEditing
                  ? <div style={{ display:'flex', flexDirection:'column', gap:'0.85rem' }}>
                      {[{k:'experience',l:'Work / Internship Experience',p:'e.g. 6-month intern at TechCorp…',rows:4},{k:'projects',l:'Projects',p:'Describe your key projects…',rows:4},{k:'achievements',l:'Achievements / Awards',p:'Hackathon wins, certifications…',rows:3}].map(f => (
                        <div className="pf-field" key={f.k}><label className="pf-label">{f.l}</label><textarea className="pf-input" rows={f.rows} placeholder={f.p} value={pfForm[f.k] || ''} onChange={e => pfSet(f.k, e.target.value)} /></div>
                      ))}
                      <div style={{ display:'flex', justifyContent:'flex-end' }}><button className="btn btn-primary btn-sm" onClick={saveProfile} disabled={pfSaving}>{pfSaving?'Saving…':'💾 Save'}</button></div>
                    </div>
                  : <div style={{ display:'flex', flexDirection:'column', gap:'1.2rem' }}>
                      {[['Work / Internship Experience',safeProfile.experience],['Projects',safeProfile.projects],['Achievements / Awards',safeProfile.achievements]].map(([l,v]) => (
                        <div key={l}><div className="pf-label" style={{ marginBottom:'0.4rem' }}>{l}</div><p style={{ fontSize:'0.85rem', color: v ? 'var(--text2)' : 'var(--text3)', lineHeight:1.65, fontStyle: v ? 'normal' : 'italic' }}>{v || `No ${l.toLowerCase()} added yet.`}</p></div>
                      ))}
                      <button className="btn btn-ghost btn-sm" style={{ width:'fit-content' }} onClick={startEdit}>✏️ Add Experience</button>
                    </div>}
              </div>
            </motion.div>
          )}

          {/* Media */}
          {pfTab === 'media' && (
            <motion.div key="md" initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
              <div className="pf-card">
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem' }}>
                  <div className="pf-card-title" style={{ marginBottom:0 }}>🏆 Certificates</div>
                  {pfEditing && <button className="btn btn-ghost btn-sm" onClick={() => certRef.current?.click()}>+ Upload</button>}
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(95px,1fr))', gap:'0.6rem' }}>
                  {certs.map((c, i) => (
                    <div className="pf-thumb" key={i} onClick={() => window.open(c.url, '_blank')}>
                      {c.type?.startsWith('image/') ? <img src={c.url} alt="" /> : <div style={{ width:'100%', height:'100%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'var(--surface2)' }}><span style={{ fontSize:'1.5rem' }}>📑</span><span style={{ fontSize:'0.58rem', fontWeight:700, color:'var(--text3)', marginTop:2 }}>PDF</span></div>}
                      {pfEditing && <button className="pf-thumb-del" onClick={e => { e.stopPropagation(); pfSet('certificates', pfForm.certificates.filter((_,j)=>j!==i)); }}>✕</button>}
                    </div>
                  ))}
                  {pfEditing && <div className="pf-add-thumb" onClick={() => certRef.current?.click()}><span style={{ fontSize:'1.2rem' }}>+</span><span>Add</span></div>}
                  {!pfEditing && certs.length === 0 && <em style={{ color:'var(--text3)', fontSize:'0.8rem' }}>No certificates yet.</em>}
                </div>
              </div>
              <div className="pf-card">
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem' }}>
                  <div className="pf-card-title" style={{ marginBottom:0 }}>📸 Activity Posts</div>
                  {pfEditing && <button className="btn btn-ghost btn-sm" onClick={() => postRef.current?.click()}>+ Upload</button>}
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(95px,1fr))', gap:'0.6rem' }}>
                  {posts.map((p, i) => (
                    <div className="pf-thumb" key={i} onClick={() => window.open(p.url, '_blank')}>
                      {p.type?.startsWith('image/') ? <img src={p.url} alt="" /> : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--surface2)' }}><span style={{ fontSize:'1.5rem' }}>🎬</span></div>}
                      {pfEditing && <button className="pf-thumb-del" onClick={e => { e.stopPropagation(); pfSet('personalPosts', pfForm.personalPosts.filter((_,j)=>j!==i)); }}>✕</button>}
                    </div>
                  ))}
                  {pfEditing && <div className="pf-add-thumb" onClick={() => postRef.current?.click()}><span style={{ fontSize:'1.2rem' }}>+</span><span>Add</span></div>}
                  {!pfEditing && posts.length === 0 && <em style={{ color:'var(--text3)', fontSize:'0.8rem' }}>No posts yet.</em>}
                </div>
                {pfEditing && <div style={{ display:'flex', justifyContent:'flex-end', marginTop:'1.1rem' }}><button className="btn btn-primary btn-sm" onClick={saveProfile} disabled={pfSaving}>{pfSaving?'Saving…':'💾 Save Media'}</button></div>}
              </div>
            </motion.div>
          )}

          {/* Resume */}
          {pfTab === 'resume' && (
            <motion.div key="rv" initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
              <div className="pf-card">
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.2rem' }}>
                  <div className="pf-card-title" style={{ marginBottom:0 }}>📄 My Resumes</div>
                  {pfEditing && <button className="btn btn-ghost btn-sm" onClick={() => resumeRef.current?.click()}>+ Upload</button>}
                </div>
                {resumes.length === 0
                  ? <div className="empty-state"><div className="empty-icon">📄</div><div className="empty-title">No resumes yet</div><div className="empty-text">Upload a resume to attach to applications.</div>{pfEditing ? <button className="btn btn-primary" style={{ marginTop:'1rem' }} onClick={() => resumeRef.current?.click()}>+ Upload Resume</button> : <button className="btn btn-ghost btn-sm" style={{ marginTop:'1rem' }} onClick={startEdit}>Go to Edit Mode</button>}</div>
                  : resumes.map((r, i) => (
                    <div key={i} style={{ display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.9rem 1rem', background:'var(--surface2)', borderRadius:'10px', border:'1px solid var(--border)', marginBottom:'0.55rem' }}>
                      <div style={{ fontSize:'1.4rem', flexShrink:0 }}>{r.type === 'application/pdf' ? '📑' : '🖼️'}</div>
                      <div style={{ flex:1 }}><div style={{ fontSize:'0.8rem', fontWeight:700, color:'var(--text)' }}>{r.name}</div><div style={{ fontSize:'0.65rem', color:'var(--text3)' }}>{r.type}</div></div>
                      <div style={{ display:'flex', gap:'0.4rem' }}>
                        <a href={r.url} target="_blank" rel="noreferrer"><button className="btn btn-ghost btn-xs">View</button></a>
                        {pfEditing && <button className="btn btn-danger btn-xs" onClick={() => pfSet('resumes', pfForm.resumes.filter((_,j)=>j!==i))}>Remove</button>}
                      </div>
                    </div>
                  ))
                }
                {pfEditing && resumes.length > 0 && <div style={{ display:'flex', justifyContent:'flex-end', marginTop:'1.1rem' }}><button className="btn btn-primary btn-sm" onClick={saveProfile} disabled={pfSaving}>{pfSaving?'Saving…':'💾 Save'}</button></div>}
              </div>
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

      {/* Exit confirm */}
      <AnimatePresence>
        {showExitConfirm && (
          <motion.div className="exit-overlay" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
            <motion.div className="exit-box" initial={{ scale:.92,y:20 }} animate={{ scale:1,y:0 }} exit={{ scale:.92,y:20 }}>
              <div className="exit-icon">🚪</div>
              <div className="exit-title">Leave Campus2Career?</div>
              <div className="exit-sub">You'll be signed out and returned to login. Any unsaved changes will be lost.</div>
              <div className="exit-btn-row">
                <button className="exit-btn-stay" onClick={() => setShowExitConfirm(false)}>Stay Here</button>
                <button className="exit-btn-leave" onClick={async () => { setShowExitConfirm(false); try { await signOut(); } catch(_){} navigate(pendingNavRef.current || '/login'); }}>Yes, Leave</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="sd-root">
        {/* SIDEBAR */}
        <aside className="sd-sidebar">
          <div className="sidebar-brand">
            <div className="brand-logo">Campus2Career</div>
            <div className="brand-tag">Student Portal</div>
          </div>
          <nav className="sidebar-nav">
            <div className="nav-group-label">Main</div>
            {navItems.slice(0, 4).map(n => (
              <div key={n.id} className={`nav-item ${activeTab === n.id ? 'active' : ''}`} onClick={() => setActiveTab(n.id)}>
                <span className="nav-icon">{n.icon}</span>
                <span>{n.label}</span>
                {n.badge ? <span className={`nav-badge ${n.badgeColor || ''}`}>{n.badge}</span> : null}
              </div>
            ))}
            <div className="nav-group-label" style={{ marginTop:'0.5rem' }}>Personal</div>
            {navItems.slice(4).map(n => (
              <div key={n.id} className={`nav-item ${activeTab === n.id ? 'active' : ''}`} onClick={() => setActiveTab(n.id)}>
                <span className="nav-icon">{n.icon}</span>
                <span>{n.label}</span>
                {n.badge ? <span className={`nav-badge ${n.badgeColor || ''}`}>{n.badge}</span> : null}
              </div>
            ))}
          </nav>
          <div className="sidebar-footer">
            <div className="sidebar-user" onClick={() => setActiveTab('profile')}>
              <div className="s-avatar">
                {safeProfile.photo ? <img src={safeProfile.photo} alt="" /> : (safeProfile.name || 'S')[0].toUpperCase()}
              </div>
              <div>
                <div className="s-name">{safeProfile.name || 'Student'}</div>
                <div className="s-role">{safeProfile.qualification || 'Student'}</div>
              </div>
            </div>
            <button className="logout-btn" onClick={handleLogout}>← Sign Out</button>
          </div>
        </aside>

        {/* MAIN */}
        <div className="sd-main">
          {/* Topbar */}
          <div className="topbar">
            <div className="topbar-title">{navItems.find(n => n.id === activeTab)?.label || 'Dashboard'}</div>
            <div className="search-box">
              <span style={{ color:'var(--text3)', fontSize:'0.8rem' }}>🔍</span>
              <input placeholder="Search jobs, skills, companies…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
            <div className="topbar-actions">
              <div className="icon-btn" title="Notifications"><span>🔔</span><span className="notif-dot" /></div>
              <div className="icon-btn" onClick={() => setActiveTab('profile')} title="Profile" style={{ overflow:'hidden', padding:0 }}>
                {safeProfile.photo ? <img src={safeProfile.photo} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : <span style={{ fontWeight:800, fontSize:'0.85rem' }}>{(safeProfile.name || 'S')[0].toUpperCase()}</span>}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="content-area">
            <AnimatePresence mode="wait">

              {/* ══ FEED ══════════════════════════════════════════════════════ */}
              {activeTab === 'feed' && (
                <motion.div className="page" key="feed" initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0 }}>

                  {/* Stats */}
                  <div className="stats-grid">
                    {[
                      { label:'Open Opportunities', value:vacancies.length, icon:'💼', color:'var(--accent2)', glow:'rgba(99,102,241,0.08)' },
                      { label:'Partner Companies', value:industries.length, icon:'🏢', color:'var(--cyan)', glow:'rgba(6,182,212,0.06)' },
                      { label:'My Applications', value:myApplications.length, icon:'📋', color:'var(--amber)', glow:'rgba(245,158,11,0.06)' },
                      { label:'Profile Complete', value:`${completion}%`, icon:'👤', color: completion >= 80 ? 'var(--green)' : 'var(--violet)', glow:'rgba(139,92,246,0.06)' },
                    ].map((s,i) => (
                      <motion.div key={i} className="stat-card" style={{ '--glow':s.glow }} initial={{ opacity:0,y:15 }} animate={{ opacity:1,y:0 }} transition={{ delay:i*0.06 }}>
                        <div className="stat-icon">{s.icon}</div>
                        <div className="stat-label">{s.label}</div>
                        <div className="stat-value" style={{ color:s.color }}>{s.value}</div>
                        <span className="stat-badge" style={{ background:s.glow, color:s.color }}>Live</span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Partner Industries */}
                  <div className="page-sec" style={{ marginBottom:'2rem' }}>
                    <div className="section-hd">
                      <div><div className="section-title">Partner Industries</div><div className="section-sub">{industries.length} registered companies</div></div>
                      <button className="btn btn-ghost btn-sm" onClick={() => setActiveTab('chat')}>All Conversations →</button>
                    </div>
                    {industries.length === 0
                      ? <div style={{ color:'var(--text3)', fontSize:'0.8rem', padding:'1rem' }}>No industries registered yet.</div>
                      : <div className="ind-grid">
                          {industries.map((ind, i) => (
                            <motion.div key={ind.id || i} className="ind-card" initial={{ opacity:0,y:12 }} animate={{ opacity:1,y:0 }} transition={{ delay:i*0.06 }}>
                              <div className="ind-logo">{ind.logo || (ind.name || 'CO').substring(0,2).toUpperCase()}</div>
                              <div className="ind-name">{ind.name}</div>
                              <div className="ind-domain-tag">{ind.domain}</div>
                              <div className="ind-loc">📍 {ind.location}</div>
                              {ind.tagline && <div className="ind-tagline">"{ind.tagline}"</div>}
                              <button className="msg-btn" onClick={() => openChat(ind)}>💬 Message</button>
                            </motion.div>
                          ))}
                        </div>
                    }
                  </div>

                  {/* Opportunity Feed — REAL jobs from industry dashboard via Supabase */}
                  <div className="section-hd">
                    <div><div className="section-title">Opportunity Feed</div><div className="section-sub">{vacancies.length} openings · posted by registered companies</div></div>
                  </div>
                  {feedLoading
                    ? <div style={{ textAlign:'center', padding:'3rem' }}><div className="spinner" style={{ margin:'0 auto' }} /></div>
                    : vacancies.length === 0
                      ? <div className="card"><div className="empty-state"><div className="empty-icon">📭</div><div className="empty-title">No opportunities yet</div><div className="empty-text">Companies haven't posted any openings yet. Check back soon.</div></div></div>
                      : <div className="feed-grid">
                          {vacancies.map((v, i) => (
                            <motion.div key={v.id || i} className="vac-card" style={{ '--line':lineColor(v.type) }} initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }} transition={{ delay:i*0.04 }}>
                              <div className="vac-body">
                                <div className="vac-top">
                                  <div className="vac-logo-wrap">
                                    <div className="vac-logo">{v.ownerLogo}</div>
                                    <div><div className="vac-company">{v.ownerName}</div><div className="vac-date">{v.date}</div></div>
                                  </div>
                                  <TypeChip type={v.type} />
                                </div>
                                <div className="vac-title">{v.title}</div>
                                <div className="vac-desc">{v.desc}</div>
                                <div className="skill-pills">{(v.skills||'').split(',').filter(Boolean).slice(0,5).map((sk,j) => <span key={j} className="s-pill">{sk.trim()}</span>)}</div>
                              </div>
                              <div className="vac-foot">
                                <div className="vac-meta">
                                  {v.duration && <span className="vac-meta-item">⏱ {v.duration}</span>}
                                  {v.offerings && <span className="vac-meta-item">💰 {v.offerings.slice(0,30)}{v.offerings.length>30?'…':''}</span>}
                                  {v.location && <span className="vac-meta-item">📍 {v.location}</span>}
                                </div>
                                <div className="vac-actions">
                                  <button className="btn btn-ghost btn-xs" onClick={() => setDetailModal(v)}>Details</button>
                                  {alreadyApplied(v.id) ? <span className="applied-badge">✓ Applied</span> : <button className="apply-btn" onClick={() => setApplyModal(v)}>Apply Now</button>}
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                  }
                </motion.div>
              )}

              {/* ══ JOBS BOARD ════════════════════════════════════════════════ */}
              {activeTab === 'jobs' && (
                <motion.div className="page" key="jobs" initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0 }}>
                  <div className="section-hd">
                    <div><div className="section-title">Jobs Board</div><div className="section-sub">{filteredJobs.length} of {allJobs.length} listings</div></div>
                  </div>
                  <div className="jobs-grid">
                    {filteredJobs.map((j, i) => (
                      <motion.div key={i} className="job-card" style={{ '--line':'var(--accent)' }} initial={{ opacity:0,scale:.97 }} animate={{ opacity:1,scale:1 }} transition={{ delay:i*0.04 }}>
                        <div className="job-company">{j.industry}</div>
                        <div className="job-title">{j.job}</div>
                        <div className="job-desc">{j.desc}</div>
                        <div className="job-tags">
                          {j.dept && <span className="j-tag" style={{ color:'var(--cyan)', borderColor:'rgba(6,182,212,0.2)', background:'var(--cyan2)' }}>{j.dept}</span>}
                          {j.role && <span className="j-tag" style={{ color:'var(--violet)', borderColor:'rgba(139,92,246,0.2)', background:'var(--violet2)' }}>{j.role}</span>}
                          {j.ug && <span className="j-tag" style={{ color:'var(--green)', borderColor:'rgba(16,185,129,0.2)', background:'var(--green2)' }}>{j.ug}</span>}
                        </div>
                        <div className="skill-pills" style={{ marginBottom:'0.65rem' }}>{(j.skills||'').split(',').filter(Boolean).slice(0,4).map((sk,k) => <span key={k} className="s-pill" style={{ fontSize:'0.64rem' }}>{sk.trim()}</span>)}</div>
                        <div className="job-foot">
                          <span style={{ fontSize:'0.68rem', color:'var(--text3)' }}>{j.pg && `PG: ${j.pg}`}</span>
                          <a href={j.url} target="_blank" rel="noreferrer"><button className="btn btn-primary btn-xs">Apply →</button></a>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* ══ AI MATCHES ════════════════════════════════════════════════ */}
              {activeTab === 'matches' && (
                <motion.div className="page" key="matches" initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0 }}>
                  <div className="section-hd">
                    <div><div className="section-title">🤖 AI Skill Matches</div><div className="section-sub">Based on your skill profile</div></div>
                    <button className="btn btn-ghost btn-sm" onClick={refreshMatch} disabled={matchLoading}>{matchLoading ? '…' : '↺ Refresh'}</button>
                  </div>
                  {matchLoading
                    ? <div style={{ textAlign:'center', padding:'2rem' }}><div className="spinner" style={{ margin:'0 auto' }} /></div>
                    : !safeProfile.skills?.length
                      ? <div className="card"><div className="empty-state"><div className="empty-icon">⚡</div><div className="empty-title">No skills added yet</div><div className="empty-text">Add skills to unlock AI-powered job matches.</div><button className="btn btn-primary" style={{ marginTop:'1rem' }} onClick={() => { setActiveTab('profile'); setTimeout(() => setPfTab('skills'), 100); }}>Add Skills →</button></div></div>
                      : matchedJobs.length === 0
                        ? <div className="card"><div className="empty-state"><div className="empty-icon">🔍</div><div className="empty-title">No matches yet</div><div className="empty-text">Click Refresh to run AI skill analysis.</div></div></div>
                        : <div className="match-grid">
                            {matchedJobs.map((m, i) => (
                              <motion.div key={i} className="match-card" initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }} transition={{ delay:i*0.07 }}>
                                <div className="match-pct">{m.match_confidence ?? m.accuracy ?? 0}%</div>
                                <div className="match-lbl">Match Confidence</div>
                                <div className="match-bar-track"><div className="match-bar-fill" style={{ width:`${m.match_confidence ?? m.accuracy ?? 0}%` }} /></div>
                                <div className="match-job">{m.job || m.matched_job}</div>
                                {m.industry && <div className="match-industry">📍 {m.industry}</div>}
                                {m.missing_skills?.length > 0 && <div style={{ marginBottom:'0.65rem' }}><div style={{ fontSize:'0.63rem', fontWeight:800, textTransform:'uppercase', color:'var(--red)', letterSpacing:'0.06em', marginBottom:'0.35rem' }}>Skills to Learn</div><div>{m.missing_skills.map((s,j) => <span key={j} className="miss-chip">{s}</span>)}</div></div>}
                                {m.courses?.length > 0 && <div><div style={{ fontSize:'0.63rem', fontWeight:800, textTransform:'uppercase', color:'var(--green)', letterSpacing:'0.06em', margin:'0.7rem 0 0.35rem' }}>Recommended Courses</div>{m.courses.map((c,j) => <a key={j} href={c.link||c.url||'#'} target="_blank" rel="noreferrer" className="course-rec-item"><span style={{ fontSize:'0.9rem' }}>📚</span><span className="course-rec-name">{c.title}</span><span style={{ fontSize:'0.65rem', color:'var(--accent2)', fontWeight:700 }}>→</span></a>)}</div>}
                                {m.url && <a href={m.url} target="_blank" rel="noreferrer"><button className="btn btn-primary" style={{ width:'100%', marginTop:'0.7rem' }}>View Job →</button></a>}
                              </motion.div>
                            ))}
                          </div>
                  }
                </motion.div>
              )}

              {/* ══ COURSES ═══════════════════════════════════════════════════ */}
              {activeTab === 'courses' && (
                <motion.div className="page" key="courses" initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0 }}>
                  <div className="section-hd" style={{ marginBottom:'1.3rem' }}>
                    <div><div className="section-title">Recommended Courses</div><div className="section-sub">{courses.length} courses available</div></div>
                  </div>
                  <div className="courses-grid">
                    {courses.map((c, i) => (
                      <motion.div key={c.id || i} className="course-card" initial={{ opacity:0,y:12 }} animate={{ opacity:1,y:0 }} transition={{ delay:i*0.06 }} onClick={() => window.open(c.link||c.url||'#', '_blank')}>
                        <div className="course-top"><div className="course-provider">{c.provider}</div><div className="course-name">{c.title}</div></div>
                        <div className="course-body">
                          <div className="course-meta-row">
                            {c.duration && <span className="course-meta-item">⏱ {c.duration}</span>}
                            {c.rating && <span className="course-meta-item">⭐ {c.rating}</span>}
                          </div>
                          {c.level && <div style={{ marginBottom:'0.7rem' }}><span className={`level-badge level-${c.level}`}>{c.level}</span></div>}
                          {(c.skills||[]).length > 0 && <div className="skill-pills" style={{ marginBottom:'0.7rem' }}>{c.skills.slice(0,3).map((sk,j) => <span key={j} className="s-pill">{sk}</span>)}</div>}
                          <button className="enroll-btn">Enroll Now →</button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* ══ CHAT ══════════════════════════════════════════════════════ */}
              {activeTab === 'chat' && (
                <motion.div className="page" key="chat" style={{ padding:0 }} initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
                  <div className="chat-layout" style={{ margin:'1.5rem' }}>
                    {/* Conversation list */}
                    <div className="conv-list">
                      <div className="conv-list-head">💬 Conversations</div>
                      <div className="conv-search">
                        <input placeholder="Search companies…" value={convSearch} onChange={e => setConvSearch(e.target.value)} />
                      </div>
                      <div className="conv-list-body">
                        {/* Industries you haven't messaged yet */}
                        {filteredConvs.length === 0 && industries.length === 0 && (
                          <div style={{ padding:'2rem 1.2rem', textAlign:'center', color:'var(--text3)', fontSize:'0.78rem' }}>No conversations yet. Go to Feed to message companies.</div>
                        )}

                        {/* Active conversations */}
                        {filteredConvs.map(c => (
                          <div key={c.id} className={`conv-row ${activeChat?.id == c.id ? 'active' : ''}`} onClick={() => {
                            const ind = industries.find(i => String(i.id) === String(c.id));
                            setActiveChat(ind || c);
                          }}>
                            <div className="conv-av">{c.logo}</div>
                            <div style={{ flex:1, minWidth:0 }}>
                              <div className="conv-name">{c.name}</div>
                              <div className="conv-preview">{c.lastMsg || 'Start a conversation…'}</div>
                            </div>
                            {c.time && <div className="conv-time">{c.time}</div>}
                          </div>
                        ))}

                        {/* Divider: Browse companies to message */}
                        {industries.length > 0 && (
                          <>
                            <div style={{ padding:'0.5rem 1.2rem', fontSize:'0.58rem', fontWeight:700, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.1em', borderBottom:'1px solid var(--border)' }}>All Companies</div>
                            {industries.filter(ind => !conversations.find(c => String(c.id) === String(ind.id)) && ind.name.toLowerCase().includes(convSearch.toLowerCase())).map(ind => (
                              <div key={ind.id} className={`conv-row ${activeChat?.id == ind.id ? 'active' : ''}`} onClick={() => openChat(ind)}>
                                <div className="conv-av">{ind.logo || (ind.name||'CO').substring(0,2).toUpperCase()}</div>
                                <div style={{ flex:1, minWidth:0 }}>
                                  <div className="conv-name">{ind.name}</div>
                                  <div className="conv-preview" style={{ color:'var(--accent2)' }}>Start conversation</div>
                                </div>
                              </div>
                            ))}
                          </>
                        )}
                      </div>
                    </div>

                    {/* Chat area */}
                    <div className="chat-area">
                      {!activeChat
                        ? <div className="chat-empty" style={{ margin:'auto' }}>
                            <span style={{ fontSize:'2rem', opacity:0.3 }}>💬</span>
                            <span style={{ fontFamily:"'Cabinet Grotesk',sans-serif", fontWeight:700, color:'var(--text2)' }}>Select a company to message</span>
                            <span>Choose from the list or browse companies in the Feed</span>
                          </div>
                        : <>
                            <div className="chat-head">
                              <div className="conv-av" style={{ width:38, height:38, borderRadius:10 }}>{activeChat.logo || (activeChat.name||'CO').substring(0,2).toUpperCase()}</div>
                              <div style={{ flex:1 }}>
                                <div className="chat-head-name">{activeChat.name}</div>
                                <div className="chat-head-role">{activeChat.domain || 'Company'}</div>
                              </div>
                              <span className="online-badge"><span className="online-dot" /> Active</span>
                            </div>
                            <div className="chat-body">
                              {(chatMessages[String(activeChat.id)] || []).length === 0
                                ? <div className="chat-empty">
                                    <span style={{ fontSize:'2rem', opacity:0.3 }}>👋</span>
                                    <span style={{ fontFamily:"'Cabinet Grotesk',sans-serif", fontWeight:700, color:'var(--text2)' }}>Start the conversation</span>
                                    <span>Introduce yourself and ask about opportunities</span>
                                  </div>
                                : (chatMessages[String(activeChat.id)] || []).map((msg, i) => (
                                  <div key={i} className={`bubble ${msg.mine ? 'sent' : 'recv'}`}>
                                    {msg.text}
                                    <div className="bubble-time">{msg.time}</div>
                                  </div>
                                ))
                              }
                              <div ref={chatEndRef} />
                            </div>
                            <div className="chat-foot">
                              <input
                                className="chat-input"
                                placeholder={`Message ${activeChat.name}…`}
                                value={chatInput}
                                onChange={e => setChatInput(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                              />
                              <button className="chat-send-btn" onClick={sendMessage}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                              </button>
                            </div>
                          </>
                      }
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ══ APPLICATIONS ══════════════════════════════════════════════ */}
              {activeTab === 'applications' && (
                <motion.div className="page" key="apps" initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0 }}>
                  <div className="section-hd" style={{ marginBottom:'1.3rem' }}>
                    <div><div className="section-title">My Applications</div><div className="section-sub">{myApplications.length} submitted</div></div>
                  </div>
                  {myApplications.length === 0
                    ? <div className="card"><div className="empty-state"><div className="empty-icon">📋</div><div className="empty-title">No applications yet</div><div className="empty-text">Browse the feed and apply to internships and vacancies.</div><button className="btn btn-primary" style={{ marginTop:'1rem' }} onClick={() => setActiveTab('feed')}>Browse Openings →</button></div></div>
                    : <div className="apps-list">
                        {myApplications.map((a, i) => (
                          <motion.div key={a.id || i} className="app-card" initial={{ opacity:0,x:-10 }} animate={{ opacity:1,x:0 }} transition={{ delay:i*0.05 }}>
                            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                              <div>
                                <div className="app-role">{a.role}</div>
                                <div className="app-company">🏢 {a.company}</div>
                              </div>
                              <StatusChip status={a.status} />
                            </div>
                            <div style={{ display:'flex', gap:'1.2rem', marginTop:'0.6rem', fontSize:'0.75rem', color:'var(--text3)' }}>
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
                <motion.div className="page" key="profile" initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0 }}>
                  <ProfilePage />
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ══ DETAIL MODAL ══════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {detailModal && (
          <motion.div className="modal-ov" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} onClick={e => e.target === e.currentTarget && setDetailModal(null)}>
            <motion.div className="modal-box" initial={{ scale:.95 }} animate={{ scale:1 }} exit={{ scale:.95 }}>
              <button className="modal-close" onClick={() => setDetailModal(null)}>✕</button>
              <div style={{ display:'flex', alignItems:'center', gap:'0.85rem', marginBottom:'1.35rem' }}>
                <div style={{ width:48, height:48, borderRadius:12, background:'var(--accent3)', color:'var(--accent2)', fontFamily:"'Cabinet Grotesk',sans-serif", fontWeight:700, fontSize:'0.9rem', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{detailModal.ownerLogo}</div>
                <div><div className="modal-title" style={{ fontSize:'1.15rem' }}>{detailModal.title}</div><div style={{ color:'var(--accent2)', fontWeight:700, fontSize:'0.8rem' }}>{detailModal.ownerName} · <TypeChip type={detailModal.type} /></div></div>
              </div>
              <p style={{ fontSize:'0.85rem', color:'var(--text2)', lineHeight:1.65, marginBottom:'1rem' }}>{detailModal.desc}</p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.7rem', marginBottom:'1.2rem', fontSize:'0.83rem' }}>
                {detailModal.duration && <div style={{ background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:10, padding:'0.75rem' }}><div style={{ fontSize:'0.6rem', fontWeight:700, color:'var(--text3)', textTransform:'uppercase', marginBottom:3 }}>Duration</div><div style={{ fontWeight:600 }}>{detailModal.duration}</div></div>}
                {detailModal.location && <div style={{ background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:10, padding:'0.75rem' }}><div style={{ fontSize:'0.6rem', fontWeight:700, color:'var(--text3)', textTransform:'uppercase', marginBottom:3 }}>Location</div><div style={{ fontWeight:600 }}>{detailModal.location}</div></div>}
                {detailModal.offerings && <div style={{ background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:10, padding:'0.75rem', gridColumn:'1/-1' }}><div style={{ fontSize:'0.6rem', fontWeight:700, color:'var(--text3)', textTransform:'uppercase', marginBottom:3 }}>Offerings</div><div style={{ fontWeight:600 }}>{detailModal.offerings}</div></div>}
              </div>
              {detailModal.skills && <div className="skill-pills" style={{ marginBottom:'1.2rem' }}>{detailModal.skills.split(',').filter(Boolean).map((sk,i) => <span key={i} className="s-pill">{sk.trim()}</span>)}</div>}
              {alreadyApplied(detailModal.id)
                ? <div style={{ textAlign:'center', padding:'0.8rem', background:'var(--green2)', borderRadius:10, color:'var(--green)', fontWeight:700, border:'1px solid rgba(16,185,129,0.2)' }}>✓ Already Applied</div>
                : <button className="modal-btn-primary" onClick={() => { setApplyModal(detailModal); setDetailModal(null); }}>Apply for this Role</button>}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ APPLY MODAL ═══════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {applyModal && (
          <motion.div className="modal-ov" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} onClick={e => e.target === e.currentTarget && setApplyModal(null)}>
            <motion.div className="modal-box" initial={{ y:30,opacity:0 }} animate={{ y:0,opacity:1 }} exit={{ y:30,opacity:0 }}>
              <button className="modal-close" onClick={() => setApplyModal(null)}>✕</button>
              <div className="modal-title">Apply Now</div>
              <div className="modal-sub">Applying to <strong style={{ color:'var(--text)' }}>{applyModal.ownerName}</strong> for <strong style={{ color:'var(--accent2)' }}>{applyModal.title}</strong></div>
              <form onSubmit={handleApplySubmit}>
                <label className="field-label">Your Name</label>
                <input className="field-input" value={safeProfile.name || ''} readOnly style={{ opacity:0.6, cursor:'not-allowed' }} />
                <label className="field-label">Email</label>
                <input className="field-input" value={safeProfile.email || ''} readOnly style={{ opacity:0.6, cursor:'not-allowed' }} />
                {(safeProfile.resumes || []).length > 0 && (
                  <>
                    <label className="field-label">Resume (Auto-attached)</label>
                    {safeProfile.resumes.slice(0,1).map((r,i) => (
                      <div key={i} style={{ display:'flex', alignItems:'center', gap:'0.5rem', background:'var(--green2)', borderRadius:9, padding:'0.5rem 0.8rem', marginBottom:'0.35rem', border:'1px solid rgba(16,185,129,0.2)' }}>
                        <span>📑</span>
                        <span style={{ fontSize:'0.8rem', fontWeight:600, flex:1, color:'var(--text)' }}>{r.name}</span>
                        <span style={{ fontSize:'0.65rem', fontWeight:700, color:'var(--green)' }}>✓ Attached</span>
                      </div>
                    ))}
                  </>
                )}
                {(safeProfile.resumes || []).length === 0 && (
                  <div style={{ marginBottom:'0.75rem', padding:'0.65rem 0.9rem', background:'var(--amber2)', border:'1px solid rgba(245,158,11,0.2)', borderRadius:9, fontSize:'0.78rem', color:'var(--amber)', fontWeight:600 }}>⚠️ No resume on file. Go to Profile → Resume to upload one.</div>
                )}
                <label className="field-label">Cover Letter</label>
                <textarea required className="field-input" rows={4} placeholder="Explain why you're a great fit for this role…" value={coverLetter} onChange={e => setCoverLetter(e.target.value)} />
                <button type="submit" className="modal-btn-primary">🚀 Submit Application</button>
                <button type="button" className="modal-btn-secondary" onClick={() => setApplyModal(null)}>Cancel</button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOASTS */}
      <div className="toast-stack">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div key={t.id} className="toast" initial={{ opacity:0,x:50,scale:.92 }} animate={{ opacity:1,x:0,scale:1 }} exit={{ opacity:0,scale:.9 }}>
              <div className="toast-dot" style={{ background:t.color }} />
              {t.msg}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}
