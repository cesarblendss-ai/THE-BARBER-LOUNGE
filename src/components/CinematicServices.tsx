import { PhoneIcon, ScissorsIcon } from "@/components/icons";
import { SITE, SITE_BOOK_PATH } from "@/lib/content";

type CinematicService = {
  name: string;
  description: string;
  price: string;
  href: string;
  analyticsLabel: string;
};

const DEFAULT_SERVICES: CinematicService[] = [
  {
    name: "Signature Haircut",
    description: "Precision cut, detailed finish.",
    price: "$50",
    href: SITE_BOOK_PATH,
    analyticsLabel: "Book Signature Haircut (service card)",
  },
  {
    name: "Haircut & Beard Trim",
    description: "Complete look, clean finish.",
    price: "$65",
    href: SITE_BOOK_PATH,
    analyticsLabel: "Book Haircut & Beard (service card)",
  },
];

type CinematicServicesProps = {
  services?: CinematicService[];
};

export function CinematicServices({ services = DEFAULT_SERVICES }: CinematicServicesProps) {
  return (
    <section
      id="services"
      className="border-t border-white/10 bg-black px-5 py-14 text-white sm:px-8 sm:py-16"
      aria-labelledby="cinematic-services-heading"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 md:mb-10 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-white/45">Services</p>
            <h2
              id="cinematic-services-heading"
              className="mt-3 font-serif text-3xl font-semibold tracking-tight sm:text-4xl"
            >
              Book your cut
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/55 sm:text-base">
              Clear prices. Tap a card to book on this site — four steps, pay in the shop — or call us.
            </p>
          </div>
          <a
            href={`tel:${SITE.phoneTel}`}
            data-analytics-label="Call Now (services section)"
            className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-orange-400/50 px-5 py-3.5 text-xs font-semibold uppercase tracking-[0.16em] text-orange-100 transition hover:bg-orange-500/10 sm:w-auto"
          >
            <PhoneIcon className="h-4 w-4 stroke-orange-100" />
            Call {SITE.phone}
          </a>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {services.map((service) => (
            <a
              key={service.name}
              href={service.href}
              {...(service.href.startsWith("http")
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
              data-analytics-label={service.analyticsLabel}
              className="group relative flex flex-col rounded-xl border border-white/15 bg-white/[0.02] p-6 outline-none transition duration-200 hover:-translate-y-0.5 hover:border-orange-400/50 hover:bg-white/[0.06] focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:p-8"
            >
              <ScissorsIcon className="h-5 w-5 stroke-white/75 transition group-hover:stroke-orange-200" />
              <h3 className="mt-5 font-serif text-2xl font-semibold tracking-tight">{service.name}</h3>
              <p className="mt-2 text-sm text-white/55">{service.description}</p>
              <p className="mt-6 font-serif text-3xl font-semibold tracking-tight">{service.price}</p>
              <span className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-orange-500 px-4 py-3.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-black transition group-hover:bg-orange-400 sm:w-auto sm:self-start">
                Book this cut
                <span aria-hidden>→</span>
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
