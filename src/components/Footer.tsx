"use client";

import Link from "next/link";

import { EditableText } from "@/components/EditableText";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { SITE, SITE_BOOK_PATH } from "@/lib/content";
import type { SiteContent } from "@/lib/site-content-types";

type FooterProps = {
  content: SiteContent;
  adminAuthenticated?: boolean;
};

const DAY_ES: Record<string, string> = {
  Sunday: "Domingo",
  Monday: "Lunes",
  Tuesday: "Martes",
  Wednesday: "Miércoles",
  Thursday: "Jueves",
  Friday: "Viernes",
  Saturday: "Sábado",
};

const HOURS_ES: Record<string, string> = {
  Closed: "Cerrado",
};

/** Clean conversion footer — no oversized wordmark, no public staff links. */
export function Footer({ content }: FooterProps) {
  const { locale, t } = useLanguage();
  const { SITE: site, HOURS, FOOTER } = content;
  const year = new Date().getFullYear();

  const footerNav = [
    { href: SITE_BOOK_PATH, label: t("nav.book") },
    { href: "/services", label: t("nav.services") },
    { href: "/about", label: t("nav.barbers") },
    { href: "/contact", label: t("nav.location") },
  ] as const;

  return (
    <footer className="relative border-t border-orange-500/25 bg-black text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 sm:py-14 md:grid-cols-3">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-orange-300/70">
            {t("footer.visit")}
          </p>
          <a
            href="https://maps.google.com/?q=1518+A+St,+Antioch,+CA+94509"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 block text-sm leading-relaxed text-white/80 transition hover:text-orange-200"
          >
            <EditableText path="SITE.address" defaultValue={site.address} as="span" />
          </a>
          <a
            href={`tel:${SITE.phoneTel}`}
            className="mt-2 block text-sm text-white/70 transition hover:text-orange-200"
          >
            <EditableText path="SITE.phone" defaultValue={site.phone} as="span" />
          </a>
          <a
            href={SITE.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 block text-sm text-white/55 transition hover:text-orange-200"
          >
            <EditableText path="SITE.instagram" defaultValue={site.instagram} as="span" />
          </a>
        </div>

        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-orange-300/70">
            {locale === "es" ? t("footer.hours") : (
              <EditableText path="FOOTER.hoursLabel" defaultValue={FOOTER.hoursLabel} as="span" />
            )}
          </p>
          <ul className="mt-3 space-y-1.5 text-sm text-white/70">
            {HOURS.map((item, index) => {
              const dayLabel =
                locale === "es" ? (DAY_ES[item.day] ?? item.day) : item.day;
              const hoursLabel =
                locale === "es"
                  ? HOURS_ES[item.hours] ??
                    item.hours
                      .replace("Closed", "Cerrado")
                      .replace("AM", "a. m.")
                      .replace("PM", "p. m.")
                  : item.hours;
              return (
                <li key={item.day} className="flex justify-between gap-4">
                  {locale === "es" ? (
                    <>
                      <span>{dayLabel}</span>
                      <span>{hoursLabel}</span>
                    </>
                  ) : (
                    <>
                      <EditableText path={`HOURS.${index}.day`} defaultValue={item.day} as="span" />
                      <EditableText
                        path={`HOURS.${index}.hours`}
                        defaultValue={item.hours}
                        as="span"
                      />
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-orange-300/70">
            {locale === "es" ? t("footer.explore") : (
              <EditableText
                path="FOOTER.quickLinksLabel"
                defaultValue={FOOTER.quickLinksLabel}
                as="span"
              />
            )}
          </p>
          <nav aria-label="Footer navigation" className="mt-3">
            <ul className="space-y-2 text-sm">
              {footerNav.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-white/70 transition hover:text-orange-200">
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href={SITE_BOOK_PATH}
                  data-analytics-label="Book Online (footer)"
                  className="text-orange-200 transition hover:text-orange-100"
                >
                  {t("cta.bookOnline")}
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      <div className="border-t border-orange-500/20 px-5 py-5 text-center text-[11px] tracking-wide text-white/40 sm:px-8">
        © {year} <EditableText path="SITE.name" defaultValue={site.name} as="span" /> ·{" "}
        {t("footer.rights")}
        {" · "}
        <Link href="/privacy" className="transition hover:text-orange-200">
          {t("footer.privacy")}
        </Link>
        {" · "}
        <Link href="/terms" className="transition hover:text-orange-200">
          {t("footer.terms")}
        </Link>
      </div>
    </footer>
  );
}
