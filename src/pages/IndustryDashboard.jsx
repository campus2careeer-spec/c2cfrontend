import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useAuth } from "../AuthContext";
import API_BASE_URL from "../apiConfig";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const API = `${API_BASE_URL}/api`;

const MOCK_STUDENTS = [
  { id: 201, name: "Rajat Kumar", email: "rajat.k@email.com", contact: "+91 9876512345", about: "Passionate Full Stack Developer specializing in MERN stack.", skills: ["React", "Node.js", "MongoDB", "Express", "AWS"], match: 98, rank: "Top 1%", experience: "6 months intern at WebDev Studio", certificates: ["AWS Cloud Practitioner", "React Advanced Concepts"], profilePic: null, qualification: "BCA", college: "Delhi University", resumes: [{ name: "Rajat_Kumar_Resume.pdf", type: "application/pdf", size: "245 KB" }], personalPosts: [{ url: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=400&h=400&fit=crop", caption: "Hackathon 2024 - First Place!" }], certImages: [], applications: [{ postId: 1, role: "MERN Stack Intern", status: "Shortlisted" }] },
  { id: 202, name: "Simmi Sharma", email: "simmi.data@email.com", contact: "+91 8765432109", about: "Data enthusiast with strong mathematical background.", skills: ["Python", "TensorFlow", "SQL", "Pandas", "Scikit-Learn"], match: 94, rank: "Top 5%", experience: "Research Assistant at University AI Lab", certificates: ["Deep Learning Specialization (Coursera)"], profilePic: null, qualification: "MCA", college: "Pune University", resumes: [], personalPosts: [], certImages: [], applications: [] },
  { id: 203, name: "Ankit Verma", email: "ankit.design@email.com", contact: "+91 7654321098", about: "Creative UI/UX designer focusing on user-centered design.", skills: ["UI/UX", "Figma", "Adobe XD", "Framer", "CSS"], match: 89, rank: "Top 10%", experience: "Freelance Designer (2 years)", certificates: ["Google UX Design Certificate"], profilePic: null, qualification: "B.Tech", college: "BITS Pilani", resumes: [{ name: "Ankit_Portfolio_Resume.jpg", type: "image/jpeg", size: "380 KB", preview: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop" }], personalPosts: [{ url: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=400&fit=crop", caption: "UI project - SaaS dashboard redesign" }], certImages: [], applications: [{ postId: 5, role: "Senior Product Designer", status: "Pending" }] },
  { id: 204, name: "Priya Das", email: "priya.backend@email.com", contact: "+91 6543210987", about: "Backend engineer focused on highly available microservices.", skills: ["Java", "Spring Boot", "AWS", "Docker", "Kubernetes"], match: 85, rank: "Top 15%", experience: "1 year Junior Backend Dev at TechCorp", certificates: ["Oracle Certified Associate, Java SE 8"], profilePic: null, qualification: "B.Tech", college: "NIT Trichy", resumes: [], personalPosts: [], certImages: [], applications: [] },
];

// ─── STYLES ───────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400&family=Syne:wght@400;500;600;700;800;900&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg: #0a0c14;
  --surface: #111320;
  --surface2: #181b2e;
  --surface3: #1e2238;
  --border: rgba(255,255,255,0.07);
  --border2: rgba(255,255,255,0.12);
  --accent: #6c63ff;
  --accent2: #a78bfa;
  --accent-glow: rgba(108,99,255,0.25);
  --accent-soft: rgba(108,99,255,0.12);
  --green: #10b981;
  --green-soft: rgba(16,185,129,0.12);
  --red: #f43f5e;
  --red-soft: rgba(244,63,94,0.12);
  --amber: #f59e0b;
  --amber-soft: rgba(245,158,11,0.12);
  --blue: #3b82f6;
  --blue-soft: rgba(59,130,246,0.12);
  --text: #f1f5f9;
  --text2: #94a3b8;
  --text3: #64748b;
  --radius: 16px;
  --radius-lg: 24px;
  --shadow: 0 8px 32px rgba(0,0,0,0.4);
  --shadow-accent: 0 8px 32px rgba(108,99,255,0.2);
}

body { font-family: 'DM Sans', sans-serif; background: var(--bg); color: var(--text); -webkit-font-smoothing: antialiased; }
::-webkit-scrollbar { width: 4px; height: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(108,99,255,0.3); border-radius: 99px; }

.ind-wrap { display: flex; min-height: 100vh; }

/* ── SIDEBAR ─────────────────────────────── */
.ind-sidebar {
  width: 260px; background: var(--surface); border-right: 1px solid var(--border);
  display: flex; flex-direction: column; padding: 0; height: 100vh;
  position: sticky; top: 0; z-index: 100; flex-shrink: 0;
}
.sidebar-logo {
  padding: 1.8rem 1.6rem 1.2rem;
  border-bottom: 1px solid var(--border);
}
.logo-mark {
  font-family: 'Syne', sans-serif; font-size: 1.5rem; font-weight: 900;
  background: linear-gradient(135deg, var(--accent), var(--accent2));
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  letter-spacing: -0.03em;
}
.logo-sub { font-size: 0.64rem; color: var(--text3); font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; margin-top: 2px; }

.sidebar-nav { flex: 1; padding: 1.2rem 1rem; overflow-y: auto; }
.nav-section-label {
  font-size: 0.6rem; font-weight: 700; color: var(--text3); letter-spacing: 0.14em;
  text-transform: uppercase; padding: 0.5rem 0.6rem 0.4rem; margin-top: 0.5rem;
}
.nav-item {
  display: flex; align-items: center; gap: 10px; padding: 0.72rem 0.9rem;
  border-radius: 12px; cursor: pointer; margin-bottom: 3px;
  font-size: 0.875rem; font-weight: 500; color: var(--text2);
  transition: all 0.18s ease; position: relative; text-decoration: none;
}
.nav-item:hover { background: var(--surface3); color: var(--text); }
.nav-item.active { background: var(--accent-soft); color: var(--accent2); font-weight: 600; }
.nav-item.active::before {
  content: ''; position: absolute; left: 0; top: 25%; bottom: 25%;
  width: 3px; background: var(--accent); border-radius: 0 3px 3px 0;
}
.nav-item .nav-icon { font-size: 1rem; width: 20px; text-align: center; flex-shrink: 0; }
.nav-badge {
  margin-left: auto; background: var(--accent); color: white;
  font-size: 0.6rem; font-weight: 800; min-width: 18px; height: 18px;
  border-radius: 9px; display: flex; align-items: center; justify-content: center; padding: 0 5px;
}
.nav-badge.green { background: var(--green); }

.sidebar-footer {
  padding: 1rem; border-top: 1px solid var(--border);
}
.sidebar-profile-card {
  display: flex; align-items: center; gap: 10px; padding: 0.8rem;
  background: var(--surface3); border-radius: 12px; cursor: pointer; transition: 0.18s;
}
.sidebar-profile-card:hover { background: var(--surface2); }
.sidebar-avatar {
  width: 36px; height: 36px; border-radius: 10px; overflow: hidden;
  background: var(--accent-soft); display: flex; align-items: center; justify-content: center;
  font-size: 0.8rem; font-weight: 800; color: var(--accent2); flex-shrink: 0;
}
.sidebar-avatar img { width: 100%; height: 100%; object-fit: cover; }
.sidebar-profile-name { font-size: 0.8rem; font-weight: 700; color: var(--text); }
.sidebar-profile-role { font-size: 0.65rem; color: var(--text3); margin-top: 1px; }
.sidebar-logout {
  margin-top: 8px; width: 100%; padding: 0.55rem; border-radius: 10px;
  background: var(--red-soft); color: var(--red); border: 1px solid rgba(244,63,94,0.2);
  font-size: 0.78rem; font-weight: 700; cursor: pointer; transition: 0.18s; font-family: inherit;
}
.sidebar-logout:hover { background: var(--red); color: white; }

/* ── MAIN ──────────────────────────────────── */
.ind-main { flex: 1; min-height: 100vh; overflow-y: auto; }

.main-topbar {
  position: sticky; top: 0; z-index: 50; background: rgba(10,12,20,0.85);
  backdrop-filter: blur(20px); border-bottom: 1px solid var(--border);
  padding: 0 2.5rem; height: 64px; display: flex; align-items: center; gap: 1.5rem;
}
.topbar-title { font-family: 'Syne', sans-serif; font-size: 1.1rem; font-weight: 700; flex: 1; }
.topbar-search {
  display: flex; align-items: center; gap: 8px;
  background: var(--surface2); border: 1px solid var(--border); border-radius: 12px;
  padding: 0.5rem 1rem; width: 280px;
}
.topbar-search input {
  background: none; border: none; outline: none; font-family: inherit;
  font-size: 0.85rem; color: var(--text); flex: 1;
}
.topbar-search input::placeholder { color: var(--text3); }
.topbar-actions { display: flex; align-items: center; gap: 10px; }
.icon-btn {
  width: 38px; height: 38px; border-radius: 11px; background: var(--surface2);
  border: 1px solid var(--border); display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: 0.18s; font-size: 1rem; position: relative; color: var(--text2);
}
.icon-btn:hover { background: var(--surface3); color: var(--text); }
.icon-btn .dot {
  position: absolute; top: 6px; right: 6px; width: 7px; height: 7px;
  background: var(--accent); border-radius: 50%; border: 2px solid var(--surface);
}

.page-content { padding: 2.5rem; max-width: 1400px; }

/* ── STATS / KPI ── */
.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.2rem; margin-bottom: 2rem; }
.stat-card {
  background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg);
  padding: 1.5rem; position: relative; overflow: hidden; transition: 0.2s;
}
.stat-card:hover { border-color: var(--border2); transform: translateY(-2px); }
.stat-card::after {
  content: ''; position: absolute; top: -30px; right: -30px;
  width: 100px; height: 100px; border-radius: 50%;
  background: var(--glow-color, rgba(108,99,255,0.08)); filter: blur(20px);
}
.stat-label { font-size: 0.72rem; font-weight: 600; color: var(--text3); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 0.75rem; }
.stat-value { font-family: 'Syne', sans-serif; font-size: 2.2rem; font-weight: 800; line-height: 1; margin-bottom: 0.5rem; }
.stat-delta { display: inline-flex; align-items: center; gap: 4px; font-size: 0.75rem; font-weight: 600; padding: 3px 8px; border-radius: 6px; }
.stat-delta.up { background: var(--green-soft); color: var(--green); }
.stat-delta.neutral { background: var(--amber-soft); color: var(--amber); }
.stat-icon { position: absolute; top: 1.2rem; right: 1.2rem; font-size: 1.5rem; opacity: 0.4; }

/* ── SECTION HEADERS ── */
.section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem; }
.section-title { font-family: 'Syne', sans-serif; font-size: 1.1rem; font-weight: 700; }
.section-sub { font-size: 0.8rem; color: var(--text3); margin-top: 2px; }

/* ── BUTTONS ── */
.btn { display: inline-flex; align-items: center; gap: 7px; padding: 0.65rem 1.2rem; border-radius: 12px; font-family: inherit; font-size: 0.85rem; font-weight: 600; cursor: pointer; border: none; transition: all 0.18s; }
.btn-primary { background: var(--accent); color: white; }
.btn-primary:hover { background: #5a52e0; transform: translateY(-1px); box-shadow: var(--shadow-accent); }
.btn-ghost { background: var(--surface2); color: var(--text2); border: 1px solid var(--border); }
.btn-ghost:hover { background: var(--surface3); color: var(--text); }
.btn-danger { background: var(--red-soft); color: var(--red); border: 1px solid rgba(244,63,94,0.2); }
.btn-danger:hover { background: var(--red); color: white; }
.btn-success { background: var(--green-soft); color: var(--green); border: 1px solid rgba(16,185,129,0.2); }
.btn-success:hover { background: var(--green); color: white; }
.btn-sm { padding: 0.4rem 0.8rem; font-size: 0.78rem; border-radius: 9px; }
.btn-lg { padding: 0.9rem 1.8rem; font-size: 0.95rem; border-radius: 14px; }
.btn-icon { width: 36px; height: 36px; padding: 0; justify-content: center; border-radius: 10px; }

/* ── CARDS ── */
.card {
  background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg);
  padding: 1.75rem; transition: 0.2s;
}
.card:hover { border-color: var(--border2); }

/* ── JOB CARDS ── */
.jobs-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 1.25rem; }
.job-card {
  background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg);
  padding: 1.5rem; transition: 0.2s; position: relative;
}
.job-card:hover { border-color: rgba(108,99,255,0.3); transform: translateY(-2px); box-shadow: var(--shadow); }
.job-card-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 1rem; }
.job-type-badge { font-size: 0.68rem; font-weight: 700; padding: 4px 10px; border-radius: 7px; text-transform: uppercase; letter-spacing: 0.06em; }
.job-type-vacancy { background: var(--accent-soft); color: var(--accent2); }
.job-type-internship { background: rgba(167,139,250,0.12); color: #c4b5fd; }
.job-type-training { background: var(--blue-soft); color: #93c5fd; }
.job-title { font-family: 'Syne', sans-serif; font-size: 1.05rem; font-weight: 700; margin-bottom: 0.4rem; line-height: 1.3; }
.job-meta { font-size: 0.8rem; color: var(--text3); display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 1rem; }
.job-meta span { display: flex; align-items: center; gap: 4px; }
.job-skills { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 1.2rem; }
.skill-pill {
  background: var(--surface3); color: var(--text2); border: 1px solid var(--border);
  padding: 3px 9px; border-radius: 6px; font-size: 0.7rem; font-weight: 600;
}
.job-footer { display: flex; align-items: center; justify-content: space-between; padding-top: 1rem; border-top: 1px solid var(--border); }
.applicant-count { display: flex; align-items: center; gap: 6px; font-size: 0.78rem; color: var(--text3); font-weight: 500; }

/* ── TALENT GRID ── */
.talent-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.25rem; }
.talent-card {
  background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg);
  padding: 1.5rem; cursor: pointer; transition: 0.2s;
}
.talent-card:hover { border-color: rgba(108,99,255,0.3); transform: translateY(-2px); box-shadow: var(--shadow); }
.talent-card-top { display: flex; align-items: center; gap: 12px; margin-bottom: 1rem; }
.talent-avatar {
  width: 48px; height: 48px; border-radius: 14px; overflow: hidden;
  background: var(--accent-soft); display: flex; align-items: center; justify-content: center;
  font-size: 1.1rem; font-weight: 800; color: var(--accent2); flex-shrink: 0;
}
.talent-avatar img { width: 100%; height: 100%; object-fit: cover; }
.talent-name { font-weight: 700; font-size: 0.95rem; }
.talent-qual { font-size: 0.75rem; color: var(--text3); margin-top: 2px; }
.match-bar-bg { height: 4px; background: var(--surface3); border-radius: 99px; margin-top: 6px; }
.match-bar-fill { height: 100%; background: linear-gradient(90deg, var(--accent), var(--accent2)); border-radius: 99px; transition: width 1s ease; }
.rank-badge { font-size: 0.65rem; font-weight: 800; padding: 2px 8px; border-radius: 5px; background: var(--amber-soft); color: var(--amber); }

/* ── APPLICATIONS TABLE ── */
.app-table { width: 100%; border-collapse: collapse; }
.app-table th { font-size: 0.68rem; font-weight: 700; color: var(--text3); text-transform: uppercase; letter-spacing: 0.08em; padding: 0 1.2rem 0.9rem; text-align: left; border-bottom: 1px solid var(--border); }
.app-table td { padding: 1rem 1.2rem; border-bottom: 1px solid var(--border); font-size: 0.85rem; vertical-align: middle; }
.app-table tr:last-child td { border-bottom: none; }
.app-table tr:hover td { background: var(--surface2); }
.status-pill { padding: 4px 10px; border-radius: 6px; font-size: 0.7rem; font-weight: 700; display: inline-block; }
.status-pending { background: var(--amber-soft); color: var(--amber); }
.status-shortlisted { background: var(--accent-soft); color: var(--accent2); }
.status-selected { background: var(--green-soft); color: var(--green); }
.status-rejected { background: var(--red-soft); color: var(--red); }

/* ── MESSAGES ── */
.msg-layout { display: grid; grid-template-columns: 300px 1fr; height: calc(100vh - 130px); background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); overflow: hidden; }
.msg-list { border-right: 1px solid var(--border); overflow-y: auto; }
.msg-list-head { padding: 1.2rem 1.4rem; font-weight: 700; font-size: 0.9rem; border-bottom: 1px solid var(--border); }
.msg-row { display: flex; align-items: center; gap: 10px; padding: 1rem 1.4rem; cursor: pointer; border-bottom: 1px solid var(--border); transition: 0.15s; }
.msg-row:hover { background: var(--surface2); }
.msg-row.active { background: var(--accent-soft); }
.msg-av { width: 40px; height: 40px; border-radius: 11px; background: var(--surface3); display: flex; align-items: center; justify-content: center; font-size: 0.85rem; font-weight: 800; color: var(--text2); flex-shrink: 0; }
.msg-nm { font-size: 0.85rem; font-weight: 700; }
.msg-preview { font-size: 0.73rem; color: var(--text3); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 160px; }
.msg-unread-dot { width: 7px; height: 7px; background: var(--accent); border-radius: 50%; flex-shrink: 0; }
.msg-chat-area { display: flex; flex-direction: column; }
.msg-chat-head { padding: 1.2rem 1.6rem; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 12px; }
.msg-bubbles { flex: 1; overflow-y: auto; padding: 1.5rem; display: flex; flex-direction: column; gap: 10px; }
.bubble { max-width: 68%; padding: 0.6rem 0.9rem; border-radius: 14px; font-size: 0.84rem; line-height: 1.5; }
.bubble.sent { background: var(--accent); color: white; align-self: flex-end; border-bottom-right-radius: 4px; }
.bubble.recv { background: var(--surface3); color: var(--text); align-self: flex-start; border-bottom-left-radius: 4px; }
.bubble-time { font-size: 0.62rem; opacity: 0.55; margin-top: 3px; text-align: right; }
.msg-input-row { padding: 1rem 1.5rem; border-top: 1px solid var(--border); display: flex; gap: 10px; }
.msg-input { flex: 1; background: var(--surface2); border: 1px solid var(--border); border-radius: 12px; padding: 0.7rem 1rem; color: var(--text); font-family: inherit; font-size: 0.85rem; outline: none; transition: 0.18s; }
.msg-input:focus { border-color: var(--accent); }

/* ── MODAL ── */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(12px); display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 1rem; }
.modal-box { background: var(--surface); border: 1px solid var(--border2); border-radius: var(--radius-lg); padding: 2.5rem; width: 100%; max-width: 580px; max-height: 90vh; overflow-y: auto; position: relative; box-shadow: 0 32px 80px rgba(0,0,0,0.5); }
.modal-box.wide { max-width: 720px; }
.modal-close { position: absolute; top: 1.2rem; right: 1.2rem; width: 34px; height: 34px; background: var(--surface3); border: 1px solid var(--border); border-radius: 9px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--text2); font-size: 0.9rem; transition: 0.15s; }
.modal-close:hover { background: var(--red-soft); color: var(--red); }
.modal-title { font-family: 'Syne', sans-serif; font-size: 1.4rem; font-weight: 800; margin-bottom: 0.25rem; }
.modal-sub { font-size: 0.82rem; color: var(--text3); margin-bottom: 2rem; }

/* ── FORMS ── */
.form-group { margin-bottom: 1.2rem; }
.form-label { font-size: 0.75rem; font-weight: 700; color: var(--text3); text-transform: uppercase; letter-spacing: 0.07em; display: block; margin-bottom: 0.5rem; }
.form-input, .form-textarea, .form-select {
  width: 100%; background: var(--surface2); border: 1px solid var(--border2);
  border-radius: 12px; padding: 0.75rem 1rem; color: var(--text);
  font-family: inherit; font-size: 0.875rem; outline: none; transition: 0.18s;
}
.form-input:focus, .form-textarea:focus, .form-select:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft); }
.form-textarea { resize: vertical; min-height: 100px; }
.form-select option { background: var(--surface2); }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.form-row { display: flex; gap: 1rem; }

/* ── PROFILE PAGE ── */
.profile-hero { background: linear-gradient(135deg, var(--accent), #9333ea); border-radius: var(--radius-lg); padding: 2.5rem; margin-bottom: 5.5rem; position: relative; overflow: hidden; }
.profile-hero::before { content: ''; position: absolute; inset: 0; background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E"); }
.profile-pic-wrap { position: absolute; bottom: -50px; left: 2.5rem; width: 120px; height: 120px; border-radius: 24px; border: 4px solid var(--surface); overflow: hidden; background: var(--surface2); display: flex; align-items: center; justify-content: center; cursor: pointer; }
.profile-pic-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.55); display: flex; align-items: center; justify-content: center; opacity: 0; transition: 0.2s; font-size: 0.7rem; font-weight: 700; color: white; }
.profile-pic-wrap:hover .profile-pic-overlay { opacity: 1; }

/* ── ANALYTICS SECTION ── */
.analytics-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem; margin-bottom: 2rem; }
.activity-bar-wrap { display: flex; align-items: flex-end; gap: 8px; height: 100px; margin-top: 1rem; }
.activity-bar { flex: 1; background: var(--accent-soft); border-radius: 6px 6px 0 0; border: 1px solid rgba(108,99,255,0.2); position: relative; transition: 0.3s; }
.activity-bar:hover { background: var(--accent); }
.activity-bar-label { font-size: 0.62rem; color: var(--text3); text-align: center; margin-top: 5px; }

.donut-wrap { position: relative; display: flex; align-items: center; justify-content: center; }
.donut-center { position: absolute; text-align: center; }
.donut-center-num { font-family: 'Syne', sans-serif; font-size: 1.6rem; font-weight: 800; }
.donut-center-lbl { font-size: 0.65rem; color: var(--text3); font-weight: 600; }

/* ── EMPTY STATES ── */
.empty-state { text-align: center; padding: 4rem 2rem; color: var(--text3); }
.empty-state-icon { font-size: 3rem; margin-bottom: 1rem; opacity: 0.5; }
.empty-state-title { font-size: 1rem; font-weight: 700; color: var(--text2); margin-bottom: 0.5rem; }
.empty-state-text { font-size: 0.82rem; line-height: 1.6; }

/* ── NOTIFICATIONS ── */
.notif-stack { position: fixed; bottom: 2rem; right: 2rem; z-index: 10000; display: flex; flex-direction: column; gap: 10px; }
.notif-toast { background: var(--surface2); border: 1px solid var(--border2); color: var(--text); padding: 0.9rem 1.4rem; border-radius: 14px; box-shadow: var(--shadow); font-size: 0.84rem; font-weight: 600; display: flex; align-items: center; gap: 10px; min-width: 280px; }
.notif-dot { width: 8px; height: 8px; background: var(--accent2); border-radius: 50%; flex-shrink: 0; }

/* ── STUDENT PROFILE DRAWER ── */
.drawer-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(8px); z-index: 8888; }
.drawer { position: fixed; right: 0; top: 0; bottom: 0; width: 480px; background: var(--surface); border-left: 1px solid var(--border2); z-index: 8889; overflow-y: auto; padding: 2rem; }
.drawer-hero { background: var(--surface2); border-radius: var(--radius); padding: 1.5rem; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 1.2rem; }
.drawer-avatar { width: 72px; height: 72px; border-radius: 20px; background: var(--accent-soft); display: flex; align-items: center; justify-content: center; font-size: 1.6rem; font-weight: 800; color: var(--accent2); flex-shrink: 0; overflow: hidden; }
.drawer-avatar img { width: 100%; height: 100%; object-fit: cover; }

/* ── QUICK POST FORM ── */
.post-type-tabs { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 1.5rem; }
.post-type-tab { padding: 0.5rem 0.9rem; border-radius: 9px; font-size: 0.78rem; font-weight: 700; cursor: pointer; border: 1.5px solid var(--border2); color: var(--text2); background: transparent; transition: 0.18s; font-family: inherit; }
.post-type-tab.active { background: var(--accent); color: white; border-color: var(--accent); }

/* ── RESPONSIVE ── */
@media (max-width: 1200px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .analytics-grid { grid-template-columns: 1fr; }
}
@media (max-width: 900px) {
  .ind-sidebar { width: 70px; }
  .sidebar-logo, .nav-section-label, .nav-item span:not(.nav-icon), .sidebar-profile-name, .sidebar-profile-role, .sidebar-logout { display: none; }
  .nav-item { justify-content: center; padding: 0.8rem; }
  .nav-item.active::before { display: none; }
  .page-content { padding: 1.5rem; }
}
`;

// ─── COMPONENT ────────────────────────────────────────────────────────────────
export default function IndustryDashboard() {
  const navigate = useNavigate();
  const { user: authUser, profile: authProfile, signOut } = useAuth();

  const [activeTab, setActiveTab] = useState("dashboard");
  const [notifications, setNotifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentResumeModal, setStudentResumeModal] = useState(null);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [activeChat, setActiveChat] = useState(null);
  const [loadedStudents, setLoadedStudents] = useState([]);
  const [activities, setActivities] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState({
    201: [
      { mine: false, text: "Hi! I'd love to discuss the MERN Stack Intern role.", time: "10:30 AM" },
      { mine: true, text: "Thank you for reaching out! Let's schedule a call.", time: "10:45 AM" },
    ],
    202: [
      { mine: true, text: "Hi Simmi! Your Python skills look impressive.", time: "Yesterday" },
    ],
  });

  const [companyProfile, setCompanyProfile] = useState({
    id: 999, name: "Global Tech Corp", tagline: "Innovating for a Digital Future",
    email: "hr@globaltech.com", contact: "+91 98765 43210", website: "www.globaltech.com",
    location: "New Delhi, India", address: "Plot 45, Okhla Phase III, New Delhi - 110020",
    about: "We are a multi-national technology firm focusing on industrial training and high-scale software solutions.",
    industry: "IT Services", founded: "2010",
    profilePic: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200&h=200&fit=crop",
    achievements: ["CMMI Level 5", "Best Workplace 2024", "Innovation Excellence"],
    employees: "500+",
  });

  const [newPost, setNewPost] = useState({ title: "", desc: "", type: "Job Vacancy", skills: "", duration: "", offerings: "", location: "" });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [newAchievement, setNewAchievement] = useState("");
  const [selectedPostDetail, setSelectedPostDetail] = useState(null);
  const [applicationFilter, setApplicationFilter] = useState("All");

  const fileInputRef = useRef();
  const chatEndRef = useRef();

  // Load data from backend
  useEffect(() => {
    if (authProfile) {
      setCompanyProfile(prev => ({
        ...prev,
        id: authUser?.id || prev.id,
        name: authProfile.company_name || authProfile.name || prev.name,
        email: authProfile.email || prev.email,
        contact: authProfile.phone || prev.contact,
        website: authProfile.website || prev.website,
        location: authProfile.location || authProfile.address || prev.location,
        address: authProfile.address || authProfile.location || prev.address,
        about: authProfile.about || prev.about,
        industry: authProfile.domain || prev.industry,
        founded: authProfile.founded || prev.founded,
        profilePic: authProfile.photo || prev.profilePic,
        tagline: authProfile.tagline || prev.tagline,
        achievements: authProfile.achievements?.length ? authProfile.achievements : prev.achievements,
      }));
    }

    axios.get(`${API}/users?role=student`)
      .then(res => { if (Array.isArray(res.data)) setLoadedStudents(res.data); })
      .catch(() => {});

    const fetchData = async () => {
      try {
        const [vacsRes, msgsRes] = await Promise.all([
          axios.get(`${API}/vacancies`),
          authUser?.id ? axios.get(`${API}/messages/${authUser.id}`) : Promise.resolve({ data: [] })
        ]);

        if (Array.isArray(vacsRes.data)) {
          const formatted = await Promise.all(vacsRes.data.map(async v => {
            let apps = [];
            if (authUser && v.owner_id === authUser.id) {
              try {
                const appRes = await axios.get(`${API}/applications/vacancy/${v.id}`);
                if (Array.isArray(appRes.data)) {
                  apps = appRes.data.map(a => ({
                    id: a.id, studentId: a.student_id,
                    name: a.profiles?.full_name || "Student",
                    email: a.profiles?.email || "",
                    coverLetter: a.cover_letter, status: a.status
                  }));
                }
              } catch (_) {}
            }
            return {
              id: v.id, ownerId: v.owner_id, ownerName: v.owner_name,
              type: v.type, title: v.title, desc: v.description,
              skills: v.skills, duration: v.duration, offerings: v.offerings,
              location: v.location || companyProfile.location,
              date: new Date(v.created_at).toLocaleDateString(),
              likes: v.likes || 0, isLiked: false, comments: [], applications: apps
            };
          }));
          setActivities(formatted);
        }

        if (Array.isArray(msgsRes.data) && authUser) {
          const newChats = {};
          msgsRes.data.forEach(m => {
            const pid = m.sender_id === authUser.id ? m.receiver_id : m.sender_id;
            if (!newChats[pid]) newChats[pid] = [];
            newChats[pid].push({ mine: m.sender_id === authUser.id, text: m.text, time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
          });
          setChatMessages(prev => ({ ...prev, ...newChats }));
        }
      } catch (_) {}
    };
    fetchData();
  }, [authProfile, authUser]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMessages, activeChat]);

  const effectiveStudents = loadedStudents.length > 0
    ? loadedStudents.map(s => ({ ...s, id: s.id, name: s.name || s.full_name || "Student", skills: s.skills || [], match: s.match || Math.floor(Math.random() * 20 + 75), rank: s.rank || "Top 20%", experience: s.experience || "", certificates: s.certificates || [], profilePic: s.photo || null, qualification: s.qualification || "", college: s.college || s.graduation || "", resumes: s.resumes || [], personalPosts: s.personalPosts || [], certImages: s.certImages || [], applications: s.applications || [], email: s.email || "", contact: s.phone || "", about: s.about || "" }))
    : MOCK_STUDENTS;

  const pushNotify = (msg) => {
    const id = Date.now();
    setNotifications(prev => [{ id, msg }, ...prev]);
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 4000);
  };

  const handleCreatePost = async () => {
    if (!newPost.title.trim() || !newPost.desc.trim()) return;
    const postData = { ...newPost, owner_id: authUser?.id || companyProfile.id, owner_name: companyProfile.name };
    try {
      const res = await axios.post(`${API}/vacancies`, postData);
      const saved = res.data;
      setActivities(prev => [{ id: saved.id, ownerId: saved.owner_id, ownerName: saved.owner_name, type: saved.type, title: saved.title, desc: saved.description, skills: saved.skills, duration: saved.duration, offerings: saved.offerings, location: saved.location || companyProfile.location, date: "Just now", likes: 0, isLiked: false, comments: [], applications: [] }, ...prev]);
      pushNotify("✅ Job posted successfully.");
    } catch (_) {
      setActivities(prev => [{ ...newPost, id: Date.now(), ownerId: companyProfile.id, ownerName: companyProfile.name, date: "Just now", likes: 0, isLiked: false, comments: [], applications: [] }, ...prev]);
      pushNotify("✅ Post published locally.");
    }
    setNewPost({ title: "", desc: "", type: "Job Vacancy", skills: "", duration: "", offerings: "", location: "" });
    setIsPostModalOpen(false);
  };

  const handleDeletePost = async (id) => {
    setActivities(prev => prev.filter(p => p.id !== id));
    try { await axios.delete(`${API}/vacancies/${id}`); } catch (_) {}
    pushNotify("🗑️ Post removed.");
  };

  const updateApplicationStatus = async (postId, appId, newStatus) => {
    setActivities(prev => prev.map(p => p.id === postId ? { ...p, applications: p.applications.map(a => a.id === appId ? { ...a, status: newStatus } : a) } : p));
    try { await axios.put(`${API}/applications/${appId}/status`, { status: newStatus }); } catch (_) {}
    pushNotify(`Candidate marked as: ${newStatus}`);
  };

  const handleSendMessage = async (e) => {
    if ((e.key === "Enter" || e.type === "click") && chatInput.trim() && activeChat) {
      const text = chatInput.trim();
      const sId = activeChat.id;
      setChatMessages(prev => ({ ...prev, [sId]: [...(prev[sId] || []), { mine: true, text, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }] }));
      setChatInput("");
      try {
        if (authUser?.id) await axios.post(`${API}/messages`, { sender_id: authUser.id, receiver_id: sId, text });
      } catch (_) {}
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const pd = { name: fd.get("name"), email: fd.get("email"), contact: fd.get("contact"), website: fd.get("website"), about: fd.get("about"), address: fd.get("address"), location: fd.get("location"), industry: fd.get("industry"), founded: fd.get("founded"), tagline: fd.get("tagline") };
    setCompanyProfile(prev => ({ ...prev, ...pd }));
    setIsEditingProfile(false);
    if (authUser?.id) {
      try {
        await axios.put(`${API}/profile/${authUser.id}`, { company_name: pd.name, email: pd.email, phone: pd.contact, website: pd.website, about: pd.about, address: pd.address, location: pd.location, domain: pd.industry, founded: pd.founded, tagline: pd.tagline });
        pushNotify("✅ Profile saved.");
      } catch (_) { pushNotify("Profile updated locally."); }
    } else pushNotify("✅ Profile updated.");
  };

  const handleLogout = async () => {
    try { await signOut(); navigate("/login"); } catch (_) {}
  };

  // ── COMPUTED ──
  const myPosts = activities.filter(a => a.ownerId === (authUser?.id || companyProfile.id));
  const totalApplicants = myPosts.reduce((s, p) => s + (p.applications?.length || 0), 0);
  const shortlisted = myPosts.reduce((s, p) => s + (p.applications?.filter(a => a.status === "Shortlisted").length || 0), 0);
  const allApplications = myPosts.flatMap(p => (p.applications || []).map(a => ({ ...a, postTitle: p.title, postType: p.type })));
  const filteredApplications = applicationFilter === "All" ? allApplications : allApplications.filter(a => a.status === applicationFilter);
  const filteredStudents = effectiveStudents.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || (s.skills || []).some(sk => sk.toLowerCase().includes(searchQuery.toLowerCase())));
  const chatPartners = [...new Set(Object.keys(chatMessages))].map(id => effectiveStudents.find(s => String(s.id) === String(id))).filter(Boolean);

  const typeClass = (type) => {
    if (!type) return "job-type-vacancy";
    if (type.toLowerCase().includes("intern")) return "job-type-internship";
    if (type.toLowerCase().includes("train")) return "job-type-training";
    return "job-type-vacancy";
  };

  const navItems = [
    { id: "dashboard", icon: "📊", label: "Dashboard" },
    { id: "jobs", icon: "💼", label: "My Jobs", badge: myPosts.length },
    { id: "responses", icon: "📋", label: "Applications", badge: totalApplicants },
    { id: "talent", icon: "🎯", label: "Find Talent" },
    { id: "messages", icon: "💬", label: "Messages", badge: Object.values(chatMessages).flat().filter(m => !m.mine).length || null },
    { id: "analytics", icon: "📈", label: "Analytics" },
    { id: "profile", icon: "🏢", label: "Company Profile" },
  ];

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div className="ind-wrap">
      <style>{CSS}</style>

      {/* ── SIDEBAR ── */}
      <aside className="ind-sidebar">
        <div className="sidebar-logo">
          <div className="logo-mark">CareerBridge</div>
          <div className="logo-sub">Industry Portal</div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Main</div>
          {navItems.slice(0, 5).map(item => (
            <div key={item.id} className={`nav-item ${activeTab === item.id ? "active" : ""}`} onClick={() => setActiveTab(item.id)}>
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
              {item.badge ? <span className={`nav-badge ${item.id === "messages" ? "green" : ""}`}>{item.badge}</span> : null}
            </div>
          ))}
          <div className="nav-section-label" style={{ marginTop: "1rem" }}>Insights</div>
          {navItems.slice(5).map(item => (
            <div key={item.id} className={`nav-item ${activeTab === item.id ? "active" : ""}`} onClick={() => setActiveTab(item.id)}>
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-profile-card" onClick={() => setActiveTab("profile")}>
            <div className="sidebar-avatar">
              {companyProfile.profilePic ? <img src={companyProfile.profilePic} alt="" /> : companyProfile.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="sidebar-profile-name" style={{ maxWidth: 130, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{companyProfile.name}</div>
              <div className="sidebar-profile-role">{companyProfile.industry}</div>
            </div>
          </div>
          <button className="sidebar-logout" onClick={handleLogout}>⬅ Sign Out</button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="ind-main">
        {/* Topbar */}
        <div className="main-topbar">
          <div className="topbar-title">{navItems.find(n => n.id === activeTab)?.label || "Dashboard"}</div>
          <div className="topbar-search">
            <span style={{ color: "var(--text3)" }}>🔍</span>
            <input placeholder="Search talent, jobs, skills…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
          <div className="topbar-actions">
            <div className="icon-btn" title="Notifications"><span>🔔</span><span className="dot" /></div>
            <button className="btn btn-primary btn-sm" onClick={() => setIsPostModalOpen(true)}>+ Post Job</button>
          </div>
        </div>

        <div className="page-content">
          <AnimatePresence mode="wait">

            {/* ══ DASHBOARD ══════════════════════════════════════════════════ */}
            {activeTab === "dashboard" && (
              <motion.div key="dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                {/* KPI Cards */}
                <div className="stats-grid">
                  {[
                    { label: "Active Postings", value: myPosts.length, delta: "+2 this week", up: true, icon: "💼", glow: "rgba(108,99,255,0.1)" },
                    { label: "Total Applicants", value: totalApplicants, delta: `+${Math.floor(totalApplicants * 0.2)} today`, up: true, icon: "👥", glow: "rgba(59,130,246,0.1)" },
                    { label: "Shortlisted", value: shortlisted, delta: `${totalApplicants ? Math.round(shortlisted / totalApplicants * 100) : 0}% rate`, up: true, icon: "⭐", glow: "rgba(245,158,11,0.1)" },
                    { label: "Talent Pool", value: effectiveStudents.length, delta: "Available now", up: false, icon: "🎯", glow: "rgba(16,185,129,0.1)" },
                  ].map((s, i) => (
                    <motion.div key={i} className="stat-card" style={{ "--glow-color": s.glow }} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                      <div className="stat-icon">{s.icon}</div>
                      <div className="stat-label">{s.label}</div>
                      <div className="stat-value" style={{ color: i === 0 ? "var(--accent2)" : i === 1 ? "#93c5fd" : i === 2 ? "var(--amber)" : "var(--green)" }}>{s.value}</div>
                      <span className={`stat-delta ${s.up ? "up" : "neutral"}`}>▲ {s.delta}</span>
                    </motion.div>
                  ))}
                </div>

                {/* Recent Jobs + Quick Actions */}
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1.5rem" }}>
                  <div>
                    <div className="section-header">
                      <div>
                        <div className="section-title">Recent Job Posts</div>
                        <div className="section-sub">{myPosts.length} active listings</div>
                      </div>
                      <button className="btn btn-ghost btn-sm" onClick={() => setActiveTab("jobs")}>View All →</button>
                    </div>
                    {myPosts.slice(0, 3).length === 0
                      ? <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
                        <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>📭</div>
                        <div style={{ color: "var(--text3)", fontSize: "0.85rem" }}>No jobs posted yet.</div>
                        <button className="btn btn-primary" style={{ marginTop: "1rem" }} onClick={() => setIsPostModalOpen(true)}>Post First Job</button>
                      </div>
                      : myPosts.slice(0, 3).map(p => (
                        <div key={p.id} className="card" style={{ marginBottom: "1rem" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <div>
                              <span className={`job-type-badge ${typeClass(p.type)}`}>{p.type}</span>
                              <div className="job-title" style={{ marginTop: "0.5rem" }}>{p.title}</div>
                              <div className="job-meta" style={{ marginTop: "0.25rem" }}>
                                <span>📍 {p.location || companyProfile.location}</span>
                                {p.duration && <span>⏱ {p.duration}</span>}
                                <span>📅 {p.date}</span>
                              </div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                              <div style={{ font: "700 1.4rem/1 'Syne', sans-serif", color: "var(--accent2)" }}>{p.applications?.length || 0}</div>
                              <div style={{ fontSize: "0.7rem", color: "var(--text3)" }}>applicants</div>
                            </div>
                          </div>
                        </div>
                      ))
                    }
                  </div>

                  {/* Right column */}
                  <div>
                    <div className="section-header">
                      <div className="section-title">Quick Actions</div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                      {[
                        { icon: "➕", label: "Post New Job", sub: "Vacancies, internships", action: () => setIsPostModalOpen(true), color: "var(--accent)" },
                        { icon: "🔍", label: "Find Talent", sub: `${effectiveStudents.length} students available`, action: () => setActiveTab("talent"), color: "var(--green)" },
                        { icon: "📋", label: "Review Applications", sub: `${totalApplicants} pending`, action: () => setActiveTab("responses"), color: "var(--amber)" },
                        { icon: "💬", label: "Messages", sub: `${chatPartners.length} conversations`, action: () => setActiveTab("messages"), color: "#60a5fa" },
                      ].map((qa, i) => (
                        <div key={i} className="card" style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "1rem", padding: "1.1rem 1.4rem" }} onClick={qa.action}>
                          <div style={{ width: 40, height: 40, borderRadius: 12, background: qa.color + "20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", flexShrink: 0 }}>{qa.icon}</div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: "0.88rem" }}>{qa.label}</div>
                            <div style={{ fontSize: "0.73rem", color: "var(--text3)" }}>{qa.sub}</div>
                          </div>
                          <span style={{ marginLeft: "auto", color: "var(--text3)" }}>›</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Top Talent Preview */}
                <div style={{ marginTop: "2rem" }}>
                  <div className="section-header">
                    <div>
                      <div className="section-title">Top Talent Matches</div>
                      <div className="section-sub">AI-matched candidates for your domain</div>
                    </div>
                    <button className="btn btn-ghost btn-sm" onClick={() => setActiveTab("talent")}>Explore All →</button>
                  </div>
                  <div className="talent-grid">
                    {effectiveStudents.slice(0, 4).map((s, i) => (
                      <motion.div key={s.id} className="talent-card" onClick={() => setSelectedStudent(s)} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                        <div className="talent-card-top">
                          <div className="talent-avatar">{s.profilePic ? <img src={s.profilePic} alt="" /> : s.name.charAt(0)}</div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div className="talent-name">{s.name}</div>
                            <div className="talent-qual">{s.qualification} · {s.college}</div>
                            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                              <span className="rank-badge">{s.rank}</span>
                              <span style={{ fontSize: "0.72rem", color: "var(--accent2)", fontWeight: 700 }}>{s.match}% match</span>
                            </div>
                          </div>
                        </div>
                        <div className="match-bar-bg"><div className="match-bar-fill" style={{ width: `${s.match}%` }} /></div>
                        <div className="job-skills" style={{ marginTop: "0.75rem" }}>
                          {(s.skills || []).slice(0, 3).map((sk, j) => <span key={j} className="skill-pill">{sk}</span>)}
                          {s.skills?.length > 3 && <span className="skill-pill">+{s.skills.length - 3}</span>}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ══ MY JOBS ═══════════════════════════════════════════════════ */}
            {activeTab === "jobs" && (
              <motion.div key="jobs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="section-header">
                  <div>
                    <div className="section-title">Job Postings</div>
                    <div className="section-sub">{myPosts.length} active · {activities.length} total</div>
                  </div>
                  <button className="btn btn-primary" onClick={() => setIsPostModalOpen(true)}>+ New Post</button>
                </div>
                {myPosts.length === 0
                  ? <div className="empty-state"><div className="empty-state-icon">📭</div><div className="empty-state-title">No job posts yet</div><div className="empty-state-text">Click "New Post" to start hiring.</div></div>
                  : <div className="jobs-grid">
                    {myPosts.map((p, i) => (
                      <motion.div key={p.id} className="job-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                        <div className="job-card-header">
                          <span className={`job-type-badge ${typeClass(p.type)}`}>{p.type || "Job Vacancy"}</span>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setSelectedPostDetail(p)} title="View details">👁</button>
                            <button className="btn btn-danger btn-icon btn-sm" onClick={() => handleDeletePost(p.id)} title="Delete">🗑</button>
                          </div>
                        </div>
                        <div className="job-title">{p.title}</div>
                        <div className="job-meta">
                          <span>📍 {p.location || companyProfile.location}</span>
                          {p.duration && <span>⏱ {p.duration}</span>}
                          {p.offerings && <span>💰 {p.offerings}</span>}
                        </div>
                        <div style={{ fontSize: "0.82rem", color: "var(--text3)", marginBottom: "1rem", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{p.desc}</div>
                        <div className="job-skills">
                          {(p.skills || "").split(",").filter(Boolean).slice(0, 4).map((sk, j) => <span key={j} className="skill-pill">{sk.trim()}</span>)}
                        </div>
                        <div className="job-footer">
                          <div className="applicant-count">👥 {p.applications?.length || 0} applicant{p.applications?.length !== 1 ? "s" : ""}</div>
                          <button className="btn btn-ghost btn-sm" onClick={() => { setSelectedPostDetail(p); setActiveTab("responses"); }}>Review →</button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                }
              </motion.div>
            )}

            {/* ══ APPLICATIONS ══════════════════════════════════════════════ */}
            {activeTab === "responses" && (
              <motion.div key="responses" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="section-header">
                  <div>
                    <div className="section-title">Applications</div>
                    <div className="section-sub">{allApplications.length} total · {shortlisted} shortlisted</div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {["All", "Pending", "Shortlisted", "Selected", "Rejected"].map(f => (
                      <button key={f} className={`btn btn-sm ${applicationFilter === f ? "btn-primary" : "btn-ghost"}`} onClick={() => setApplicationFilter(f)}>{f}</button>
                    ))}
                  </div>
                </div>
                {filteredApplications.length === 0
                  ? <div className="empty-state"><div className="empty-state-icon">📥</div><div className="empty-state-title">No applications yet</div><div className="empty-state-text">Post jobs to start receiving applications.</div></div>
                  : <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                    <table className="app-table">
                      <thead>
                        <tr>
                          <th>Candidate</th>
                          <th>Applied For</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredApplications.map((a, i) => {
                          const student = effectiveStudents.find(s => String(s.id) === String(a.studentId));
                          return (
                            <tr key={i}>
                              <td>
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                  <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--accent-soft)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "var(--accent2)", fontSize: "0.85rem", flexShrink: 0 }}>{a.name?.charAt(0) || "?"}</div>
                                  <div>
                                    <div style={{ fontWeight: 700, fontSize: "0.875rem" }}>{a.name}</div>
                                    <div style={{ fontSize: "0.72rem", color: "var(--text3)" }}>{a.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <div style={{ fontWeight: 600, fontSize: "0.85rem" }}>{a.postTitle}</div>
                                <div style={{ fontSize: "0.7rem", color: "var(--text3)" }}>{a.postType}</div>
                              </td>
                              <td>
                                <select value={a.status || "Pending"} onChange={e => {
                                  const post = myPosts.find(p => p.title === a.postTitle);
                                  if (post) updateApplicationStatus(post.id, a.id, e.target.value);
                                }} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 700, fontSize: "0.78rem", color: a.status === "Selected" ? "var(--green)" : a.status === "Rejected" ? "var(--red)" : a.status === "Shortlisted" ? "var(--accent2)" : "var(--amber)" }}>
                                  {["Pending", "Shortlisted", "Selected", "Rejected"].map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                              </td>
                              <td>
                                <div style={{ display: "flex", gap: 6 }}>
                                  {student && <button className="btn btn-ghost btn-sm" onClick={() => setSelectedStudent(student)}>Profile</button>}
                                  {student && <button className="btn btn-ghost btn-sm" onClick={() => { setActiveChat(student); setActiveTab("messages"); }}>Chat</button>}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                }
              </motion.div>
            )}

            {/* ══ TALENT ════════════════════════════════════════════════════ */}
            {activeTab === "talent" && (
              <motion.div key="talent" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="section-header">
                  <div>
                    <div className="section-title">Talent Pool</div>
                    <div className="section-sub">{filteredStudents.length} students · AI skill-matched</div>
                  </div>
                </div>
                <div className="talent-grid">
                  {filteredStudents.map((s, i) => (
                    <motion.div key={s.id} className="talent-card" onClick={() => setSelectedStudent(s)} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
                      <div className="talent-card-top">
                        <div className="talent-avatar">{s.profilePic ? <img src={s.profilePic} alt="" /> : s.name.charAt(0)}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="talent-name">{s.name}</div>
                          <div className="talent-qual">{s.qualification} · {s.college}</div>
                        </div>
                        <div>
                          <span className="rank-badge">{s.rank}</span>
                          <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--accent2)", textAlign: "right", marginTop: 4 }}>{s.match}%</div>
                        </div>
                      </div>
                      <div className="match-bar-bg"><div className="match-bar-fill" style={{ width: `${s.match}%` }} /></div>
                      <div style={{ fontSize: "0.78rem", color: "var(--text3)", margin: "0.75rem 0", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{s.about}</div>
                      <div className="job-skills">
                        {(s.skills || []).slice(0, 4).map((sk, j) => <span key={j} className="skill-pill">{sk}</span>)}
                        {s.skills?.length > 4 && <span className="skill-pill" style={{ color: "var(--text3)" }}>+{s.skills.length - 4}</span>}
                      </div>
                      <div style={{ display: "flex", gap: 8, marginTop: "1rem" }}>
                        <button className="btn btn-ghost btn-sm" style={{ flex: 1, justifyContent: "center" }} onClick={e => { e.stopPropagation(); setSelectedStudent(s); }}>View Profile</button>
                        <button className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: "center" }} onClick={e => { e.stopPropagation(); setActiveChat(s); setActiveTab("messages"); }}>💬 Message</button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ══ MESSAGES ══════════════════════════════════════════════════ */}
            {activeTab === "messages" && (
              <motion.div key="messages" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="msg-layout">
                  <div className="msg-list">
                    <div className="msg-list-head">💬 Conversations</div>
                    {chatPartners.length === 0
                      ? <div style={{ padding: "2rem", textAlign: "center", color: "var(--text3)", fontSize: "0.82rem" }}>No conversations yet.<br />Start from Talent Pool.</div>
                      : chatPartners.map(s => (
                        <div key={s.id} className={`msg-row ${activeChat?.id === s.id ? "active" : ""}`} onClick={() => setActiveChat(s)}>
                          <div className="msg-av">{s.name.charAt(0)}</div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div className="msg-nm">{s.name}</div>
                            <div className="msg-preview">{chatMessages[s.id]?.at(-1)?.text || "—"}</div>
                          </div>
                          {chatMessages[s.id]?.some(m => !m.mine) && <div className="msg-unread-dot" />}
                        </div>
                      ))
                    }
                  </div>

                  <div className="msg-chat-area">
                    {!activeChat
                      ? <div className="empty-state" style={{ margin: "auto" }}><div className="empty-state-icon">💬</div><div className="empty-state-title">Select a conversation</div></div>
                      : <>
                        <div className="msg-chat-head">
                          <div className="msg-av">{activeChat.name.charAt(0)}</div>
                          <div>
                            <div style={{ fontWeight: 700 }}>{activeChat.name}</div>
                            <div style={{ fontSize: "0.72rem", color: "var(--text3)" }}>{activeChat.qualification} · {activeChat.college}</div>
                          </div>
                          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                            <button className="btn btn-ghost btn-sm" onClick={() => setSelectedStudent(activeChat)}>View Profile</button>
                          </div>
                        </div>
                        <div className="msg-bubbles">
                          {(chatMessages[activeChat.id] || []).map((m, i) => (
                            <div key={i} className={`bubble ${m.mine ? "sent" : "recv"}`}>
                              {m.text}
                              <div className="bubble-time">{m.time}</div>
                            </div>
                          ))}
                          <div ref={chatEndRef} />
                        </div>
                        <div className="msg-input-row">
                          <input className="msg-input" value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={handleSendMessage} placeholder="Type a message… (Enter to send)" />
                          <button className="btn btn-primary" onClick={handleSendMessage}>Send</button>
                        </div>
                      </>
                    }
                  </div>
                </div>
              </motion.div>
            )}

            {/* ══ ANALYTICS ═════════════════════════════════════════════════ */}
            {activeTab === "analytics" && (
              <motion.div key="analytics" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="section-header">
                  <div className="section-title">Analytics Overview</div>
                </div>

                <div className="analytics-grid">
                  <div className="card">
                    <div style={{ fontWeight: 700, marginBottom: "0.25rem" }}>Application Activity</div>
                    <div style={{ fontSize: "0.78rem", color: "var(--text3)", marginBottom: "0.5rem" }}>Last 7 days</div>
                    <div className="activity-bar-wrap">
                      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => {
                        const h = [30, 55, 45, 80, 60, 35, 20][i];
                        return (
                          <div key={day} style={{ flex: 1 }}>
                            <div className="activity-bar" style={{ height: `${h}%` }} title={`${Math.round(h * 0.3)} applications`} />
                            <div className="activity-bar-label">{day}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="card">
                    <div style={{ fontWeight: 700, marginBottom: "1rem" }}>Application Status</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                      {[
                        { label: "Pending", count: allApplications.filter(a => (a.status || "Pending") === "Pending").length, color: "var(--amber)" },
                        { label: "Shortlisted", count: shortlisted, color: "var(--accent2)" },
                        { label: "Selected", count: allApplications.filter(a => a.status === "Selected").length, color: "var(--green)" },
                        { label: "Rejected", count: allApplications.filter(a => a.status === "Rejected").length, color: "var(--red)" },
                      ].map(item => (
                        <div key={item.label}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: 4 }}>
                            <span style={{ color: "var(--text2)" }}>{item.label}</span>
                            <span style={{ fontWeight: 700, color: item.color }}>{item.count}</span>
                          </div>
                          <div style={{ height: 5, background: "var(--surface3)", borderRadius: 99 }}>
                            <div style={{ height: "100%", width: `${totalApplicants ? (item.count / totalApplicants) * 100 : 0}%`, background: item.color, borderRadius: 99, transition: "width 1s ease" }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.5rem" }}>
                  {[
                    { title: "Total Views", value: myPosts.length * 142, sub: "Across all posts", icon: "👁", color: "var(--blue)" },
                    { title: "Avg. Time to Fill", value: "14 days", sub: "Industry avg: 28 days", icon: "⚡", color: "var(--green)" },
                    { title: "Response Rate", value: `${totalApplicants > 0 ? Math.round((shortlisted / totalApplicants) * 100) : 0}%`, sub: "Of applicants responded to", icon: "📊", color: "var(--accent2)" },
                  ].map((stat, i) => (
                    <div key={i} className="card" style={{ textAlign: "center", padding: "2rem" }}>
                      <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>{stat.icon}</div>
                      <div style={{ font: "800 2rem/1 'Syne', sans-serif", color: stat.color, marginBottom: "0.5rem" }}>{stat.value}</div>
                      <div style={{ fontWeight: 700, fontSize: "0.88rem", marginBottom: "0.25rem" }}>{stat.title}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text3)" }}>{stat.sub}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ══ COMPANY PROFILE ════════════════════════════════════════════ */}
            {activeTab === "profile" && (
              <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                {!isEditingProfile ? (
                  <>
                    <div className="profile-hero">
                      <div style={{ color: "rgba(255,255,255,0.85)" }}>
                        <div style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Company Profile</div>
                        <div style={{ font: "800 2rem/1.1 'Syne', sans-serif" }}>{companyProfile.name}</div>
                        <div style={{ marginTop: "0.5rem", opacity: 0.75, fontSize: "0.9rem" }}>{companyProfile.tagline}</div>
                      </div>
                      <div className="profile-pic-wrap">
                        {companyProfile.profilePic ? <img src={companyProfile.profilePic} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: "2rem", fontWeight: 800, color: "var(--accent2)" }}>{companyProfile.name.slice(0, 2)}</span>}
                        <div className="profile-pic-overlay" onClick={() => fileInputRef.current?.click()}>📷 Change</div>
                        <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => { const f = e.target.files[0]; if (f) setCompanyProfile(p => ({ ...p, profilePic: URL.createObjectURL(f) })); }} />
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1.5rem" }}>
                      <div>
                        <div className="card" style={{ marginBottom: "1.5rem" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.25rem" }}>
                            <div className="section-title" style={{ fontSize: "0.95rem" }}>About</div>
                            <button className="btn btn-ghost btn-sm" onClick={() => setIsEditingProfile(true)}>✏️ Edit Profile</button>
                          </div>
                          <p style={{ fontSize: "0.875rem", color: "var(--text2)", lineHeight: 1.7 }}>{companyProfile.about}</p>
                        </div>

                        <div className="card">
                          <div className="section-title" style={{ fontSize: "0.95rem", marginBottom: "1.25rem" }}>Contact Details</div>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                            {[
                              { icon: "✉️", label: "Email", val: companyProfile.email },
                              { icon: "📞", label: "Phone", val: companyProfile.contact },
                              { icon: "🌐", label: "Website", val: companyProfile.website },
                              { icon: "📍", label: "Location", val: companyProfile.location },
                              { icon: "🏭", label: "Industry", val: companyProfile.industry },
                              { icon: "📅", label: "Founded", val: companyProfile.founded },
                            ].map((d, i) => (
                              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                                <span style={{ fontSize: "1rem", marginTop: 1 }}>{d.icon}</span>
                                <div>
                                  <div style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.07em" }}>{d.label}</div>
                                  <div style={{ fontSize: "0.85rem", fontWeight: 600, marginTop: 2 }}>{d.val || "—"}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="card" style={{ marginBottom: "1.5rem" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                            <div className="section-title" style={{ fontSize: "0.9rem" }}>Achievements</div>
                          </div>
                          {(companyProfile.achievements || []).map((a, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "0.6rem 0", borderBottom: "1px solid var(--border)" }}>
                              <span>🏆</span>
                              <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>{a}</span>
                              <button style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "var(--red)", fontSize: "0.8rem" }} onClick={() => setCompanyProfile(p => ({ ...p, achievements: p.achievements.filter((_, j) => j !== i) }))}>✕</button>
                            </div>
                          ))}
                          <div style={{ display: "flex", gap: 8, marginTop: "1rem" }}>
                            <input className="form-input" style={{ padding: "0.5rem 0.75rem", flex: 1 }} placeholder="Add achievement…" value={newAchievement} onChange={e => setNewAchievement(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && newAchievement.trim()) { setCompanyProfile(p => ({ ...p, achievements: [...(p.achievements || []), newAchievement.trim()] })); setNewAchievement(""); } }} />
                            <button className="btn btn-primary btn-sm" onClick={() => { if (newAchievement.trim()) { setCompanyProfile(p => ({ ...p, achievements: [...(p.achievements || []), newAchievement.trim()] })); setNewAchievement(""); } }}>+</button>
                          </div>
                        </div>

                        <div className="card">
                          <div className="section-title" style={{ fontSize: "0.9rem", marginBottom: "1rem" }}>Stats</div>
                          {[
                            { label: "Jobs Posted", val: myPosts.length },
                            { label: "Total Applicants", val: totalApplicants },
                            { label: "Students Hired", val: shortlisted },
                            { label: "Talent Pool", val: effectiveStudents.length },
                          ].map((s, i) => (
                            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "0.6rem 0", borderBottom: i < 3 ? "1px solid var(--border)" : "none" }}>
                              <span style={{ fontSize: "0.82rem", color: "var(--text3)" }}>{s.label}</span>
                              <span style={{ fontWeight: 800, color: "var(--accent2)" }}>{s.val}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="card" style={{ maxWidth: 720 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                      <div>
                        <div className="modal-title">Edit Company Profile</div>
                        <div className="modal-sub">Update your company information</div>
                      </div>
                      <button className="btn btn-ghost btn-sm" onClick={() => setIsEditingProfile(false)}>Cancel</button>
                    </div>
                    <form onSubmit={handleProfileUpdate}>
                      <div className="form-grid">
                        <div className="form-group"><label className="form-label">Company Name</label><input className="form-input" name="name" defaultValue={companyProfile.name} /></div>
                        <div className="form-group"><label className="form-label">Tagline</label><input className="form-input" name="tagline" defaultValue={companyProfile.tagline} /></div>
                        <div className="form-group"><label className="form-label">Email</label><input className="form-input" name="email" type="email" defaultValue={companyProfile.email} /></div>
                        <div className="form-group"><label className="form-label">Phone</label><input className="form-input" name="contact" defaultValue={companyProfile.contact} /></div>
                        <div className="form-group"><label className="form-label">Website</label><input className="form-input" name="website" defaultValue={companyProfile.website} /></div>
                        <div className="form-group"><label className="form-label">Industry / Domain</label><input className="form-input" name="industry" defaultValue={companyProfile.industry} /></div>
                        <div className="form-group"><label className="form-label">Location</label><input className="form-input" name="location" defaultValue={companyProfile.location} /></div>
                        <div className="form-group"><label className="form-label">Founded Year</label><input className="form-input" name="founded" defaultValue={companyProfile.founded} /></div>
                      </div>
                      <div className="form-group"><label className="form-label">Full Address</label><input className="form-input" name="address" defaultValue={companyProfile.address} /></div>
                      <div className="form-group"><label className="form-label">About Company</label><textarea className="form-textarea" name="about" defaultValue={companyProfile.about} rows={4} /></div>
                      <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
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
      </main>

      {/* ══ MODALS ══════════════════════════════════════════════════════════════ */}

      {/* Post Job Modal */}
      <AnimatePresence>
        {isPostModalOpen && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={e => e.target === e.currentTarget && setIsPostModalOpen(false)}>
            <motion.div className="modal-box wide" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>
              <button className="modal-close" onClick={() => setIsPostModalOpen(false)}>✕</button>
              <div className="modal-title">Post a New Opening</div>
              <div className="modal-sub">Fill in the details to attract the right candidates</div>

              <div className="post-type-tabs">
                {["Job Vacancy", "Internship", "Training Program", "Campus Drive"].map(t => (
                  <button key={t} className={`post-type-tab ${newPost.type === t ? "active" : ""}`} onClick={() => setNewPost({ ...newPost, type: t })}>{t}</button>
                ))}
              </div>

              <div className="form-grid">
                <div className="form-group" style={{ gridColumn: "span 2" }}>
                  <label className="form-label">Job Title *</label>
                  <input className="form-input" placeholder="e.g. Full Stack Developer, ML Intern" value={newPost.title} onChange={e => setNewPost({ ...newPost, title: e.target.value })} />
                </div>
                <div className="form-group"><label className="form-label">Location</label><input className="form-input" placeholder="e.g. Remote, Bangalore" value={newPost.location} onChange={e => setNewPost({ ...newPost, location: e.target.value })} /></div>
                <div className="form-group"><label className="form-label">Duration</label><input className="form-input" placeholder="e.g. 3 months, Full-time" value={newPost.duration} onChange={e => setNewPost({ ...newPost, duration: e.target.value })} /></div>
                <div className="form-group" style={{ gridColumn: "span 2" }}>
                  <label className="form-label">Required Skills (comma separated)</label>
                  <input className="form-input" placeholder="e.g. React, Node.js, MongoDB" value={newPost.skills} onChange={e => setNewPost({ ...newPost, skills: e.target.value })} />
                </div>
                <div className="form-group"><label className="form-label">Stipend / Salary</label><input className="form-input" placeholder="e.g. ₹15,000/month" value={newPost.offerings} onChange={e => setNewPost({ ...newPost, offerings: e.target.value })} /></div>
                <div className="form-group"><label className="form-label">Qualification Required</label><input className="form-input" placeholder="e.g. B.Tech, MCA" /></div>
                <div className="form-group" style={{ gridColumn: "span 2" }}>
                  <label className="form-label">Description *</label>
                  <textarea className="form-textarea" placeholder="Describe the role, responsibilities, and what you're looking for…" value={newPost.desc} onChange={e => setNewPost({ ...newPost, desc: e.target.value })} rows={4} />
                </div>
              </div>

              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: "0.5rem" }}>
                <button className="btn btn-ghost" onClick={() => setIsPostModalOpen(false)}>Cancel</button>
                <button className="btn btn-primary btn-lg" onClick={handleCreatePost} disabled={!newPost.title || !newPost.desc}>🚀 Publish Post</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Student Profile Drawer */}
      <AnimatePresence>
        {selectedStudent && (
          <>
            <motion.div className="drawer-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedStudent(null)} />
            <motion.div className="drawer" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 28, stiffness: 220 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.1rem" }}>Candidate Profile</div>
                <button className="modal-close" style={{ position: "static" }} onClick={() => setSelectedStudent(null)}>✕</button>
              </div>

              <div className="drawer-hero">
                <div className="drawer-avatar">{selectedStudent.profilePic ? <img src={selectedStudent.profilePic} alt="" /> : selectedStudent.name.charAt(0)}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: "1.1rem" }}>{selectedStudent.name}</div>
                  <div style={{ fontSize: "0.78rem", color: "var(--text3)", marginTop: 3 }}>{selectedStudent.qualification} · {selectedStudent.college}</div>
                  <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                    <span className="rank-badge">{selectedStudent.rank}</span>
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--accent2)" }}>{selectedStudent.match}% match</span>
                  </div>
                </div>
              </div>

              <div className="match-bar-bg" style={{ marginBottom: "1.5rem" }}><div className="match-bar-fill" style={{ width: `${selectedStudent.match}%` }} /></div>

              <div style={{ marginBottom: "1.25rem" }}>
                <div style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>About</div>
                <p style={{ fontSize: "0.85rem", lineHeight: 1.6, color: "var(--text2)" }}>{selectedStudent.about}</p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.25rem" }}>
                {[
                  { label: "Email", val: selectedStudent.email },
                  { label: "Contact", val: selectedStudent.contact },
                  { label: "Experience", val: selectedStudent.experience },
                  { label: "Qualification", val: selectedStudent.qualification },
                ].map((d, i) => (
                  <div key={i} className="card" style={{ padding: "0.9rem" }}>
                    <div style={{ fontSize: "0.62rem", fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", marginBottom: 4 }}>{d.label}</div>
                    <div style={{ fontSize: "0.82rem", fontWeight: 600 }}>{d.val || "—"}</div>
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: "1.25rem" }}>
                <div style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Skills</div>
                <div className="job-skills">{(selectedStudent.skills || []).map((sk, i) => <span key={i} className="skill-pill" style={{ background: "var(--accent-soft)", color: "var(--accent2)", borderColor: "rgba(108,99,255,0.2)" }}>{sk}</span>)}</div>
              </div>

              {selectedStudent.certificates?.length > 0 && (
                <div style={{ marginBottom: "1.25rem" }}>
                  <div style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Certificates</div>
                  {selectedStudent.certificates.map((c, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "0.5rem 0", borderBottom: "1px solid var(--border)" }}>
                      <span>🏅</span><span style={{ fontSize: "0.82rem", fontWeight: 600 }}>{c}</span>
                    </div>
                  ))}
                </div>
              )}

              {selectedStudent.resumes?.length > 0 && (
                <div style={{ marginBottom: "1.25rem" }}>
                  <div style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Resumes</div>
                  {selectedStudent.resumes.map((r, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "0.75rem", background: "var(--surface2)", borderRadius: 10, border: "1px solid var(--border)", marginBottom: 6, cursor: "pointer" }} onClick={() => setStudentResumeModal({ student: selectedStudent, resume: r })}>
                      <span style={{ fontSize: "1.3rem" }}>{r.type === "application/pdf" ? "📑" : "🖼️"}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "0.82rem", fontWeight: 700 }}>{r.name}</div>
                        <div style={{ fontSize: "0.7rem", color: "var(--text3)" }}>{r.size}</div>
                      </div>
                      <span style={{ fontSize: "0.72rem", background: "var(--accent-soft)", color: "var(--accent2)", padding: "3px 9px", borderRadius: 6, fontWeight: 700 }}>View</span>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: "flex", gap: 10 }}>
                <button className="btn btn-primary" style={{ flex: 1, justifyContent: "center" }} onClick={() => { setSelectedStudent(null); setActiveChat(selectedStudent); setActiveTab("messages"); }}>💬 Message</button>
                <button className="btn btn-ghost" style={{ flex: 1, justifyContent: "center" }} onClick={() => setSelectedStudent(null)}>Close</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Resume Preview Modal */}
      <AnimatePresence>
        {studentResumeModal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={e => e.target === e.currentTarget && setStudentResumeModal(null)}>
            <motion.div className="modal-box" initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}>
              <button className="modal-close" onClick={() => setStudentResumeModal(null)}>✕</button>
              <div className="modal-title">Resume Preview</div>
              <div className="modal-sub">{studentResumeModal.student.name} · {studentResumeModal.resume.name}</div>
              {studentResumeModal.resume.preview
                ? <img src={studentResumeModal.resume.preview} alt="Resume" style={{ width: "100%", borderRadius: 14, border: "1px solid var(--border)" }} />
                : <div style={{ background: "var(--surface2)", border: "2px dashed var(--border2)", borderRadius: 16, padding: "3rem", textAlign: "center", color: "var(--text3)" }}>
                  <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>{studentResumeModal.resume.type === "application/pdf" ? "📑" : "🖼️"}</div>
                  <div style={{ fontWeight: 700, marginBottom: "0.5rem", color: "var(--text2)" }}>{studentResumeModal.resume.name}</div>
                  <div style={{ fontSize: "0.82rem", marginBottom: "1.5rem" }}>{studentResumeModal.resume.size}</div>
                  <a href={studentResumeModal.resume.url || "#"} target="_blank" rel="noreferrer">
                    <button className="btn btn-primary" style={{ margin: "0 auto" }}>⬇️ Download Resume</button>
                  </a>
                </div>
              }
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notifications */}
      <div className="notif-stack">
        <AnimatePresence>
          {notifications.map(n => (
            <motion.div key={n.id} className="notif-toast" initial={{ opacity: 0, x: 60, scale: 0.92 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
              <div className="notif-dot" />
              {n.msg}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
