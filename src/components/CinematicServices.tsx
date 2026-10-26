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
      className="border-t border-white/10 bg-black px-5 py-14 text-white sm:px-8 sm:py-16"
      aria-labelledby="cinematic-services-heading"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 max-w-2xl">
          <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-white/45">Services</p>
          <h2
            id="cinematic-services-heading"
            className="mt-3 font-serif text-3xl font-semibold tracking-tight sm:text-4xl"
          >
            Book your cut
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-white/55 sm:text-base">
            Tap a card to open Booksy and lock in your time.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {services.map((service) => (
            <a
              key={service.name}
              href={service.href}
              target="_blank"
              rel="noopener noreferrer"
              data-analytics-label={service.analyticsLabel}
              className="group relative flex flex-col rounded-xl border border-white/15 bg-white/[0.02] p-6 outline-none transition duration-200 hover:-translate-y-0.5 hover:border-white/45 hover:bg-white/[0.06] focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:p-8"
            >
              <ScissorsIcon className="h-5 w-5 stroke-white/75 transition group-hover:stroke-white" />
              <h3 className="mt-5 font-serif text-2xl font-semibold tracking-tight">{service.name}</h3>
              <p className="mt-2 text-sm text-white/55">{service.description}</p>
              <p className="mt-6 font-serif text-3xl font-semibold tracking-tight">{service.price}</p>
              <span className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-white px-4 py-3.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-black transition group-hover:bg-white/90 sm:w-auto sm:self-start">
                Book on Booksy
                <span aria-hidden>→</span>
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
