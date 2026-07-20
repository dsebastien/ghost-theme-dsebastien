# Homepage + Start Page Overhaul — Plan (remaining work)

Repo: `$WKS/ghost-theme-dsebastien`. Targets: `src/home.hbs`, `src/start.hbs`, `configuration/routes.yaml`. Tier 1 (trust bugs, `@custom` stats + live prices, member-aware single-CTA hero, de-commercialized `/start/`, home fresh-content strips), 2.1 (start.hbs's ~70 hardcoded links → live pillar `topic-section` strips), 2.2 (home offer consolidated to ONE surface — the `membership-tiers` cards with Free→`/start/` + a single store link; killed the 4×-repeated offer / product-grid / duplicate-tiers decision fatigue), 2.3 (the five `/start/{layer}/` guided-path pages), 2.6 (internal linking — post→`/start/` curriculum cards keyed on public pillar tags, `/blog/` new-reader prompt, home head-term anchor; plus the `/pillars/` index + footer link), and 2.5 (answer-first definition blocks on home + start, Five Layers → semantic `<ol>`) shipped 2026-07-17→20 and are removed from this file — see **[[dSebastien Website (Project)]]** for what landed. The old `start-page-improvements.md` was fully absorbed here and deleted. This file tracks only what's left.

## Vision (north star)
Three pages, three jobs: **`/` convinces + routes** (cold → `/start/`, member → content/community, buyer → store; no price list), **`/start/` teaches** (guided free five-layer curriculum, self-routing by situation, exactly one benefit-framed offer per layer), **`/blog/` feeds** (the magazine front page). Routing = `@member`-tier branching + self-selection routers + topic-keyed contextual offers (Ghost themes can't do per-visitor server logic beyond `@member`).

## Remaining work

### 2.4 — Extract the five-layer framework into `components/layer-stack.hbs`
One partial with `variant="compact|full"` (`{{#match}}`) replacing the two divergent hardcoded implementations (home steps vs start stack). Home → compact + single CTA to `/start/#area-foundation`; start → the hero diagram, each layer bar an in-page anchor to its area (and now also linkable to the matching `/start/{layer}/` guided page — see 2.3, shipped). Fix the orphan `benefit-item` class (home.hbs). CSS already exists ~`screen.css` L2570+. This is what remains of the "shorten `/start/`" goal now that the per-layer deep-dive pages exist.

### 3.1 — Testimonial wall → 3 + expansion (`home.hbs`)
New `components/testimonial-wall.hbs`: 3 strongest outcome-specific quotes (hours saved, publish frequency) + name/role; remaining ~21 in `<details>` "Read more stories". Removes ~25 mobile screens of scroll. (Curation still needs a deploy — no testimonial CMS.)

### 3.2 — Structured-data delta (`default.hbs` L74+ already has WebSite + Person + sameAs + worksFor)
One `components/json-ld-extras.hbs`: Organization node `@id`-cross-referenced from Person; `ProfilePage` on home → `/about`; `FAQPage` from home's 7 `<details>` (GEO only, no rich result since 2023); `HowTo` (5 layers → `HowToStep` with `#area-*`) + `LearningResource` on start; 2-item BreadcrumbList on start. No SearchAction, no extra canonical.

### 3.3 — Meta description + OG
`{{#contentFor "meta_description"}}` on home (~155 chars; watch for double-emission vs `ghost_head`); rewrite start.hbs L4-6 to target "how to build a personal knowledge management system from scratch"; two custom 1200×630 OG images (Admin + image production, not theme code).

### 3.4 — Sticky-cta on the two longest scrolls
`{{> "components/sticky-cta"}}` in home.hbs + start.hbs (currently post.hbs only); its stat copy already lives in `@custom`.

### 3.5 — Remaining cleanups
Builder OS teaser (start.hbs): 8 bullets → 3 sentences + CTA. Revisit `default.hbs` client-side link-rewriter — likely deletable now that prices/links are centralized.

## Dropped (don't re-propose)
SearchAction JSON-LD (Ghost has no `?s=` results page — Sodo is a client overlay); a 2nd `rel=canonical` on `/start/` (`ghost_head` already emits it); full WebSite+Person+Organization JSON-LD (~70% already in `default.hbs` → delta only); `Course` schema on `/start/` (not a course — use `LearningResource`); reusing `post-card.hbs` for product cards (expects a post context); FAQ/HowTo *rich-result* claims (Google killed both in 2023 — schemas kept for GEO value only).

## Measurement
Plausible goals live. Targets (first 30d post-change vs pre-baseline): `/`→`/start/` CTR ≥8% of unique home visitors; email signup rate on `/`+`/start/` +50%; fewer `/start/`→store clicks but higher store-page conversion (watch store analytics, not just clicks); checklist lead-magnet >0 downloads; start.hbs TTFB delta <100ms with ~10-12 `{{#get}}`.

## The One Thing
Ship **3.2 (structured-data delta)** — 2.5 just made the home + `/start/` definition blocks and the Five Layers extractable *prose*; the compounding follow-up is annotating that now-semantic content with JSON-LD so machines read it unambiguously: a `HowTo` (5 layers → `HowToStep` with `#area-*` anchors) + `LearningResource` on `/start/`, a `FAQPage` from home's 7 `<details>`, and an Organization node `@id`-cross-referenced from the existing Person. One `components/json-ld-extras.hbs`, no visible-copy risk, and it turns the answer-first blocks into structured signals for search + GEO.
