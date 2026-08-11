# Client Onboarding — Intake Form

Collect all fields below **before** the first `seo_agent.py` run. Copy this into Notion, Google Form, or a shared doc per client.

Missing fields = weaker content and wrong local keywords. Do not run the agent until the required fields are complete.

---

## 1. Business basics (required)

| Field | Example (Barber Lounge) | Notes |
|---|---|---|
| **Business name** (legal + DBA if different) | The Barber Lounge | Exact GBP name |
| **Primary niche** | barbershop | One word — plumber, dentist, HVAC, etc. |
| **Schema.org type** | BarberShop | [Schema.org types](https://schema.org/LocalBusiness) |
| **Street address** | 1518 A St | Must match GBP exactly |
| **City** | Antioch | |
| **State** | CA | 2-letter code |
| **ZIP** | 94509 | |
| **Phone** (display format) | (925) 209-5995 | |
| **Phone** (E.164 for SMS/schema) | +19252095995 | |
| **Email** | thebarberlounge00@gmail.com | |
| **Website URL** | https://the-barber-lounge.vercel.app | Live URL or "not yet built" |
| **Booking URL** | https://booksy.com/... | Booksy, Calendly, etc. |
| **Price range** | $$ | $, $$, $$$, or $$$$ |

---

## 2. Services (required)

List **5–8 primary services** customers search for. Use plain language, not internal menu codes.

```
1. signature haircut
2. haircut and beard
3. kids haircut
4. fade
5. line up
6. beard trim
```

Also collect:

| Field | Notes |
|---|---|
| **Top 3 moneymakers** | Which services drive the most revenue? |
| **Average ticket** | e.g. $50–65 |
| **Service area / cities served** | e.g. Antioch, Brentwood, Pittsburg, Oakley |

---

## 3. Hours (required)

Provide exact hours per day — must match Google Business Profile.

```
Sunday:    8:00 AM – 7:00 PM
Monday:   10:00 AM – 7:00 PM
Tuesday:  Closed
Wednesday: 9:00 AM – 7:00 PM
Thursday:  9:00 AM – 7:00 PM
Friday:    9:00 AM – 7:00 PM
Saturday:  8:00 AM – 7:00 PM
```

---

## 4. Competitors (required — at least 3)

Name 3–5 local competitors the client wants to outrank.

```
1. Fades & Blades Antioch
2. Executive Cuts Antioch
3. [Other barbershop on Booksy/Google Maps]
```

Ask: *"When you lose a customer, where do they usually go?"*

---

## 5. Google Business Profile (required)

| Field | Notes |
|---|---|
| **GBP listing URL** | Link to their Google Maps listing |
| **Primary category** | e.g. Barber shop |
| **Secondary categories** | Up to 9 |
| **Current review count** | e.g. 180 |
| **Current star rating** | e.g. 5.0 |
| **GBP access granted?** | Owner adds you as Manager |
| **Last GBP post date** | Helps agent calibrate strategy |

---

## 6. Online presence

| Field | Notes |
|---|---|
| **Instagram URL** | |
| **Facebook URL** | |
| **Yelp URL** | |
| **Other social / directories** | TikTok, BBB, etc. |
| **Existing blog?** | Yes/No — URL if yes |
| **CMS / platform** | WordPress, Webflow, Next.js, Squarespace, none |

---

## 7. Access checklist (required before VA publishes)

- [ ] Google Business Profile — Manager access
- [ ] Website CMS — Editor or Admin access
- [ ] Google Search Console — Owner or Full user
- [ ] Google Analytics (if exists) — Viewer minimum
- [ ] Shared folder for monthly output delivery (Google Drive)

**Do not ask for:** bank login, personal email password, Twilio/payment credentials.

---

## 8. Brand & voice (recommended)

| Field | Notes |
|---|---|
| **Tone** | Professional, casual, luxury, family-friendly |
| **Words to use** | e.g. "precision," "craftsmanship" |
| **Words to avoid** | e.g. "cheap," "discount," "best in the world" |
| **Target customer** | e.g. Men 18–45 in East Contra Costa |
| **Unique selling point** | One sentence — why pick them over competitors |

---

## 9. Package & billing

| Field | Options |
|---|---|
| **Package** | Starter ($497) / Growth ($997) / Dominator ($1,497) |
| **Setup fee paid?** | $297 one-time |
| **Billing method** | Stripe subscription |
| **Start date** | First agent run date |
| **Primary contact name** | |
| **Primary contact phone/email** | |

---

## 10. Create client config file

After intake, create `clients/{client_slug}.json`:

```json
{
  "name": "Business Name",
  "niche": "plumber",
  "schema_type": "Plumber",
  "city": "Sacramento",
  "state": "CA",
  "service_area": "Sacramento, Elk Grove, Roseville",
  "services": ["drain cleaning", "water heater repair", "leak detection"],
  "competitors": ["Competitor 1", "Competitor 2", "Competitor 3"],
  "phone": "(916) 555-0100",
  "website": "https://example.com",
  "address": "123 Main St, Sacramento, CA 95814",
  "hours": "Mon-Fri 8am-6pm, Sat 9am-2pm, Sun Closed",
  "price_range": "$$",
  "email": "owner@example.com",
  "package": "Growth"
}
```

Run the agent:

```powershell
python seo_agent.py "Business Name"
# Future: python seo_agent.py --client clients/client_slug.json
```

---

## 11. Post-intake — first run checklist

- [ ] Client config JSON saved to `clients/`
- [ ] GBP access confirmed
- [ ] Website access confirmed (or site build scheduled)
- [ ] First agent run completed
- [ ] Owner reviewed output (~25 min)
- [ ] VA received output folder + `PUBLISHING_CHECKLIST.md`
- [ ] Client received welcome email with package summary
- [ ] Stripe subscription active
- [ ] Client added to Notion tracker

---

## Quick reference — The Barber Lounge (case study #1)

| Field | Value |
|---|---|
| Config file | `clients/the_barber_lounge.json` |
| Live site | https://the-barber-lounge.vercel.app |
| Package | Growth |
| Agent command | `python seo_agent.py "The Barber Lounge"` |
| Output folder | `output/the_barber_lounge_YYYY_MM_DD/` |

Use Barber Lounge as the training example when onboarding your VA.
