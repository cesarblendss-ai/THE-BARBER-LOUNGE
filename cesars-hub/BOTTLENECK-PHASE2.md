# Bottleneck map — Phase 2 / path to 10/10

**Last verified:** 2026-08-17

Gaps toward a sellable local-first org platform. Do not block shipping the core hub on these.

## Shipped in this phase

- QR code in header (LAN URL)
- Estimates tracker (saved/sent/opened + folder backfill)
- SEO clients pinned on hub home
- On-disk folders per client
- Mobile photo upload
- Quick actions on business pages
- `/api/businesses` with offline fallback
- PDF-on-save when CDN libs load

## Next (product)

- SEO client dashboards
- Gallery / bulk rename / video previews
- Editable snippets, contacts, and `BUSINESS_INFO` in the UI
- Blog / team pages per business
- AI hooks for snippets and estimate assist

## Phase 3 — larger gaps

- **P0** Agency command center (pipeline value, stale clients)
- **P0** Client-facing portal / white-label share URLs
- **P0** CRM job pipeline (lead → quote → job → invoice → paid)
- **P0** Full in-app SEO workflow
- **P1** Hub ↔ live website linkage
- **P1** Cross-hub search index
- **P1** Backup / zip export / restore
- **P1** Off-LAN estimate open-tracking
- **P2** Multi-tenant packaging for resale

## Known constraints (by design for now)

- No auth — anyone on the LAN who has the URL can read/write
- `DEFAULT_SNIPPETS` / contacts / legal info are still code/JSON, not a settings UI
- Path traversal is guarded by `safe_path()`; this is not a public internet app
