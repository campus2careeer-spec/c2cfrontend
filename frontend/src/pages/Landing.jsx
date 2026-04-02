import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// ─── Image paths (place images in /public folder) ────────────────────────────
const IMG_LEARNER  = "/landingpage1.jpg";
const IMG_STUDENT  = "/page2.jpg";
const IMG_EMPLOYER = "/working.jpg";

// ─── Reusable easing ─────────────────────────────────────────────────────────
const EASE = [0.22, 1, 0.36, 1];

// ─── Partners data ───────────────────────────────────────────────────────────
const PARTNERS = [
  { name: "SWAYAM",    emoji: "🎓", color: "from-orange-400 to-orange-600" },
  { name: "NPTEL",     emoji: "📚", color: "from-blue-500 to-blue-700" },
  { name: "NASSCOM",   emoji: "💻", color: "from-green-500 to-green-700" },
  { name: "Google",    emoji: "🔍", color: "from-red-400 to-yellow-500" },
  { name: "Microsoft", emoji: "🪟", color: "from-sky-400 to-blue-600" },
  { name: "IBM",       emoji: "🏢", color: "from-blue-700 to-indigo-800" },
  { name: "AICTE",     emoji: "🏛️", color: "from-purple-500 to-purple-700" },
  { name: "Skill India", emoji: "🇮🇳", color: "from-green-600 to-orange-500" },
  { name: "TCS",       emoji: "⚙️", color: "from-indigo-500 to-indigo-700" },
  { name: "Infosys",   emoji: "🌐", color: "from-teal-500 to-teal-700" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Infinite marquee row — duplicated for seamless loop
// ─────────────────────────────────────────────────────────────────────────────
function MarqueeRow({ items, direction = "left", speed = 35 }) {
  // duplicate so the loop is seamless
  const doubled = [...items, ...items];
  const totalCards = items.length;
  // each card ~180px wide + 16px gap = 196px
  const totalWidth = totalCards * 196;

  return (
    <div className="overflow-hidden w-full">
      <motion.div
        className="flex gap-4 w-max"
        animate={{ x: direction === "left" ? [-totalWidth, 0] : [0, -totalWidth] }}
        transition={{
          duration: speed,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        }}
      >
        {doubled.map((partner, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-[172px] bg-white/70 backdrop-blur border border-white/60 rounded-2xl shadow-md px-5 py-4 flex items-center gap-3 hover:shadow-lg hover:bg-white/90 transition-all duration-300 group cursor-default"
          >
            <div
              className={`w-10 h-10 rounded-xl bg-gradient-to-br ${partner.color} flex items-center justify-center text-xl flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform duration-300`}
            >
              {partner.emoji}
            </div>
            <span className="text-sm font-bold text-gray-700 leading-tight">
              {partner.name}
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Navbar
// ─────────────────────────────────────────────────────────────────────────────
function Navbar() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 px-4 sm:px-6 py-4 ${
        scrolled
          ? "bg-white/80 backdrop-blur-md shadow-sm border-b border-white/40"
          : "bg-white/60 backdrop-blur-md border-b border-white/30"
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-6 lg:gap-10">
          <button
            onClick={() => navigate("/")}
            className="text-xl sm:text-2xl font-black tracking-tighter leading-none bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
          >
            Campus2Career
          </button>

          <div className="hidden md:flex items-center gap-6 text-[15px] font-bold text-gray-700">
            {["Explore", "Jobs", "Resources"].map((item) => (
              <button
                key={item}
                onClick={() => scrollTo(item.toLowerCase())}
                className="relative hover:text-blue-600 transition-colors duration-200 group"
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 group-hover:w-full transition-all duration-300 rounded-full" />
              </button>
            ))}
          </div>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => navigate("/login")}
            className="text-[15px] font-bold text-gray-700 px-4 py-2 hover:bg-white/60 rounded-full transition-colors duration-200"
          >
            Sign In
          </button>
          <button
            onClick={() => navigate("/register")}
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-5 py-2.5 rounded-full font-bold text-[15px] hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg shadow-blue-200"
          >
            Join for Free
          </button>
        </div>

        <button
          className="md:hidden p-2 rounded-lg hover:bg-white/50 transition"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <span className="block w-5 h-0.5 bg-gray-700 mb-1" />
          <span className="block w-5 h-0.5 bg-gray-700 mb-1" />
          <span className="block w-5 h-0.5 bg-gray-700" />
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="md:hidden overflow-hidden border-t border-white/30 mt-4"
          >
            <div className="flex flex-col gap-1 pt-3 pb-4 px-2">
              {["Explore", "Jobs", "Resources"].map((item) => (
                <button
                  key={item}
                  onClick={() => scrollTo(item.toLowerCase())}
                  className="text-left font-bold text-gray-700 px-3 py-2.5 rounded-xl hover:bg-white/50 hover:text-blue-600 transition"
                >
                  {item}
                </button>
              ))}
              <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-white/30">
                <button
                  onClick={() => navigate("/login")}
                  className="font-bold text-gray-700 px-3 py-2.5 rounded-xl hover:bg-white/50 text-left transition"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate("/register")}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-5 py-2.5 rounded-full font-bold hover:scale-105 transition text-center"
                >
                  Join for Free
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Image Carousel
// ─────────────────────────────────────────────────────────────────────────────
function ImageCarousel() {
  const allImages = [IMG_LEARNER, IMG_STUDENT, IMG_EMPLOYER];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setIndex((i) => (i + 1) % allImages.length), 3500);
    return () => clearInterval(timer);
  }, []);

  const current = allImages[index];
  const next    = allImages[(index + 1) % allImages.length];

  return (
    <div className="relative h-[340px] sm:h-[420px] flex items-center justify-center select-none">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 0.93, x: -24 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          exit={{ opacity: 0, scale: 1.04, x: 24 }}
          transition={{ duration: 0.7, ease: EASE }}
          className="absolute inset-0 flex items-center justify-center z-20"
        >
          <img
            src={current}
            alt="Featured"
            className="w-[88%] h-full object-cover rounded-[28px] shadow-2xl border-4 border-white"
            draggable={false}
          />
        </motion.div>
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.div
          key={next + "-thumb"}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="absolute top-2 right-0 w-20 h-20 sm:w-28 sm:h-28 z-30 hidden sm:block"
        >
          <img
            src={next}
            alt="Next"
            className="w-full h-full object-cover rounded-2xl border-4 border-white shadow-xl"
            draggable={false}
          />
        </motion.div>
      </AnimatePresence>

      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-30">
        {allImages.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`rounded-full transition-all duration-300 ${
              i === index ? "w-6 h-2 bg-blue-600" : "w-2 h-2 bg-blue-300"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Landing Page
// ─────────────────────────────────────────────────────────────────────────────
export default function Landing() {
  const navigate = useNavigate();

  // Split partners into two rows for opposing directions
  const rowA = PARTNERS.slice(0, Math.ceil(PARTNERS.length / 2));
  const rowB = PARTNERS.slice(Math.ceil(PARTNERS.length / 2));

  return (
    <div className="relative overflow-x-hidden bg-gradient-to-br from-blue-100 via-white to-purple-100 font-sans text-gray-900">

      {/* BACKGROUND GLOW BLOBS */}
      <div className="absolute w-72 h-72 bg-blue-400 rounded-full blur-3xl opacity-20 top-10 left-10 pointer-events-none" />
      <div className="absolute w-96 h-96 bg-purple-400 rounded-full blur-3xl opacity-20 bottom-10 right-10 pointer-events-none" />

      <Navbar />

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative pt-16 sm:pt-20 pb-14 sm:pb-16 px-4 sm:px-6 border-b border-white/40">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.92] mb-6 sm:mb-8">
              The World&apos;s <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Best Talent
              </span>{" "}
              <br />
              Starts Here
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6, ease: EASE }}
            className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-8 sm:mb-10 font-medium leading-relaxed px-2"
          >
            A comprehensive platform helping students and MSMEs navigate the
            professional world — from discovering inspiration to securing the
            right opportunity.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.6, ease: EASE }}
            className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4"
          >
            <button
              onClick={() => navigate("/register")}
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 sm:px-10 py-3.5 sm:py-4 rounded-full font-bold text-base sm:text-lg hover:scale-105 active:scale-95 transition-all duration-200 shadow-xl shadow-blue-200"
            >
              🚀 Get Started Now
            </button>
            <button
              onClick={() => navigate("/register")}
              className="border-2 border-gray-300 bg-white/60 text-gray-800 px-8 sm:px-10 py-3.5 sm:py-4 rounded-full font-bold text-base sm:text-lg hover:bg-white active:scale-95 transition-all duration-200"
            >
              Hire Talent
            </button>
          </motion.div>
        </div>
      </section>

      {/* ── GOAL + IMAGE CAROUSEL ─────────────────────────────────────────── */}
      <section id="explore" className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <ImageCarousel />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, ease: EASE }}
            className="mt-10 md:mt-0"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-5 leading-tight">
              Our Goal: Closing the{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Industry–Skill Gap
              </span>.
            </h2>
            <p className="text-base sm:text-lg text-gray-600 mb-8 leading-relaxed font-medium">
              We understand the disconnect between academic certifications and
              real industrial demand. Our platform bridges this gap by analysing
              your learning data from{" "}
              <strong className="text-gray-800">SWAYAM</strong> and{" "}
              <strong className="text-gray-800">NPTEL</strong>, then matching
              you with the right opportunities.
            </p>
            <div className="space-y-3">
              {[
                "Industrial Competency Mapping",
                "Verified Credential Sync",
                "Direct MSME Networking",
              ].map((text, i) => (
                <motion.div
                  key={text}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5, ease: EASE }}
                  className="flex items-center gap-3 font-bold text-gray-800"
                >
                  <div className="w-6 h-6 flex-shrink-0 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-black">
                    ✓
                  </div>
                  {text}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── BLUE BANNER ───────────────────────────────────────────────────── */}
      <section className="py-10 sm:py-16 px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: EASE }}
          className="max-w-7xl mx-auto bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800 rounded-[32px] sm:rounded-[40px] p-8 sm:p-14 md:p-20 text-white relative overflow-hidden shadow-2xl"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400 opacity-10 rounded-full -ml-20 -mb-20 blur-2xl pointer-events-none" />

          <div className="relative z-10 grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-5 tracking-tight leading-tight">
                Achieve your career <br className="hidden sm:block" /> goals with precision.
              </h2>
              <p className="text-blue-100 text-base sm:text-lg mb-8 font-medium max-w-md leading-relaxed">
                Build job-ready skills through world-class course data and
                connect with companies that value your verified growth.
              </p>
              <button
                onClick={() => navigate("/register")}
                className="bg-white text-blue-700 px-7 sm:px-8 py-3 rounded-full font-bold text-base sm:text-lg hover:bg-gray-100 active:scale-95 transition-all duration-200 shadow-lg"
              >
                Start Your Journey
              </button>
            </div>

            <div className="hidden md:flex justify-end">
              <motion.div
                animate={{ rotate: [3, 5, 3] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="bg-white/10 backdrop-blur-lg p-6 lg:p-8 rounded-3xl border border-white/20 max-w-xs"
              >
                <p className="text-xs font-bold opacity-70 mb-2 uppercase tracking-widest">
                  Platform Reach
                </p>
                <p className="text-xl lg:text-2xl font-black leading-snug">
                  Learn from 350+ Top Universities &amp; MSME Partners
                </p>
              </motion.div>
            </div>
          </div>

          <div className="relative z-10 mt-14 sm:mt-20 border-t border-white/10 pt-8 sm:pt-10">
            <p className="text-center text-blue-200 font-bold mb-6 sm:mb-8 uppercase tracking-widest text-xs sm:text-sm">
              Trusted by Industry Leaders
            </p>
            <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-10 md:gap-16 opacity-60">
              {["GOOGLE", "IBM", "NPTEL", "SWAYAM", "MICROSOFT"].map((name) => (
                <span key={name} className="text-lg sm:text-2xl font-black tracking-tighter italic text-white">
                  {name}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── FEATURE TILES ─────────────────────────────────────────────────── */}
      <section id="jobs" className="py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-10 sm:mb-12">
            <div>
              <h2 className="text-3xl sm:text-4xl font-black mb-2 text-gray-800">Built for Career Growth</h2>
              <p className="text-gray-500 font-medium text-sm sm:text-base">
                Everything you need to go from campus to the corporate world.
              </p>
            </div>
            <button
              onClick={() => navigate("/register")}
              className="hidden sm:block bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-2.5 rounded-full font-bold hover:scale-105 active:scale-95 transition-all duration-200 shadow-md"
            >
              View All Jobs
            </button>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6">
            {[
              {
                img: IMG_STUDENT,
                label: "01. Learn & Certify",
                color: "text-blue-600",
                desc: "Sync your NPTEL and SWAYAM credits directly to your professional profile.",
              },
              {
                img: IMG_EMPLOYER,
                label: "02. Get Matched",
                color: "text-purple-600",
                desc: "Our algorithm connects you with MSMEs based on real-world industrial needs.",
              },
              {
                img: null,
                label: "03. Start Working",
                color: "text-green-600",
                desc: "Secure internships and full-time roles with companies that value your skills.",
              },
            ].map(({ img, label, color, desc }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: i * 0.12, duration: 0.6, ease: EASE }}
                whileHover={{ scale: 1.03 }}
                onClick={() => navigate("/register")}
                className="backdrop-blur-lg bg-white/60 border border-white/40 p-6 sm:p-8 rounded-2xl sm:rounded-3xl shadow-xl cursor-pointer group transition-all duration-200"
              >
                {img ? (
                  <img
                    src={img}
                    className="w-full h-40 sm:h-48 object-cover rounded-xl sm:rounded-2xl mb-5 sm:mb-6 opacity-90 group-hover:opacity-100 transition-opacity duration-300"
                    alt={label}
                  />
                ) : (
                  <div className="h-40 sm:h-48 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl sm:rounded-2xl mb-5 sm:mb-6 flex items-center justify-center text-4xl sm:text-5xl">
                    🚀
                  </div>
                )}
                <h3 className={`text-lg sm:text-xl font-bold mb-2 sm:mb-3 ${color}`}>{label}</h3>
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="sm:hidden mt-8 text-center">
            <button
              onClick={() => navigate("/register")}
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-7 py-3 rounded-full font-bold hover:scale-105 transition"
            >
              View All Jobs
            </button>
          </div>
        </div>
      </section>

      {/* ── RESOURCES ─────────────────────────────────────────────────────── */}
      <section id="resources" className="py-16 sm:py-20 px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: EASE }}
          className="max-w-2xl mx-auto"
        >
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-purple-600 bg-purple-50 border border-purple-100 px-3 py-1 rounded-full mb-4">
            Resources
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-800 mb-3">
            Learn. Grow. Get Certified.
          </h2>
          <p className="text-gray-500 font-medium mb-6 text-sm sm:text-base leading-relaxed">
            Access curated learning paths from SWAYAM, NPTEL, and NASSCOM —
            completely free or subsidised for registered students.
          </p>
          <button
            onClick={() => navigate("/register")}
            className="border-2 border-gray-300 bg-white/60 text-gray-800 px-8 py-3 rounded-full font-bold hover:bg-white active:scale-95 transition-all duration-200"
          >
            Explore Resources
          </button>
        </motion.div>
      </section>

      {/* ── CTA BANNER ────────────────────────────────────────────────────── */}
      <section className="py-10 sm:py-16 px-4 sm:px-6 text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: EASE }}
          className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-10 sm:p-14 rounded-3xl shadow-xl max-w-3xl mx-auto"
        >
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">
            Start Your Career Journey Today
          </h2>
          <p className="text-blue-100 mb-6 text-sm sm:text-base font-medium">
            Join thousands of students already building their future with Campus2Career.
          </p>
          <button
            onClick={() => navigate("/register")}
            className="bg-white text-blue-600 px-7 py-3 rounded-xl font-bold hover:scale-105 active:scale-95 transition-all duration-200 shadow-md"
          >
            Get Started
          </button>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          OUR PARTNERS — infinite sliding marquee (two opposing rows)
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-20 overflow-hidden">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: EASE }}
          className="text-center mb-10 px-4"
        >
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full mb-3">
            Our Partners
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-800">
            Backed by the{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Best in the Industry
            </span>
          </h2>
          <p className="text-gray-500 mt-2 text-sm sm:text-base font-medium max-w-xl mx-auto">
            Collaborating with leading universities, government programmes, and global tech companies.
          </p>
        </motion.div>

        {/* Row 1 — slides left */}
        <div className="relative mb-4">
          {/* fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-r from-blue-50 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-l from-purple-50 to-transparent z-10 pointer-events-none" />
          <MarqueeRow items={PARTNERS} direction="left" speed={40} />
        </div>

        {/* Row 2 — slides right (reversed list for variety) */}
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-r from-blue-50 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-l from-purple-50 to-transparent z-10 pointer-events-none" />
          <MarqueeRow items={[...PARTNERS].reverse()} direction="right" speed={50} />
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/40 px-4 sm:px-6 py-14 sm:py-20">
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8 sm:gap-10 md:gap-12">
          <div className="col-span-2 sm:col-span-3 md:col-span-1">
            <div className="text-xl sm:text-2xl font-black tracking-tighter mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Campus2Career
            </div>
            <p className="text-sm text-gray-500 font-medium leading-relaxed max-w-[200px]">
              Bridging students and MSMEs — one skill at a time.
            </p>
          </div>

          {[
            {
              heading: "For Talent",
              links: ["Discover Careers", "Find Jobs", "Get Certified", "MSME Network"],
            },
            {
              heading: "Opportunities",
              links: ["Post a Job", "Skill Assessment", "Industry Mapping", "Resource Hub"],
            },
            {
              heading: "Company",
              links: ["About Us", "Privacy Policy", "Help Center", "Contact Us"],
            },
            {
              heading: "Social",
              links: ["Instagram", "Twitter / X", "LinkedIn", "Facebook"],
            },
          ].map(({ heading, links }) => (
            <div key={heading}>
              <h4 className="font-black text-gray-800 mb-4 sm:mb-5 text-sm sm:text-base">
                {heading}
              </h4>
              <ul className="space-y-3 text-gray-500 text-[14px] sm:text-[15px] font-medium">
                {links.map((link) => (
                  <li
                    key={link}
                    className="hover:text-blue-600 cursor-pointer transition-colors duration-200"
                  >
                    {link}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="max-w-7xl mx-auto mt-14 sm:mt-20 pt-8 sm:pt-10 border-t border-white/40 flex flex-col sm:flex-row justify-between items-center gap-3 text-sm font-semibold text-gray-500">
          <p>© 2026 Campus2Career. All rights reserved.</p>
          <p className="text-xs">Designed with ❤️ for India&apos;s future workforce</p>
        </div>
      </footer>
    </div>
  );
}
