import Link from "next/link";

import { ScissorsIcon, RazorIcon } from "@/components/icons";
import { BOOKING_URL } from "@/lib/content";

type CinematicService = {
  name: string;
  description: string;
  price: string;
  icon: "scissors" | "razor";
};

const DEFAULT_SERVICES: CinematicService[] = [
  {
    name: "Signature Haircut",
    description: "Precision cut, detailed finish.",
    price: "$50",
    icon: "scissors",
  },
  {
    name: "Haircut & Beard Trim",
    description: "Complete look, clean finish.",
    price: "$65",
    icon: "scissors",
  },
];

type CinematicServicesProps = {
  services?: CinematicService[];
};

export function CinematicServices({ services = DEFAULT_SERVICES }: CinematicServicesProps) {
  return (
    <section
      id="services"
      className="bg-black px-5 py-16 text-white sm:px-8 sm:py-24"
      aria-labelledby="cinematic-services-heading"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col gap-4 sm:mb-14 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-white/45">
              Services
            </p>
            <h2
              id="cinematic-services-heading"
              className="mt-3 font-serif text-3xl font-semibold tracking-tight sm:text-4xl"
            >
              Two clear options. Done right.
            </h2>
          </div>
          <Link
            href="/services"
            className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60 transition hover:text-white"
          >
            Full menu →
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {services.map((service) => {
            const Icon = service.icon === "razor" ? RazorIcon : ScissorsIcon;
            return (
              <a
                key={service.name}
                href={BOOKING_URL}
                target="_blank"
                rel="noopener noreferrer"
                data-analytics-label={`Book ${service.name} (cinematic card)`}
                className="group rounded-xl border border-white/15 bg-white/[0.02] p-6 transition hover:border-white/35 hover:bg-white/[0.04] sm:p-8"
              >
                <Icon className="h-5 w-5 stroke-white/80 transition group-hover:stroke-white" />
                <h3 className="mt-5 font-serif text-2xl font-semibold tracking-tight">
                  {service.name}
                </h3>
                <p className="mt-2 text-sm text-white/55 underline decoration-white/25 underline-offset-4">
                  {service.description}
                </p>
                <p className="mt-8 font-serif text-3xl font-semibold tracking-tight">{service.price}</p>
                <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40 transition group-hover:text-white/70">
                  Book appointment →
                </p>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
