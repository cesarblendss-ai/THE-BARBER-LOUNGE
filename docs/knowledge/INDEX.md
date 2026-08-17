# Topic Index

> **Restructured (2026-08-08):** Knowledge now lives in two folders:
>
> - **`docs/org-conventions/`** — read-only reference (style, security, architecture, business facts)
> - **`docs/team-memory/`** — read-write working state (deploy, blockers, SMS status, flaky tests)
>
> Read org-conventions first, then team-memory for current status.

---

## Quick routing

| If you're talking about… | Read this file |
|--------------------------|----------------|
| Brand voice, colors, no "Bet" | `docs/org-conventions/style-guide.md` |
| Secrets, ADMIN_UPLOAD_KEY, env safety | `docs/org-conventions/security.md` |
| Phone, address, hours, team, services | `docs/org-conventions/barber-lounge-facts.md` |
| SEO packages, agent runs, VA workflow | `docs/org-conventions/local-seo-playbook.md` |
| Agency pricing, 20 clients, upsells | `docs/org-conventions/marketing-agency-scale.md` |
| Stack choices, env var names | `docs/org-conventions/tech-stack-decisions.md` |
| Booking wizard, receipts, notifications | `docs/org-conventions/booking-system.md` |
| **Production URL, deploy date, Vercel env** | `docs/team-memory/deploy.md` |
| **Open blockers (Twilio, Postgres, domain)** | `docs/team-memory/current-blockers.md` |
| **SMS KYC, error 20003, Twilio checklist** | `docs/team-memory/twilio-sms-status.md` |
| **OneDrive .next, dev server, SEO v1 bug** | `docs/team-memory/flaky-tests.md` |
| **Key paths map (src/, api, admin)** | `docs/team-memory/repo-layout.md` |
| **Cesar’s Hub (standalone estimates app)** | `cesars-hub/README.md` |
| **Estimates + Stripe deposit setup** | `docs/team-memory/estimates-stripe.md` |

---

## Legacy files (redirects)

These files in `docs/knowledge/` are kept for old links. **Canonical copies** are in org-conventions or team-memory:

| Legacy file | Canonical location |
|-------------|-------------------|
| `barber-lounge-facts.md` | `docs/org-conventions/barber-lounge-facts.md` |
| `local-seo-playbook.md` | `docs/org-conventions/local-seo-playbook.md` |
| `marketing-agency-scale.md` | `docs/org-conventions/marketing-agency-scale.md` |
| `tech-stack-decisions.md` | `docs/org-conventions/tech-stack-decisions.md` |
| `booking-system.md` | `docs/org-conventions/booking-system.md` |
| `vercel-deploy-status.md` | `docs/team-memory/deploy.md` |
| `twilio-sms-status.md` | `docs/team-memory/twilio-sms-status.md` |

---

## Quick paths (unchanged)

| Need | Go to |
|------|-------|
| Site copy source of truth | `src/lib/content.ts` |
| SEO client profile | `tools/seo-agent/clients/the_barber_lounge.json` |
| Latest SEO agent output | `tools/seo-agent/output/the_barber_lounge_2026_08_08_v2/` |
| Appointments on disk | `data/appointments.json` |
| Admin SMS setup UI | `/admin/sms-setup` → `src/app/admin/sms-setup/page.tsx` |
