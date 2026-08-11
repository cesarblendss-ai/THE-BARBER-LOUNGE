import { loadSiteContent, saveSiteContent } from "./site-content-store";
import { getValueAtPath, setValueAtPath } from "./site-content-path";
import type { SiteContent } from "./site-content-types";

export type { SiteContent } from "./site-content-types";

export async function getSiteContent(): Promise<SiteContent> {
  return loadSiteContent();
}

export async function getSiteContentValue(path: string): Promise<string | undefined> {
  const value = getValueAtPath(await getSiteContent(), path);
  return typeof value === "string" ? value : undefined;
}

export async function updateSiteContentValue(path: string, value: string): Promise<SiteContent> {
  const current = await getSiteContent();
  const existing = getValueAtPath(current, path);

  if (typeof existing !== "string") {
    throw new Error(`Path "${path}" is not an editable string field`);
  }

  const updated = setValueAtPath(current, path, value) as SiteContent;
  await saveSiteContent(updated);
  return updated;
}
