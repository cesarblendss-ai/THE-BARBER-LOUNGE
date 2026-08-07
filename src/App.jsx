import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Instagram, Phone, Scissors, Sparkles, ArrowRight, MessageSquare } from "lucide-react";

/********************************************
 * BARBER LOUNGE — PEARL WHITE LUXE (FIRST SIMPLE VERSION)
 * Fix: Ensure closing parens in root component; add small dev tests.
 * Update: Local MP4s (no IG/CDN) for hero + work grid.
 ********************************************/

const SITE = {
  brand: "The Barber Lounge",
  phone: "(925) 436-8540",
  phoneHref: "tel:+19254368540",
  smsHref: (body) => `sms:+19254368540?&body=${encodeURIComponent(body)}`,
  instagram: "@cesarblendss",
  instagramHref: "https://instagram.com/cesarblendss",
};

// Place your downloaded file in public/videos/facial.mp4
const FACIAL_VIDEO = "/videos/facial.mp4";

// Local reels for the Recent Work grid — drop files into public/videos/
const WORK_VIDEOS = [
  { src: "/videos/beard-lineup.mp4", title: "Beard Lineup — Hot Towel" },
  { src: "/videos/mid-fade.mp4", title: "Mid Fade — Shear Work" },
];

/*********************************
 * Dev-time sanity checks (non-blocking)
 *********************************/
try {
  console.assert(typeof SITE.smsHref("test") === "string", "smsHref should return a string");
  console.assert(/\.mp4(\?|$)/i.test(FACIAL_VIDEO), "Hero video must be an MP4 path");
  console.assert(Array.isArray(WORK_VIDEOS) && WORK_VIDEOS.length >= 2, "WORK_VIDEOS should have at least 2 items");
  WORK_VIDEOS.forEach((v) => console.assert(/\.mp4(\?|$)/i.test(v.src), `Work video must be an MP4: ${v.src}`));
} catch (e) { /* no-op in production */ }

const SERVICES = [
  { name: "Haircut", price: "$50", icon: Scissors, tag: "CLEAN FADE" },
  { name: "Haircut + Beard", price: "$65", icon: Sparkles, tag: "FULL SERVICE" },
];

const THEME = {
  bg: "bg-[#FAFAFA]",
  card: "bg-white",
  text: "text-neutral-900",
  sub: "text-neutral-500",
  line: "border-neutral-200",
  chip: "bg-neutral-100",
};

function IntroOverlay({ onDone }) {
  const [skip, setSkip] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => onDone?.(), skip ? 150 : 1500);
    return () => clearTimeout(t);
  }, [skip, onDone]);
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-white"
      initial={{ opacity: 1 }}
      animate={{ opacity: skip ? 0 : 1 }}
      transition={{ duration: 0.35, delay: skip ? 0 : 1.2 }}
    >
      <div className="text-center">
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="tracking-[0.25em] text-xs text-neutral-400 uppercase"
        >
          Welcome to
        </motion.div>
        <motion.h1
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mt-2 text-4xl sm:text-6xl font-semibold text-neutral-900"
        >
          {SITE.brand}
        </motion.h1>
        <button onClick={() => setSkip(true)} className="mt-6 text-xs text-neutral-500 hover:text-neutral-700">Skip</button>
      </div>
    </motion.div>
  );
}

function Nav() {
  return (
    <div className={`sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-white/70 bg-white/80 border-b ${THEME.line}`}>
      <div className="mx-auto max-w-6xl px-5 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-neutral-900" />
          <span className="font-semibold tracking-wide text-neutral-900">{SITE.brand}</span>
        </div>
        <div className="flex items-center gap-6 text-sm text-neutral-700">
          <a href="#services" className="hover:text-neutral-900">Services</a>
          <a href="#work" className="hover:text-neutral-900">Work</a>
          <a href="#book" className="hover:text-neutral-900 inline-flex items-center gap-2">
            Book <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  );
}

function Hero() {
  const videoRef = useRef(null);
  const [muted, setMuted] = useState(false); // try with sound first per user request
  const [autoplayWithSound, setAutoplayWithSound] = useState(true);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    // Try to autoplay WITH audio (may be blocked by browser policy)
    v.muted = false;
    const attempt = v.play();
    if (attempt && typeof attempt.then === "function") {
      attempt
        .then(() => {
          setAutoplayWithSound(true);
          setMuted(false);
        })
        .catch(() => {
          // Fallback: autoplay muted, show unmute hint
          v.muted = true;
          setMuted(true);
          setAutoplayWithSound(false);
          v.play().catch(() => {});
        });
    }
  }, []);

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
    if (v.paused) {
      v.play().catch(() => {});
    }
  };

  return (
    <section className={`${THEME.bg} pt-14`}>
      <div className="mx-auto max-w-6xl px-5 py-14">
        <div className="relative rounded-2xl overflow-hidden border border-neutral-200 bg-white">
          <video
            ref={videoRef}
            key={FACIAL_VIDEO}
            src={FACIAL_VIDEO}
            className="w-full h-80 sm:h-[480px] object-cover"
            autoPlay
            loop
            playsInline
            preload="metadata"
            controls
            muted={muted}
          >
            <source src={FACIAL_VIDEO} type="video/mp4" />
          </video>

          {/* If the browser blocked autoplay-with-sound, show a simple unmute chip */}
          {muted && (
            <button
              onClick={toggleMute}
              className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 bg-neutral-900/85 text-white text-sm hover:bg-neutral-900"
            >
              🔊 Tap for sound
            </button>
          )}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {SERVICES.map((s) => (
            <a
              key={s.name}
              href={SITE.smsHref(`${s.name} — ${s.price} at The Barber Lounge`)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 border ${THEME.line} ${THEME.text} hover:bg-neutral-100`}
            >
              <s.icon className="h-4 w-4" /> {s.name} — {s.price}
            </a>
          ))}
          <a href={SITE.phoneHref} className="inline-flex items-center gap-2 rounded-full px-4 py-2 bg-neutral-900 text-white hover:opacity-90"><Phone className="h-4 w-4"/> Call</a>
          <a href={SITE.smsHref("Hey, can I book a cut?")} className="inline-flex items-center gap-2 rounded-full px-4 py-2 border border-neutral-300 text-neutral-800 hover:bg-neutral-100"><MessageSquare className="h-4 w-4"/> Text</a>
          <a href={SITE.instagramHref} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full px-4 py-2 border border-neutral-300 text-neutral-800 hover:bg-neutral-100"><Instagram className="h-4 w-4"/> {SITE.instagram}</a>
        </div>
      </div>
    </section>
  );
}

function Services() {
  return (
    <section id="services" className={`${THEME.bg} py-8`}>
      <div className="mx-auto max-w-6xl px-5 grid grid-cols-1 sm:grid-cols-2 gap-6">
        {SERVICES.map((s) => (
          <div key={s.name} className={`rounded-2xl ${THEME.card} border ${THEME.line} p-6`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <s.icon className="h-5 w-5 text-neutral-700" />
                <div className={`text-lg font-medium ${THEME.text}`}>{s.name}</div>
              </div>
              <div className="text-lg font-semibold text-neutral-900">{s.price}</div>
            </div>
            <div className="mt-3 text-xs tracking-[0.2em] text-neutral-500">{s.tag}</div>
            <div className="mt-5 flex gap-3">
              {["Today", "Tomorrow", "This Weekend"].map((t) => (
                <a
                  key={t}
                  href={SITE.smsHref(`${s.name} — ${s.price}. I can do ${t}.`)}
                  className={`text-sm rounded-full px-3 py-1 ${THEME.chip} hover:bg-neutral-200 ${THEME.text}`}
                >
                  {t}
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function WorkGrid() {
  return (
    <section id="work" className={`${THEME.bg} py-8`}>
      <div className="mx-auto max-w-6xl px-5">
        <h2 className={`text-2xl sm:text-3xl font-semibold ${THEME.text}`}>Recent Work</h2>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {WORK_VIDEOS.map((v, i) => (
            <div key={i} className={`rounded-2xl overflow-hidden border ${THEME.line} ${THEME.card}`}>
              <video
                key={v.src}
                src={v.src}
                className="w-full h-64 object-cover"
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                controls
              >
                <source src={v.src} type="video/mp4" />
              </video>
              <div className="px-4 py-3 text-sm text-neutral-700 border-top border-neutral-200">{v.title}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function QuickBook() {
  const slots = ["Today 6:30 PM", "Today 7:30 PM", "Tomorrow 6:00 PM", "Sunday 2:00 PM"];
  return (
    <section id="book" className={`${THEME.bg} py-12`}>
      <div className="mx-auto max-w-6xl px-5">
        <div className={`rounded-2xl ${THEME.card} border ${THEME.line} p-6`}>
          <h3 className={`text-xl font-semibold ${THEME.text}`}>Book in 2 taps</h3>
          <p className={`mt-1 ${THEME.sub}`}>Pick a service, tap a time — I’ll text back to confirm.</p>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {SERVICES.map((s) => (
              <div key={s.name} className="rounded-xl border border-neutral-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-neutral-800">
                    <s.icon className="h-4 w-4" /> {s.name}
                  </div>
                  <div className="font-semibold text-neutral-900">{s.price}</div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {slots.map((slot) => (
                    <a
                      key={slot}
                      href={SITE.smsHref(`${s.name} — ${s.price}. ${slot} works for me.`)}
                      className="text-sm rounded-full px-3 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-900"
                    >
                      {slot}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <a href={SITE.phoneHref} className="inline-flex items-center gap-2 rounded-full px-4 py-2 bg-neutral-900 text-white hover:opacity-90">
              <Phone className="h-4 w-4" /> Call
            </a>
            <a href={SITE.smsHref("Hey, can I book a cut?")} className="inline-flex items-center gap-2 rounded-full px-4 py-2 border border-neutral-300 text-neutral-800 hover:bg-neutral-100">
              <MessageSquare className="h-4 w-4" /> Text
            </a>
            <a href={SITE.instagramHref} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full px-4 py-2 border border-neutral-300 text-neutral-800 hover:bg-neutral-100">
              <Instagram className="h-4 w-4" /> {SITE.instagram}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className={`${THEME.bg} border-t ${THEME.line}`}>
      <div className="mx-auto max-w-6xl px-5 py-10 grid grid-cols-1 sm:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-neutral-900" />
            <span className="font-semibold tracking-wide text-neutral-900">{SITE.brand}</span>
          </div>
          <p className="mt-3 text-sm text-neutral-600">Modern cuts with a luxury touch.</p>
        </div>
        <div>
          <div className="text-neutral-900 font-medium">Contact</div>
          <a href={SITE.phoneHref} className="mt-2 block text-neutral-800 hover:underline">{SITE.phone}</a>
          <a href={SITE.instagramHref} className="mt-1 inline-flex items-center gap-2 text-neutral-800 hover:underline">
            <Instagram className="h-4 w-4" /> {SITE.instagram}
          </a>
        </div>
      </div>
      <div className="border-t border-neutral-200 py-4 text-center text-xs text-neutral-500">
        © {new Date().getFullYear()} {SITE.brand}. All rights reserved.
      </div>
    </footer>
  );
}

export default function BarberLoungeSite() {
  const [showIntro, setShowIntro] = useState(true);
  return (
    <div className={`min-h-screen ${THEME.bg} font-[ui-sans-serif]`}>
      <AnimatePresence>
        {showIntro && <IntroOverlay onDone={() => setShowIntro(false)} />}
      </AnimatePresence>
      <Nav />
      <Hero />
      <Services />
      <WorkGrid />
      <QuickBook />
      <Footer />
    </div>
  );
}
