"use client";

import { useLanguage } from "@/components/i18n/LanguageProvider";
import { SITE, SITE_BOOK_PATH } from "@/lib/content";
import { PhoneIcon } from "./icons";

export function StickyBookButton() {
  const { t } = useLanguage();

  return (
    <nav
      aria-label={t("footer.quickActions")}
      className="fixed inset-x-0 bottom-0 z-50 border-t border-orange-500/30 bg-black/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md md:hidden"
    >
      <div className="mx-auto flex max-w-lg gap-2">
        <a
          href={`tel:${SITE.phoneTel}`}
          aria-label={`${t("cta.callNow")} ${SITE.phone}`}
          data-analytics-label="Call Now (sticky)"
          className="flex min-w-[5.5rem] shrink-0 flex-col items-center justify-center gap-0.5 rounded-md border border-orange-400/50 px-3 py-2.5 text-orange-100 transition-colors hover:bg-orange-500/15"
        >
          <PhoneIcon className="h-5 w-5 stroke-orange-100" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.12em]">
            {t("cta.call")}
          </span>
        </a>
        <a
          href={SITE_BOOK_PATH}
          aria-label={t("cta.bookAppointment")}
          data-analytics-label="Book Appointment (sticky)"
          className="flex flex-1 items-center justify-center rounded-md bg-orange-500 px-4 py-3.5 text-sm font-semibold uppercase tracking-[0.14em] text-black transition-colors hover:bg-orange-400"
        >
          {t("cta.bookYourCut")}
        </a>
      </div>
    </nav>
  );
}
