# PVL.ONE — website prototype

Working prototype of the renewed **PVL.ONE (Port Virtual Lab)** website and Training Hub,
built for Escola Europea – Intermodal Transport.

It is a **static site**: plain HTML, one stylesheet and three small scripts. No build step,
no framework, no dependencies, no tracking. Open `index.html` and it runs.

> **Status: prototype for internal review.** Content comes from the PVL.ONE 2026 commercial
> presentation. Items still awaiting verification are marked in the pages themselves with
> `[PLACEHOLDER]` or a *To verify* badge. Simulated company names used in the Training Hub
> screens are fixtures invented for the mockup, not the real ones.

---

## What is in here

### Layer A — public website
| Page | What it covers |
| --- | --- |
| `index.html` | Home: hero, talent gap, vision and constructivist philosophy, ecosystem, video, nine modules, method, three entry points, Chiron, roadmap, community, testimonials, news, conversion |
| `product.html` | The platform: method, digitalised document flow, support for educators, Port Virtual World vision |
| `solutions.html` | Three entry points (Flash, Immersion Course, Open Lab) and the nine modules |
| `audiences.html` | Training centres, universities, companies, trainers, and the Chiron programme with the ToT calendar |
| `proof.html` | Figures, active communities, testimonials, ISO certification, partners |
| `news.html` | News index with editorial rules |
| `port-virtual-world.html` | The virtual port community and the wider ecosystem roadmap |
| `certificates.html` | Public certificate verification by reference number |
| `demo.html` | Request a demo or a proposal, with every form state |
| `training-access.html` | Gateway: Pilot Course / Open Lab / Flash |
| `game.html` | Container Stacker, a small canvas game |

### Layer B — Training Hub (participant)
`hub.html` · `hub-modules.html` · `hub-community.html` · `hub-tools.html` · `hub-help.html`

### Layer C — Management
`admin.html` · `admin-courses.html` · `admin-catalog.html`

### Reference
`architecture.html` (the three layers) · `style.html` (design system) · `map.html` (all screens)

---

## Design system

| Token | Value | Use |
| --- | --- | --- |
| Institutional navy | `#0B2D63` | Headings, dark sections, navigation |
| PVL blue | `#164194` | Buttons, links, primary elements |
| Cyan | `#009FE3` | Gradients, digital accents, focus ring |
| Logistics amber | `#F9B233` | Active states and highlights |
| Coral | `#E84E1B` | Alerts and special points |
| Ink / muted / line / panel | `#10233D` `#65758A` `#DFE7EF` `#F5F8FB` | Text and surfaces |

Strong colours are used mainly as gradients; the base stays white and navy. Typography is
**Sora** for display and **Inter** for interface and body. Radii 12 / 20 / 28, blue-tinted
shadows only, motion 0.2–0.3 s and disabled under `prefers-reduced-motion`.

Full reference: open `style.html`.

### Assets
| File | What it is |
| --- | --- |
| `assets/pvl-one.svg` | Official PVL.ONE logo (vector) |
| `assets/pvl-one-white.svg` | White variant for navy backgrounds |
| `assets/art-hero.svg` | Hero artwork, drawn for this project — no stock photography |
| `assets/art-port.svg` | Port illustration, drawn for this project |
| `assets/pvl.css` | The whole design system |
| `assets/pvl.js` | Menu, directory filters, reveal on scroll |
| `assets/cookies.js` | Cookie consent — analytics stay off until explicit consent |
| `assets/stacker.js` | The Container Stacker game |

---

## Running it locally

Just open `index.html` in a browser. To serve it over HTTP (useful for testing paths):

```powershell
powershell -ExecutionPolicy Bypass -File tools\serve.ps1
```

Then open <http://localhost:8099>.

---

## Publishing with GitHub Pages

The site lives at the repository root, so Pages works with no build:

1. **Settings → Pages**
2. **Source: Deploy from a branch**
3. Branch `main`, folder `/ (root)` → **Save**

The site is then served at `https://portvirtuallab.github.io/pvlsite/`.

A workflow (`.github/workflows/pages.yml`) is also included for the *GitHub Actions* source, if
that is preferred. `.nojekyll` is present so files are served exactly as they are.

---

## Accessibility and privacy

- Semantic HTML, real buttons and links, skip link, visible focus ring, 44 px touch targets.
- Text contrast meets WCAG 2.2 AA; colour is never the only signal for a status.
- No analytics, no third-party scripts and no cookies are loaded until the visitor accepts them.
- The certificate checker and the forms are interface only: nothing is sent anywhere.

## Known limitations

- Forms and the certificate checker have no backend; they never claim a message was delivered.
- The platform video opens on YouTube rather than playing inline in restricted viewers.
- Partner logos, some dates and the real simulated-company names are still placeholders.
- Prices are shown as *On request* by decision of the product owner.

---

## Copyright

© Escola Europea Short Sea Shipping, Spain.

**Notice of Copyright Protection:** All rights reserved. Unauthorised use, reproduction, or
distribution of this content is prohibited and may result in legal action.

The Port Virtual Lab® name and mark, and all other associated trademarks and logotypes,
including but not limited to SDG Lines®, SDG Airlines®, MEDtrade® and Playforwarding®, are
owned by The Escola Europea de Short Sea Shipping AEIE.
