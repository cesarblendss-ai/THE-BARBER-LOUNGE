"use client";

import { useLanguage } from "@/components/i18n/LanguageProvider";
import { PhoneIcon, ScissorsIcon } from "@/components/icons";
import { SITE, SITE_BOOK_PATH } from "@/lib/content";

type CinematicService = {
  name: string;
  description: string;
  price: string;
  href: string;
  analyticsLabel: string;
};

type CinematicServicesProps = {
  services?: CinematicService[];
};

export function CinematicServices({ services }: CinematicServicesProps) {
  const { t } = useLanguage();

  const defaults: CinematicService[] = [
    {
      name: t("services.signature"),
      description: t("services.signatureDesc"),
      price: "$50",
      href: SITE_BOOK_PATH,
      analyticsLabel: "Book Signature Haircut (service card)",
    },
    {
      name: t("services.beardAlt"),
      description: t("services.beardDesc"),
      price: "$65",
      href: SITE_BOOK_PATH,
      analyticsLabel: "Book Haircut & Beard (service card)",
    },
  ];

  const list = services ?? defaults;

  return (
    <section
      id="services"
      className="border-t border-white/10 bg-black px-5 py-14 text-white sm:px-8 sm:py-16"
      aria-labelledby="cinematic-services-heading"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 md:mb-10 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-white/45">
              {t("nav.services")}
            </p>
            <h2
              id="cinematic-services-heading"
              className="mt-3 font-serif text-3xl font-semibold tracking-tight sm:text-4xl"
            >
              {t("cta.bookYourCut").replace(" →", "")}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/55 sm:text-base">
              {t("home.finalBody")}
            </p>
          </div>
          <a
            href={`tel:${SITE.phoneTel}`}
            data-analytics-label="Call Now (services section)"
            className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-orange-400/50 px-5 py-3.5 text-xs font-semibold uppercase tracking-[0.16em] text-orange-100 transition hover:bg-orange-500/10 sm:w-auto"
          >
            <PhoneIcon className="h-4 w-4 stroke-orange-100" />
            {t("home.callPhone", { phone: SITE.phone })}
          </a>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {list.map((service) => (
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
                {t("cta.bookNow")}
                <span aria-hidden>→</span>
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
