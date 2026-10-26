import { ScissorsIcon } from "@/components/icons";
import { BOOKSY_SERVICE_VARIANT, getBooksyServiceUrl } from "@/lib/booksy";

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
    href: getBooksyServiceUrl(BOOKSY_SERVICE_VARIANT.signatureHaircut),
    analyticsLabel: "Book Signature Haircut (service card)",
  },
  {
    name: "Haircut & Beard Trim",
    description: "Complete look, clean finish.",
    price: "$65",
    href: getBooksyServiceUrl(BOOKSY_SERVICE_VARIANT.signatureHaircutBeard),
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
      className="bg-black px-5 py-14 text-white sm:px-8 sm:py-20"
      aria-labelledby="cinematic-services-heading"
    >
      <div className="mx-auto max-w-7xl">
        <h2 id="cinematic-services-heading" className="sr-only">
          Book a service
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
          {services.map((service) => (
            <a
              key={service.name}
              href={service.href}
              target="_blank"
              rel="noopener noreferrer"
              data-analytics-label={service.analyticsLabel}
              className="group relative block rounded-xl border border-white/15 bg-white/[0.02] p-6 outline-none transition duration-200 hover:-translate-y-0.5 hover:border-white/45 hover:bg-white/[0.06] hover:shadow-[0_18px_50px_rgba(0,0,0,0.45)] focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:p-8"
            >
              <ScissorsIcon className="h-5 w-5 stroke-white/75 transition group-hover:stroke-white" />
              <h3 className="mt-5 font-serif text-2xl font-semibold tracking-tight transition group-hover:text-white">
                {service.name}
              </h3>
              <p className="mt-2 text-sm text-white/55 underline decoration-white/25 underline-offset-4 transition group-hover:text-white/75 group-hover:decoration-white/50">
                {service.description}
              </p>
              <p className="mt-8 font-serif text-3xl font-semibold tracking-tight">{service.price}</p>
              <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40 transition group-hover:text-white/80">
                Book on Booksy →
              </p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
