# VA Publishing Checklist

Use this checklist every month after the owner sends you an output folder (e.g. `output/the_barber_lounge_2026_08_08/`).

**Rule:** Publish exactly what the agent produced. Do not rewrite headlines, change keywords, or edit body copy unless the owner explicitly asks.

---

## Before you start

- [ ] Confirm you have the correct output folder for this client and month
- [ ] Confirm CMS / site admin access works (log in and load the homepage)
- [ ] Confirm Google Business Profile access (Manager role minimum)
- [ ] Read `client_report.md` — this is what the client sees; do not publish this to their website
- [ ] Flag anything that looks wrong (wrong city, wrong phone, placeholder text like `[PHONE]`) to the owner **before** publishing

---

## Step 1 — Publish 4 blog posts

Source files: `blog_post_1.md` through `blog_post_4.md`

For each post:

1. **Extract metadata** from the top of the file:
   - `TITLE:` → page title / H1
   - `META DESCRIPTION:` → meta description field
   - `SLUG:` → URL path (e.g. `best-fade-antioch-ca` → `/blog/best-fade-antioch-ca`)

2. **Create the blog page** in the client's CMS:
   - Paste the article body below the metadata block
   - Preserve H1, H2, H3 structure — do not flatten headings
   - Keep internal linking suggestions as actual links if target pages exist; otherwise leave as plain text and note to owner

3. **Set SEO fields:**
   - Title tag: use `TITLE` value (50–60 chars)
   - Meta description: use `META DESCRIPTION` value (145–155 chars)
   - URL slug: use `SLUG` value exactly

4. **Add a featured image** if the owner provided one; otherwise use an existing gallery/shop photo (ask owner if unsure)

5. **Publish** (or schedule one per week if owner prefers drip publishing)

6. **Update the blog index page** to list the new posts with title + excerpt + link

### Next.js sites (like The Barber Lounge)

Until individual blog routes exist, coordinate with the owner on one of:

- Add MDX/markdown files under `src/app/blog/[slug]/`
- Add entries to a blog data file the owner maintains
- Do **not** replace the entire `/blog` page with a single post

After publishing, confirm each URL returns **200** and appears in `/sitemap.xml`.

---

## Step 2 — Google Business Profile posts

Source file: `gbp_posts.md`

For each of the 4 weekly posts:

1. Log into [Google Business Profile](https://business.google.com)
2. Select the correct business listing
3. Click **Add update** → **Post**
4. Copy the post body from the matching `WEEK N` section
5. Set the **CTA button** as specified (`CALL`, `BOOK`, `LEARN MORE`, or `OFFER`)
6. Add a photo if available (shop interior, team, or service result)
7. **Schedule or publish:**
   - Week 1 → publish now
   - Week 2 → publish +7 days (or schedule if GBP supports it)
   - Week 3 → publish +14 days
   - Week 4 → publish +21 days

**Do not** post all 4 at once unless the owner says to.

---

## Step 3 — Meta tags

Source file: `meta_tags.md`

Update title tags and meta descriptions on these pages:

| Page | Where to edit (Next.js) | Where to edit (WordPress) |
|---|---|---|
| Homepage | `src/app/layout.tsx` or `src/app/page.tsx` → `metadata` | Yoast / Rank Math on homepage |
| Services | `src/app/services/page.tsx` | Services page SEO plugin fields |
| Contact | `src/app/contact/page.tsx` | Contact page SEO plugin fields |
| About | `src/app/about/page.tsx` | About page SEO plugin fields |
| FAQ | `src/app/faq/page.tsx` | FAQ page SEO plugin fields |
| Each blog post | Post-level `metadata` or SEO plugin | Per-post Yoast / Rank Math |

For each entry in `meta_tags.md`:

- [ ] Title tag updated (50–60 characters)
- [ ] Meta description updated (145–155 characters)
- [ ] H1 on the live page matches the H1 suggestion (or is close — ask owner if conflict)

**Verify:** View page source or use a browser extension to confirm new title/description appear.

---

## Step 4 — Schema markup

Source file: `schema_markup.json`

1. Open the file and validate JSON (no trailing commas, proper quotes)
2. Compare with existing schema on the site — **merge, do not replace blindly**

### For Next.js sites (The Barber Lounge)

Live schema lives in:

- `src/lib/content.ts` → `LOCAL_BUSINESS_SCHEMA`
- `src/lib/seo.ts` → `buildLocalBusinessJsonLd()`
- Injected in `src/lib/layout.tsx` via `<script type="application/ld+json">`

**Safe to add from agent output:**

- `hasOfferCatalog` with services
- `areaServed` cities
- `email` if missing
- `image` / `logo` URL

**Do NOT change:**

- `aggregateRating` values — keep live `SITE.rating` and `SITE.reviewCount`
- `telephone` — keep verified business phone
- `openingHoursSpecification` — keep exact hours from site (agent may be approximate)
- `@type` — keep `BarberShop` (or whatever is already live)

3. Test after deploy: [Google Rich Results Test](https://search.google.com/test/rich-results)

---

## Step 5 — On-page audit (quick wins only)

Source file: `onpage_audit.md`

Work through items marked **QUICK WINS** and **CRITICAL** only unless the owner assigns more.

Common tasks:

- [ ] Add missing alt text to images
- [ ] Fix broken internal links
- [ ] Add city name to page titles that are missing it
- [ ] Submit updated sitemap in Google Search Console
- [ ] Respond to unanswered GBP Q&A

Do **not** redesign pages, change brand colors, or rewrite marketing copy.

---

## Step 6 — Citations (Dominator clients only)

Source file: `onpage_audit.md` → **LOCAL CITATION CHECKLIST**

For each directory listed:

1. Create or claim the listing
2. Use **exact** NAP (Name, Address, Phone) from the client config — no variations
3. Match categories to GBP primary category
4. Add website URL and hours
5. Mark complete in the shared tracker

---

## Step 7 — Done — notify owner

Send the owner a brief message:

```
✅ [Client Name] — [Month] publish complete

Blog posts:
- /blog/[slug-1] ✓
- /blog/[slug-2] ✓
- /blog/[slug-3] ✓
- /blog/[slug-4] ✓

GBP posts: 4 scheduled (Week 1 live, 2–4 queued)
Meta tags: Homepage, Services, Contact, About, FAQ + 4 blog posts
Schema: Merged hasOfferCatalog + areaServed
Audit quick wins: [list what you did]

Issues / questions:
- [anything flagged]
```

---

## What NOT to touch

| Do not edit | Why |
|---|---|
| **Google reviews / testimonials** | Real customer data — legal and trust risk |
| **`aggregateRating` in schema** | Must match real review count |
| **Booking URLs** (Booksy, Calendly, etc.) | Breaks client revenue |
| **Phone numbers** | Must match GBP and SMS systems |
| **Brand colors, fonts, layout** | Not your scope — SEO publishing only |
| **Gallery photos** | Owner-managed unless explicitly assigned |
| **Admin keys / API keys / `.env` files** | Security — never share or commit |
| **Booking chatbot / SMS / analytics code** | Owner or dev handles |
| **Pricing on services page** | Owner sets prices — do not change |
| **Team bios / staff names** | Owner-verified content |
| **`data/appointments.json` or database records** | Customer data |
| **Twilio, Stripe, or payment settings** | Owner-only |
| **Domain / DNS / SSL settings** | Owner or dev only |
| **Blog post body copy** | Agent-written for SEO — flag errors to owner, don't rewrite |

When in doubt, **ask the owner before changing anything not listed in this checklist.**

---

## Troubleshooting

| Problem | Action |
|---|---|
| Placeholder text like `[PHONE]` or `[WEBSITE]` in output | Stop. Tell owner before publishing. |
| Agent used wrong city or competitor name | Stop. Owner re-runs agent with corrected config. |
| CMS doesn't have a blog section yet | Publish to Google Doc formatted as final; owner/dev creates routes. |
| GBP post rejected | Check for policy violations (no phone in post body, no URLs in offer posts). |
| Schema test fails | Send JSON + error to owner — do not guess fixes. |
| Meta title too long | Trim from the end, keep primary keyword + city. Ask owner if unsure. |
