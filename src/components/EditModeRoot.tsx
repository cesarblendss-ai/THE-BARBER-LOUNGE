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
  adminAuthenticated: boolean;
  children: React.ReactNode;
};

export function EditModeRoot({ cookieEnabled, adminAuthenticated, children }: EditModeRootProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [clientCookieEnabled, setClientCookieEnabled] = useState(false);

  useEffect(() => {
    setClientCookieEnabled(readEditModeCookie());
  }, [pathname, searchParams, cookieEnabled]);

  const enabled =
    adminAuthenticated && (cookieEnabled || clientCookieEnabled);

  return (
    <EditModeProvider enabled={enabled}>
      <EditToastProvider>
        {adminAuthenticated ? <EditModeBanner /> : null}
        {adminAuthenticated ? <EditSiteTextButton /> : null}
        {children}
      </EditToastProvider>
    </EditModeProvider>
  );
}
