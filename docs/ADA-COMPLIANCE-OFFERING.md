# ADA-Compliant Website Offering

> **Internal sales asset** — copy-paste ready for proposals, website copy, and client conversations.  
> **Not legal advice.** See [What we tell clients honestly](#what-we-tell-clients-honestly) below.

---

## 1. Client-facing pitch (short)

Every website we build is designed to meet **WCAG 2.1 Level AA** — the industry standard for web accessibility. That means your site works for customers who use keyboards, screen readers, or assistive technology, not just mouse and touch users.

Accessible sites reach more people, perform better in search, and reduce exposure to **ADA Title III** web accessibility complaints — a growing issue for small businesses nationwide. We build accessibility in from day one, not as an expensive add-on after launch.

---

## 2. What "ADA compliant website" means (plain English)

**For business owners:** "ADA compliant" usually refers to making your website usable by people with disabilities — vision, hearing, motor, and cognitive differences — so they can browse, contact you, and book services like anyone else.

### Our technical target: WCAG 2.1 Level AA

[WCAG](https://www.w3.org/WAI/standards-guidelines/wcag/) (Web Content Accessibility Guidelines) is the international standard courts and regulators reference. **Level AA** is the practical baseline most businesses aim for — strong protection without the extreme requirements of AAA.

### Reduces lawsuit risk (without fear-mongering)

Under **ADA Title III**, courts have increasingly treated business websites as places of public accommodation. Demand letters and lawsuits over inaccessible sites have risen sharply across retail, hospitality, healthcare, and local services. A site built to WCAG AA won't eliminate legal risk entirely, but it demonstrates good-faith effort and addresses the most common issues cited in complaints: missing labels, poor contrast, keyboard traps, and content that screen readers can't interpret.

### Better for all customers

Accessibility improvements help everyone:

- **SEO** — semantic HTML, alt text, and clear headings help search engines understand your content
- **Mobile** — touch targets, readable text, and responsive layouts benefit phone users
- **Older users** — larger tap areas, high contrast, and plain language improve usability at any age
- **Temporary situations** — broken arm, bright sunlight, slow connection — accessible design holds up

---

## 3. What's included in our build (checklist)

Every client site we deliver includes the following accessibility baseline. **The Barber Lounge** (`the-barber-lounge`) is our reference implementation — the same patterns apply to new projects.

| Area | What we implement | Reference |
|------|-------------------|-----------|
| **Skip to main content** | Hidden link visible on keyboard focus; jumps past navigation to page content | `src/app/layout.tsx` |
| **Keyboard navigation + visible focus** | All interactive elements focusable; brass focus ring site-wide | `src/app/globals.css`, `src/components/Button.tsx` |
| **Screen reader labels** | ARIA attributes, alt text on images, form labels, descriptive button names | Throughout components |
| **Color contrast** | Charcoal/bone/brass palette tested for WCAG AA ratios (4.5:1 body, 3:1 large text/UI) | Design tokens in `tailwind.config.ts` |
| **Accessible chatbot / modals** | `role="dialog"`, focus trap, Escape to close, `aria-live` announcements | `src/components/BookingChatbot.tsx`, `src/components/GalleryLightbox.tsx` |
| **Semantic HTML landmarks** | `<header>`, `<main>`, `<footer>`, `<nav>` with labels | `layout.tsx`, `Header.tsx`, `Footer.tsx`, `StickyBookButton.tsx` |
| **Video accessibility** | Muted autoplay only; descriptive `aria-label`; poster fallback | `src/components/HeroVideoGrid.tsx`, `HeroVideo.tsx` |
| **FAQ accordion accessibility** | Button triggers with `aria-expanded`, `aria-controls`, labeled panels | `src/components/FaqAccordion.tsx` |
| **Mobile sticky bar accessible names** | Call and Book buttons with clear `aria-label` text | `src/components/StickyBookButton.tsx` |

### Additional patterns in every build

- **`lang="en"`** on the document root
- **One `<h1>` per page** with logical heading hierarchy
- **`aria-current="page"`** on active navigation links
- **Mobile menu** — keyboard accessible, Escape closes, focus returns to trigger
- **Contact forms** — visible labels, required-field indicators, inline error text (not color alone), `role="alert"` summaries
- **Gallery images** — meaningful alt text from content data, not filenames
- **Testimonial carousel** — `aria-live` updates, labeled prev/next controls
- **Descriptive link text** — no "click here"; action-oriented labels ("Book on Booksy", "Call Now")

### Copy-paste checklist for proposals

```
☑ Skip-to-content link
☑ Keyboard-accessible navigation (desktop + mobile)
☑ Visible focus indicators on all interactive elements
☑ Screen reader labels (ARIA, alt text, form labels)
☑ WCAG AA color contrast
☑ Accessible modals (chatbot, lightbox) with focus management
☑ Semantic HTML landmarks (header, main, footer, nav)
☑ Accessible video (muted, labeled, fallback image)
☑ Accessible FAQ accordion
☑ Mobile action bar with descriptive accessible names
☑ Form validation with text errors (not color-only)
☑ Page titles and heading hierarchy
```

---

## 4. What we tell clients honestly

Use this language to set accurate expectations:

> **We implement a WCAG 2.1 Level AA technical baseline** in every site we build — keyboard access, screen reader support, contrast, semantic structure, and accessible interactive components. This is the same standard referenced in most ADA web accessibility discussions.
>
> **We recommend a periodic accessibility audit** (annually or after major content changes) and **legal counsel** if you operate in a high-risk industry or have received a demand letter. No developer can guarantee zero legal exposure.
>
> **Third-party widgets** — booking systems (Booksy, Square, etc.), chat plugins, payment forms, embedded maps — are controlled by external vendors. We link to them accessibly and choose embed options carefully, but their internal accessibility may require separate review or alternative booking paths (e.g., phone, accessible contact form).

**Do not say:** "100% ADA certified" or "lawsuit-proof."  
**Do say:** "Built to WCAG 2.1 AA standards with accessibility integrated from the start."

---

## 5. Optional site badge (not added by default)

If a client wants to signal accessibility on their site, suggest one of these — **only add with client approval:**

- **Footer:** `Built with accessibility in mind`
- **About page:** `This website was designed to meet WCAG 2.1 Level AA accessibility guidelines so every guest can browse, contact us, and book with confidence.`
- **Accessibility statement page** (optional add-on): short page listing standards met, known limitations (third-party booking), and a contact email for accessibility feedback

---

## Appendix: The Barber Lounge — reference implementation

**ADA audit status:** Subagent audit (`e27eaf23`) was in progress at time of this document. The items below reflect **accessibility patterns already present in the codebase**, which align with the WCAG 2.1 AA audit scope.

### Files implementing accessibility

| File | Accessibility features |
|------|------------------------|
| `src/app/layout.tsx` | Skip link, `#main-content` landmark, `lang="en"`, `<main tabIndex={-1}>` |
| `src/app/globals.css` | Global `:focus-visible` ring styles for links, buttons, inputs |
| `src/components/Header.tsx` | `aria-current`, mobile menu `aria-expanded`/`aria-controls`, Escape key, focus management |
| `src/components/Footer.tsx` | `<footer>`, labeled footer `<nav>` |
| `src/components/BookingChatbot.tsx` | Dialog semantics, focus trap, Escape, `aria-live`, labeled inputs/buttons |
| `src/components/ContactForm.tsx` | Labels, `aria-invalid`, `aria-describedby`, error alerts, required indicators |
| `src/components/FaqAccordion.tsx` | `aria-expanded`, `aria-controls`, `role="region"`, button triggers |
| `src/components/StickyBookButton.tsx` | `aria-label` on Call/Book, `<nav aria-label="Quick actions">` |
| `src/components/HeroVideoGrid.tsx` | Video `aria-label`, muted autoplay, section label, poster fallback |
| `src/components/HeroVideo.tsx` | Video `aria-label`, muted autoplay, poster fallback |
| `src/components/GalleryLightbox.tsx` | Dialog, keyboard nav (arrows, Escape), focus trap, labeled controls |
| `src/components/TestimonialCarousel.tsx` | `aria-live="polite"`, labeled navigation buttons |
| `src/components/Button.tsx` | `focus-visible` ring variants |
| `src/app/about/page.tsx` | Single `h1`, `aria-labelledby` sections, sr-only headings where needed |
| `src/app/faq/page.tsx` | Single `h1`, labeled FAQ section |
| `src/app/services/page.tsx` | sr-only section headings for screen readers |
| `src/lib/gallery.ts` | Alt text defined for all gallery and hero video assets |

### Known follow-ups (third-party / ongoing)

- **Booksy booking** — external booking flow; we provide accessible links and phone fallback
- **Periodic re-audit** — recommended after content or component changes
- **Admin upload tools** — alt text should be verified when clients add new gallery images

---

*Last updated: August 6, 2026 · Reference project: The Barber Lounge, Antioch CA*
