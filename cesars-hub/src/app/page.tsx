import { cookies } from "next/headers";

import { EstimatesBoard } from "@/components/EstimatesBoard";
import { HubLogin } from "@/components/HubLogin";
import { HUB } from "@/lib/brand";
import { isHubAuthenticated } from "@/lib/hub-auth";

export const dynamic = "force-dynamic";

export default async function HubHomePage({
  searchParams,
}: {
  searchParams: Promise<{ biz?: string; production?: string; key?: string }>;
}) {
  const params = await searchParams;
  const cookieStore = await cookies();
  const unlocked = isHubAuthenticated(cookieStore);
  const biz = params.biz?.trim() || null;

  if (!unlocked) {
    return <HubLogin biz={biz} />;
  }

  const authRequired = Boolean(process.env.HUB_KEY?.trim() || process.env.ADMIN_UPLOAD_KEY?.trim());

  return (
    <section className="bg-bone px-4 pb-16 pt-12 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <p className="font-sans text-xs font-semibold uppercase tracking-label text-charcoal/60">
          {HUB.owner}
        </p>
        <h1 className="mt-3 font-serif text-4xl font-semibold text-charcoal sm:text-5xl">
          {HUB.name}
        </h1>
        <p className="mt-4 text-lg text-charcoal/70">
          Estimates, e-sign, and deposits. This is not The Barber Lounge website.
        </p>
        {biz ? (
          <p className="mt-2 text-sm text-charcoal/55">
            Client: <span className="font-medium text-charcoal">{biz}</span>
          </p>
        ) : null}
        <EstimatesBoard authRequired={authRequired} initialKey={params.key} />
      </div>
    </section>
  );
}
