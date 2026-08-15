# Conversion Audit — The Barber Lounge

**Date:** August 15, 2026  
**Context:** 71% bounce rate, 142 visitors, 64% mobile, traffic from Instagram + Google  
**Goal:** Identify what is NOT closing and fix for low-friction, “obvious” UX (phone → book → done)

---

## Executive summary

Mobile visitors from IG/Google land on a cinematic video hero with **no phone number**, **no address**, and **no walk-in signal** above the fold. Call/Book actions were buried in the hamburger menu or a 2.25s intro splash. Three competing booking paths (Booksy link, sticky bar, chatbot FAB) added confusion. Trust signals (reviews, hours) appeared only after significant scroll.

**Quick wins implemented** in this pass focus on mobile: hero overlay with Book + tap-to-call, sticky bar with visible phone, header Call/Book pills, intro splash skipped on mobile, duplicate hero hidden on mobile, chatbot FAB hidden on mobile.

---

## Not closing (problems) — ranked by impact

### 1. No phone or address above the fold on mobile (HIGH)

**What happens:** First screen was three autoplay videos + a single glass “Book Your Appointment” button. No tap-to-call, no “where are you,” no walk-in cue.

**Why it kills conversion:** IG/Google mobile users want to call or book in one tap. If they don’t see a number, they bounce.

**Evidence:** `HeroVideoGrid` centered one external Booksy CTA over video; `Header` hid Call/Book behind the hamburger on mobile.

---

### 2. Intro splash blocks first interaction ~2.25s (HIGH)

**What happens:** First session visit shows full-screen logo zoom/fade (`IntroSplash`) before any CTA is usable.

**Why it kills conversion:** Paid and social traffic has near-zero patience. A splash with no skip button is a classic bounce trigger.

**Evidence:** `IntroSplash.tsx` — 1400ms zoom + 850ms fade, `z-[200]` overlay.

---

### 3. Duplicate hero / too many choices before services (MEDIUM–HIGH)

**What happens:** After the video hero, a second full hero block repeated logo, headline, “Book Your Appointment,” and “See Our Work” (Instagram).

**Why it kills conversion:** Scroll fatigue + decision paralysis. Instagram secondary CTA sends motivated bookers away from booking.

**Evidence:** `page.tsx` lines 61–111 duplicated hero content below `HeroVideoGrid`.

---

### 4. Three competing booking paths on mobile (MEDIUM)

**What happens:** Sticky Call/Book bar, hero Booksy link, and pulsing chatbot FAB all offer “book” differently (external Booksy vs in-site wizard).

**Why it kills conversion:** Low-intent users don’t know which to tap. Chatbot requires service → day → time → phone steps.

**Evidence:** `StickyBookButton`, `HeroVideoGrid`, `BookingChatbot` FAB at `bottom-[5.75rem]`.

---

### 5. Mobile header had no visible Call/Book (MEDIUM)

**What happens:** Sticky header showed logo + hamburger only. Call and Book lived inside the collapsed menu.

**Why it kills conversion:** Users who don’t open menus never see primary actions.

**Evidence:** `Header.tsx` — CTAs in `lg:flex` desktop block and mobile menu only.

---

### 6. Trust signals buried below fold (MEDIUM)

**What happens:** 5★ rating, review count, and full address only appeared in the second hero section or footer.

**Why it kills conversion:** Cold traffic from Google needs instant legitimacy (reviews + location).

**Evidence:** `HOME.hero.trustBar` below duplicate hero; not in video overlay.

---

### 7. Global 75% root font size shrinks tap targets (LOW–MEDIUM)

**What happens:** `html { font-size: 75% }` makes all rem-based UI ~25% smaller than default.

**Why it kills conversion:** Harder to read and tap on small screens; buttons feel less “obvious.”

**Evidence:** `globals.css` line 7.

---

### 8. Booksy external redirect adds friction (LOW–MEDIUM)

**What happens:** Primary CTAs open Booksy in a new tab — account/app prompts, loading, service picker.

**Why it kills conversion:** Extra steps vs one-tap call or simplified on-site booking.

**Evidence:** `BOOKING_URL` used across site; `/book` redirects externally in `next.config.ts`.

---

## Would close “dumb” traffic (fixes)

| Fix | Why it works |
|-----|----------------|
| **Big “Book Now” + full phone number in hero** | Two obvious actions, zero hunting |
| **“Walk-ins welcome · [address]” under headline** | Answers “can I just show up?” and “where?” instantly |
| **Sticky Call (with number) + Book bar** | Always visible while scrolling |
| **Call + Book in mobile header** | No menu required |
| **Skip intro splash on mobile** | First paint = actionable |
| **Hide chatbot FAB on mobile** | One booking path (Booksy) + call |
| **Hide duplicate desktop hero block on mobile** | Less scroll, less confusion |
| **Show ★ rating under hero CTAs** | Instant trust |
| **Short CTA copy: “Book Now” not “Book Your Appointment”** | Scannable, action-first |

### Copy recommendations (not all implemented)

- Hero headline (mobile): shorter, benefit-first — e.g. “Best Fades in Antioch”
- Replace “See Our Work” with “View Gallery” on same site, or hide on mobile entirely
- Add “Open today until 7 PM” dynamic hours line (requires open/closed logic)
- Google Maps link on address tap

---

## Before / after recommendations

| Area | Before | After (implemented) | File(s) |
|------|--------|---------------------|---------|
| Hero overlay | Single glass Book button over video | Gradient overlay, headline, walk-ins + address, Book Now + Call {phone}, ★ trust | `HeroVideoGrid.tsx` |
| Mobile header | Hamburger only | Call + Book pills + menu | `Header.tsx` |
| Sticky bar | “Call Now” text only | Call label + full phone number | `StickyBookButton.tsx` |
| Intro splash | All viewports, ~2.25s | Skipped on mobile (≤767px) | `IntroSplash.tsx` |
| Duplicate hero | Full block on mobile | Hidden below `md` breakpoint | `page.tsx` |
| Chatbot FAB | Visible on mobile | Hidden on mobile (`md:flex`) | `BookingChatbot.tsx` |
| Desktop hero | Book + Instagram | Book + Call + Instagram | `page.tsx` |

---

## Quick wins vs bigger lifts

### Quick wins (implemented this pass)

- [x] Hero: Book Now + tap-to-call phone + walk-ins/address + reviews
- [x] Mobile header Call + Book always visible
- [x] Sticky bar shows phone number
- [x] Skip intro splash on mobile
- [x] Hide duplicate hero section on mobile
- [x] Hide booking chatbot FAB on mobile (reduce path confusion)

### Quick wins (recommended next)

- [ ] Add `tel:` link on address → Google Maps
- [ ] Show today’s hours in hero (“Open until 7 PM” / “Closed Tuesday”)
- [ ] Shorten hero headline in CMS for mobile
- [ ] Remove or defer “See Our Work” Instagram CTA on homepage
- [ ] Add `pb-safe` for iOS home indicator on sticky bar

### Bigger lifts

- [ ] Replace Booksy redirect with on-site booking as **primary** path (chatbot or simplified form)
- [ ] Remove intro splash entirely (or add Skip button)
- [ ] Restore root font-size to 100% on mobile only
- [ ] Consolidate homepage: one hero, services immediately below on mobile
- [ ] Click-to-call + call tracking (Google Ads call extension alignment)
- [ ] A/B test: call-primary vs book-primary hero for IG vs Google traffic

---

## Mobile above-the-fold map (after fixes)

```
┌─────────────────────────────────┐
│ [Logo]          [Call] [Book] [≡]│  ← Header (sticky)
├─────────────────────────────────┤
│                                 │
│     (3-column video grid)       │
│                                 │
│  Sharp Cuts. Zero Compromise.   │  ← h1
│  Walk-ins welcome · 1518 A St…  │
│                                 │
│  ┌─────────────────────────┐    │
│  │       BOOK NOW          │    │  ← Primary CTA
│  └─────────────────────────┘    │
│  ┌─────────────────────────┐    │
│  │  Call (925) 209-5995    │    │  ← Tap-to-call
│  └─────────────────────────┘    │
│  5★ · 180+ reviews              │
├─────────────────────────────────┤
│ [Call (925)...] [BOOK NOW]      │  ← Sticky bar (fixed bottom)
└─────────────────────────────────┘
```

---

## Metrics to watch post-deploy

| Metric | Current | Target (4–6 weeks) |
|--------|---------|---------------------|
| Bounce rate | 71% | < 55% |
| Avg. session duration | — | Increase |
| Click events: `Call Now (hero)`, `Call Now (sticky)` | — | Track in Vercel Analytics |
| Click events: `Book Now (hero)`, `Book Now (sticky)` | — | Track |
| Mobile bounce | Likely higher | Largest improvement expected |

---

## Reviews bottleneck (primary growth lever)

**Problem:** Traffic and booking UX can improve, but **Google review velocity** is the constraint on local pack rank, cold-traffic trust, and word-of-mouth scale. A 5★ profile with stale review count underperforms against shops actively asking happy clients.

**Strategy:** One premium funnel — staff text `/review` → branded landing → single Google CTA. No Yelp clutter, no discount-for-review gimmicks.

### Tactics implemented

| Tactic | URL / location | Use |
|--------|----------------|-----|
| **Staff text link** | `https://thebarberlounge.com/review` | Barber texts after a great cut — short, on-brand |
| **Review landing page** | `/review` | Dark/brass page, one button → Google |
| **Homepage section** | After testimonials | Subtle “Enjoyed your visit?” CTA |
| **Post-booking receipt** | Booking chatbot confirmation | Brass “Leave a Google review” button → `/review` |
| **In-shop QR card** | `/review-qr` | Print at mirror/checkout; scan → Google (or `/review` until GBP link set) |
| **Staff hub** | `/admin` | Review link tile for copy/paste |

### Staff workflow

1. **After every great cut:** Text the client `thebarberlounge.com/review` (full URL on `/admin` hub).
2. **At checkout:** Point to printed QR from `/review-qr`.
3. **Online bookers:** Receipt in booking wizard includes review CTA automatically.

### Cesar setup (required once)

In `src/lib/content.ts`:

- **Option A (recommended):** Paste GBP link into `GOOGLE_REVIEW_URL`  
  Google Business Profile → **Ask for reviews** → **Share review form** → copy link  
  Format: `https://g.page/r/XXXXX/review`
- **Option B:** Set `GOOGLE_PLACE_ID` (e.g. `ChIJ...`) — site auto-builds writereview URL

Until configured, `/review` shows a fallback message; QR points to `/review` instead of Google direct.

### Metrics to watch

| Metric | Target |
|--------|--------|
| New Google reviews / month | Track in GBP dashboard |
| Clicks: `Leave a review (homepage)`, `Leave a Google Review (review page)` | Vercel Analytics |
| Staff adoption | Team texts `/review` after 3+ star experiences |

### Recommended next (reviews)

- [ ] Post-service SMS with review link (Twilio, after Trust Hub KYC)
- [ ] Barber-specific review ask (“Tell Google about Braulio’s fade”)
- [ ] Monthly review count sync in `SITE.reviewCount` for hero trust line

---

## Premium conversion refinements (this pass)

Prior agent pass optimized mobile bounce; this pass **refined aesthetic** to match Walnut Creek / luxury barbershop tone:

| Element | Refinement |
|---------|------------|
| Sticky bar | Dark charcoal + brass — phone icon + “Book Appointment” (not loud “BOOK NOW”) |
| Hero trust line | “Antioch · By appointment & walk-in” + address secondary |
| Review CTAs | Brass/dark only — no red/yellow urgency |

---

## Files changed (implementation)

- `src/components/HeroVideoGrid.tsx` — hero overlay, CTAs, trust
- `src/components/Header.tsx` — mobile Call/Book pills
- `src/components/StickyBookButton.tsx` — dark/brass sticky bar, phone icon, “Book Appointment”
- `src/components/IntroSplash.tsx` — skip on mobile
- `src/components/BookingChatbot.tsx` — hide FAB on mobile
- `src/components/LeaveReviewSection.tsx` — homepage review CTA
- `src/components/BookingReceipt.tsx` — post-book review button
- `src/components/PrintButton.tsx` — printable QR card
- `src/app/page.tsx` — pass headline to hero; hide duplicate section on mobile; review section
- `src/app/review/page.tsx` — Google review landing
- `src/app/review-qr/page.tsx` — printable in-shop QR
- `src/app/admin/page.tsx` — staff hub with review link
- `src/lib/content.ts` — `GOOGLE_REVIEW_URL`, `GOOGLE_PLACE_ID`
- `src/lib/reviews.ts` — review URL helpers
- `docs/CONVERSION-AUDIT.md` — this document
