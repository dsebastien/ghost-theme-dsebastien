# Homepage + Start Page Overhaul

Repo: `/home/dsebastien/wks/ghost-theme-dsebastien`. Targets: `src/home.hbs` (363 lines), `src/start.hbs` (599 lines), `configuration/routes.yaml`. Sibling plan: `documentation/plans/articles-page-overhaul.md` (its "Audit findings" = live Content API facts). This plan **supersedes** `documentation/plans/start-page-improvements.md` — disposition of its items in the "Absorbed plan" section at the end.

---

## Vision

Three pages, three jobs, zero overlap:

- **`/` = convince.** A cold visitor knows WHO (Sébastien, 20+ yrs, 6K readers), WHAT (knowledge + content systems for creators), and their ONE next action (`/start/`) within 5 seconds. Members get routed instead of re-pitched (`@member` tiers). Proof of life via dynamic post strips. No price list.
- **`/start/` = teach.** Guided free entry into the five-layer curriculum. Self-routing by situation ("brand new" / "messy system" / "want to publish"), live article strips per layer, exactly ONE benefit-framed offer per layer. Zero pricing tables — the store and the Knowii long-form page (audit: it's good) do the selling.
- **`/blog/` = feed.** The magazine front page (articles-page-overhaul). Depth, topics, returning readers.

**Routing model:** cold → `/` hero → `/start/`; returning reader → `/` fresh-content strips or nav → `/blog/`; buyer → demoted-but-present store links + contextual offers → store/Knowii. Since Ghost themes can't do per-visitor server logic beyond `@member`, routing = member-tier branching + self-selection routers + contextual offers keyed on topic tags.

**Two invariants before any layout work:**
1. Every stat comes from `{{@custom.*}}`; every price is deleted from the theme (prices live on the store pages that own them — they already drifted: theme €99.99 PKM coaching vs vault $99.99; Knowii Voice AI €49 vs $99.99).
2. Every article list is a `{{#get}}` via `partials/components/topic-section.hbs` — never a hardcoded `<a>` list.

---

## Merged & dropped

**Merged clusters** (all 23 proposals were feasible; 16 collapse into 7 workstreams):
- **Hero (home)** ← member-aware hero + single-goal hero/segment router + identity anchor + headline rewrite + credibility strip + brand-name anchor + E-E-A-T author block. Owner mechanism: the member-aware variant (most implementation-complete per verdicts).
- **Stats/prices** ← 3 centralization proposals. Adopted policy: `config.custom` in `src/package.json` for stats; **delete** prices (ux-ghost stance wins — a partial full of prices still rots).
- **start.hbs lists** ← 3 topic-section proposals. Owner: ux-ghost variant (uses existing `/feeds/*` channels as seeAllUrl + internal quick-win tags).
- **De-commercialize /start/** ← flatten-ladder + 2 checklist-bug proposals.
- **Home fresh content** ← 3 strip proposals. Owner: two-strip design (featured + latest).
- **Five-layer partial** ← 2 extraction proposals (testimonial trimming split OUT into its own Tier 3 item).
- **Routers** ← /start/ visitor router + home segment router + sticky-cta reuse. One shared router partial; home's router folds into the hero workstream.

**Dropped / descoped** (verdict-driven):
- **SearchAction JSON-LD** — Ghost has no `?s=` results page (Sodo is a client-side overlay); target URL wouldn't resolve.
- **`rel=canonical` on /start/** — `{{ghost_head}}` already emits it; a second tag is a duplication bug.
- **Full WebSite+Person+Organization JSON-LD** — ~70% already exists in `default.hbs` L74+; descoped to a small delta (Tier 3).
- **`Course` schema on /start/** — not a course; schema-abuse risk. Use `LearningResource`.
- **Repurposing `post-card.hbs` for product cards** — it expects a post context object; use a tiny dedicated partial.
- **FAQ/HowTo rich-result claims** — Google killed both (2023); schemas kept for GEO value only, rescored to Tier 3.

---

## Shipped beyond this plan (2026-07-17)

Funnel work landed that this plan did not foresee — recorded here so tiers stay honest:
- **Newsletter page tier rework**: Free + Supporter (Ghost portal) + single Knowii Community card → store; member-aware ("Go further" view; Free/Supporter cards hidden where redundant). Extracted to `components/membership-tiers.hbs`, also rendered on home (before final CTA) and on the About page.
- **`page-about.hbs`**: About converts at 3.2% (site's best) — template appends lead-magnet form + membership tiers after the admin-managed content.
- **Theme-owned subscribe overlay + floating bubble** (`components/subscribe-overlay.hbs`, `subscribe-bubble.hbs`): replaces Portal's modal on nav/sticky/sidebar triggers and Portal's launcher (hidden in admin). Free signup via native data-members-form; Supporter → portal; Knowii → store. Knowledge Builder/Master portal tiers archived in Ghost admin.
- **4-column footer** (brand/content/products/free resources, gradient) + link-spacing fix; lead-magnet form sizing fix.
- **Analytics**: Plausible custom-event goals created (CTA Click, Subscribe Intent, Signup, Store Click) + `plausible-events.js` wiring through the blue-bar worker. Post-signup `/welcome/` page drafted in Ghost (needs publish + free-tier welcome-page setting).
- **Live prices everywhere** via store products-light.json pricing block + `prices.js` hydration (supersedes this plan's delete-prices policy — see 1.2).

## Tier 1 — Do first

### 1.1 Fix the trust-breaking bugs (effort: minutes) — ✅ DONE 2026-07-17
- `src/start.hbs` L122: "Get It Free →" under "Free Knowledge System Checklist" pointed to the **paid** `store.dsebastien.net/product/knowledge-management-for-beginners` (€69.99). FIXED → now points to `https://www.dsebastien.net/free-knowledge-management-system-checklist`.
- ~~`www.store.dsebastien.net` double-subdomain URLs~~ — INVALID FINDING: verified live, `www.store.dsebastien.net` is the canonical host (the non-www form 301s TO it). Both forms return 200. Do not "fix" these.
**Why:** a broken free promise at maximum visibility, one click after "Get started, it's free ✨".

### 1.2 Centralize stats via `@custom` + live prices from the store catalog — ✅ DONE 2026-07-17
Implemented with a policy amendment: instead of deleting prices, they are now HYDRATED live from `store.dsebastien.net/products-light.json` (which gained a `pricing` block, store commit cd2fc85) via `assets/js/prices.js` + `data-price` attributes — hardcoded values remain as no-JS/SEO fallbacks. 6 stat fields added to `config.custom` (14/20 slots), 21 usages replaced. CSP `connect-src` updated by Sébastien. Original spec below for reference.

### ~~1.2 original~~ Centralize stats via `@custom`, delete all prices (prerequisite for every restructure)
- `src/package.json` `config.custom` currently has 8 of Ghost's 20 slots. Add ≤6: `stat_newsletter_members`, `stat_community_members`, `stat_years_expertise`, `stat_products_sold`, `stat_concepts_count`, `stat_articles_count` (→ 14/20; do NOT add per-price fields — 14 prices would blow the cap, and policy is delete anyway).
- Replace hardcoded stats in: `home.hbs` L15-19/31/45-59/159/172/317, `start.hbs` L20-24/396, `partials/components/lead-magnet-cta.hbs` (×2), `partials/components/sticky-cta.hbs`, `partials/footer.hbs`.
- Delete all 14 prices in `start.hbs` (L116, 185, 192, 243, 250, 257, 397, 403, 409, 470, 476, 482, Knowii tiers L273-287, bundle L524). Product CTAs become benefit-framed links; the store page owns the price.
**Why first:** doing 1.3/1.4 before this means restructuring hardcoded values twice (explicit verdict warning). One Admin → Design field update then refreshes 14+ surfaces with zero deploys.
**Caveat:** code injection is NOT the mechanism (opaque HTML, not template variables) — `config.custom` + `{{@custom.*}}` only.

### 1.3 Member-aware single-CTA hero with identity anchor — ✅ DONE 2026-07-17

**Shipped** (hero copy chosen via a judged 3-angle copy panel; outcome-first won, grafted pain-first's "save everything and find nothing" hook): H1 "The Knowledge System That Turns Overload Into Output 🧠" (8 words); H2 names the audience + the pain; a 2-line identity anchor (WHO, placed *above* the stat strip so the name lands before the numbers); ONE primary button → `/start/` ("Start here, it's free"); the `path-router` (home variant) directly under the button; the store demoted to a `.hero-textlink` fallback (no second button). Three mutually-exclusive states via a single `{{#if @member}}…{{#if @member.paid}}PAID{{else}}FREE{{/if}}…{{else}}COLD{{/if}}`: **cold** = full pitch; **free member** = "Welcome back" + jump-to-latest + one Knowii upgrade CTA; **paid member** = compact shortcut row (Community / Latest articles / Account). Adversarial-review follow-through: (a) the entire commerce stack (results-proof, enemy, identity-benefits, offerings grid, risk-reversal, membership tiers, CTA funnel) is now wrapped in `{{#unless @member}}` — members are routed, not re-pitched (plan Vision); members see hero shortcuts → about → youtube → fresh strips → approach. (b) Lead magnet moved below the About section so the first screen carries a single ask. No JSON-LD added (Person delta stays Tier 3). New CSS: `.hero-identity-anchor`, `.hero-textlink`, `.hero-welcome`, `.hero-member-shortcuts`. gscan clean.

**Original spec (for reference):**

Three states via native `@member` / `@member.paid`:
- **Cold** (`{{#unless @member}}`): new H1 naming audience + outcome in <12 words (e.g. "The Knowledge System for Serious Creators" — Creators are the stated primary segment); H2 = specific benefit line; 2-line identity anchor directly under it ("Sébastien Dubois — 20 years in software, {{@custom.stat_newsletter_members}} readers") reusing the already-loaded `seb.jpg`; ONE primary button → `/start/` ("Start here — it's free →"); "Explore Solutions" demoted to a text link; inline 3-option segment router row (new-to-PKM → `/start/#area-foundation` | messy system → `/start/#area-system` | ready-to-buy → store) as a shared `partials/components/path-router.hbs`.
- **Free member**: "Welcome back" + link into the fresh strips (1.5) + one Knowii upgrade CTA.
- **Paid member**: shortcut row — community, latest posts, account.
Also: shrink the L113-121 bio section to "More about me →" (identity moved up); add `rel="me"` links (GitHub/LinkedIn/YouTube) + `itemid` reference to the existing Person JSON-LD node in `default.hbs` — don't duplicate the entity.
**Caveats:** one owner for L6-32 — four proposals collided here, this workstream is the merge. If the site fronts `/` with full-page CDN caching, exclude `/` or member variants leak across cohorts (Ghost(Pro) handles it natively). Anchors in the router require matching `id`s in start.hbs (added in 1.4).

### 1.4 De-commercialize /start/ + visitor router — ✅ DONE 2026-07-17

**Shipped:** `components/path-router.hbs` created with `variant="start"` (in-page anchors: foundation / system / application) and `variant="home"` (ready for 1.3: /start/ anchors + store); rendered under the /start/ hero; clicks flow into the CTA Click goal via `data-cta="router-*"` / `data-cta-topic="router"`. All five recommended-resources blocks replaced with one benefit-framed `offer-card` each (no prices, `hideKnowii=true`, topics `start-foundation|system|practice|application|creation`). Knowii pricing table → narrative CTA block (one testimonial + one button to the long-form page); Everything Bundle and bottom Community sections deleted; timeline CTA trimmed to the Knowii link only; Further Learning → 3-button links row (articles / videos / newsletter). Two lead magnets kept (obsidian top, checklist bottom). Dead CSS excised (~200 lines: knowii-tiers, bundle, community, product-recommendation). start.hbs 599 → ~340 lines.
- Add the shared `path-router.hbs` under the /start/ hero (L16-28): "Brand new" → `#area-foundation` | "Have a messy system" → `#area-system` | "Want to publish consistently" → `#area-application`. Add the `id` anchors to the five area sections. (Absorbs old plan item 2's `#area-foundation` hero CTA.)
- Replace each recommended-resources block (L116-257, L397-482) with ONE contextual offer per layer — benefit-framed, no price ("Ready to go deeper? The Obsidian Starter Kit gets you to Day 30 faster →"). **Reuse `contextual-offer.hbs` from the blog overhaul (Tier 1.3 there)**; if it hasn't landed yet, ship a plain static partial with the same slot signature and swap later (verdict-flagged dependency).
- Delete: mid-page Knowii pricing table (L268-344 — keep one narrative CTA to the Knowii long-form page, which the audit confirmed converts), bottom Community section (L557-579), Everything Bundle section (L519-554). Buyers route to store/Knowii pages that own pricing.
- Replace empty Further Learning (L590-596) with a compact links row (articles / videos / newsletter).
- Lead magnets: `obsidian` variant above the fold (keep L58-62), `checklist` variant at bottom (keep L582-584), drop the third mid-page capture unless a `tools` variant (Tools for Thought DB) is added to `lead-magnet-cta.hbs` — max 2-3 captures.
**Why:** /start/ currently shows €14.99-€399.99 across ~25 store links before layer one ends, contradicting the free promise that routed people there — the audit's biggest cold-conversion break.

### 1.5 Fresh-content strips on home — ✅ DONE 2026-07-17

**Shipped:** two `{{> "components/topic-section"}}` strips inserted after the YouTube card — "Best of the blog" (`featured:true+tag:blog`, seeAll → `/feeds/best/`, anchor `home-best`) and "Latest articles" (`tag:blog`, seeAll → `/blog/`, anchor `home-latest`), 3 cards each. `topic-section.hbs` gained an optional `limit` param: to avoid the bare-`limit` NQL default of 15 silently changing other callers, every existing call in blog.hbs (10) was given an explicit `limit=6` first, then the partial switched to `limit=limit` (verified: 12 total calls, none without an explicit limit). Strips render for all cohorts (returning members get proof-of-life; the free-member hero links here). gscan clean.

**Original spec (for reference):**

After the YouTube card (~L124): two `{{> "components/topic-section"}}` includes —
- "Best of": `topicFilter="featured:true+tag:blog"` limit=3, post-card **large**, `seeAllUrl="/feeds/best/"` (channel exists in routes.yaml; 13 featured posts exist).
- "Latest articles": `topicFilter="tag:blog"` limit=3, post-card **compact**, `seeAllUrl="/blog/"`.
`loading="lazy"` on card images (below fold). Heading = "Latest articles", NOT "This week" (stale-looking if publishing pauses).
**Why:** the homepage has zero dynamic content — returning readers get nothing, cold visitors get no proof of life. ~15 lines of template, self-updating forever.

---

## Tier 2 — Big bets

### 2.1 Replace start.hbs's ~70 hardcoded article links with topic-section strips
Each of the five areas (L65-265, L346-488) becomes one `{{> "components/topic-section"}}` call scoped to the layer's topic tags `+tag:blog`, limit=6, compact cards, `seeAllUrl` → the **existing** channels: `/feeds/pkm/` (Foundation/System/Practice split by tag), `/feeds/productivity/` (Application), plus tag routes (`/tag/{slug}/` — native, no query-param filtering) where a channel doesn't fit. Curate each layer's "Quick Win" first-touch article via an internal tag (`#start-foundation` etc.) with a second `{{#get}}` limit=1 — filter syntax `tag:hash-start-foundation` (internal tags need the `hash-` prefix).
**Kills in one move:** slug rot / 404 risk, duplicate links, crossed Zettelkasten/Overview titles (L163-164), off-topic OpenClaw entries (L365, L440), the 12-18-item mobile tap-target walls. start.hbs drops ~600 → ~250 lines.
**Real cost (why Tier 2):** a Ghost Admin tagging pass — the layer taxonomy must actually be applied to posts. Content ops, not theme work. Also watch cumulative `{{#get}}` count (~10-12 on the page) — measure render time once.

### 2.2 Collapse home's 7-product grid into a 3-path chooser (`src/home.hbs` L157-223)
Three cards, one product + one outcome sentence + one CTA each: "Just exploring (free)" → `/start/` | "Want a proven system" → Obsidian Starter Kit | "Ready for the community" → Knowii. Small dedicated partial (NOT post-card — wrong context object, per verdict). The 6-product grid survives as a collapsed `<details>` "See all products" beneath. Keep the Knowii featured card's hardcoded "3,400 concepts" on `@custom.stat_concepts_count`.
**Why:** 7 equal cards to a cold visitor = paralysis; none converts.

### 2.3 `/start/{pillar}/` guided paths (planned route map; TODO.md's per-pillar pages)
Ghost Pages (slugs `start-foundation`…`start-creation`) + one `src/custom-start-pillar.hbs` template (Ghost auto-offers `custom-*` templates in the editor): intro/Quick Win prose in `{{content}}` (Admin-editable, no deploys), template appends the layer's topic-section strip, contextual-offer slot, prev/next-layer nav via `{{#match page.slug}}`. Add five routes to `configuration/routes.yaml` (`/start/foundation/: { data: page.start-foundation, template: custom-start-pillar }` — the data binding also 301s the bare page URL). /start/ then shortens further: hero + layer stack + router + five pillar links + one lead magnet. A sixth page for the Creators persona (primary segment, TODO.md's per-persona ask) fits the same template. Add 3-item BreadcrumbList JSON-LD inside this template (not topic-section).
**Sequence:** strictly after 2.1 — pillar pages are assembled from parts that must already exist. Highest-effort item in the plan.

### 2.4 Extract the five-layer framework into `partials/components/layer-stack.hbs`
Two divergent hardcoded implementations (home.hbs L127-154 steps vs start.hbs L29-55 stack) → one partial with `variant="compact|full"` via `{{#match}}` (Ghost ships the helper). Home: shrinks to stack + one line + single CTA → `/start/#area-foundation`. Start: stays the hero diagram, each layer bar becomes an in-page anchor to its area (the "jump to where you are" self-routing the audit found missing). Fix the orphan `benefit-item` class (home.hbs L106) while in there. CSS already exists around `screen.css` L2570+.

### 2.5 Answer-first blocks + semantic markup (GEO)
- home.hbs: follow the H2 with a 100-150-word extractable definition block (what PKM is + who Sébastien is) — the E-E-A-T copy from 1.3 doubles as this.
- start.hbs: 130-word "What is knowledge mastery?" block above the layer diagram.
- Both: real `<h2>` + semantic `<ol>/<ul>` on the Five Layers section so Foundation→Creation is extractable as the canonical BuilderOS framework definition (the term being claimed). Lowest-risk item in the batch per verdicts; pure copy/markup.

### 2.6 Internal linking: make /start/ a hub that receives PageRank
- `partials/components/sidebar.hbs` (included from post.hbs): tag-conditional "Part of the Knowledge Mastery curriculum → Start here" via `{{#has tag=}}` on the layer topic tags.
- `/blog/` front page: "New to PKM? Start here" above the topic nav (coordinate with the blog overhaul — it must land first).
- home.hbs: standardize one of the three `/start/` links' anchor text to "Personal Knowledge Management guide" for the head term.

---

## Tier 3 — Polish

### 3.1 Testimonial wall → 3 + expansion (`src/home.hbs` L226-252)
New `partials/components/testimonial-wall.hbs`: 3 strongest outcome-specific quotes (hours saved, publish frequency) with name + role, remaining 21 in `<details>` "Read more stories". Removes ~25 mobile screens of scroll. Curation still needs a deploy (no testimonial CMS) — acceptable.

### 3.2 Structured-data delta (NOT a rebuild — `default.hbs` L74+ already has WebSite + Person + sameAs + worksFor)
One `partials/components/json-ld-extras.hbs` next to `{{ghost_head}}`: top-level Organization node with `@id` cross-referenced from Person; `ProfilePage` on home pointing at `/about`; `FAQPage` on home from the 7 existing `<details>` L255-306 (answer text in the script block, <300 words each — GEO value only, no rich results since 2023); `HowTo` (5 layers → `HowToStep` with `#area-*` URLs) + `LearningResource` on start (GEO only); 2-item `BreadcrumbList` on start. No SearchAction, no extra canonical.

### 3.3 Meta description + OG (mostly Admin/content work)
- home.hbs: add a `{{#contentFor "meta_description"}}` block (default.hbs exposes the slot at L147) — keyword-targeted, ~155 chars; test against `ghost_head` output for double-emission (default.hbs L146-152 documents the interplay).
- start.hbs L4-6: **rewrite** (it's filled, not empty) to target "how to build a personal knowledge management system from scratch". Single owner — this item, not 3.2.
- Two custom OG images (1200×630: layer diagram for /start/, photo + headline for /) — set in Ghost Admin page settings + image production, not theme code.

### 3.4 Sticky-cta on the two longest scrolls
`{{> "components/sticky-cta"}}` in home.hbs and start.hbs (currently only post.hbs L256); its "6,000+"/"800+ articles" copy moves to `@custom` in 1.2. Skip the extra under-hero router here — 1.3/1.4 already own routing (verdict: redundant if both land).

### 3.5 Remaining cleanups
- Builder OS teaser (start.hbs L447-462): 8 bullets → 3 sentences + CTA (survives from the old plan).
- Timeline section: keep, position after the five areas.
- Revisit `default.hbs` L200-281 client-side link-rewriter once prices/links are centralized — likely deletable (out of scope here; note it).

---

## Absorbed plan: `start-page-improvements.md` disposition
| Old item | Fate |
|---|---|
| 1. Checklist link bug | **Survives** → Tier 1.1 |
| 1. Dedupe 3 articles / remove OpenClaw | **Superseded** by 2.1 (tag queries make dupes/off-topic impossible) |
| 2. Hero anchor CTA `#area-foundation` | **Absorbed** into 1.4 router |
| 3. Trim lists to 6 + "See all" | **Superseded** by 2.1 (live data, not manual trim) |
| 4. Builder OS teaser trim | **Survives** → 3.5 |
| 5. Delete bottom Community | **Survives** → 1.4 |
| 6. Further Learning → links row | **Survives** → 1.4 |
| 7-8. Move Bundle / reorder bottom | **Superseded** — bundle is deleted, not moved (1.4) |

Mark the old file superseded-by this plan (header note), don't delete until Tier 1 ships.

---

## Page-job map
`/` markets and routes (cold → `/start/`, member → content/community, buyer → store); `/start/` is the guided free curriculum hub feeding five `/start/{pillar}/` pages (Tier 2.3) and receiving inbound links from every curriculum post; `/blog/` is the flagship magazine for depth and returning readers (articles-page-overhaul); `/feeds/*` channels are the "see all" long tail; the store and the Knowii long-form page are the only surfaces that show prices.

## Measurement
Custom events via the existing Plausible-style worker (`default.hbs` L21-26); name = `page:element`:
- `home:hero-cta` (primary → /start/), `home:router-*` (3 paths), `home:strip-click` (fresh-content cards), `home:chooser-*` (3-path cards), `home:store-textlink`.
- `start:router-*`, `start:offer-<layer>`, `start:seeall-<layer>`, `start:knowii-cta`, `start:pillar-<name>` (Tier 2.3).
- Email: per-`email_field_id` signup counts (home-hero-email, start-email, footer-email).
Thresholds (first 30 days post-Tier-1, vs 30-day pre-baseline):
- `/` → `/start/` CTR ≥ 8% of unique home visitors (currently split across ~20 CTAs).
- Email signup rate on `/` + `/start/` combined: +50%.
- `/start/` → store bounce-back < before (measure store clicks per /start/ session; expect FEWER clicks but higher store-page conversion — watch Gumroad/store analytics, not just clicks).
- Checklist lead magnet: >0 downloads (currently structurally impossible — the link points at a paid product).
- start.hbs render time with ~10-12 `{{#get}}` queries: TTFB delta < 100ms vs current.

## The One Thing
Ship Tier 1.1 today — the "Get It Free →" checklist CTA on /start/ sends people who just clicked "it's free" to a €69.99 product page, and no redesign matters while the first promise on the page is a lie.
