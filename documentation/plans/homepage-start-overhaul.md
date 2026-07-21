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

Grounding (current `post.hbs`): freshness badge exists but JS-gated + hidden (`post.hbs`); author card + "About Sébastien" H2 exist (visual only); **sticky TOC already exists** (`main.js` L162 `.article-toc` — 4+ H2 threshold, scroll-spy, mobile collapse); no article FAQ.

### 4.3 — Auto TOC + citable slug anchors (theme-global) — **shipped 2026-07-21**
Sticky TOC already existed (`main.js` L162 — 4+ H2 threshold, scroll-spy, mobile collapse). The gap was anchors: headings without a Ghost id fell back to index-based `heading-N`, which is neither citable (meaningless to an answer engine) nor stable (reordering shifts every anchor). Fixed in `main.js` — headings now get slugified IDs (`#how-to-build-a-pkm-system`) with collision dedup (`-2`) and a `section-N` fallback for empty/symbol-only headings; pre-existing ids are respected. Commit `dd28f88`. Pending redeploy (zip built).

### 4.4 — Visible freshness (theme-global) — **already shipped** (pre-Tier-4)
Turns out this was already built: `freshness.js` reveals both the `.gh-article-freshness` badge and the `.gh-article-meta-updated` "updated {date}" meta line whenever `updated_at` is ≥30 days newer than `published_at` AND on/after the `2026-07-01` cutoff (the guard against the 2026-06 site-wide re-timestamp). Pairs with the machine-readable `dateModified` from 4.2. No work remaining — raise/remove the `CUTOFF_MS` in `freshness.js` once the re-timestamp is far enough in the past that older genuine refreshes should badge again.

### 4.5 — Answer-first content pass (content-level, top articles)
Via existing skills: `developassion-seo-geo-optimize` does the answer-first rewrite per article. **Per-article change-set** (the checklist applied to each): 1) **inverted-pyramid intro** — first 2–3 sentences directly answer the article's core question (the chunk answer engines lift); 2) **tighten `custom_excerpt`** → feeds the 4.1 "In short" box + the `BlogPosting.description`; 3) **question-form H2s** matching real search queries (each becomes a citable slug anchor via 4.3); 4) **self-contained sections** — define terms in place, no "as I said above"; 5) an authored **FAQ block** (3–5 Q&As) of extractable Q&A chunks; 6) **concrete data/stats with attribution**; 7) **link each named framework** (Five Layers, Builder OS, PKM, Zettelkasten, Johnny Decimal) to its canonical pillar/`/start/` page. **Source of truth = the vault note**: edit the note, verify the diff, then republish to Ghost (one article at a time, user verifies each).

**Candidate ranking — Plausible 12mo top articles (pulled 2026-07-21; visitors / bounce / avg-dwell → GEO priority):**

| # | Article (vault note) | Ghost slug | 12mo vis | bounce | dwell |
|---|---|---|---|---|---|
| 1 | Must Have Obsidian Plugins for 2026 | `the-must-have-obsidian-plugins-for-2026` (+ legacy `2022-10-19-the-must-have-obsidian-plugins`, ~10k vis) | 12,505 | 89% | 46s |
| 2 | How I synchronize and backup my Obsidian Notes | `how-i-synchronize-and-backup-my-obsidian-notes` | 9,213 | 87% | 59s |
| 3 | How I manage books and summaries in Obsidian | `how-i-manage-books-and-summaries-in-obsidian` | 7,807 | 81% | 95s |
| 4 | The Ultimate Beginner's Guide to Obsidian | `the-ultimate-beginners-guide-to-obsidian` | 6,050 | 81% | 106s |
| 5 | How I Use AI With My Obsidian Vault Every Day - 16 Practical Use Cases | `how-i-use-ai-with-my-obsidian-vault-every-day-16-practical-use-cases` | 4,569 | 88% | 53s |
| 6 | How to Self-Host OpenClaw Securely on a VPS | `how-to-self-host-openclaw-securely-on-a-vps-a-security-first-guide` | 3,181 | 86% | 112s |
| 7 | Organize Anything With The Johnny Decimal System | `2022-04-29-johnny-decimal` | 2,630 | 77% | 84s |
| 8 | How I Turned 20,000 Notes Into Live Dashboards With Obsidian Bases | `how-i-turned-20-000-notes-into-live-dashboards-with-obsidian-bases` | 2,467 | 88% | 47s |
| 9 | The Reasons I'll Never Switch from Obsidian to Tana | `the-reasons-ill-never-switch-from-obsidian-to-tana` | 2,232 | 86% | 57s |
| 10 | Stop Tweaking Your Tools and Start Actually Using Them | (vault `slug` empty — backfill) | 2,099 | 84% | 88s |
| 11 | Personal Knowledge Management at Scale - 8,000 Notes | `personal-knowledge-management-at-scale-analyzing-8-000-notes-and-64-000-links` | 1,612 | 78% | 109s |

Priority = high traffic × high bounce × low dwell (#1, #2, #5, #8 are the worst offenders → biggest GEO/engagement upside). Pareto: this top-11 is the bulk of article traffic — do these before widening.

**Execution checklist:**
- [ ] **Preflight:** confirm `developassion-publish` updates an existing Ghost post in-place (by slug/id), not create-new. If it can't, use the Ghost Admin API `PUT /posts/{id}` (key works).
- [ ] **Theme gap (4.7?):** article FAQ blocks get no `FAQPage` schema — `json-ld-extras.hbs` emits `FAQPage` on home only. Visible Q&A still chunks well without schema; decide later whether to add a marker-keyed `FAQPage` emitter to `post.hbs`.
- [x] #1 Must Have Obsidian Plugins 2026 → **shipped 2026-07-21**: answer-first intro + FAQ (5 Q&A) + H2→question + answer-first `custom_excerpt`. Pushed via Admin API surgical Lexical patch (all 5 plugin tables/images/cards preserved). Vault note = source of truth (updated). Note: `<meta name="description">` (SEO) unchanged by design — `custom_excerpt` drives the In-short box + og/twitter/schema.
- [x] #2 Synchronize and backup → **shipped 2026-07-21**: answer-first intro (surfaces "syncing is not a backup" thesis) + FAQ (5 Q&A) + answer-first excerpt. Admin API surgical Lexical patch (26 images/5 bookmarks/2 ad cards preserved). H2s already query-aligned, left as-is.
- [x] #3 Books and summaries → **shipped 2026-07-21**: answer-first intro (names the Book Search + Templater + Bases/Projects method, future-proofed with Bases) + FAQ (5 Q&A) + answer-first excerpt. Admin API surgical patch (14 images/8 bookmarks/2 ad cards preserved). Now driven by reusable `ghost_patch_generic.mjs` + per-article config.
- [x] #4 Ultimate Beginner's Guide → **shipped 2026-07-21**: definitional answer-first intro + FAQ (5 Q&A: what-is/beginner-friendly/get-started/free/need-markdown) + answer-first excerpt. Admin API surgical patch (60 images/53 bookmarks/1 embed preserved). H2s already question-form, left as-is.
- [x] #5 AI 16 use cases → **shipped 2026-07-21**: answer-first bold lead (the filesystem-access method) + FAQ (5 Q&A: how/best-tool/can-AI-read/is-it-safe/need-plugin) + answer-first excerpt. Admin API surgical patch (image/bookmark/4 embeds preserved). Note: live Ghost slug is the long one (`...-16-practical-use-cases`), not the frontmatter `slug`.
- [ ] #6 Self-Host OpenClaw → …
- [ ] #7 Johnny Decimal → …
- [ ] #8 Obsidian Bases dashboards → …
- [ ] #9 Obsidian vs Tana → …
- [ ] #10 Stop Tweaking Your Tools (backfill slug first) → …
- [ ] #11 PKM at Scale → …

## Dropped (don't re-propose)
SearchAction JSON-LD (Ghost has no `?s=` results page — Sodo is a client overlay); a 2nd `rel=canonical` on `/start/` (`ghost_head` already emits it); full WebSite+Person+Organization JSON-LD (~70% already in `default.hbs` → delta only); `Course` schema on `/start/` (not a course — use `LearningResource`); reusing `post-card.hbs` for product cards (expects a post context); FAQ/HowTo *rich-result* claims (Google killed both in 2023 — schemas kept for GEO value only).

## Measurement
Plausible goals live. Targets (first 30d post-change vs pre-baseline): `/`→`/start/` CTR ≥8% of unique home visitors; email signup rate on `/`+`/start/` +50%; fewer `/start/`→store clicks but higher store-page conversion (watch store analytics, not just clicks); checklist lead-magnet >0 downloads; start.hbs TTFB delta <100ms with ~10-12 `{{#get}}`. **GEO scoreboard:** bot access confirmed clear (2026-07-21 — robots.txt + Cloudflare), so add a Plausible segment for AI referrers (`chatgpt.com`, `perplexity.ai`, `gemini.google.com`) + periodic citation spot-checks (ask the engines the questions your top articles answer). No rich-result to measure against — citation presence is the metric.

## The One Thing
Start **4.5 — the answer-first content pass on the top ~30 articles.** Every theme-global GEO lever is now shipped (4.1 Key Takeaways, 4.2 enriched schema, 4.3 TOC + citable slug anchors, 4.4 visible freshness) and bots crawl freely — so the remaining gains are per-article and content-level, not code. Kick it off by ranking candidates: feed GSC top-traffic pages (`developassion-seo-gsc-analyzer`) into `developassion-seo-geo-audit`, then run `developassion-seo-geo-optimize` on the highest-value few (inverted-pyramid intro, question-form H2s, self-contained sections, an authored FAQ block → `FAQPage`, framework links to pillars/`/start/`). Sync every rewrite back to the vault (source of truth).
