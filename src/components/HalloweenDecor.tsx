/**
 * Seasonal Halloween overlay — spider webs, hanging spiders, ambient glow.
 * Pointer-events none so booking / nav stay fully usable.
 */
export function HalloweenDecor() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-[60] overflow-hidden"
      aria-hidden
    >
      {/* Ambient halloween wash */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,120,20,0.14),_transparent_55%),radial-gradient(ellipse_at_bottom,_rgba(88,28,135,0.18),_transparent_50%)]" />

      {/* Corner webs */}
      <CornerWeb className="absolute -left-2 -top-2 h-[min(42vw,280px)] w-[min(42vw,280px)] text-white/55" />
      <CornerWeb className="absolute -right-2 -top-2 h-[min(38vw,240px)] w-[min(38vw,240px)] scale-x-[-1] text-white/45" />
      <CornerWeb className="absolute -bottom-4 -left-4 h-[min(36vw,220px)] w-[min(36vw,220px)] scale-y-[-1] text-white/30" />
      <CornerWeb className="absolute -bottom-4 -right-4 h-[min(40vw,260px)] w-[min(40vw,260px)] scale-x-[-1] scale-y-[-1] text-white/35" />

      {/* Extra mid-side webs */}
      <SideWeb className="absolute left-0 top-[38%] h-40 w-28 -translate-x-1/4 text-white/25 sm:h-52 sm:w-36" />
      <SideWeb className="absolute right-0 top-[55%] h-36 w-24 translate-x-1/4 scale-x-[-1] text-white/22 sm:h-48 sm:w-32" />

      {/* Hanging spiders */}
      <HangingSpider className="absolute left-[12%] top-0" thread={72} delay="0s" />
      <HangingSpider className="absolute left-[48%] top-0 hidden sm:block" thread={110} delay="0.4s" />
      <HangingSpider className="absolute right-[18%] top-0" thread={88} delay="0.8s" />
      <HangingSpider className="absolute right-[38%] top-0 hidden md:block" thread={64} delay="1.2s" />

      {/* Floating bats (simple silhouettes) */}
      <Bat className="absolute left-[8%] top-[22%] h-6 w-10 text-black/80 opacity-70 animate-[halloween-drift_9s_ease-in-out_infinite]" />
      <Bat className="absolute right-[10%] top-[30%] h-5 w-9 text-black/70 opacity-60 animate-[halloween-drift_11s_ease-in-out_infinite_reverse]" />
      <Bat className="absolute left-[70%] top-[18%] hidden h-7 w-12 text-black/75 opacity-50 sm:block animate-[halloween-drift_13s_ease-in-out_infinite]" />

      {/* Pumpkin accents — corners near sticky CTAs */}
      <span className="absolute bottom-24 left-3 text-2xl opacity-80 drop-shadow-[0_0_8px_rgba(255,140,0,0.55)] sm:bottom-8 sm:left-6 sm:text-3xl">
        🎃
      </span>
      <span className="absolute bottom-24 right-3 text-2xl opacity-80 drop-shadow-[0_0_8px_rgba(255,140,0,0.55)] sm:bottom-8 sm:right-6 sm:text-3xl md:bottom-8">
        🎃
      </span>
    </div>
  );
}

function CornerWeb({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" fill="none" className={className}>
      <path
        d="M0 0 L200 0 M0 0 L0 200 M0 0 L200 40 M0 0 L200 90 M0 0 L200 150 M0 0 L150 200 M0 0 L90 200 M0 0 L40 200"
        stroke="currentColor"
        strokeWidth="1.1"
        opacity="0.85"
      />
      <path
        d="M18 0 Q28 28 0 18 M40 0 Q58 58 0 40 M70 0 Q95 95 0 70 M110 0 Q135 135 0 110 M155 0 Q175 175 0 155"
        stroke="currentColor"
        strokeWidth="1"
        fill="none"
        opacity="0.9"
      />
      {/* sticky silk blobs */}
      <circle cx="52" cy="28" r="2.2" fill="currentColor" opacity="0.7" />
      <circle cx="88" cy="62" r="1.8" fill="currentColor" opacity="0.6" />
      <circle cx="34" cy="74" r="1.6" fill="currentColor" opacity="0.55" />
    </svg>
  );
}

function SideWeb({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 180" fill="none" className={className}>
      <path
        d="M0 0 L0 180 M0 20 L90 90 M0 60 L100 100 M0 110 L85 140 M0 150 L70 170"
        stroke="currentColor"
        strokeWidth="1"
      />
      <path
        d="M0 30 Q40 55 0 80 M0 70 Q55 100 0 130 M0 120 Q45 145 0 165"
        stroke="currentColor"
        strokeWidth="1"
        fill="none"
      />
    </svg>
  );
}

function HangingSpider({
  className,
  thread,
  delay,
}: {
  className?: string;
  thread: number;
  delay: string;
}) {
  return (
    <div
      className={`${className} flex flex-col items-center`}
      style={{ animation: `halloween-sway 4.5s ease-in-out ${delay} infinite` }}
    >
      <div className="w-px bg-white/45" style={{ height: thread }} />
      <svg viewBox="0 0 40 28" className="h-5 w-7 text-orange-200/90 drop-shadow-[0_0_6px_rgba(255,140,0,0.45)] sm:h-6 sm:w-8">
        <ellipse cx="20" cy="14" rx="7" ry="6" fill="currentColor" />
        <ellipse cx="20" cy="9" rx="4.5" ry="4" fill="currentColor" />
        <path
          d="M13 10 C4 4, 2 2, 1 1 M13 14 C3 14, 1 16, 0 18 M13 18 C5 22, 3 24, 2 26 M27 10 C36 4, 38 2, 39 1 M27 14 C37 14, 39 16, 40 18 M27 18 C35 22, 37 24, 38 26"
          stroke="currentColor"
          strokeWidth="1.4"
          fill="none"
          strokeLinecap="round"
        />
        <circle cx="18.2" cy="8" r="0.9" fill="#1a1a1a" />
        <circle cx="21.8" cy="8" r="0.9" fill="#1a1a1a" />
      </svg>
    </div>
  );
}

function Bat({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 36" fill="currentColor" className={className}>
      <path d="M32 20c-2 0-4 2-4 4 0 0 2 2 4 2s4-2 4-2c0-2-2-4-4-4zm-4-2c-8-6-16-12-24-8 6 2 10 8 12 12 2-2 6-4 12-4zm8 0c8-6 16-12 24-8-6 2-10 8-12 12-2-2-6-4-12-4z" />
    </svg>
  );
}
