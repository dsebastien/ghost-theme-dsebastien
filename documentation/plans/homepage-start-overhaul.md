# Homepage + Start Page Overhaul — Plan (remaining work)

Repo: `$WKS/ghost-theme-dsebastien`. Targets: `src/home.hbs`, `src/start.hbs`, `src/post.hbs`, `configuration/routes.yaml`. Tier 1 (trust bugs, `@custom` stats + live prices, member-aware single-CTA hero, de-commercialized `/start/`, home fresh-content strips), 2.1 (start.hbs's ~70 hardcoded links → live pillar `topic-section` strips), 2.2 (home offer consolidated to ONE surface — the `membership-tiers` cards with Free→`/start/` + a single store link; killed the 4×-repeated offer / product-grid / duplicate-tiers decision fatigue), 2.3 (the five `/start/{layer}/` guided-path pages), 2.6 (internal linking — post→`/start/` curriculum cards keyed on public pillar tags, `/blog/` new-reader prompt, home head-term anchor; plus the `/pillars/` index + footer link), and 2.5 (answer-first definition blocks on home + start, Five Layers → semantic `<ol>`), and 3.2 (structured-data delta — `components/json-ld-extras.hbs`: Organization+ProfilePage+FAQPage on home, HowTo+LearningResource+BreadcrumbList on start, `@id`-merged into the default.hbs graph) shipped 2026-07-17→21 and are removed from this file — see **[[dSebastien Website (Project)]]** for what landed. The old `start-page-improvements.md` was fully absorbed here and deleted. This file tracks only what's left.

## Vision (north star)
Three pages, three jobs: **`/` convinces + routes** (cold → `/start/`, member → content/community, buyer → store; no price list), **`/start/` teaches** (guided free five-layer curriculum, self-routing by situation, exactly one benefit-framed offer per layer), **`/blog/` feeds** (the magazine front page). Routing = `@member`-tier branching + self-selection routers + topic-keyed contextual offers (Ghost themes can't do per-visitor server logic beyond `@member`).

## Remaining work

### 2.4 — Extract the five-layer framework into `components/layer-stack.hbs`
One partial with `variant="compact|full"` (`{{#match}}`) replacing the two divergent hardcoded implementations (home steps vs start stack). Home → compact + single CTA to `/start/#area-foundation`; start → the hero diagram, each layer bar an in-page anchor to its area (and now also linkable to the matching `/start/{layer}/` guided page — see 2.3, shipped). Fix the orphan `benefit-item` class (home.hbs). CSS already exists ~`screen.css` L2570+. This is what remains of the "shorten `/start/`" goal now that the per-layer deep-dive pages exist.

### 3.1 — Testimonial wall → 3 + expansion (`home.hbs`)
New `components/testimonial-wall.hbs`: 3 strongest outcome-specific quotes (hours saved, publish frequency) + name/role; remaining ~21 in `<details>` "Read more stories". Removes ~25 mobile screens of scroll. (Curation still needs a deploy — no testimonial CMS.)

### 3.3 — Meta description + OG
`{{#contentFor "meta_description"}}` on home (~155 chars; watch for double-emission vs `ghost_head`); rewrite start.hbs L4-6 to target "how to build a personal knowledge management system from scratch"; two custom 1200×630 OG images (Admin + image production, not theme code).

### 3.4 — Sticky-cta on the two longest scrolls
`{{> "components/sticky-cta"}}` in home.hbs + start.hbs (currently post.hbs only); its stat copy already lives in `@custom`.

### 3.5 — Remaining cleanups
Builder OS teaser (start.hbs): 8 bullets → 3 sentences + CTA. Revisit `default.hbs` client-side link-rewriter — likely deletable now that prices/links are centralized.

## Tier 4 — Article-level GEO (the real battleground)
`/` + `/start/` are now GEO-complete (answer-first blocks + full `@id`-merged JSON-LD graph). But ~95% of traffic lands on ONE **article** and bounces, so articles are where citability compounds. **The model:** RAG answer engines (ChatGPT, Perplexity, Google AI Overviews) chunk a page and cite chunks that are self-contained, extractable, authoritative, and fresh. Goal = make every article yield clean, quotable, attributable chunks. **Two levers:** theme-global (`post.hbs`, one deploy hits all ~800 articles) vs content-per-article (vault → `developassion-publish`, apply only to the ~30–50 top-traffic articles — Pareto).

**4.1 + 4.2 shipped 2026-07-21** (theme-global, one `post.hbs` deploy): the Key Takeaways `.article-tldr` box (custom_excerpt → labeled "In short" callout) + the enriched `BlogPosting` node (`author.@id`→`#person`, `publisher`→`#organization`, `isPartOf`→`#website`, `articleSection`/`keywords`/`dateModified`/`speakable`). See **[[dSebastien Website (Project)]]**. Remaining Tier-4 items below.

Grounding (current `post.hbs`): freshness badge exists but JS-gated + hidden (`post.hbs`); author card + "About Sébastien" H2 exist (visual only); no TOC; no article FAQ.

### 4.3 — Auto TOC from H2/H3 (theme-global)
Small JS builds a table of contents from article headings → named-anchor chunks answer engines can deep-link/cite (same trick as `/start/#area-*`) + a machine-readable outline. Real conversion co-benefit: cuts bounce on long articles. Add `#slug` anchors to headings if Ghost doesn't already.

### 4.4 — Visible freshness (theme-global)
Un-gate a "Updated {date}" line in the article meta whenever `updated_at` is materially newer than `published_at` (respect the 2026-07-01 re-timestamp cutoff, per Key decisions). Freshness is a strong GEO/SEO signal; pairs with `dateModified` in 4.2.

### 4.5 — Answer-first content pass (content-level, top ~30 articles)
Via existing skills: `developassion-seo-geo-audit` ranks candidates (feed it GSC top-traffic pages from `developassion-seo-gsc-analyzer`); `developassion-seo-geo-optimize` does the answer-first intro rewrite. Per article: inverted-pyramid intro (first 2–3 sentences answer the core question), **question-form H2s** matching real queries, self-contained sections (define terms, no "as I said above"), an authored **FAQ block** → `FAQPage` schema, concrete data/stats-with-attribution, and each named framework (Five Layers, Builder OS) linked to its canonical pillar/`/start/` page. Sync back to the vault (source of truth).

## Dropped (don't re-propose)
SearchAction JSON-LD (Ghost has no `?s=` results page — Sodo is a client overlay); a 2nd `rel=canonical` on `/start/` (`ghost_head` already emits it); full WebSite+Person+Organization JSON-LD (~70% already in `default.hbs` → delta only); `Course` schema on `/start/` (not a course — use `LearningResource`); reusing `post-card.hbs` for product cards (expects a post context); FAQ/HowTo *rich-result* claims (Google killed both in 2023 — schemas kept for GEO value only).

## Measurement
Plausible goals live. Targets (first 30d post-change vs pre-baseline): `/`→`/start/` CTR ≥8% of unique home visitors; email signup rate on `/`+`/start/` +50%; fewer `/start/`→store clicks but higher store-page conversion (watch store analytics, not just clicks); checklist lead-magnet >0 downloads; start.hbs TTFB delta <100ms with ~10-12 `{{#get}}`. **GEO scoreboard:** bot access confirmed clear (2026-07-21 — robots.txt + Cloudflare), so add a Plausible segment for AI referrers (`chatgpt.com`, `perplexity.ai`, `gemini.google.com`) + periodic citation spot-checks (ask the engines the questions your top articles answer). No rich-result to measure against — citation presence is the metric.

## The One Thing
Ship **4.3 (auto TOC from H2/H3)** next — it's the last theme-global GEO lever (one `post.hbs` deploy → citable heading anchors on all ~800 articles + a real bounce-cutting co-benefit). Bot access is confirmed clear, so every article's Tier-4 signal (4.1 + 4.2) is now actually being read; the frontier is making each article's *sections* individually deep-linkable, then the 4.5 answer-first content pass on the top ~30 articles. Note: the theme zip still needs a manual redeploy to make 3.2 + 4.1 + 4.2 live.
