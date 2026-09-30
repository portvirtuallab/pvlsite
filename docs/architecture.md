# PVL.ONE — current architecture

Status: **prototype under review** · Last updated: 30 September 2026 · Repository: `portvirtuallab/pvlsite`

This document describes what exists today in this repository: the information architecture,
the page inventory, the design system, the technical decisions and the boundaries that were
deliberately drawn. It is the reference for the review and the starting point for the
production build.

---

## 1. Product model — three layers, one identity

PVL.ONE is treated as one product with three surfaces. A visitor moves left to right, and at
every moment the interface makes clear which surface they are on.

```
   DISCOVER                CONVERT                   LEARN & OPERATE
   Understand the value →  Demo, proposal, course →  Authenticated Training Hub

   ┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐
   │  A. PUBLIC SITE  │   │  B. TRAINING HUB │   │  C. MANAGEMENT   │
   │  white, airy     │   │  navy, task-first│   │  navy + amber    │
   │  sells & explains│   │  gets work done  │   │  runs the system │
   └──────────────────┘   └──────────────────┘   └──────────────────┘
            └──────────────────────┴──────────────────────┘
                            COMMON BASE
        identity & access · content model · design system ·
        notifications · search · audit and logs
```

**Why the split matters.** The public site optimises for comprehension and conversion; the
Hub optimises for task completion. Mixing them is what makes most training platforms feel
like a brochure with a login. Here they share tokens and components but differ in density,
colour weight and navigation.

### Visual boundary rules

| Surface | Shell | Signals |
| --- | --- | --- |
| Public | White background, sticky translucent header, wide spacing | Marketing nav + *Request a demo* |
| Training Hub | Navy header, sidebar with course state, dense cards | Course progress, module states, no selling |
| Management | Navy header with amber accents, data tables | Records, permissions, operational health |

Leaving the ecosystem is always announced: destination, whether credentials are needed and
how to come back, before the jump.

---

## 2. Information architecture

### Layer A — public website

| Route | Purpose | Key sections |
| --- | --- | --- |
| `index.html` | Home | Hero, talent gap, vision + constructivist philosophy, ecosystem, video, nine modules, method, three entry points, Chiron, roadmap, virtual port community, active communities, testimonials, news, conversion |
| `product.html` | The platform | Constructivist method, digitalised document flow, support for educators, Port Virtual World vision |
| `solutions.html` | Offer | Flash / Immersion Course / Open Lab, the nine modules, simulated companies |
| `audiences.html` | Who it is for | VET, universities, companies and port communities, trainers, **Chiron programme + ToT calendar** |
| `proof.html` | Evidence | Figures, 11 countries, testimonials, ISO 9001:2015, partners, PLIKA |
| `news.html` | News | Filterable index with editorial rules |
| `port-virtual-world.html` | Roadmap | Virtual port community, digital twins, green corridors, ecosystem components |
| `certificates.html` | Verification | Certificate check by reference, with valid / not-found states |
| `demo.html` | Conversion | Demo **or** proposal request, full form-state matrix |
| `training-access.html` | Gateway | Pilot Course / Open Lab / Flash before the Hub |
| `game.html` | Retention | Container Stacker, a small canvas game |

Primary navigation: **Product · Solutions · Who it is for · Proof · News**, plus the persistent
actions *Enter Training* and *Request a demo*.

### Layer B — Training Hub (participant)

| Route | Purpose |
| --- | --- |
| `hub.html` | My training: course, progress, learning route, next steps, sessions, team |
| `hub-modules.html` | Module list with states, plus a full module detail (content, resources, deliverable) |
| `hub-community.html` | Virtual Port Community: companies by role and mode, external-link pattern |
| `hub-tools.html` | ERP, email, documents, simulators, with availability per tool |
| `hub-help.html` | Support request, Agora, FAQ, system status |

### Layer C — management

| Route | Purpose |
| --- | --- |
| `admin.html` | Organisations and users, tracking by cohort, operational incidents |
| `admin-courses.html` | Courses and cohorts: template → dates → roles → access release |
| `admin-catalog.html` | Central catalogue of modules, resources and companies with owners and verification states |

### Reference

`architecture.html` (this model, as a page) · `style.html` (design system) · `map.html` (all screens)

---

## 3. Content model

Every entry in the central catalogue carries the same record, so relationships are declared
once and never hard-coded in a page:

```yaml
id: mod-cu-03                  # stable identifier
slug: customs-operation
title: Customs operation
summary: Clearance, documentation control, tariff management…
audience: [vocational, university, professional]
taxonomy: { area: customs, mode: sea, format: on-site }
relationships:
  companies: [duana-partners, terminal-llevant]
  resources: [role-brief-forwarder, sample-invoice]
  tools: [click-and-cargo]
publicationStatus: published   # draft | scheduled | published | archived
verificationStatus: pending    # pending | verified
source: 2026 commercial presentation
owner: training.content
lastReviewed: 2026-05-11
locale: en
seo: { title: …, description: … }
```

Rules the production build is expected to enforce:

- a broken internal relationship **fails the build**;
- stale review dates raise a warning;
- entries marked `restricted` never reach the public bundle;
- `verificationStatus: pending` is never rendered as fact — it shows as a placeholder or a badge.

### Module states

`Available` · `Registration required` · `Coming soon` · `Access restricted` ·
`Temporarily unavailable` · `Archived` · `External destination` · `Link expired`

No disabled action ever appears without a sentence explaining why and what to do instead.

---

## 4. Design system

| Token | Value | Use |
| --- | --- | --- |
| `--navy` | `#0B2D63` | Headings, dark sections, navigation |
| `--blue` | `#164194` | Buttons, links, primary elements |
| `--cyan` | `#009FE3` | Gradients, digital accents, focus ring |
| `--yellow` | `#F9B233` | Active states and highlights |
| `--coral` | `#E84E1B` | Alerts and special points |
| `--ink` `--muted` `--line` `--panel` | `#10233D` `#65758A` `#DFE7EF` `#F5F8FB` | Text and surfaces |

Gradients: `blue → cyan` (main), `navy → blue` (premium), `#D66F14 → amber` (sun).
Strong colours appear mainly as gradients; the base stays white and navy.

- **Typography** — Sora for display and headings, Inter for interface and body. Letter-spacing
  `-0.04em` on large headings; labels in uppercase 800 with wide tracking.
- **Shape** — radii 12 / 20 / 28; borders over shadows; shadows always blue-tinted, never black.
- **Motion** — 0.2–0.3 s, ease-out, fully disabled under `prefers-reduced-motion`.
- **Layout** — max content width 1216 px; breakpoints 1240 / 1000 / 860 / 640.

### Component inventory

Gradient module cards · white info cards · the dark operational card (*live route*, the
signature element) · price cards · quote cards · resource panel and rows · status badges ·
filter chips and tags · search bar · forms with the full state matrix · alerts · progress bars ·
layer cards · stat strips · news cards · access choice cards · cookie banner.

Reference implementation: `style.html`.

---

## 5. Technical decisions

| Decision | Choice | Why |
| --- | --- | --- |
| Framework | **None** — static HTML, one stylesheet, three small scripts | A prototype that anyone can open, review and host anywhere; no build step to rot |
| Styling | One hand-written CSS file with custom properties | The tokens are the system; no utility-class indirection during review |
| Fonts | Google Fonts (Sora + Inter) | Wide language coverage for ES/CA/FR/IT, no self-hosting yet |
| Imagery | SVG artwork drawn for this project | No stock licensing, tiny files, recolours with the brand |
| Analytics | None loaded | Consent-gated by design; the hook exists in `cookies.js` and stays empty |
| Hosting | GitHub Pages from `main` at root | Zero configuration, public preview, `.nojekyll` included |

### File structure

```
pvlsite/
├── index.html … training-access.html     # 22 pages, flat at root for Pages
├── assets/
│   ├── pvl.css              # the whole design system
│   ├── pvl.js               # menu, directory filters, reveal on scroll
│   ├── cookies.js           # consent; analytics stay off until accepted
│   ├── stacker.js           # Container Stacker game
│   ├── pvl-one.svg          # official logo (+ white variant)
│   └── art-hero.svg         # hero and port artwork
├── docs/architecture.md     # this document
├── tools/serve.ps1          # local static server
├── .github/workflows/pages.yml
└── .nojekyll · .gitignore · README.md
```

### Where a real backend would attach

The prototype draws the boundary but does not cross it:

1. **Forms** (`demo.html`, `hub-help.html`, `certificates.html`) — behind a configurable
   adapter. They never claim a message was delivered.
2. **Authentication** — `training-access.html` is the seam. Pilot Course, Open Lab and Flash
   are three entry paths into the same Hub; none of them implies a session today.
3. **Content** — the catalogue becomes typed JSON/MDX with schema validation at build time.
4. **Analytics** — one function in `cookies.js`, called only after explicit consent.

---

## 6. Accessibility and privacy

- Semantic HTML: real `<button>`, `<a href>`, `<label>` — never a clickable div.
- Skip link, landmarks, one `<h1>` per page, logical focus order.
- Visible cyan focus ring, offset from the control; touch targets ≥ 44 px.
- Text contrast meets WCAG 2.2 AA; colour is never the only signal for a status.
- Dynamic result counts announced through a live region.
- No analytics, no third-party scripts, no cookies before explicit consent. The consent choice
  lives in `localStorage` in the visitor's own browser.
- The game stores only a best score, locally, wrapped in `try/catch`.

---

## 7. Content provenance

Content comes from the **PVL.ONE 2026 commercial presentation**: figures (4,500+ participants,
11 countries, 30+ institutions, 4.93/5), the nine modules, the three formats, the Chiron
programme, the ToT calendar, the roadmap components and the testimonials.

Still placeholders, marked as such in the pages:

- partner names and logos;
- the real names of the 40+ simulated companies (the Hub screens use invented fixtures);
- some news and case-study dates and headlines;
- certificate reference format and the verification service.

Prices are published as **On request** by decision of the product owner.

---

## 8. Known limitations

1. Forms and the certificate checker have no backend.
2. The platform video opens on YouTube instead of playing inline in restricted viewers; the
   production site embeds it through `youtube-nocookie` after consent.
3. The Hub shows a single fictional cohort; there is no session, no real progress and no
   personal data anywhere.
4. English only. The architecture is ready for ES/CA/FR/IT but no locale routing exists yet.
5. No automated tests or CI checks beyond the Pages deployment.

---

## 9. Suggested next steps

| Priority | Step |
| --- | --- |
| 1 | Replace the placeholders: partners, real simulated-company names, news items |
| 2 | Decide the form service and wire the adapter, so *Request a demo* really sends |
| 3 | Confirm the certificate reference format and the verification source |
| 4 | Decide the authentication model behind `training-access.html` |
| 5 | Move the content into typed collections with build-time validation |
| 6 | Add locale routing and the first translation once content is frozen |

---

© Escola Europea Short Sea Shipping, Spain. All rights reserved. The Port Virtual Lab® name
and mark, and all associated trademarks and logotypes, including but not limited to SDG Lines®,
SDG Airlines®, MEDtrade® and Playforwarding®, are owned by The Escola Europea de Short Sea
Shipping AEIE.
