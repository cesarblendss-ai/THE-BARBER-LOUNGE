/** Client-readable edit mode cookie (not httpOnly). */
export const EDIT_MODE_COOKIE = "tbl_edit";

export function readEditModeCookie(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie
    .split(";")
    .some((part) => part.trim() === `${EDIT_MODE_COOKIE}=1`);
}
