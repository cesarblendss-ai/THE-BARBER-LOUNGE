# Style Guide — The Barber Lounge

**Last verified:** 2026-08-08  
**Copy source of truth:** `src/lib/content.ts`

---

## Brand colors

From `tailwind.config.ts`:

| Token | Hex | Use |
|-------|-----|-----|
| `charcoal` | `#1A1A1A` | Primary text, dark backgrounds |
| `bone` | `#F2EFEA` | Page background, light surfaces |
| `brass` | `#B08D57` | Primary accent, CTAs, highlights |
| `brass-dark` | `#7A6035` | Hover states, secondary accent text |
| `burgundy` | `#6E1F2B` | Destructive / delete actions only |

**Typography:** Fraunces (serif headings via `--font-fraunces`), Inter (sans body via `--font-inter`). Uppercase + wide tracking (`tracking-wider`, `tracking-label`) for buttons and labels.

---

## Voice and tone

**Barbershop front desk in Antioch — not corporate, not slang-heavy.**

From `src/lib/booking-config.ts`:

> Short, friendly, human — like a barber shop front desk in Antioch. Never corporate.

### Do

- Direct, warm, confident — "Sharp Cuts. Real Craftsmanship."
- Precision and craft language: fades, tapers, line-ups, consultation, Hot Lather Finish
- Local pride: Antioch, East Bay, community
- One question at a time in booking/chat flows
- Mirror the customer's words ("fade", "line up") instead of repeating menu titles

### Don't

- **No "Bet"** — avoid Gen-Z filler ("Bet — what day works?"). Used in old receptionist script examples in `src/lib/booking-agent/receptionist-scripts.ts`; do **not** use on the public site, SMS, or new chat copy.
- No corporate speak: "We'd be delighted to assist you with your grooming needs"
- No hype spam: "BEST BARBERS IN THE BAY!!!"
- No gambling language (ironic given the name — never lean into "bet" puns)
- No placeholder pricing on public pages (services starting with `[` in `content.ts` stay hidden)

### Site copy patterns (from `content.ts`)

| Element | Pattern |
|---------|---------|
| Hero eyebrow | ALL CAPS, location-forward: "ANTIOCH'S PREMIER BARBERSHOP EXPERIENCE" |
| Headline | Short punchy pairs: "Sharp Cuts. Real Craftsmanship. Zero Compromise." |
| CTAs | Action-first: "Book Your Appointment", "See Our Work" |
| Trust bar | Rating + review count + address inline |

---

## SEO and blog content

- Target local keywords: Antioch barbershop, fades Antioch, etc.
- Match site voice — helpful neighbor barber, not agency brochure
- See `local-seo-playbook.md` for deliverable formats
- Generated posts live under `tools/seo-agent/output/` — edit before publishing to match this guide

---

## SMS and notifications

- Branded but brief — confirmation code, service, time, address, shop phone
- No emoji spam; one line breaks OK
- Templates: `src/lib/sms-receipt.ts`
