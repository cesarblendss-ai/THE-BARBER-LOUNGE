import { Suspense } from "react";
import { cookies } from "next/headers";

import { HubLogin } from "@hub/components/HubLogin";
import { HubShell } from "@hub/components/HubShell";
import { listSeoClients } from "@hub/lib/clients";
import { isHubAuthenticated } from "@hub/lib/hub-auth";

export default async function HubGroupLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const unlocked = isHubAuthenticated(cookieStore);

  if (!unlocked) {
    return (
      <Suspense>
        <HubLogin />
      </Suspense>
    );
  }

  const clients = await listSeoClients();

  return (
    <Suspense>
      <HubShell clients={clients.map((client) => ({ slug: client.slug, name: client.name }))}>
        {children}
      </HubShell>
    </Suspense>
  );
}
