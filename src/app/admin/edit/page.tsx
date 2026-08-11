import type { Metadata } from "next";

import { AdminEditForm } from "@/components/AdminEditForm";
import { SectionLabel } from "@/components/SectionLabel";
import { SITE } from "@/lib/content";

export const metadata: Metadata = {
  title: `Edit Site Text — ${SITE.name}`,
  robots: { index: false, follow: false },
};

type AdminEditPageProps = {
  searchParams: Promise<{ key?: string }>;
};

export default async function AdminEditPage({ searchParams }: AdminEditPageProps) {
  const params = await searchParams;
  const authRequired = Boolean(process.env.ADMIN_UPLOAD_KEY?.trim());

  return (
    <section className="bg-bone px-4 pb-16 pt-28 sm:px-6 sm:pt-32">
      <div className="mx-auto max-w-3xl text-center">
        <SectionLabel>Admin</SectionLabel>
        <h1 className="mt-3 font-serif text-4xl font-semibold text-charcoal sm:text-5xl">
          Edit Site Text
        </h1>
        <p className="mt-4 text-lg text-charcoal/70">
          Turn on inline editing so you can change any text on the site without touching code.
        </p>
        <ol className="mx-auto mt-8 max-w-md space-y-3 text-left text-sm text-charcoal/80">
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brass text-xs font-bold text-bone">
              1
            </span>
            <span>
              {authRequired
                ? "Enter your admin key below (same key used for gallery uploads)."
                : "No admin key is required in this environment — skip to step 2."}
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brass text-xs font-bold text-bone">
              2
            </span>
            <span>Click <strong>Enable edit mode</strong>.</span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brass text-xs font-bold text-bone">
              3
            </span>
            <span>
              You&apos;ll return to the homepage with edit mode on. Click any highlighted text or the{" "}
              <strong>✎</strong> button, edit, then Save.
            </span>
          </li>
        </ol>
        <AdminEditForm authRequired={authRequired} initialKey={params.key} />
      </div>
    </section>
  );
}
