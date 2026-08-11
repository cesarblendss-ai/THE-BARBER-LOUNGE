# Website Booking → Booksy — Shop SOP

**The Barber Lounge · 1518 A St, Antioch · (925) 209-5995**  
**Print · post in back room · one page**

---

## The rule

When someone books on **thebarberlounge.com**, enter the appointment in **Booksy within 15 minutes**, then **Confirm** on the website admin.

Website availability is separate from Booksy. Until you enter Booksy, the slot is only a *request* — not on the real calendar.

---

## Who does what

| Role | Responsibility |
|---|---|
| **Owner (Cesar)** | ntfy alerts on phone · enter Booksy · confirm in admin |
| **Barber on shift** | If owner is cutting / away: tap the alert, enter Booksy, confirm admin — or hand phone to owner immediately |

**Never ignore a booking alert.** If the time is wrong or double-booked, call the guest within 15 minutes.

---

## Step-by-step (every web booking)

### 1 · Alert arrives (0 min)

Owner phone gets an **ntfy** push (high priority):

```
Title: New booking: Maria Garcia

New booking: Maria Garcia
Signature Haircut & Beard
Saturday 2:00 PM
Phone: (925) 555-1234
Code: TBL-A7K2
```

SMS to owner may also arrive when Twilio is active — treat ntfy as the primary alert.

**No alert but customer says they booked?** Open admin (step 3) or call Cesar.

### 2 · Enter Booksy (within 15 min)

1. Open **Booksy Biz** app or [Booksy web](https://booksy.com/en-us/1180862_the-barber-lounge_barber-shop_103886_antioch).
2. **New appointment** → match exactly from the alert:
   - Guest name & phone
   - Service (include guest count if multiple, e.g. “3 kids cuts”)
   - Date & time from the alert
3. Assign the correct barber chair.
4. Save in Booksy.

**Notes field (optional):** paste confirmation code, e.g. `TBL-A7K2 — website booking`.

### 3 · Confirm on website admin

1. Go to **thebarberlounge.com/admin/appointments** (bookmark on owner phone).
2. Find the row by **confirmation code** (e.g. `TBL-A7K2`) — status should be **pending** (amber).
3. Tap **Confirm** → status turns **confirmed** (green).

Do this **after** Booksy is saved, not before.

**Cancel instead?** Tap **Cancel** in admin if the slot cannot be honored — then call the guest.

### 4 · Block the slot (if needed)

On the admin page, pick the appointment date → **Today's slots** grid.

- Tap open slots to **block** times you hold in Booksy (walk-ins, personal blocks).
- Booked web requests already show as filled — do not block those.

---

## One-time: ntfy setup (owner phone)

Do this once. Takes ~5 minutes.

1. Install free **ntfy** app → [ntfy.sh/app](https://ntfy.sh/app)
2. Tap **+** → **Subscribe to topic**
3. Enter the shop topic name (ask Cesar — do not share publicly)
4. Allow notifications · set priority to **High**
5. Send a test booking through the site chat — confirm push arrives

Full setup: **thebarberlounge.com/admin/notifications**

---

## Quick reference

| What | Where |
|---|---|
| Customer books | thebarberlounge.com → “Book your cut” chat |
| Owner alert | ntfy app (topic subscribed on owner phone) |
| Real calendar | Booksy Biz app |
| Confirm request | thebarberlounge.com/admin/appointments |
| Booksy profile | booksy.com/en-us/1180862_the-barber-lounge_barber-shop_103886_antioch |
| Shop phone | (925) 209-5995 |

---

## Troubleshooting

| Problem | Fix |
|---|---|
| No push alert | Check ntfy app is open · topic subscribed · phone not on Do Not Disturb |
| Slot already taken in Booksy | Call guest · offer next open time · **Cancel** in admin |
| Can't open admin | Ask Cesar for admin key · bookmark `/admin/appointments?key=…` |
| Guest count > 1 | Book enough consecutive slots in Booksy for all guests |

---

## Checklist (laminate this)

- [ ] Push received — note code: __________
- [ ] Entered in Booksy within 15 min
- [ ] Confirmed in website admin
- [ ] Called guest if time changed or cancelled

---

*Last updated: Aug 2026 · Internal use — The Barber Lounge*
