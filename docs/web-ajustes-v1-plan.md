# Web adjustments v1 — change list for review

Branch: `web-ajustes-v1` · Prepared 5 November 2026 · **Nothing has been changed yet.**

This is deliverable 1 of the technical brief ("antes de tocar nada: lista de cambios por archivo").
It lists every edit I intend to make, file by file, so the team can correct the plan before any
code moves. Each row carries its source so you can trace a decision back to its author.

**Sources used:** the technical brief (5 Nov), which distils Marta Miquel's *Revision_web_PVL_ONE.docx*
(28 Oct), Eduard Rodés (5 Oct), Lidia Slawinska / PVL Style Guide v1.1 (31 Oct–4 Nov) and Orlando.

> **Two source documents did not reach me.** The **PVL Style Guide v1.1 (PDF)** and
> **Revision_web_PVL_ONE.docx** were not attached. I am working from the brief's summary of both,
> which is detailed, but I cannot check anything in the guide that the brief does not transcribe —
> spacing scale, icon set, the exact logo clear-space rules, or page 15 beyond the person-card spec.
> Please attach them before I start, or accept that section 4 compliance is "as described in the
> brief" rather than "as per the guide".

---

## 1. Corrections to the brief

Four things in the brief do not match what is actually in the repository. Worth settling now,
because three of them change the work.

| # | The brief says | What the code actually has | Proposed |
|---|---|---|---|
| 1 | Fix broken anchors `#ecosystem`, `#courses`, `#game`, `#companies` | `#ecosystem` **exists** (`product.html:64`) and `#companies` **exists** (`solutions.html:101`). The genuinely broken ones are `#courses`, `#game` and **`#openlab`** — the last is not in the brief's list but is linked from every footer | Fix `#courses`, `#game`, `#openlab`. Leave `#ecosystem` and `#companies` as working anchors that simply move with their blocks |
| 2 | Figures: "11 countries · 30+ institutions" | The network map I built last week counts **10 countries and 34 institutions** from the member list Escola Europea maintains. `proof.html` currently shows both: the stat strip says 11/30+, the map below it says 10/34 | **Blocking — see 2.1.** The page cannot ship contradicting itself |
| 3 | Home goes "from 19 to 10 blocks" | `index.html` has **15 `<section>` blocks / 16 `<h2>`** | No action, just so the diff is not a surprise. Going to 10 is still a real cut |
| 4 | Astro or static HTML, "whichever the repo uses" | Static HTML. No build step, no framework, no dependencies | No action. Confirming so nobody expects `npm run build` |

---

## 2. Decisions needed before I start

I will not invent an answer to any of these. Items 2.1–2.4 block whole blocks of work; the rest
I can park behind a visible `TODO` and carry on.

### 2.1 Which figures are canonical — **blocks Home, Why PVL** 🔴

The 2026 commercial presentation says *4,500+ participants · 11 countries · 30+ institutions ·
4.93/5*. The member list behind the network map says *34 institutions in 10 countries*. One is out
of date. I need: the four numbers, the as-of month, the source line to print, and the number of
responses behind 4.93/5. Until then the proof bar and the Why PVL hero cannot be written.

### 2.2 Navigation labels — **blocks every page's header** 🔴

The brief proposes Platform · Formats · Who it is for · CHIRON · Why PVL · News & Events, and
marks it `TODO: confirmar nombres con Marta y Lidia`. Renaming touches the header, the footer, the
breadcrumb, the `<title>` and the file names on all 22 pages. I would rather do it once.

- Solutions → **Formats** or *Ways to work with us*?
- Proof → **Why PVL** or *Inside PVL*?
- Do the **files** rename too (`product.html` → `platform.html`) or only the labels? Renaming files
  breaks any link already shared and needs redirects, which GitHub Pages cannot do without stub
  pages. **My recommendation: keep the filenames, change only the visible labels.**

### 2.3 Flash / Immersion Course / Open Lab comparison table — **blocks Formats** 🔴

11 of the 36 cells are `TODO` in the brief, including which modules each format includes. The table
is the centre of the page; I can publish it with visible `TODO` cells, but a prospect reading it
will see holes. Also unresolved: the hero says all three formats use the nine modules while Open Lab
lists only "Commercial, Maritime, Airfreight", and **"Commercial" is not one of the nine**
(MAR, AIR, RWY, HAU, INL, CUS, INS, NEG, BMB).

### 2.4 Which single badge survives on the formats — **blocks Formats, Home** 🟠

Today "Guided · most complete" (Immersion Course) and "Most popular" (Open Lab) compete, in both
`index.html` and `solutions.html`. The style guide allows one highlight per section. Which one?

### 2.5 Everything else, parked behind a visible `TODO`

| Question | Blocks | Source |
|---|---|---|
| ToT Spanish edition schedule (30 Nov–2 Dec 2026) | CHIRON, Who it is for | brief 6.4 |
| Written approval for institution and partner logos | Proof bar, Why PVL | brief 6.5.2 |
| Case studies: institution, challenge, format, result, quote | Why PVL | brief 6.5.4 |
| Decision-maker testimonials (current ones are all students) | Why PVL, Home | Marta, problem 4 |
| "Order to invoice" phase names — confirm against the original diagram | Home, Platform | brief 6.1.4 |
| Technical requirements, languages, accounts | Platform | brief 6.2.8 |
| Privacy policy text validated by Escola | `privacy.html`, all forms | brief 6.9 |
| Status of each Port Virtual World community | PVW | brief 6.7 |
| Does PVW address companies, or only ports and authorities? | PVW | Marta |
| PVW launch date; own domain or inside this site? | PVW | Marta |
| Is "Play Freight Forwarder · Developed" kept? | Roadmap | brief 5.7 |
| Official CHIRON logo file | CHIRON, footer | brief 6.6 |
| Click & Cargo logo for "Created with the support of" | Footer | brief 7 |
| Do CHIRON and the platform share a login? | Log in menu | Marta |
| Who maintains the ToT calendar, how often? | CHIRON | Marta |
| What happens to CHIRON content now on pvl.one? | CHIRON | Marta |
| Photo consent for the three named candidates | Home, Why PVL | brief 8 |
| Clientify chatbot embed snippet | Who it is for | Lidia |
| Formal PVL Ambassador appointment criteria | `people.html` | Orlando |
| Romania figure in the network map | Why PVL | brief 6.5.3 |
| ISO cert. no. 2821/26 — confirm | Why PVL | brief 6.5.7 |

**Missing assets I will stub with `<!-- TODO: logo X -->` at the right size:** Escola Europea
standard logo (the repo only has PVL), CHIRON logo, Click & Cargo logo, partner logos, institution
logos, the three candidate photographs.

---

## 3. Change list by file

Legend — **Do**: I can do it now · **Stub**: do it with a visible `TODO` · **Blocked**: needs an answer first.

### 3.1 Global — every page (22 files)

| # | Change | Source | State |
|---|---|---|---|
| G1 | Header nav → Platform · Formats · Who it is for · CHIRON · Why PVL · News & Events | brief 5.1 | Blocked 2.2 |
| G2 | Replace the `Enter Training` pill with a discreet **Log in** control offering *PVL Platform* → `training-access.html` and *CHIRON* → `chiron.escolaeuropea.eu`, set apart from the nav | brief 5.2, Marta 6.1 | Do |
| G3 | Header primary button → **Request a demo →** | brief 5.3 | Do |
| G4 | One closing block per page, not two. Primary *Request a demo →* or *Request a proposal*; secondary *Join a free Training of Trainers*. Remove "Still thinking? Play a round" | brief 5.4 | Do |
| G5 | Footer: add Escola standard logo + "Powered by", CHIRON + "Part of the CHIRON Programme", partner strip, and the links Privacy Policy · Legal notice · Cookies · Accessibility · YouTube | brief 5.9, 7 | Stub (logos) |
| G6 | Footer: add the Creative Commons BY-NC-ND 4.0 licence paragraph verbatim after the copyright | brief 5.9 | Do |
| G7 | Footer: remove the duplicate *Architecture* link, *Design system*, *Container stacker*. Game becomes one small footer link | brief 5.8 | Do |
| G8 | Remove the floating **Prototype · all screens** flag — present on all 22 pages | brief 5.8 | Do |
| G9 | `<title>` ≤ 60 chars and `<meta description>` ≤ 155 on every page | brief 5.11 | Do |
| G10 | Unify "immersed" → **participants trained** (`index.html:343`, `proof.html:45`, `proof.html:122`) | brief 4 | Do |
| G11 | Verify no `#0C4494`, `#FCB434`, coral backgrounds, white body text on cyan, or any font outside Sora/Inter. **Audited: the repo is already clean on all of these** | brief 4 | Done |
| G12 | Check every heading is sentence case with at most one highlighted word and no exclamation mark | brief 4 | Do |
| G13 | Confirm 390 px width across all pages after the edits | brief 9 | Do |

### 3.2 `index.html` — Home, 15 blocks → 10

| # | Change | Source | State |
|---|---|---|---|
| H1 | Hero: add eyebrow "FOR PORT COMMUNITIES AND INSTITUTIONS"; keep the H1 with *port talent.* in light cyan; replace the lead with the copy given in the brief | brief 6.1.1 | Do |
| H2 | Hero CTAs: *Request a demo →* primary; *Join a free Training of Trainers* and *Watch the video* demoted to links. **Remove `Enter Training` (line 42)** | brief 6.1.1, 5.2 | Do |
| H3 | Hero right: keep the live document-flow card, make it the real one (QT Accepted · BK Confirmed · INV *Mismatch detected* amber · CUS Waiting · CMR Next) and leave one slot for a student photo | brief 6.1.1, 8 | Stub (photo) |
| H4 | New **proof bar**: the four figures with source line + institution logo strip. **Logos hidden until approved — figures only** | brief 6.1.2 | Blocked 2.1 |
| H5 | Cut "The talent gap" to two sentences and two bullets | brief 6.1.3 | Do |
| H6 | New **How it works** block, merging today's scattered method copy: order-to-invoice in 5–7 numbered squares + the new video + the Freight Forwarder role brief | brief 6.1.4 | Stub (phases) |
| H7 | Swap the video to **quLtCtCMr9U** with the navy facade + `youtube-nocookie` after consent | brief 5.10 | Do |
| H8 | Keep the nine modules as gradient cards | brief 6.1.5 | Do |
| H9 | Keep the three formats, link to Formats, single highlight badge | brief 6.1.6 | Blocked 2.4 |
| H10 | New **entry by profile**: three cards → Who it is for / CHIRON / the ports section | brief 6.1.7 | Do |
| H11 | Social proof: decision-maker testimonials beside the country map | brief 6.1.8 | Stub (quotes) |
| H12 | Roadmap reduced to a one-line teaser linking to `port-virtual-world.html` | brief 6.1.9, 5.7 | Do |
| H13 | Single closing CTA: demo primary, ToT secondary | brief 6.1.10 | Do |
| H14 | **Remove:** the second method explanation ("Our vision" / repeated constructivist block) and the unattributed quote | brief 6.1 | Do |
| H15 | **Remove:** "What a PVL.ONE experience is made of" (folded into H6) | brief 6.1 | Do |
| H16 | **Remove:** the large CHIRON block (`index.html:260`) and the roadmap/PVW block (`:285`) | brief 6.1 | Do |
| H17 | **Remove:** the second closing block "Try it free in a Training of Trainers" (`:393`), including its `Enter Training` button (`:397`) | brief 6.1, 5.2 | Do |
| H18 | **Remove:** the October ToT news item (`:365`) and the two `[DATE]` news cards (`:369`, `:373`) | brief 6.1, 5.8 | Do |

### 3.3 `product.html` → **Platform**, 7 blocks → 9

| # | Change | Source | State |
|---|---|---|---|
| P1 | Keep the hero "A logistics lab, not a course player"; demo CTA promoted | brief 6.2.1, 3 | Do |
| P2 | New **How a simulation runs**: teams and roles → case → quotation → documentation → incident → debrief, with the video and Eduard's step-by-step flow | brief 6.2.2, Eduard | Stub (phases) |
| P3 | Bring the **virtual port community** across from Solutions: 40+ companies, 5 transport modes, link to the directory | brief 6.2.3 | Do |
| P4 | Keep the Click & Cargo document-flow block as it is — Marta's "best block on the site" | brief 3, 6.2.4 | Keep |
| P5 | Bring the **nine modules** across from Solutions as a short summary linking to `hub-modules.html` | brief 6.2.5 | Do |
| P6 | The constructivist method, short version, **stated once on this page only** | brief 6.2.6 | Do |
| P7 | Keep educator support Before · During · After | brief 3, 6.2.7 | Keep |
| P8 | New **practical information**: browser access, technical requirements, languages, accounts | brief 6.2.8 | Stub |
| P9 | **Remove** "Where it is going" (`:103`) → moves to PVW | brief 6.2 | Do |
| P10 | **Remove** the internal note "They are presented here as roadmap, never as available features" (`:111`) | brief 5.8 | Do |
| P11 | Rename to "Platform" in nav, `<title>`, breadcrumb and footer; keep `#ecosystem` working | brief 6.2 | Blocked 2.2 |
| P12 | Add the second video (old `ZsmbmxQTOz0`) below the new one | brief 5.10 | Do |

### 3.4 `solutions.html` → **Formats**, 6 blocks → 8

| # | Change | Source | State |
|---|---|---|---|
| F1 | Hero: three ways to work with PVL, ordered by level of commitment | brief 6.3.1 | Do |
| F2 | New **"What do you need?"** quick selector, three answers jumping to their card | brief 6.3.2 | Do |
| F3 | Rewrite the three cards so they carry **identical attributes**, same CTA *Request a proposal*, and one highlight badge only | brief 6.3.3 | Blocked 2.4 |
| F4 | Add the full **comparison table** in English, `TODO` in the unknown cells | brief 6.3 | Blocked 2.3 |
| F5 | New **format ladder**: Flash → Immersion Course → Open Lab | brief 6.3.4 | Do |
| F6 | New **how contracting works**: Demo → Proposal → Set-up → Start → Follow-up, moved here from Who it is for | brief 6.3.5 | Do |
| F7 | New **what the price depends on** + FAQ: participants, duration, modules, facilitation. No figures | brief 6.3.6, 4 | Do |
| F8 | Single closing CTA: proposal primary; demo and ToT secondary | brief 6.3.7 | Do |
| F9 | **Move out** the nine modules (`:87`) and the simulated companies (`:102`) → Platform | brief 6.3 | Do |
| F10 | Resolve the module contradiction: hero claims all nine, Open Lab lists three, and "Commercial" is not one of the nine | brief 6.3 | Blocked 2.3 |
| F11 | Create the missing anchors `#courses`, `#openlab` (and drop `#game` from the footer) | brief 5.8 + correction 1 | Do |

### 3.5 `audiences.html` — Who it is for, 4 profiles → 5

| # | Change | Source | State |
|---|---|---|---|
| A1 | Hero aimed at the buyer, with a five-card profile selector | brief 6.4.1 | Do |
| A2 | **Split** today's "Port communities & companies" (`:60`) into **Port communities and authorities** and **Companies** as separate blocks | brief 6.4.4, 6.4.5 | Do |
| A3 | Give each profile the same shape: need → benefits → **recommended format** → testimonial or case → CTA carrying the profile | brief 6.4.2–6.4.5 | Stub (cases) |
| A4 | Ports block gets two paths: *Train your community today* → Formats, *Co-create Port Virtual World* → PVW with its own form | brief 6.4.4 | Do |
| A5 | **Merge** the two CHIRON blocks (the `#trainers` card at `:65` and the `#chiron` section at `:75`) into one, linking to the new `chiron.html` | brief 6.4.6 | Do |
| A6 | **Replace the ToT dates.** Currently published as open: *05–08 October 2026*, which is in the past. New: EN **2–5 November 2026**, 15:30–19:30 CET; ES **30 November–2 December 2026** | brief 6.4.6, Marta "Alta" | Stub (ES time) |
| A7 | ToT gets its **own registration form**, not the demo form, and an explanation of the access code | brief 5.5, 6.4.6 | Do |
| A8 | Move the full adoption process (`:119`) to Formats; keep a 4-step summary | brief 6.4.7 | Do |
| A9 | Closing CTA plus the student line: "Are you a student? Ask your school, or log in if you already have an account." | brief 6.4.8 | Do |
| A10 | Add the Clientify chatbot as `<!-- TODO: widget -->` | brief 6.4 | Stub |
| A11 | Profile CTAs link to `demo.html?profile=vet\|university\|port\|company\|trainer` | brief 5.5 | Do |

### 3.6 `proof.html` → **Why PVL**

| # | Change | Source | State |
|---|---|---|---|
| W1 | **Replace the H1** "Eight port communities. Thousands of decisions." — YEP MED framing — with scope-based copy, e.g. "Institutions in 11 countries already run operations on PVL.ONE" | brief 6.5.1, 5.6, Marta "Alta" | Blocked 2.1 |
| W2 | **Remove** "PVL.ONE was built with eight port communities…" (`:140`) | brief 5.6 | Do |
| W3 | Four figures with as-of date and source under the hero | brief 6.5.1 | Blocked 2.1 |
| W4 | **Hide** the logo block until written approval, and **remove** the internal note "Placeholders until the approved partner list is supplied" (`:144`) | brief 6.5.2, 5.8 | Do |
| W5 | Keep the network map (built last week) and name the centres; recheck Romania | brief 6.5.3 | Stub |
| W6 | New **case studies** section, 2–3, with `TODO` content | brief 6.5.4 | Stub |
| W7 | Rebuild testimonials on the **person card** spec — 20 px square portrait, name, role · institution · country, one badge. Mark the current student quotes `TODO: replace or complete` | brief 6.5.5, 7 | Stub |
| W8 | New **outcome indicators** beyond satisfaction | brief 6.5.6 | Stub |
| W9 | **Quality and track record**: ISO 9001:2015 Cert. No. 2821/26, 20+ years, Barcelona and Civitavecchia, link to `certificates.html` | brief 6.5.7 | Do |
| W10 | **Remove the PLIKA section** (`:153`); at most one historical line under Quality. Never in the same composition as PVL | brief 6.5, 4 | Do |
| W11 | Merge the two contact blocks into one closing CTA | brief 6.5.8 | Do |
| W12 | Rename to "Why PVL" across nav, title, breadcrumb, footer | brief 5.1 | Blocked 2.2 |

### 3.7 `chiron.html` — new file

Full page per brief 6.6, using the English copy given there verbatim: *Available* badge and logo ·
what it is · the problem it solves · who it is for · three pillars (Methodology, Platform mastery,
Scenario design) · four entry steps (Train, Sign in, Run, Share) · inside CHIRON (webinars, podcast,
blog, Ambassadors) · the didactic sequence Analyse → Decide → Simulate → Justify → Reflect with
*Reflect* in amber · upcoming ToT editions with their own registration form · CTAs *Join the next
Training of Trainers* primary and *Enter CHIRON* as a link. **Stub:** the CHIRON logo and the ES
edition time. This page also removes the dependency on the external pvl.one CHIRON link.

### 3.8 `port-virtual-world.html` — rewrite

| # | Change | Source | State |
|---|---|---|---|
| V1 | *Coming soon* badge visible at the top; **not in the main nav** while in development | brief 6.7, 5.1 | Do |
| V2 | "What it is" using the brief's copy; "It is built with ports, not for them" | brief 6.7 | Do |
| V3 | Audiences: Port Authorities · communities · Companies · Training centres | brief 6.7 | Stub |
| V4 | The 10 items each community includes, *Local reference people* in amber | brief 6.7 | Do |
| V5 | Three capabilities: Train · Decide · Connect | brief 6.7 | Do |
| V6 | Communities: Barcelona · **Genoa** (highlighted, reference community in preparation) · Civitavecchia · Palermo · Rotterdam · + Your port | brief 6.7 | Stub (status) |
| V7 | How it is built: Map → Validate → Use | brief 6.7 | Do |
| V8 | **Receive the ecosystem roadmap** from Home and Platform: Port Virtual Game, HERMES Lab, Trade Bank, all *Coming soon* | brief 5.7, 6.7 | Do |
| V9 | Own conversion *Join as a co-creating port →* with a **separate form** `pvw-cocreate` | brief 6.7 | Do |
| V10 | Remove "29 port communities"; name no individuals without consent | brief 6.7 | Do |

### 3.9 `news.html` → News & Events

| # | Change | Source | State |
|---|---|---|---|
| N1 | Filter by type: Training · CHIRON · Events · Platform | brief 6.9 | Do |
| N2 | Calendar of upcoming dates | brief 6.9 | Stub |
| N3 | **Remove all five `[DATE]` / `[Headline…]` cards** (`:52`, `:61`, `:70`, `:79`, `:88`) and the editorial-rules note that explains the placeholders (`:96`) | brief 6.9, 5.8, Marta "Alta" | Do |

### 3.10 Other new files

| File | Content | State |
|---|---|---|
| `privacy.html` | Privacy policy, linked from the footer and every form | Stub (legal text) |
| `people.html` | PVL Ambassadors · Teachers · Speakers & experts · Partner organisations, with the Ambassadors copy verbatim from brief 7 | Stub (profiles) |
| `assets/credits.md` | Image credits, if any royalty-free photography is used | Do |

### 3.11 Hub pages — prepare, do not change access

Per brief 6.8 the public/private split is **still undecided**. I will not touch access or the
course PIN logic. I will deliver the proposed split as a list:

- **Public shop window:** company names, sectors, transport modes, one worked example company.
- **Inside the system:** documents, cases, role briefs, operational data, anything that reveals
  the solution to a case.

### 3.12 `style.html`, `architecture.html`, `map.html`

Internal reference pages. They keep working but come out of the public footer (G7). `style.html`
gets updated with the person card, the Log in control and the status badge set so it stays an
honest mirror of the system.

---

## 4. Order of work

One commit per page, in Marta's priority order.

| # | Commit | Depends on |
|---|---|---|
| 1 | ToT dates and the ToT registration form | 2.5 ES time |
| 2 | Remove internal notes, placeholders and the prototype flag | — |
| 3 | Remove YEP MED framing | 2.1 |
| 4 | Global header, Log in control, footer, licence | 2.2 |
| 5 | Home hero and reordering | 2.1 |
| 6 | Platform / Formats / Who it is for split | 2.2, 2.3, 2.4 |
| 7 | `chiron.html` | — |
| 8 | Port Virtual World | — |
| 9 | Why PVL | 2.1 |
| 10 | News & Events, `privacy.html`, `people.html` | — |
| 11 | Responsive pass at 390 px, SEO tags, final link check | all |

**Out of scope, as stated in the brief:** SDG Lines, SDG Airlines, and the review of messaging,
tone and claims.

---

## 5. What I can start on today without any answer

Commits 1 (partly), 2, 7, 8 and 10 — the cleanup, CHIRON, Port Virtual World and the new pages —
plus the footer licence and the removal of the prototype flag. That is roughly 40 % of the work and
none of it conflicts with the open decisions.

Everything touching the navigation, the figures or the formats table waits on §2.
