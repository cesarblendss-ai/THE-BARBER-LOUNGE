import { loadSiteContent, saveSiteContent } from "./site-content-store";
import { getValueAtPath, setValueAtPath } from "./site-content-path";
import type { SiteContent } from "./site-content-types";

export type { SiteContent } from "./site-content-types";

export function getSiteContent(): SiteContent {
  return loadSiteContent();
}

export function getSiteContentValue(path: string): string | undefined {
  const value = getValueAtPath(getSiteContent(), path);
  return typeof value === "string" ? value : undefined;
}

export function updateSiteContentValue(path: string, value: string): SiteContent {
  const current = getSiteContent();
  const existing = getValueAtPath(current, path);

  if (typeof existing !== "string") {
    throw new Error(`Path "${path}" is not an editable string field`);
  }

  const updated = setValueAtPath(current, path, value) as SiteContent;
  saveSiteContent(updated);
  return updated;
}
