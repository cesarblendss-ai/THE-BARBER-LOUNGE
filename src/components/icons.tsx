type IconProps = {
  className?: string;
};

const defaultClass = "h-6 w-6 stroke-current fill-none";

export function ScissorsIcon({ className = defaultClass }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle cx="6" cy="6" r="2.5" strokeWidth="1.75" />
      <circle cx="6" cy="18" r="2.5" strokeWidth="1.75" />
      <path d="M20 4L8.5 15.5M20 20L8.5 8.5" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

export function RazorIcon({ className = defaultClass }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M3 12h14l4-4v8l-4-4H3z"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path d="M3 12v4" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

export function CombIcon({ className = defaultClass }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <rect x="4" y="4" width="8" height="16" rx="1" strokeWidth="1.75" />
      <path d="M12 7h8M12 10h8M12 13h8M12 16h8" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

export function ClockIcon({ className = defaultClass }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9" strokeWidth="1.75" />
      <path d="M12 7v5l3 2" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PinIcon({ className = defaultClass }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11z"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10" r="2.5" strokeWidth="1.75" />
    </svg>
  );
}

export function StarIcon({ className = defaultClass }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M12 2l2.9 6.3L22 9.3l-5 4.5 1.5 6.5L12 17.8 5.5 20.3 7 13.8 2 9.3l7.1-1z"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MenuIcon({ className = defaultClass }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

export function CloseIcon({ className = defaultClass }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

export function PhoneIcon({ className = defaultClass }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 5 5L14 13l5 2v3a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2z"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  );
}
