/**
 * Live Booksy availability sync — alias of refresh-availability.
 * Prefer this path in docs/ops when the intent is "pull Booksy opens".
 */
export { GET, POST, runtime, dynamic } from "@/app/api/cron/refresh-availability/route";
