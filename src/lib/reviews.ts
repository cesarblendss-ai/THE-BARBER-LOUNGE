import { GOOGLE_REVIEW_URL } from "./content";
import { SITE_URL } from "./constants";

export const REVIEW_LANDING_PATH = "/review";
export const REVIEW_QR_PATH = "/review-qr";

/** Short link staff text to clients — lands on the premium /review page. */
export function getReviewLandingUrl(): string {
  return `${SITE_URL}${REVIEW_LANDING_PATH}`;
}

export function getGoogleReviewHref(): string {
  return GOOGLE_REVIEW_URL;
}

/** True when Cesar has replaced the GBP placeholder. */
export function isGoogleReviewConfigured(): boolean {
  const url = GOOGLE_REVIEW_URL.trim();
  return url.length > 0 && !url.includes("REPLACE_WITH_GBP_REVIEW_LINK");
}

export function getReviewQrTargetUrl(): string {
  return isGoogleReviewConfigured() ? getGoogleReviewHref() : getReviewLandingUrl();
}

export function getQrCodeImageUrl(data: string, size = 400): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}&margin=10&color=1A1A1A&bgcolor=F2EFEA`;
}
