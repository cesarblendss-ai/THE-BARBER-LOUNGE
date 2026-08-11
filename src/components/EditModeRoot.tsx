"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { EditModeBanner } from "./EditModeBanner";
import { EditModeProvider } from "./EditModeProvider";
import { EditSiteTextButton } from "./EditSiteTextButton";
import { EditToastProvider } from "./EditToast";
import { readEditModeCookie } from "@/lib/edit-mode-client";

type EditModeRootProps = {
  cookieEnabled: boolean;
  children: React.ReactNode;
};

export function EditModeRoot({ cookieEnabled, children }: EditModeRootProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const queryEnabled = searchParams.get("edit") === "1";
  const [clientCookieEnabled, setClientCookieEnabled] = useState(false);

  useEffect(() => {
    setClientCookieEnabled(readEditModeCookie());
  }, [pathname, searchParams, cookieEnabled]);

  const enabled = cookieEnabled || queryEnabled || clientCookieEnabled;

  return (
    <EditModeProvider enabled={enabled}>
      <EditToastProvider>
        <EditModeBanner />
        <EditSiteTextButton />
        {children}
      </EditToastProvider>
    </EditModeProvider>
  );
}
