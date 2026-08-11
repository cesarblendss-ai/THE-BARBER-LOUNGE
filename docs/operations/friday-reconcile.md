# Friday retail reconcile — weekly ritual

**When:** Every Friday, ~15 minutes (before closing or first thing Saturday).  
**Who:** Owner (Cesar).  
**Goal:** Collect what barbers owe, confirm inventory matches reality, and zero out unpaid sales in admin.

Related: [Retail Product Tracking](../retail-tracking.md) (tiers, shop rules, `/shop-log` setup).

---

## Before you start

- [ ] Phone or laptop with admin access
- [ ] Owner notebook (original stock counts / restock notes)
- [ ] Physical access to the retail cabinet
- [ ] Venmo app or cash drawer ready for collection

**Admin URL:** `https://your-site.vercel.app/admin/products?key=YOUR_ADMIN_KEY`  
(`ADMIN_UPLOAD_KEY` from Vercel → Production env. Bookmark this page.)

**Barber log (reference only):** `/shop-log` — barbers should have already logged grabs during the week.

---

## Checklist

### 1. Review unpaid totals

- [ ] Open **Retail Products** admin → **Weekly balance** card at the top
- [ ] Note the **total unpaid** dollar amount and **sale count**
- [ ] Review the **per-barber breakdown** (e.g. Sebastian $36, Kristian $18)
- [ ] Scroll **Recent sales** — confirm each unpaid line matches what you remember from the week
- [ ] Flag anything suspicious (wrong product, duplicate grab, client sale logged as barber)

**Rule:** Unpaid lines stay on the books until you collect payment and tap **Mark paid**.

---

### 2. Physical stock count vs admin vs notebook

Work product by product. For each SKU in the **Inventory** table:

- [ ] Count units **on the shelf right now** (physical count)
- [ ] Compare to **Stock** column in admin
- [ ] Compare to your **notebook** baseline (restocks, starting counts)

**Expected relationship:**

```
Physical count ≈ Admin stock
```

Admin stock drops automatically when barbers log at `/shop-log`. If numbers disagree:

| Situation | Likely cause | Action |
|---|---|---|
| Physical **lower** than admin | Grab not logged | Ask barber who took it; log sale retroactively or charge at reconcile |
| Physical **higher** than admin | Double-log or wrong qty | Fix count in admin (re-add product with correct stock via API) or note in notebook |
| Admin matches physical but notebook differs | Restock not entered | Update admin stock to match physical; note restock date in notebook |

- [ ] All eight products reconciled (Clay, Spider Wax, Leave-in, Cool Care, Powder, Sanek, After Shave, Hair Spray)
- [ ] Low-stock items flagged for reorder (Sanek Strips, After Shave, Hair Spray often run low)

> **Stock correction:** Admin UI shows inventory read-only today. To fix a count, use **Add product** with the same name and corrected stock, or POST to `/api/products` with the product `id` and new `stock` (see [retail-tracking.md](../retail-tracking.md)).

---

### 3. Collect payment (Venmo or cash)

For each barber with an unpaid balance on the **Weekly balance** card:

- [ ] Tell them their total for the week
- [ ] Collect **Venmo** to the shop account **or** **cash** into the shop drawer
- [ ] Client retail sold at the chair: cash should already be in the drawer — verify before marking paid

**Payment options (shop rule):**

| Method | Where it goes | Owner action |
|---|---|---|
| **Venmo** | Shop Venmo account | Confirm payment received on phone |
| **Cash** | Shop drawer / owner | Count and deposit to retail float |

- [ ] Every barber with a balance has paid (or you have a written IOU with a pay-by date)

---

### 4. Mark paid in admin

Only after money is in hand:

- [ ] In **Recent sales**, find each unpaid line for that barber
- [ ] Tap **Mark paid** on each sale (or all of one barber's lines)
- [ ] Confirm the badge changes to green **Paid**
- [ ] **Weekly balance** total should read **$0.00** when everything is settled

- [ ] Screenshot or note the zero balance for your records (optional)

---

### 5. Close the week

- [ ] Unpaid total is **$0.00** (or documented exceptions only)
- [ ] Physical stock matches admin (or discrepancies logged in notebook)
- [ ] Remind barbers in the group chat: *log within 5 minutes at `/shop-log`*
- [ ] If logs were missed two weeks in a row → review [Tier 1 door sensor](../retail-tracking.md#tier-1-hardware-shopping-list-3080)

---

## Quick reference

| Item | Location |
|---|---|
| Barber log | `/shop-log` → **Team log** (4-digit PIN) |
| Admin dashboard | `/admin/products?key=…` |
| Unpaid summary | Top card: **Weekly balance** |
| Per-sale actions | **Recent sales** → **Mark paid** |
| Retail price | **$18.00** per unit (all SKUs) |
| Shop rules poster | [retail-tracking.md § Shop rules](../retail-tracking.md#shop-rules-post-in-back-room) |

---

## Weekly log (copy each Friday)

```
Date: ___________

Unpaid at start:  $________  (___ sales)

Per barber:
  ________________  $________  paid ☐  Venmo ☐  Cash ☐
  ________________  $________  paid ☐  Venmo ☐  Cash ☐
  ________________  $________  paid ☐  Venmo ☐  Cash ☐

Stock discrepancies:
  Product ________________  admin ___  physical ___  action ________________

Unpaid at end:    $________  (target: $0.00)

Notes:
```

---

## If someone refuses to pay or disputes a sale

1. Show them their line in **Recent sales** (timestamp + product).
2. Shop rule: **no log = assumed purchase** — if stock is missing and they grabbed it, it counts.
3. For honest misses, barber can log retroactively at `/shop-log` (owner verifies stock), then pay and mark paid.
4. Repeat offenders: discuss before ordering more retail inventory on their behalf.
