# Security Conventions

**Last verified:** 2026-08-08

Rules for secrets, admin access, and safe agent behavior on this project.

---

## Never commit secrets

| Rule | Detail |
|------|--------|
| **`.env.local` is gitignored** | Real keys live only locally and on Vercel dashboard |
| **Use `.env.example`** | Document variable *names* only — never real values |
| **No secrets in chat** | Agents must not paste `TWILIO_AUTH_TOKEN`, `ADMIN_UPLOAD_KEY`, API keys, or database URLs |
| **No secrets in docs** | Refer to variable names; say "set in Vercel" not the value |

If a secret was accidentally committed: rotate immediately, remove from git history if needed.

---

## Admin access — `ADMIN_UPLOAD_KEY`

Protects:

- `/admin/*` pages (edit, hero, gallery, appointments, analytics, notifications, sms-setup)
- Upload APIs (`/api/upload-hero-video`, `/api/upload-gallery`)
- Analytics API when configured
- Edit mode cookie via `/api/admin/edit-auth`

**How it works:**

1. User enters key at `/admin/edit` (or protected admin routes)
2. Server sets httpOnly cookie on successful auth
3. `EditModeRoot`, upload handlers, and analytics check the cookie

**Production:** Key must be set in Vercel Environment Variables (Production). Redeploy after adding.

**Agent rule:** Never output the key value. Say "use the key from `.env.local` or Vercel dashboard."

---

## Environment variables (reference)

Full list and purposes: `tech-stack-decisions.md` → Environment variables.

**High-sensitivity:**

| Variable | Risk if leaked |
|----------|----------------|
| `TWILIO_AUTH_TOKEN` | Send SMS, charge account |
| `OPENAI_API_KEY` | API spend |
| `ADMIN_UPLOAD_KEY` | Full admin + upload access |
| `DATABASE_URL` | Read/write analytics DB |

**Lower sensitivity (still don't commit):**

| Variable | Notes |
|----------|-------|
| `TWILIO_ACCOUNT_SID` | Public-ish but keep private |
| `TWILIO_PHONE_NUMBER` | Public on receipts anyway |
| `NTFY_TOPIC` | Anyone with topic can spam owner push |

---

## Vercel production

- Set env vars in Project → Settings → Environment Variables → **Production**
- After changes: redeploy (`npx vercel --prod --yes`)
- **Deployment Protection:** When ON, team URLs require Vercel SSO — see `docs/team-memory/deploy.md` for current status

---

## SEO agent secrets

Separate env in `tools/seo-agent/.env`:

- `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `SERPER_API_KEY`

Not used by the Next.js app at runtime. Keep out of committed files.

---

## Agent checklist

1. Never paste values from `.env.local` into chat or markdown
2. Never commit `.env`, `.env.local`, or credential files
3. When documenting setup, use placeholders: `your-admin-key-here`
4. Warn Cesar if a file looks like it contains a real secret before committing
