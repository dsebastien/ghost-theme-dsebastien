# Articles Page Overhaul — Plan (remaining work)

Repo: `$WKS/ghost-theme-dsebastien`. Most of Tiers 1–2 plus 3.3 (the per-layer `/start/{layer}/` guided pages, `custom-start-pillar.hbs`) shipped 2026-07-17→20 — completed items have been removed from this file. See **[[dSebastien Website (Project)]]** (History + Key decisions + gotchas + build/deploy + Admin-API constraints) for what landed and why. This file tracks only what's left.

## Remaining work

### 1.7 — FAQ schema (JSON-LD)
Add `FAQPage` schema on posts carrying a `#faq` tag or a code-injection Q&A field. (CollectionPage + ItemList + BreadcrumbList already ship via `partials/schema/collection.hbs`.)

### 2.3 — Portal tier–aware personalization + `/dashboard/`
Branch every CTA (contextual-offer, sticky-cta, sidebar, post) on `@member.status` + `@member.subscriptions.[0].tier.slug`. New `/dashboard/` route with a tier-filtered reading list; needs `#tier-<slug>` conventions on gated content. NOTE: on-site membership is now Free-or-Knowii (Supporter retired) — scope to the Knowii ladder (Explorer/Builder/Master).

### 2.2 (Option B) — Faceted `/search/` + cmd-K palette
Deferred. Sodo search + the `Cmd/Ctrl-K` (`/`) shortcut already ship; only build the custom `/search/?q=` page (MiniSearch/pagefind index; pillar / content-type / year facets) if search analytics show demand. Needs a public Content API key.

### 3.2 — Tag description backfill (content, not theme)
Author descriptions for the top ~30 tags in Ghost Admin → unlocks the richer `tag.hbs` hero + better SEO.

### 3.5 — `#most-read` curation
Maintain a `#most-read` internal tag (top ~20, refreshed monthly) and surface "Most read on {topic}" in `sidebar.hbs` + pillar hubs. Honest workaround — Ghost exposes no view counts to themes.

### 3.6 — Drive `/feeds/` from `pillars.json`
The static `/feeds/` page hardcodes tags; drive it from `src/data/pillars.json` so adding a pillar needs no HTML edit.

### Deferred
- `/series/{slug}/` dedicated pages + `/series/` per-series channel routes (the on-post strip + `/series/` index already ship).
- `#start-here-<pillar>` curated strips on pillar hubs (currently use `featured`).
- Portal newsletter segmentation by pillar.

### Data-gated (do after the redeploy + ~2 weeks of 2.4 capture data)
**Tune the top-4 Obsidian articles' offers** — they are ≈48% of pageviews. Use the `topic` / `cta` props on `Capture Shown` + `CTA Click` to feature whatever converts inside those posts. This is the real revenue lever; it depends on the on-article capture (2.4) data, which depends on the pending redeploy.

## Reference — still-true facts for article work
- **`tag:blog` is the deliberate "this is an article" marker** (292 articles). Scope every article surface (sections, strips, schema) to it. `primary_tag` is the content-TYPE marker (`blog`/`newsletter`/`news`), never a topic — never key topical logic on it.
- **Internal `hash-*` tags** (pillars, series) resolve inside `{{#get}}` filters but NOT in a routes `data:` binding → bind them to routes via **per-slug wrapper templates** (a `data: tag.hash-*` route 404s).
- **Collections + `/feeds/` RSS stay**: the `/blog/`, `/newsletter/`, `/news/` collection `{slug}` permalinks are inert, but their RSS feeds are referenced all over the web — never delete.
- Full Handlebars/Ghost gotchas + build/test/deploy + the Owner-uploads-nav/routes/redirects constraint: **[[dSebastien Website (Project)]]**.

## Rejected / deferred (don't re-propose)
- Members-writable "save for later" — Content API is read-only; needs an external service.
- Per-URL sitemap `lastmod` — Ghost-core-generated, not theme-controllable (schema `dateModified` is the theme-side lever, shipped).
- Client-side inter-H2 "further reading" links — not crawlable; skip.
- `/library-data/` JSON route via routes.yaml — can't set arbitrary Content-Type.

## Measurement
Plausible goals are live (see the project note for the goal/prop table). Track per change: `/blog/` clicks-per-visit per section; search open/submit; keep-reading CTR (target >25%); contextual-CTA conversion by topic (≥2× baseline); tag-hub traffic share; tier progression; pillar-term rankings + AI-citation share. Baseline before/after.

## The One Thing
Deploy the pending queue, then **tune the top-4 Obsidian articles' offers** from the 2.4 data — that's where the traffic and the revenue lever both are; everything else here is smaller.
