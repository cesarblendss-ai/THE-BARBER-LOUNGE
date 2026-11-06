# Website Booking → Booksy — Shop SOP

**The Barber Lounge · 1518 A St, Antioch · (925) 209-5995**  
**Print · post in back room · one page**  
**Last verified:** 2026-11-06

---

## The rule

When someone books on **thebarberloungeca.com/book**, they are sent to **Booksy** with
service + barber + day (and time when known) already selected. **Booksy is the live
calendar.** Prefer the customer finishing there — then you type nothing.

If they abandon Booksy, your **ntfy** alert opens the same prefilled Booksy link in one tap.

---

## Who does what

| Role | Responsibility |
|---|---|
| **Customer** | Finishes on Booksy (widget opens after /book) — chair locked |
| **Owner (Cesar)** | ntfy one-tap only when guest didn't finish; confirm admin if needed |
| **Barber on shift** | Same one-tap if owner is cutting |

**Never ignore a booking alert.** If the time is wrong or double-booked, call the guest within 15 minutes.

---

## Step-by-step

### 1 · Alert arrives (0 min)

Owner phone gets an **ntfy** push. **Tap the notification** — it opens Booksy with
service / barber / day ready (same deep link the customer got).

```
Title: Booksy tap (Cesar): Maria Garcia

Web booking: Maria Garcia
Signature Haircut with Cesar Silva
Saturday 2:00 PM
Phone: (925) 555-1234
Code: TBL-A7K2

ONE TAP — open Booksy with service/barber/day ready:
https://booksy.com/…?do=open-widget&variantId=…&stafferId=…&date=…
```

### 2 · Zero type vs one tap

| Situation | Action |
|---|---|
| Guest finished on Booksy (appt shows in Booksy Biz) | **Done.** Optional: Confirm in admin. |
| Guest abandoned Booksy | Tap ntfy → pick their time in the widget → save. |
| Wrong time / double-book | Call guest · Cancel in admin |

### 3 · Confirm on website admin (optional cleanup)

1. **thebarberloungeca.com/admin/calendar-sync**
2. Web bookings list for that day → **Open Booksy →**
3. Mark confirmed when you use status controls

### 4 · Busy blocks (backup only)

Live Booksy sync already feeds /book. Paste busy times only for outages or special holds.

---

## Why not auto-create inside Booksy?

Booksy's create endpoint needs a **customer login session** (`x-access-token`) and books
under that Booksy account. We do **not** store Booksy Biz passwords or a shared customer
token. Deep-link handoff keeps Booksy authoritative without secrets.

Optional future: Zapier/Make "new web booking → create Booksy appt" if Booksy Biz API
access is purchased — see `docs/team-memory/calendar-sync-agent.md`.

---

## One-time: ntfy setup (owner phone)

1. Install free **ntfy** app → [ntfy.sh/app](https://ntfy.sh/app)
2. Subscribe to the shop topic (ask Cesar — do not share publicly)
3. Allow notifications · High priority
4. Test a /book → confirm push + tap opens Booksy prefilled

---

## Quick reference

| What | Where |
|---|---|
| Customer books | thebarberloungeca.com/book |
| Customer finishes | Booksy widget (auto-opened, prefilled) |
| Owner alert | ntfy (tap = Open Booksy) |
| Real calendar | Booksy Biz app |
| Staff one-tap | /admin/calendar-sync · Open Booksy → |
| Shop phone | (925) 209-5995 |

---

## Checklist (laminate this)

- [ ] Push received — note code: __________
- [ ] Guest already in Booksy? → stop
- [ ] Else: tap ntfy / Open Booksy → save their time
- [ ] Called guest if time changed or cancelled

---

*Internal use — The Barber Lounge*
