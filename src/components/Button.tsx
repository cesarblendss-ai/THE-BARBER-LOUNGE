import Link from "next/link";

type ButtonVariant = "primary" | "secondary" | "burgundy" | "ghost" | "outline" | "glass";

type ButtonProps = {
  href: string;
  children: React.ReactNode;
  variant?: ButtonVariant;
  external?: boolean;
  className?: string;
  size?: "default" | "lg";
  analyticsLabel?: string;
};

const variants: Record<ButtonVariant, string> = {
  primary: "bg-brass text-bone hover:bg-brass/90 focus-visible:ring-brass",
  secondary: "bg-charcoal text-bone hover:bg-charcoal/90 focus-visible:ring-charcoal",
  burgundy: "bg-burgundy text-bone hover:bg-burgundy/90 focus-visible:ring-burgundy",
  ghost: "border border-charcoal/20 text-charcoal hover:border-brass hover:text-brass focus-visible:ring-brass",
  outline: "border-2 border-brass text-brass-dark hover:bg-brass hover:text-bone focus-visible:ring-brass",
  glass:
    "border-2 border-brass/70 bg-white/10 text-bone shadow-sm backdrop-blur-md hover:bg-white/20 focus-visible:ring-brass",
};

const sizes = {
  default: "px-8 py-3 text-sm",
  lg: "px-10 py-4 text-base",
};

export function Button({
  href,
  children,
  variant = "primary",
  external = false,
  className = "",
  size = "default",
  analyticsLabel,
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-full font-semibold uppercase tracking-wider transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-bone";

  const classes = `${base} ${variants[variant]} ${sizes[size]} ${className}`;

  const isTelOrMailto = href.startsWith("tel:") || href.startsWith("mailto:");

  const analyticsProps = analyticsLabel
    ? { "data-analytics-label": analyticsLabel }
    : undefined;

  if (external || isTelOrMailto) {
    return (
      <a
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        className={classes}
        {...analyticsProps}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes} {...analyticsProps}>
      {children}
    </Link>
  );
}
