# Retail Product Tracking — The Barber Lounge

Problem: ~$600 retail buy-in with ~3× markup should be profitable, but barbers grab product without logging or paying — inventory shrinks with no record.

This doc covers tier options, shop rules, the software MVP, and optional door-sensor hardware.

---

## Tier comparison

| | **Tier 0 — Software only** | **Tier 1 — Door sensor + software** | **Tier 2 — Retail POS** |
|---|---|---|---|
| **Cost** | $0 (uses existing site) | ~$30–80 one-time | ~$49–89/mo + hardware |
| **Setup time** | 1–2 hours | Half day | 1–2 days + training |
| **Catches “forgot to log”** | Culture + weekly reconcile | ntfy ping when cabinet opens | Payment required at checkout |
| **Barber friction** | Tap `/shop-log` on phone | Same + push reminder | Full POS flow per item |
| **Owner visibility** | Admin dashboard, unpaid totals | Same + real-time open alerts | Square/Clover reports |
| **Best for** | Start immediately, test habit | Habit still weak after Tier 0 | High volume or client-facing retail |

**Recommendation:** Start **Tier 0** this week. Add **Tier 1** if pings help after 2–3 weeks. Skip Tier 2 unless you sell heavily to walk-in clients at the chair.

---

## Motion vs door contact vs PIN lock

| Approach | What it detects | Solves “forgot to pay”? |
|---|---|---|
| **PIR motion sensor** | Movement in the room | **No.** Barbers walk past the cabinet all day — constant false alerts. Cannot tie an open event to a person or product. |
| **Door contact (reed switch)** | Cabinet door actually opened | **Partially.** Creates accountability moment: owner gets ping → barber should log within 5 min. Does not stop theft alone. |
| **PIN / smart lock on cabinet** | Who unlocked | **Stronger deterrent**, but slower (PIN every grab) and batteries/Wi-Fi hassle. |
| **Software log (`/shop-log`)** | Voluntary record | **Yes, if enforced** — weekly settle makes debt visible. |
| **POS (Square/Clover)** | Paid transaction | **Yes for compliance**, overkill for internal barber grabs. |

**Motion alone fails** because it measures presence, not access. A barber leaning over the chair triggers it; so does a client. You cannot reconcile “motion at 2:14pm” with “who took the pomade.”

**What actually works:** door contact → ntfy ping with link to `/shop-log` → weekly admin reconcile → mark paid. Culture rule: *open cabinet = log within 5 minutes.*

---

## Shop rules (post in back room)

1. **Take product → log within 5 minutes** at `/shop-log` (bookmark on every barber phone).
2. **Pay weekly** — cash or Venmo to shop. Owner marks “Paid” in admin.
3. **No log = assumed purchase** — owner runs the [Friday reconcile checklist](operations/friday-reconcile.md) every week.
4. **Client sales** — barber logs same way; money goes in shop drawer, owner marks paid when deposited.
5. **Low stock** — tell owner before grabbing the last unit.

---

## Software MVP (built in this repo)

### Routes

| URL | Who | Purpose |
|---|---|---|
| `/shop-log` | Everyone / barbers | Public product grid; barbers unlock **Team log** with 4-digit code |
| `/admin/products?key=…` | Owner | Inventory, sales, mark paid, weekly balance |
| `POST /api/cabinet-event` | Door sensor | Webhook → ntfy “cabinet opened” + link to `/shop-log` |

### Data

- **Postgres** (when `DATABASE_URL` set): `Product`, `ProductSale` models in `prisma/schema.prisma`
- **JSON fallback**: `data/products.json` (same pattern as appointments)

### Seeded inventory (Aug 2026)

Initial stock from owner notebook. **All retail products sell for $18.00 each** (`priceCents: 1800`). Edit anytime in `/admin/products`.

| Product | Stock | Retail |
|---|---:|---:|
| Sculpting Clay | 4 | $18.00 |
| Spider Wax | 12 | $18.00 |
| Leave in Conditioner | 12 | $18.00 |
| Cool Care | 6 | $18.00 |
| Styling Powder | 8 | $18.00 |
| Sanek Strips | 2 | $18.00 |
| After Shave | 3 | $18.00 |
| Hair Spray | 3 | $18.00 |

**Total units on hand:** 50

Import to Postgres after deploy: `npm run db:seed-products`

**Barbers on `/shop-log`:** `RETAIL_BARBERS` in `src/lib/retail-config.ts` includes **Sebastian Guardado** (Sebas) and **Kristian Guerra**.

### `/shop-log` UX

1. **Default (no PIN):** Read-only grid — product name, **$18.00**, and “X left” stock count.
2. **Team log:** Barbers tap **Team log** → enter **4-digit code** → log form (name, product, qty).
3. After logging, stay in barber mode or tap **View products** / **Lock** to return.

### Env vars (`.env.local` / Vercel)

```env
NTFY_TOPIC=your-secret-topic          # already used for bookings — same app subscription
RETAIL_LOG_PIN=1847                   # 4-digit team code — set on Vercel for production
CABINET_WEBHOOK_SECRET=random-string  # optional — protect cabinet webhook
ADMIN_UPLOAD_KEY=...                  # protects admin API
```

**PIN behavior:**

| Environment | `RETAIL_LOG_PIN` | Team log access |
|---|---|---|
| Local dev | unset | Code **1847** (dev default) |
| Local dev | set | Your code |
| Production | set on Vercel | Your code — share with barbers only |
| Production | unset | No PIN gate (set `RETAIL_LOG_PIN` on Vercel before go-live) |

After adding Postgres models: `npm run db:push`

### Cabinet webhook

Point your sensor hub at:

```http
POST https://your-site.vercel.app/api/cabinet-event
Header: x-cabinet-secret: YOUR_SECRET
Body: {"event":"open","source":"aqara"}
```

Response includes ntfy delivery status and the log URL.

---

## Tier 1 hardware shopping list (~$30–80)

### Option A — Aqara (easiest, no soldering)

| Item | Approx. price | Notes |
|---|---|---|
| [Aqara Door/Window Sensor P2](https://www.amazon.com/s?k=Aqara+Door+Window+Sensor+P2) | ~$18–25 | Zigbee 3.0, mounts on cabinet door |
| [Aqara Hub M2](https://www.amazon.com/s?k=Aqara+Hub+M2) | ~$35–45 | Required; Wi-Fi + automations |
| USB power for hub | — | Near cabinet or back office |

**Automation:** Aqara app → Home Assistant (optional) or IFTTT/webhook → `POST /api/cabinet-event`.  
For direct webhook without Home Assistant, use **Home Assistant on a Pi** or **Node-RED** on the hub’s LAN — Aqara Cloud alone does not expose raw webhooks; see Option B for DIY webhook.

### Option B — ESP32 + reed switch (cheapest webhook)

| Item | Approx. price | Notes |
|---|---|---|
| [ESP32 dev board (WROOM-32)](https://www.amazon.com/s?k=ESP32+WROOM-32+development+board) | ~$8–12 | Wi-Fi MCU |
| [Magnetic reed switch (NC/NO)](https://www.amazon.com/s?k=magnetic+reed+switch+door) | ~$5–8 | Glue on cabinet frame + door |
| [Micro USB cable + 5V adapter](https://www.amazon.com/s?k=5v+micro+usb+power+supply) | ~$6–10 | Permanent power (avoid battery) |
| Jumper wires | ~$3 | Breadboard optional |

**Firmware sketch (concept):** on GPIO interrupt when door opens → `HTTP POST` to `/api/cabinet-event` with `x-cabinet-secret`. Debounce 30s to avoid double-fires.

### Option C — Shelly Door (Wi-Fi, webhook-native)

| Item | Approx. price | Notes |
|---|---|---|
| [Shelly Door Window 2](https://www.amazon.com/s?k=Shelly+Door+Window+2) | ~$15–20 | Wi-Fi, built-in webhook actions |

Configure Shelly app: **Actions → URL** on open → your `/api/cabinet-event` URL.

---

## Tier 2 — Square / Clover (reference)

| | **Square for Retail** | **Clover Go / Station** |
|---|---|---|
| Monthly | ~$0 + 2.6% + 10¢ (no monthly on free plan) | ~$49–89/mo + processing |
| Staff accounts | Yes — pin per employee | Yes |
| Inventory | Built-in | Built-in |
| Pros | Low upfront, familiar | Strong reporting |
| Cons | Extra step for internal grabs; barbers may skip | Monthly cost hard to justify for ~$600 stock |

Use Tier 2 if clients buy product at checkout regularly. For barber self-use, Tier 0/1 fits better.

---

## Phase 2 (not built yet)

From owner notes — track separately from retail MVP:

- **Booth rent:** $250
- **Commission splits:** Sebas 25%, Kristian 20%

Would extend admin or a payroll view; not in scope for Tier 0.

---

## Friday weekly ritual

Every Friday (~15 min): review **Weekly balance** in `/admin/products`, count physical stock against the admin **Inventory** table and owner notebook, collect Venmo or cash from each barber, then **Mark paid** on each settled sale.

**Full step-by-step checklist:** [docs/operations/friday-reconcile.md](operations/friday-reconcile.md)

---

## Rollout checklist for Cesar

1. [x] Products + stock seeded in `data/products.json` (verify/adjust prices in `/admin/products`)
2. [ ] Set `RETAIL_LOG_PIN` and share `/shop-log` link with team
3. [ ] Print shop rules; review in huddle
4. [ ] Friday: run [friday-reconcile.md](operations/friday-reconcile.md) — unpaid totals, stock count, mark paid
5. [ ] If logs still missed after 2 weeks → order Shelly DW2 or ESP32 kit
6. [ ] Configure sensor → `/api/cabinet-event` → test ntfy ping
7. [ ] Optional: `npm run db:push` on Vercel Postgres for production persistence

---

## Files added

- `prisma/schema.prisma` — `Product`, `ProductSale`
- `src/lib/retail-store.ts`, `retail-db.ts`, `retail-config.ts`
- `src/app/shop-log/page.tsx`, `src/app/admin/products/page.tsx`
- `src/components/ShopLogClient.tsx` — public catalog + PIN-gated team log
- `src/app/api/products/route.ts`, `product-sales/route.ts`, `retail-log-auth/route.ts`, `cabinet-event/route.ts`
- `data/products.json` — local fallback (8 products seeded)
- `scripts/seed-products.ts` — `npm run db:seed-products`
