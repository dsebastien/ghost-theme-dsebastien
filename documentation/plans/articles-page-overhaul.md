# Articles Page Overhaul — Plan

Repo: `/home/dsebastien/wks/ghost-theme-dsebastien`
Scope: everything between "someone lands on the site" and "someone finishes an article" — with 687 posts (292 articles + 223 newsletters + 170 news; see Audit findings), 176 public tags, 7 content pillars, and a full product/newsletter ladder attached.

---

## Vision

The articles experience becomes a **hub-and-spoke topical mesh** driven by Ghost's native primitives (collections, channels, tags, Portal tiers) rather than by hardcoded HTML strips and copy-pasted `{{#get}}` batches.

**`/blog/` is the flagship and stays at its URL.** It is the page readers land on and the page that must do justice to the catalog. `/all-articles/` remains a utility index for maintenance and crawlers — no migration, no renaming.

Three moves define it:

1. **`/blog/` becomes a curated magazine front page**, not a 60-card wall. Hero + editor's picks, a "start here" on-ramp, de-duplicated data-driven topic sections with curated leads, freshness and best-of strips, and conversion modules woven between sections. Sticky topic nav + search for wayfinding.
2. **Every "see more" from `/blog/` lands somewhere rich.** Enriched tag pages, pillar hubs (Tier 2), and cmd-K search replace the current cliff-drop onto a bare 21-line `tag.hbs`. Every article ends in a topical loop (related, prev/next, series) before ONE contextual offer + ONE contextual lead magnet chosen from the post's TOPIC tags (`{{#has tag=}}` — NOT `primary_tag`, which is the content-type marker; see Audit findings).
3. **Everything above compounds through structured data, real freshness, and site search.** Article/BreadcrumbList/CollectionPage schema everywhere, real `dateModified`, a working cmd-K palette, and a proper `/tags/` hub turn the 515-post catalog from an inert wall into a machine-legible knowledge graph that both humans and AI answer engines can traverse.

Conversion follows naturally: 7 pillars × pillar-matched lead magnet + pillar-matched product recommendation + Portal tier-aware CTAs = every article page becomes its own funnel, not a broadcast of the same "Knowledge System Checklist" everywhere.

---

## Audit findings — live Content API, 2026-07-17

Queried `dsebastien.ghost.io` Content API (public key from the site frontend). These facts override earlier assumptions and are baked into the tiers below.

**Content model**
- 687 posts total: 292 `primary_tag:blog`, 223 `primary_tag:newsletter`, 170 `primary_tag:news` (+2 other). 176 public tags.
- **`primary_tag` is the content-TYPE marker, not a topic.** Every article's primary tag is `blog`. All nine `/blog/` section topics have ZERO posts as `primary_tag`. Consequence: anything keyed on `primary_tag` for topical logic (CTA mapping, related posts, card tag pill) is wrong by construction — use topic tags (`{{#has tag=}}` / tag list minus the markers) instead.
- **`tag:blog` is the deliberate inclusion marker** for the articles surface (confirmed by Sébastien). Newsletters, news, project pages etc. must never appear on `/blog/` even when they share topic tags.

**Live bugs on `/blog/` today**
- **Topic sections leak non-article content**: sections filter bare `tag:<topic>` without `+tag:blog`. Leakage right now: PKM 9 posts, Obsidian 7, Productivity 3, AI 2, Personal Development 1, Personal Organization 1 — newsletters/news showing up in article sections.
- **43% of the catalog is invisible**: 127 of 292 articles match NONE of the nine section tags. Biggest omissions (blog-scoped counts): `software-development` 91, `tools` 40, `note-taking` 40, `writing` 30, `ai-2` 20, `entrepreneurship` 13. Adding those clusters drops the uncovered set from 127 to 21.
- **The AI section is stale**: it filters `tag:ai` (11 posts, newest 2026-03) while active AI content uses `ai-2` (newest 2026-07). Blog-scoped `tag:[ai,ai-2,ai-skills,claude-code]` = 22 posts.
- **Heavy duplication across sections**: pkm∩learning 37, pkm∩note-taking 36, pkm∩obsidian 23, productivity∩personal-organization 14, productivity∩personal-development 14.

**Curation + routing facts**
- `featured:true` = 13 posts, all articles — a healthy, already-curated pool for the hero zone and best-of strip.
- All post URLs live at `/{slug}/` — the unfiltered `/` collection owns every post, so the `/blog/`, `/newsletter/`, `/news/` collections' permalinks never apply. **BUT their RSS feeds are live, correctly filtered, and populated** (`/blog/rss/`, `/news/rss/`, `/newsletter/rss/` — 15 items each) and those URLs are referenced all over the web. **The collections and the `/newsletter/` + `/news/` routes MUST stay.** Nothing gets deleted; the only inert part is the `{slug}` permalink filters, which are harmless.

---

## Information Architecture — proposed route map

`configuration/routes.yaml` sketch (only the parts that change):

```yaml
routes:
  /:                    { template: home }              # marketing landing (unchanged)
  /blog/:               { template: blog }              # FLAGSHIP — rebuilt magazine front page (Tier 1.0)
  /start/:              { template: start }             # global "start here" (unchanged)
  /start/{pillar}/:     { template: start-pillar }      # NEW — per-pillar guided path (pages)

  /tags/:               { template: tags-hub }          # NEW — replaces 404
  /search/:             { template: search }            # NEW — search-first archive

  /all-articles/:                                       # utility crawl index — becomes a channel so it paginates
    controller: channel
    filter: "tag:blog"
    template: all-articles
    rss: false

collections:
  /:
    permalink: /{slug}/
    template: index                                     # unchanged — post URLs stay /{slug}/
  # KEEP the /blog/, /newsletter/, /news/ collections EXACTLY as they are.
  # Their {slug} permalink filters are inert (the unfiltered / collection owns
  # every post), but they generate the live, correctly-filtered RSS feeds at
  # /blog/rss/, /newsletter/rss/, /news/rss/ — URLs referenced all over the web.
  # Do not delete, do not rename. (Audited 2026-07-17: 15 items each, filtered right.)

  # 7 pillar collections (rss:true each; native pagination + infinite scroll)
  /pillars/pkm-foundations/:      { permalink: /pillars/pkm-foundations/{slug}/,    template: pillar, filter: "tag:hash-pillar-pkm-foundations",    rss: true }
  /pillars/tools-and-systems/:    { permalink: /pillars/tools-and-systems/{slug}/,  template: pillar, filter: "tag:hash-pillar-tools-and-systems",  rss: true }
  /pillars/writing-and-thinking/: { permalink: /pillars/writing-and-thinking/{slug}/,template: pillar, filter: "tag:hash-pillar-writing-and-thinking",rss: true }
  /pillars/knowledge-work/:       { permalink: /pillars/knowledge-work/{slug}/,     template: pillar, filter: "tag:hash-pillar-knowledge-work",     rss: true }
  /pillars/zen-productivity/:     { permalink: /pillars/zen-productivity/{slug}/,   template: pillar, filter: "tag:hash-pillar-zen-productivity",   rss: true }
  /pillars/content-systems/:      { permalink: /pillars/content-systems/{slug}/,    template: pillar, filter: "tag:hash-pillar-content-systems",    rss: true }
  /pillars/creator-systems/:      { permalink: /pillars/creator-systems/{slug}/,    template: pillar, filter: "tag:hash-pillar-creator-systems",    rss: true }

taxonomies:
  tag: /tag/{slug}/
  author: /author/{slug}/
```

Redirects (`configuration/redirects.yaml`):
- `/all-tags/` → `/tags/` (301)
- `/archive`, `/topics/`, `/categories/` → `/tags/` (301)
- consolidate duplicate tags: `/tag/ai-2/` → `/tag/ai/`, `/tag/knowledge-management/` → `/tag/personal-knowledge-management/`, `/tag/perserverance/` → `/tag/perseverance/`

Notes:
- **`/blog/` keeps its URL and template** — it is the flagship, rebuilt in Tier 1.0. `/all-articles/` keeps its URL as the utility crawl index (converted to a channel so it paginates past the `{{#get}}` cap).
- Pillar filters use internal `hash-pillar-*` tags applied in Ghost admin (kept out of `/tag/`). A one-time admin backfill script maps existing tags → pillar hash tags.
- Existing channels (`/feeds/pkm/` etc.) stay as RSS-only surfaces; pillar collections are the primary browsable destinations once Tier 2.1 ships.

---

## Tier 1 — Do first (high impact, low-to-medium effort)

Ordered by impact.

### 1.0 Rebuild `/blog/` as the flagship magazine front page — ✅ DONE 2026-07-17
Shipped across commits 2d22965→d799139: tag:blog-scoped cascaded topic sections (100% coverage), featured hero + editor's picks + Latest row, sticky topic nav (wrapping pills on desktop, jump-to-topic select on mobile), inline capture + offer bands, CollectionPage JSON-LD still pending (see 1.7). Original spec below.

### ~~1.0 original~~ Rebuild `/blog/` as the flagship magazine front page

THE page. `src/blog.hbs` today is 10 hardcoded topic sections × 6 identical cards (~60 uniform cards), a "Recent" strip filtered on `tag:blog`, heavy cross-section duplication (a post tagged `obsidian`+`personal-knowledge-management`+`knowledge-work` renders 3×), no hierarchy, no curation, no conversion in the main column, and "See more" links that drop onto a bare 21-line `tag.hbs`.

**Build** — full rewrite of `src/blog.hbs`, top to bottom:

1. **Hero zone** (replaces the text header + flat "Recent" grid): one `hero`-size card for the newest `featured:true` post, two `large` cards for the next two featured, plus a compact "Latest" list of the 5 newest posts. Curation lever = Ghost's featured flag — zero new admin concepts. Uses the post-card size variants from 1.9.
2. **Sticky topic nav**: the 9 anchor links become a sticky pill bar with scroll-spy (IntersectionObserver) + a search button (opens cmd-K palette when 2.2 ships; sodo-search until then). Wayfinding that survives scrolling, instead of a paragraph of links that disappears.
3. **"Start here" strip**: 3–5 evergreen on-ramps via internal tag `#start-here`, linking onward to `/start/`. First-time visitors get an entry path before the wall.
4. **Topic sections — data-driven, scoped, and de-duplicated**: replace the ten copy-pasted `{{#get}}` blocks with one parameterized partial `src/partials/components/topic-section.hbs` (params: `title`, `filter`, `magnet`, `seeAllUrl`). Three mechanics, all grounded in the audit:
   - **Scope every section to articles**: `tag:blog+tag:<topic>` — fixes the live leakage of newsletters/news into topic sections (9 posts in PKM alone today).
   - **De-duplicate via cascading exclusions** (NOT `primary_tag` — that's the content-type marker): order sections specific→general and exclude earlier topics, e.g. Obsidian = `tag:blog+tag:obsidian`, then PKM = `tag:blog+tag:personal-knowledge-management+tag:-obsidian`, then Learning = `...+tag:-[obsidian,personal-knowledge-management]`, etc. Deterministic, server-rendered, crawlable. Filter strings grow for later sections but stay well within NQL limits.
   - **Fix the section set so ~100% of the catalog is reachable**: fix AI to `tag:[ai,ai-2,ai-skills,claude-code]` (22 posts vs today's stale 11), and add sections for the invisible clusters — Software Development (91!), Tools (40), Writing (30) — folding `note-taking` (40) into PKM. That takes uncovered articles from 127/292 (43%) down to ~21, catchable with a final "More" section (`tag:blog` excluding all section topics).
5. **Conversion woven between sections**: one inline newsletter module (`email-subscription.hbs` + a social-proof line) after the second section; a topic-matched lead-magnet band from `contextual-offer.hbs` (1.3) at every third section boundary, keyed by the section's topic. Today the main column contains ZERO conversion surface — everything sits in the repeated generic sidebar.
6. **Freshness + best-of strips**: a "Recently updated" strip (`order="updated_at desc"`, badge logic from 1.8) and a "Best of" strip (`featured:true`, linking to `/feeds/best/`).
7. **CollectionPage + ItemList JSON-LD** (1.7) on the page.
8. **"Recent" semantics are CORRECT**: `tag:blog` is the deliberate inclusion marker for the articles surface (audit-confirmed: 292 posts, exactly matching `primary_tag:blog`). Keep it — and apply the same `tag:blog` scope to every section, strip, and the hero zone (the current sections forgot it; see the leakage bug above).

**Files**
- `src/blog.hbs` (full rewrite)
- `src/partials/components/topic-section.hbs` (new)
- `src/partials/post-card.hbs` (size variants — 1.9)
- `src/partials/components/contextual-offer.hbs` (1.3)
- `src/assets/js/blog-nav.js` (new — sticky pills + scroll-spy, ~2KB vanilla)

**Why**
- This is the page readers actually visit; it currently reads as a directory, not a front page. Hierarchy (hero → start-here → topics) lets the best work surface instead of drowning in uniform cards.
- De-duplication roughly doubles the number of DISTINCT posts visible without adding length.
- The parameterized partial kills ~150 lines of copy-paste; adding/reordering a topic becomes a one-line change.
- Inline, topic-matched conversion in the main column converts browsing intent where it happens — the sidebar is banner-blind real estate.

**Caveats**
- Cascading exclusion changes section membership vs today (a post shows once, in its most-specific section). The audit numbers above predict the counts; spot-check the rendered page against them.
- ~13 `{{#get}}` queries per render is acceptable (Ghost caches rendered pages) but don't grow it further; strips share queries where possible.
- Featured pool is 13 posts, all articles (audit-confirmed) — ideal size for hero + best-of; keep it curated at 10–15.

### 1.1 Fix `/all-articles/` as the utility crawl index (paginated, un-capped) — DONE 2026-07-17

Converted to a channel (`controller: channel`, `filter: "tag:blog"`, `rss: false`) in `routes.yaml`; `src/all-articles.hbs` rewritten as a plain `{{#foreach posts}}` list (title + date + first topic tag, `data-year` markers) with `{{pagination}}` — the ten copy-pasted `{{#get}}` batches are gone.

`/all-articles/` exists for maintenance and search engines only; it just needs to be complete and crawlable, not pretty.

**Build**
- Convert the static route to a **channel** in `configuration/routes.yaml` (`controller: channel`, `filter: "tag:blog"`, `rss: false`) so it gets native Ghost pagination and `link[rel=next/prev]` autodiscovery instead of one giant capped `{{#get}}`.
- Simplify `src/all-articles.hbs` to a plain `{{#foreach posts}}` list (title + date + primary tag is enough); keep year markers via `data-year` attributes if cheap.

**Files**: `configuration/routes.yaml`, `src/all-articles.hbs`

**Why**: guarantees every one of the 515+ posts is reachable by crawlers regardless of catalog growth; removes the `{{#get}}` cap risk.

### 1.2 Ship `/tags/` hub + enriched tag pages — ✅ DONE 2026-07-17
Shipped: `tags-hub.hbs` at `/tags/` (main-topic cards + full 176-tag index from two paginated `{{#get "tags"}}` queries), `all-tags.hbs` deleted, `/all-tags`→`/tags/` 301s, `tag.hbs` enriched (kicker to /tags/, description hero, "Start with the best" featured strip, Knowii offer band, browse-all footer). Related-tags cooccurrence + curated `#start-here` strips deferred. Original spec below.

### ~~1.2 original~~ Ship `/tags/` hub grouped by the 7 pillars + kill the `/all-tags/` copy-paste

**Build**
- Add `/tags/` route in `routes.yaml` → `template: tags-hub`. 301 `/all-tags/` → `/tags/`.
- New `src/tags-hub.hbs`:
  - 7 pillar cluster cards at top (drawn from a committed `src/data/pillars.json` mapping pillar → tag slugs).
  - Below: single `{{#get "tags" limit="all" include="count.posts" order="count.posts desc" filter="visibility:public"}}` for the full A–Z index (174 tags easily fits).
  - Letter jump-nav + inline text filter.
- Enrich `src/tag.hbs` (currently 21 lines): tag hero with `{{tag.description}}`, a "Start here" strip via `{{#get "posts" filter="tag:{{slug}}+tag:hash-start-here" limit=3}}`, standard paginated feed, "Related tags" strip from a committed `src/data/tag-cooccurrence.json` (built by a small Node script that hits the Content API), pillar-matched lead magnet.
- `configuration/redirects.yaml`: consolidate `ai-2 → ai`, `knowledge-management → personal-knowledge-management`, `perserverance → perseverance`.

**Files**
- `configuration/routes.yaml`, `configuration/redirects.yaml`
- `src/tags-hub.hbs` (new), retire `src/all-tags.hbs`
- `src/tag.hbs` (rewrite)
- `src/data/pillars.json`, `src/data/tag-cooccurrence.json` (new)
- `src/partials/components/lead-magnet-cta.hbs` (wire in)

**Why**
- The current `/tags/` 404 is dead weight. A working hub gives the 174-tag graph a browsable entry point and consolidates internal link equity.
- Cluster-first display hides the 174-tag long tail behind 7 pillars — matches how humans think, matches the content strategy.
- Tag pages become rankable topic hubs (description + curated top + related), not thin auto-archives.

**Caveats**
- Tag descriptions must be authored in Ghost admin for the top 20 tags — one-off content work, not code.
- Co-occurrence JSON needs a rebuild-on-publish hook (`gulpfile.js` task hitting the Content API).

### 1.3 Contextual CTA + lead-magnet engine driven by TOPIC tags — ✅ DONE 2026-07-17 (commit 713a620)
Shipped as `offer-card.hbs` (presentational) + `contextual-offer.hbs` (post-context topic chain). One hero offer + one free magnet + Knowii nudge; fixed the dead AI branch (ai-2/ai-skills/claude-code); wired into post.hbs footer + /blog/ bands. Mid-article slot kept as subscribe/upgrade (deliberate — product pitches mid-read are more aggressive; revisit with data). Original spec below.

### ~~1.3 original~~ Contextual CTA + lead-magnet engine driven by TOPIC tags (kills the 15-branch `{{#has}}` cascade)

**Build**
- New `src/partials/components/contextual-offer.hbs`. Uses an ordered `{{#has tag=}}` chain over the post's TOPIC tags — `primary_tag` is unusable for this (it's always `blog` on articles; audit-confirmed). First match wins, most-specific topic first. Picks ONE hero product + ONE lead magnet + ONE community nudge per post/listing. Map:
  - `obsidian`, `dataview`, `templates`, `obsidian-starter-kit`, `obsidian-starter-course` → OSK Premium + Free Beginner's Guide to Obsidian
  - `ai`, `ai-skills`, `claude-code`, `ai-2` → AI Ghostwriter Guide + AI prompt pack
  - `personal-knowledge-management`, `zettelkasten`, `evergreen-notes`, `atomic-notes`, `note-taking` → KMB Course + Knowledge System Checklist
  - `productivity`, `personal-organization`, `routines`, `habits`, `time-management` → KWK + Personal Organization masterclass
  - `software-development`, `typescript`, `javascript`, dev cluster → Dev Concepts + newsletter
  - `entrepreneurship`, `solopreneurship`, `content-creation` → Knowii Master tier + AI Ghostwriter
  - default → Knowii Community + Knowledge System Checklist
- Wire it into `src/post.hbs`: replace the giant tag `{{#has}}` signature cascade AND the current `#mid-article-cta` JS-relocated block with one call at the mid-article slot and one at the footer slot.
- Wire into listings: `src/blog.hbs` (primary surface — topic-keyed bands between sections, see 1.0), `src/tag.hbs`, `src/pillar.hbs`, `src/author.hbs`, `src/partials/components/feed-archive.hbs`.
- Use existing `src/partials/email-subscription.hbs` (Ghost `data-members-form`) with Portal labels pre-selected per pillar for later segmentation.

**Files**
- `src/partials/components/contextual-offer.hbs` (new)
- `src/partials/components/lead-magnet-cta.hbs` (finally used — currently orphaned)
- `src/post.hbs` (strip cascade, insert partial ×2)
- `src/blog.hbs`, `src/tag.hbs`, `src/author.hbs`, `src/partials/components/feed-archive.hbs`, `src/partials/components/sidebar.hbs`

**Why**
- Single biggest conversion lever. Today every reader sees the same "Knowledge System Checklist" no matter what they read. Match the offer to the topic and the conversion rate goes up without adding CTA surface.
- Kills a giant maintenance liability (15-branch `{{#has}}` chain duplicated across mid and footer slots).
- Turns 515 articles into 7 targeted funnels each pointing at the right product-ladder rung.

**Caveats**
- Portal signup labels for segmentation must be created in Ghost admin.
- Track with `data-cta-topic="<topic>"` for Plausible custom events so per-topic performance is visible from day 1.

### 1.4 End-of-article discovery block — ✅ DONE 2026-07-17 (series-awareness deferred to T2.5)
Shipped `keep-reading.hbs`: "More on {topic}" (3 compact cards via tags.[1], featured-first) + older/newer-article prev/next, rendered before the signature/offer. Original spec below.

### ~~1.4 original~~ End-of-article discovery block — related + prev/next + series-aware (before any product signature)

**Build**
- New `src/partials/components/keep-reading.hbs` with 4 rows, rendered INSIDE `src/post.hbs` BEFORE the contextual offer:
  1. **Next in series** if any tag matches `hash-series-*`.
  2. **More on {topic}** — topic = the post's first non-marker tag (tags minus `blog`/`newsletter`/`news`): `{{#get "posts" filter="tag:blog+tag:{{topic}}+id:-{{id}}" order="featured:desc,published_at:desc" limit=4}}`. NOT `primary_tag` — that's always `blog` (audit).
  3. **You might also like** — all topic tags: `{{#get "posts" filter="tag:blog+tags:[{{topic tag slugs}}]+id:-{{id}}" limit=3}}`, excluding the "More on {topic}" picks.
  4. **Continue in this pillar** — link to `/pillars/{pillar}/` mapped from topic tags.
- Use Ghost's native `prev_post`/`next_post` helpers with `in="primary_tag"` for a compact prev/next strip — here `primary_tag` IS right: it walks chronologically within articles only (label it "Older / newer article", it is not topical).
- Series detection: introduce internal tags `#series-<slug>` in Ghost admin. Series manifest lives at `src/data/series.json` (order + title per series). `keep-reading.hbs` iterates it when the post has a `#series-*` tag.

**Files**
- `src/partials/components/keep-reading.hbs` (new)
- `src/post.hbs` — insert before contextual-offer
- `src/data/series.json` (new)

**Why**
- The current end-of-post leaks a 32-minute-guide reader straight to product boxes. Reclaim that highest-intent moment for another article, and subscribe/upgrade rates compound instead of terminating.
- Multi-signal related (all topic tags) beats single-tag related for topical relevance.
- Series awareness turns multi-part guides (Obsidian Properties, Bases dashboards, Newsletter #20–214) into cohesive journeys.

**Caveats**
- Multiple nested `{{#get}}` per post render costs API round-trips at build/cache time. Ghost caches these per post; acceptable.
- Inline "further reading" links between H2s (client-side JS injection) are NOT crawlable as internal links for SEO — do them but don't count on them for topical mesh. Server-side `keep-reading.hbs` is what SEO needs.

### 1.5 Sticky auto-generated TOC on long-form posts — ✅ ALREADY EXISTS
The theme already ships a client-side TOC (`assets/js/main.js` builds `nav.article-toc` with a Contents toggle). Nothing to build; the plan's finding was stale.

### ~~1.5 original~~ Sticky auto-generated TOC on long-form posts

**Build**
- `src/assets/js/toc.js` — scans `.gh-content h2, .gh-content h3` on load, adds anchor IDs, renders sticky right-rail TOC on `lg+`, collapsible `<details>` at top on `< lg`. IntersectionObserver for scroll-spy active state.
- Modify `src/post.hbs` to wrap `.gh-content` in a grid with `<aside class="post-toc">` and add `body.long-form` class when `{{reading_time}} > 8`.

**Files**
- `src/post.hbs`, `src/assets/js/toc.js` (new), `src/assets/css/post-toc.css`

**Why**
- A 32-minute Obsidian Properties guide has no map. TOC drops bounce on cornerstone SEO content and doubles as engagement instrumentation.
- ~3KB JS, zero server cost.

### 1.6 Routes hygiene + dead-collection cleanup + nav de-dupe — ✅ DONE 2026-07-17 (except nav de-clutter)
Feeds channels scoped +tag:blog, /all-articles/ channelized, protective RSS-collection comments added, search-toggle finding invalidated (responsive pattern, not a bug). REMAINING: the 11-item nav de-clutter (promote Start/Articles/Community, Products dropdown). Original spec below.

### ~~1.6 original~~ Routes hygiene + dead-collection cleanup + nav de-dupe

**Build**
- **Collections and routes all STAY.** Audit resolved the earlier "dead config" hypothesis: the `/blog/`, `/newsletter/`, `/news/` collections' `{slug}` permalinks are inert (the unfiltered `/` collection owns every post), but their RSS feeds (`/blog/rss/`, `/newsletter/rss/`, `/news/rss/`) are live, correctly filtered, and linked from many places online. Zero deletions, zero URL changes. Add a comment in `routes.yaml` documenting WHY the collections exist (RSS) so nobody "cleans them up" later. — **DONE 2026-07-17**: explanatory comment block added above `collections:` in `routes.yaml`.
- **DONE 2026-07-17 — scope the `/feeds/` topical channels to articles**: appended `+tag:blog` to the `/feeds/pkm/`, `/feeds/ai/`, `/feeds/productivity/`, `/feeds/dev/` filters and changed `/feeds/best/` to `featured:true+tag:blog`, so newsletters/news no longer leak into those browsable pages.
- `/blog/` STAYS as a static route → the rebuilt `blog.hbs` (1.0). No URL changes, no redirects needed.
- ~~Dedupe `partials/search-toggle.hbs` — currently rendered 3× in `partials/components/navigation.hbs`.~~ **Verified false (2026-07-17)** — the brand and actions instances are swapped by CSS media queries at 768px (`.gh-navigation-brand .gh-search` hidden ≥768px, `.gh-navigation-actions .gh-search` hidden <768px — standard responsive pattern; exactly one visible per viewport). The third instance (inside `.gh-navigation-menu`) only renders when members are disabled, which is not the case on this site. No a11y bug, nothing to dedupe.
- Fix the duplicate 📰 icon in nav (News + Articles). Use 🗞️ for News, 📰 for Articles.
- Remove/reorder nav items to reduce the 11-item cognitive load: promote Start/Articles/Community, collapse Store/Courses/Coaching under a Products dropdown.

**Files**
- `configuration/routes.yaml`
- `src/partials/components/navigation.hbs`

**Why**
- The routes.yaml comment prevents a future "cleanup" from accidentally killing three live, externally-linked RSS feeds.
- Nav de-clutter raises click-through to the surfaces that matter (`/blog/`, `/start/`, community).

### 1.7 JSON-LD structured data — ⚠️ MOSTLY PRE-EXISTING; breadcrumb fixed 2026-07-17
Audit: theme already emits WebSite+SearchAction, Article (dateModified, keywords), BreadcrumbList. Fixed: breadcrumb now topical (Home > Articles|Newsletter|News > topic > title; was Home > "Blog" linking the marker tag page). REMAINING: CollectionPage/ItemList on /blog/, tag pages, /tags/ hub; FAQ schema where relevant. CAVEAT: SearchAction targets /search/?q= which does not exist until T2.2. Original spec below.

### ~~1.7 original~~ JSON-LD structured data (Article + BreadcrumbList + CollectionPage + WebSite/SearchAction + FAQ)

**Build**
- New partials: `src/partials/schema/article.hbs`, `breadcrumb.hbs`, `collection.hbs`, `faq.hbs`, `website.hbs`.
- `src/default.hbs` — inject `website.hbs` (WebSite + SearchAction pointing to `/search/?q=` on every page). Global `<head>` block.
- `src/post.hbs` — inject `article.hbs` (author, publisher, datePublished, dateModified, articleSection = first topic tag (NOT `primary_tag` — always "Blog"), keywords = topic tags, wordCount ≈ `{{reading_time}}` × 225) + `breadcrumb.hbs` (Home > Articles > Topic > Article, topic from first topic tag) + `faq.hbs` when a code-injection field or `#faq` tag is present.
- `src/blog.hbs`, `src/tag.hbs`, `src/pillar.hbs`, `src/author.hbs` — inject `collection.hbs` with `ItemList` position/url/name for each post.
- Real BreadcrumbList replaces the current "Blog > Article" generic breadcrumb.

**Files**
- `src/default.hbs`, `src/post.hbs`, `src/blog.hbs`, `src/tag.hbs`, `src/pillar.hbs`, `src/author.hbs`
- 5 new schema partials

**Why**
- Table stakes for GEO (AI answer engine) citability. LLMs preferentially cite content with unambiguous machine-readable authorship, dates, and topical scoping.
- Sitelinks searchbox potential from WebSite/SearchAction.
- Real BreadcrumbList replaces the useless generic "Blog > Article" trail with topical hierarchy.

**Caveats**
- Ghost emits some Article schema by default — audit and override rather than double up.
- `wordCount` isn't natively exposed; approximate via `reading_time * 225` or omit.

### 1.8 Freshness signals: `dateModified` + "Updated" badge + `/updated/` feed

**Build**
- In `src/post.hbs`, when `{{updated_at}}` > `{{published_at}}` + 30d, render both dates + an "Updated" badge above the title + optional "What changed" collapsible fed by a Ghost code-injection field.
- Emit `dateModified` = `{{updated_at}}` in Article schema (Tier 1.7).
- Add `/updated/` collection route → `template: updated`, sorted by `updated_at desc`. Same card layout as `/articles/`.

**Files**
- `configuration/routes.yaml`
- `src/post.hbs`
- `src/updated.hbs` (new)

**Why**
- Restores the freshness signal destroyed by the site-wide 2026-06 re-timestamp.
- Gives evergreen posts a second life without republishing.

**Caveats**
- Sitemap `lastmod` is Ghost-core-generated and not editable from a theme. The `dateModified` in schema + visible badge is the theme-side lever; the sitemap fix is out of scope (would need a Cloudflare Worker proxy — not blocking).

### 1.9 Enrich `post-card.hbs` and swap in size variants — ✅ DONE 2026-07-17 (freshness badge + data-attrs deferred)
Shipped: hero|large|regular|compact sizes, topic pill (tags.[1]), reading time. Deferred to later passes: freshness badges (needs 1.8), data-* filter attributes (needs the /blog/ client filter). Original spec below.

### ~~1.9 original~~ Enrich `post-card.hbs` and swap in featured/regular/hero sizes

**Build**
- `src/partials/post-card.hbs`: add `size` param (`hero` | `large` | `regular` | `compact`), expose a TOPIC pill = first non-marker tag, i.e. skip `blog`/`newsletter`/`news` (NOT `primary_tag` — always "Blog" on articles; audit); color via `pillars.json`, `reading_time`, `published_at`, relative freshness badge ("New" <14d, "Updated" if updated_at > published_at + 30d, "Evergreen" if `featured`), and a series badge when a `#series-*` tag is present.
- Data attributes for client-side filter: `data-year`, `data-pillar`, `data-primary-tag`, `data-reading-time`, `data-featured`.
- Primary consumer is the rebuilt `src/blog.hbs` (1.0): `hero` + `large` in the hero zone, `large` + `compact` in topic sections. Pillar hubs and tag pages reuse the same variants.

**Files**
- `src/partials/post-card.hbs`
- Every listing consumer

**Why**
- Card metadata (tags, read time) is currently hidden on `/blog/` — visitors can't judge relevance before clicking.
- Size variants make listings scannable rather than grid-monotonous.

---

### 1.10 Sidebar UX overhaul on /blog/ + reuse on posts — ✅ DONE 2026-07-17

**Shipped:** sidebar order is **About → Knowii card → Featured** (+ All Articles/All Topics links); Categories, product list, Free Resources, and Recommendations dropped (footer owns them); Knowii card wired to the CTA Click goal (`data-cta="knowii"` / `data-cta-topic="sidebar"`); all 5 call sites simplified to `showFeatured=true`. Post pages ≥1300px: `.post-side-rail` — absolute full-height column in the right whitespace of `.gh-content` with the sticky sidebar inside; auto-hidden via `:has(.kg-width-wide, .kg-width-full)` (6 of 296 posts use wide cards, verified via Admin API — rail would overlap those). The inline collapsible TOC is untouched (content column, no conflict). Mid-article subscribe CTA switched from `data-portal` to `data-subscribe-overlay` for surface consistency.

**Correction (same day):** the first cut added `max-height + overflow-y: auto` to `.gh-sidebar-inner` as a "safety net." It backfired — clipping turned the sidebar into a nested-scroll container, and because the Knowii card rendered *last*, the CTA fell into the clipped overflow and was only reachable via an awkward inner scroll (regression vs the old page-scrolling sidebar). Fixed by (a) rendering the Knowii card **above** Featured so the priority CTA is always visible near the top, and (b) removing the max-height/overflow clip so the sidebar scrolls with the page as normal flow. **Lesson: don't clip a sticky sidebar into internal scroll — order it priority-first and let it flow.**

**Problem:** the sidebar (`components/sidebar.hbs` inside `.gh-sidebar-inner`, `position: sticky`) is far taller than the viewport (about + featured + categories + products + free resources + recommendations). A sticky element never scrolls internally, so everything below the fold of the sidebar is unreachable until the PAGE scroll hits the bottom — on /blog/ that means scrolling through 10 topic sections before ever seeing the sidebar's product links.

**Build:**
1. **Slim it to viewport-fit first** (the real fix — the sidebar is a wall): the new 4-column footer now carries Categories, Free Resources, and the product list, so the sidebar can drop to: About card + Featured (5 links) + ONE product card (Knowii) — fits ~90dvh. Everything removed remains one scroll away in the footer.
2. **Internal scroll as safety net**: `.gh-sidebar-inner { max-height: calc(100dvh - <sticky offset>); overflow-y: auto; scrollbar-width: thin }` so any future content growth degrades to internal scrolling instead of unreachability. (Same fix pattern the subscribe-overlay panel got.)
3. **Reuse on post pages (desktop ≥1200px)**: once slimmed, render the same partial on post.hbs as a right rail while reading — About + Featured are exactly the "who is this person" surface the 3.2%-converting About page proves works. **Caveat:** must coordinate with the client-side `article-toc` (main.js) and the reading width of `.gh-canvas`; TOC gets priority, sidebar below it in the same rail.
4. Add `data-cta` attributes to sidebar product links so Plausible's `CTA Click`/`Store Click` goals cover them.

**Files:** `partials/components/sidebar.hbs`, `screen.css` (sidebar section), `post.hbs` (rail integration).

---

## Tier 2 — Big bets (high impact, high effort)

Ordered by impact.

### 2.1 Introduce 7 pillar hub pages — ✅ DONE 2026-07-18 (live; needs redeploy for the latest fixes)

**Shipped:** 7 pillar **channels** (not collections — collections partition posts and the unfiltered `/` owns them all) at `/pillars/<slug>/` in `routes.yaml`, each pointing at its own thin `src/pillar-<slug>.hbs` wrapper that passes name/emoji/intro/slug/bestFilter to the shared `src/partials/components/pillar-body.hbs`. Body = editorial hero (title + intro from wrapper params; offer switched on `pillarSlug`) + "Start with the best" featured strip + paginated channel feed with sidebar, **both feeds inside one `.gh-container.is-grid.has-sidebar > .gh-main`** (the proven blog/feed structure; a bare `.gh-container` collapses the grid) + one pillar-matched `offer-card` + "Explore the pillars" cross-link strip + CollectionPage/BreadcrumbList JSON-LD. Regular (not large) cards so the internal `#pillar-*` tag never leaks as the topic pill. CSS: `.pillar-*` block. Taxonomy source of truth: `src/data/pillars.json` (priority-ordered clusters). Backfill applied live via Admin API bulk `addTag` with exclusion chains (exact first-match): creator-systems 35, content-systems 15, tools-and-systems 86, writing-and-thinking 30, pkm-foundations 13, knowledge-work 30, zen-productivity 13; ~74 legacy dev/misc left pillar-less (stay in `/feeds/dev/`). Discoverability: "Browse by pillar" strip on `/tags/` + six `/blog/` topic sections re-pointed their "See more" at the matching pillar hub.

**Gotchas learned (all fixed):** (1) `data: tag.hash-pillar-*` does NOT work — Ghost's routes data-resolver uses the Content API, which excludes internal-visibility tags, so the binding resolves to nothing and Ghost 404s the whole route. Use per-slug wrapper templates instead. (2) A "best of" `.gh-feed` outside `.gh-main` collapses to ~0 width. (3) `large`/`hero` card variants always show the topic pill → internal pillar tag leaks; use regular cards. (4) `&amp;` in a partial param gets double-escaped by `{{param}}` → pass plain `&` (and `{{{param}}}` in JSON-LD).

Deferred: separate `#start-here-<pillar>` curated strip (uses featured instead), Portal newsletter segmentation by pillar.

**Original spec below.**

### ~~2.1 original~~ Introduce 7 pillar hub pages as first-class collections

**Build**
- Add 7 pillar collections in `routes.yaml` (see IA sketch above), each with `filter: "tag:hash-pillar-<slug>"`, `template: pillar`, `rss: true`.
- New `src/pillar.hbs`:
  - Editorial hero + intro (fetched via `{{#get "pages" filter="slug:pillar-{{@custom.pillar-slug}}" limit=1}}` or a per-pillar handcrafted `pillar-<slug>.hbs` variant).
  - 3-card "Start here" curated strip (posts tagged `#start-here-<pillar>`).
  - "Best of" strip (posts tagged `#best-of-<pillar>` or `featured:true`).
  - Paginated newest feed via `{{#foreach posts}}{{> "post-card"}}{{/foreach}}` (pagination.js works out of the box).
  - Pillar-matched lead magnet via `contextual-offer.hbs`.
  - Related pillars footer.
  - CollectionPage + BreadcrumbList JSON-LD.
- One-off Ghost admin work: apply `hash-pillar-<slug>` tag to every post based on its topic tags (first match in a topic→pillar mapping table). Script-generatable via Admin API from a mapping table.

**Files**
- `configuration/routes.yaml`
- `src/pillar.hbs` (new)
- `src/data/pillars.json`
- Optional: `src/pillar-<slug>.hbs` variants per pillar

**Why**
- Fixes the biggest topical-authority gap. Individual posts can't rank for head-of-funnel queries like "personal knowledge management" — pillar hubs can.
- Consolidates internal link equity from 100+ posts each.
- Gives Portal newsletter segmentation a natural home: subscribers pick pillars.
- Perfect landing surface for AI answer engines answering "where do I start with X".

**Caveats**
- One-time Ghost admin backfill for `hash-pillar-*` tags. Script it via Admin API.
- Once pillar hubs exist, point the "See all →" links of the matching `/blog/` topic sections at the pillar hub instead of the raw tag page (one-line change per section thanks to `topic-section.hbs`).

### 2.2 Site search — ⚠️ RE-SCOPED 2026-07-18 after a live audit. Search ALREADY EXISTS (Ghost Sodo Search).

**Existing state (audited live 2026-07-18 — the original "build from scratch" spec below was written before this audit and is largely redundant):**
Ghost's **Sodo Search is already wired and live**. `src/partials/search-toggle.hbs` is `<button ... data-ghost-search>` (the search icon), included from `navigation.hbs` in 4 responsive spots. Because a `[data-ghost-search]` element is present, Ghost auto-injects `sodo-search@~1.8` (jsdelivr CDN) via `{{ghost_head}}`/`{{ghost_foot}}` — no theme code needed. Clicking the icon opens a working overlay ("Search posts, tags and authors"); tested `obsidian plugins` → correctly ranked posts with highlighted title+excerpt matches, client-side and instant.
- **What Sodo already covers:** posts (title + excerpt), tags, authors. Ranked, highlighted, fast, zero-maintenance, free. For a 515-post catalog this is genuinely good.
- **Gaps (what's actually left to do):**
  1. **No `Cmd/Ctrl-K` shortcut** — opens on click only (theme JS has no `K` keydown; Sodo binds none).
  2. **Dangling schema** — `src/default.hbs` L111-115 emits a `SearchAction` whose `target` is `https://www.dsebastien.net/search/?q={search_term_string}`, but Sodo is an overlay with **no `/search/` URL**, so that target 404s.
  3. **No facets** — can't filter by pillar / content type (article vs newsletter vs news — Sodo mixes all three) / year / reading time.
  4. **Title+excerpt only** — no full-text BODY search.

**Option A — Enhance Sodo (quick win, ~1h, RECOMMENDED first):**
- Add a global `Cmd/Ctrl-K` (and `/` when focus isn't in an input/textarea/contentEditable) handler that programmatically `.click()`s the `[data-ghost-search]` button. New `src/assets/js/search-shortcut.js` (ES5 — gulp concat/uglify chokes on ES6), `preventDefault`, guard against form fields. It rides the existing concatenated bundle (already loaded site-wide via default.hbs), so no new script tag.
- Fix the dangling `SearchAction`: since Sodo has no results URL, **remove** the `potentialAction`/`SearchAction` block from default.hbs (honest — this plan's own "Dropped" section already flagged it; Google retired the sitelinks-searchbox rich result, so the schema yields nothing while pointing at a 404). Only keep/point it if Option B ships a real `/search/` page.
- Optional: add a visible `⌘K` hint to the search button + `aria-keyshortcuts`.
- **Net:** closes the "search + expected keyboard affordance" gap honestly and cheaply. This is the recommended close for this catalog size.

**Option B — Custom faceted `/search/` page + cmd-K palette (bigger; only if Sodo's gaps bite):** the original build below. Now unlocks the pillar facet via `src/data/pillars.json` and the type facet via `primary_tag`. Adds a real `/search/?q=` URL (which would then validate a SearchAction), faceted filtering, and (optionally) body search.
- **Prerequisite the original spec missed:** a **Content API key** — create a custom Integration in Ghost Admin → Settings → Integrations (the Content API key is public-safe, read-only; hardcode in the theme JS or pass via `config.custom`/`@custom`). Sodo's internal key is not reusable.
- Full-text body search needs a prebuilt index (Content API `formats=plaintext` per post at build, or **pagefind** at build time) — the Content API's live `fields` do not include body.
- **Verdict:** defer unless search analytics show heavy use + demand to filter by pillar/type. The marginal value over Sodo is mostly the facets.

**Original from-scratch spec below (superseded by the audit — keep only if pursuing Option B):**

#### ~~2.2 original~~ Site search: `/search/` route + cmd-K palette backed by Content API

**Build**
- `configuration/routes.yaml`: add `/search/: { template: search }`.
- `src/search.hbs`: renders shell + a client hydrated by `src/assets/js/search.js`.
- `src/assets/js/search.js`: fetches Ghost Content API (`/ghost/api/content/posts/?limit=100&include=tags&fields=title,slug,url,excerpt,feature_image,primary_tag,tags,reading_time,published_at`, paginated internally to walk all 515), caches in `localStorage` with a 24h TTL and etag check, indexes with MiniSearch (~15KB gz).
- Facets: pillar (mapped via `pillars.json`), content type (article/newsletter/news), year, reading time.
- Global cmd-K palette: `src/assets/js/cmdk.js`, bound to `Cmd/Ctrl-K` and `/`. Sections: Posts, Tags, Pages, Actions (Subscribe, Join Knowii).
- Rewrite `src/partials/search-toggle.hbs` to open the palette; keep sodo-search as fallback for members-only content search if needed.

**Files**
- `configuration/routes.yaml`
- `src/search.hbs` (new)
- `src/assets/js/search.js`, `src/assets/js/cmdk.js` (new)
- `src/partials/search-toggle.hbs` (rewrite)
- `src/default.hbs` (mount cmd-K globally)

**Why**
- #1 UX gap for a 515-post catalog. No search = catalog invisible.
- `/search/?q=` becomes a rankable landing for long-tail brand+topic queries.
- cmd-K is the muscle memory expert readers now expect.

**Caveats**
- Content API caps at 100 posts per request. Paginate internally (5 requests for 515 posts). Rebuild-on-publish via a Ghost webhook is nice-to-have; TTL cache is sufficient for v1.
- Client-side facet search is fast enough for 515 items; when the catalog grows past 5k, switch to pagefind.

### 2.3 Portal tier–aware personalization: CTAs and `/dashboard/` differ by member state

**Build**
- Everywhere CTAs render (contextual-offer, sticky-cta, mid-article, sidebar), branch on `{{@member.status}}` and `{{@member.subscriptions.[0].tier.slug}}`:
  - Anonymous → Subscribe to newsletter
  - Free member → Upgrade to Supporter
  - Supporter → Unlock Knowledge Builder bonuses
  - Knowledge Builder → Upgrade to Knowledge Master
  - Knowledge Master → Book coaching / join community
- New `/dashboard/` route → `template: dashboard`. Personalized reading list by tier: Master sees KWK + coaching content, Free sees Start Here + lead magnets. Uses `{{#get "posts" filter="tag:hash-tier-<slug>"}}`.
- Selectively gate deep-dives via `access: members` on posts tagged `#members-only` — Ghost's native paywall handles the rest.

**Files**
- `src/partials/components/contextual-offer.hbs`, `sticky-cta.hbs`, `sidebar.hbs`, `post.hbs`
- `src/dashboard.hbs` (new)
- `configuration/routes.yaml`

**Why**
- Portal tiers currently treated as a boolean (`@member.paid`). Actual personalization turns every article page into a right-rung ladder push instead of a broadcast.
- Directly addresses the "monolithic newsletter offer" leak — segmented offers convert 3–5× better than global ones.

**Caveats**
- Requires Ghost admin work: tier structure is already in place, but `#tier-<slug>` internal tag conventions must be applied to gated content.

### 2.4 Scroll-triggered inline capture + exit-intent modal, throttled and instrumented

**Build**
- `src/assets/js/engagement.js`:
  - On post.hbs at 60% scroll, inject the topic-mapped `contextual-offer.hbs` variant into a placeholder `<div id="scroll-cta">` inserted between paragraphs 6 and 7 by the template.
  - On desktop `mouseleave` toward viewport top OR mobile `pagehide` after >30s dwell, show a modal with the topic-mapped lead magnet form (Ghost `data-members-form`).
  - Throttle via `localStorage` (max 1/week, suppressed for `@member`).
  - Track Plausible custom events: `cta.scroll.impression`, `cta.scroll.submit`, `cta.exit.impression`, `cta.exit.submit`, dimensioned by the matched topic (`data-cta-topic`).
- `src/post.hbs`: insert `<div id="scroll-cta"></div>` at a safe paragraph anchor.

**Files**
- `src/assets/js/engagement.js` (new)
- `src/post.hbs`

**Why**
- Current in-article capture is static and one-shot. Scroll-triggered CTAs at proven-attention moments plus exit-intent recovery are the two biggest conversion multipliers off pillar-matched offers.

**Caveats**
- Aggressive modals annoy expert readers. Throttling + `@member` suppression is non-negotiable.

### 2.5 First-class Series support

**Build**
- Convention: internal tag `#series-<slug>` applied in Ghost admin. Series metadata (order, title, description) lives in `src/data/series.json` (committed).
- New `src/series.hbs` served via `/series/{slug}/` collection route with `permalink: /series/{slug}/`.
- `src/partials/components/series-nav.hbs` — rendered at top of `post.hbs` when `{{#has tag="hash-series-*"}}`. Shows "Part N of M — [series title]" with prev/next and a collapsible outline of siblings.
- `/series/` index page listing all series via `{{#get "tags" filter="visibility:internal+slug:~^hash-series-" limit="all"}}`.

**Files**
- `configuration/routes.yaml`
- `src/series.hbs`, `src/partials/components/series-nav.hbs` (new)
- `src/data/series.json` (new)
- `src/post.hbs` (mount series-nav)

**Why**
- Newsletter #20–214 and multi-part guides currently have zero wayfinding.
- Series pages are natural entry points for readers who found part 3 first.

---

## Tier 3 — Polish

### 3.1 Sticky reading-progress bar on long-form posts
3px top bar + collapsible subscribe pill that expands to the topic-mapped lead magnet. Replaces the current `sticky-cta.hbs` bottom bar (easy to dismiss, thin on value). Files: `src/partials/components/reading-progress.hbs`, `src/assets/js/progress.js`, `src/post.hbs`.

### 3.2 Alias generator + tag description backfill
Author descriptions for the top 30 tags in Ghost admin (one-off content work). Enables tag-hub enrichment (Tier 1.2) and improves SEO for tag pages.

### 3.3 "Start here" per-pillar pages
Ghost pages at `/start/pkm/`, `/start/obsidian/`, etc., using a shared `src/start-pillar.hbs` template. 5 essential reads + 3 tools + 1 flagship product + 1 lead magnet each. Cross-link from every post's footer via the same ordered `{{#has tag=}}` topic lookup as `contextual-offer.hbs`.

### 3.4 Reuse `topic-section.hbs` on `home.hbs` marketing landing
Once 1.0 ships, `home.hbs` can render one or two curated topic strips via the same `topic-section.hbs` partial — the marketing landing gets a taste of the catalog and a path into `/blog/` for free.

### 3.5 Freshness heuristics + `#most-read` curation
Manually maintain a `#most-read` internal tag (top 20 posts, refreshed monthly). Surface in `sidebar.hbs` and pillar hubs as "Most read on {topic}". Honest workaround since Ghost exposes no view counts to themes.

### 3.6 Consolidate/re-tag `feeds.hbs`
The static `/feeds/` page hardcodes popular tags. Drive from `pillars.json` so adding a pillar doesn't require HTML edits.

---

## Rejected / deferred

- **Members-writable "Save for later" archive explorer** — Content API is read-only; per-member saved lists require an external service + Ghost Admin API. Out of theme scope.
- **Fix sitemap `lastmod` per URL** — Ghost core generates sitemaps; not theme-controllable. Would need a Cloudflare Worker rewriting sitemap-posts.xml. Non-blocking; schema `dateModified` is the theme-side lever.
- **`sitemap-pillars.xml`** — same reason. Ship pillar URLs to sitemap-pages.xml via Ghost admin instead.
- **Inline "further reading" links between H2s via JS** — not crawlable, marginal UX gain. Skip.
- **Custom `/library-data/` JSON route via `routes.yaml`** — routes.yaml renders handlebars templates and can't natively set arbitrary Content-Type. Use Content API directly from the client for search/library indexing.

---

## Measurement — how to know it worked

Instrument day 1 in Plausible (or GA4 if preferred) with these custom events + dimensions:

| Signal | Event / dimension | Success threshold |
|---|---|---|
| `/blog/` engagement | Scroll depth on `/blog/` + clicks-per-visit into articles, per section (`data-section` dimension) | 2× clicks-per-visit from `/blog/` within 60d; every topic section gets clicks (no dead sections) |
| Search adoption | `search.open` (cmd-K + toggle) / `search.submit` | 15% of blog visitors open search within 90d |
| Related-content lift | Click-through rate on `keep-reading.hbs` cards | >25% CTR from post footer |
| Contextual CTA lift | `cta.impression` / `cta.submit` dimensioned by matched topic | Per-pillar conversion rate ≥ 2× baseline monolithic CTA |
| Tag hub usage | `/tags/` pageviews, click-through to tag pages | Tag pages get ≥ 10% of overall listing traffic |
| Portal tier progression | Members upgrading tier within 30d of first article visit | Baseline this month; target +50% within 6m |
| SEO / GEO | Rankings for pillar head terms; AI citation share (Perplexity + Kagi Answer sampling) | Pillar hubs indexed and ranking top-20 for pillar keyword within 90d |
| Long-form engagement | Time-on-page + scroll depth on posts with TOC | +25% median time-on-page for reading_time > 8 |
| Freshness signal | Crawl frequency on `/updated/` + evergreen impressions in GSC | Evergreen posts regain rising-impression trend |

Baseline the current numbers BEFORE shipping Tier 1 (pageviews, subscribe conversion, tag traffic, top query rankings). Without a baseline, none of the deltas mean anything.

---

## Analytics-driven re-prioritization + handoff (added 2026-07-18)

Live data pulled this session (Plausible 30d + Ghost Admin API):
- **Traffic:** 16.1k unique visitors, 22.9k pageviews, **85% bounce, 1.35 views/visit, 59s** avg visit.
- **Top pages are ~all individual Obsidian how-to articles** — top 4 (Bases dashboards 2.9k · Plugins-2026 2.3k · Obsidian Properties 1.3k · AI-with-vault 1.1k) ≈ **48% of pageviews**. Homepage `/` = 546 (3.4%). `/projects/`, `/courses/`, `/store`, `/start/`, `/blog/` do **not** appear in top pages — near-zero direct traffic.
- **Members:** 2,716 (2,701 free, **13 paid**, 2 comped). Ghost paid ("Supporter") is monetarily negligible; revenue is the store/Knowii.
- **Conversion events** (only ~days of data since events deployed — directional, not 30d): Store Click 9u · Signup 4u · Subscribe Intent 3u · CTA Click 2u.

**Diagnosis: traffic-rich, capture-poor.** ~95% of visitors land on ONE article from search/social and bounce (85%) without ever seeing home/start/pillars. The **article page is the battleground**; the article→email and article→store handoff is the bottleneck — not traffic, and not the funnel pages that most of this plan polished.

Re-prioritized steps (highest ROI first — these are NOT yet built):

1. **[PROMOTE to top of Tier 2] Articles 2.4 — on-article exit-intent + scroll-triggered capture.** Targets the 85% who bounce off a single article, which is where 95% of traffic is. Highest-ROI unbuilt item; jump it ahead of the remaining homepage Tier-2 polish. Lifting article→email from ~0.2% to ~1% ≈ 5× list growth at zero extra traffic.
2. **Simplify membership tiers to Free → Knowii.** 13 Ghost-paid means the "Supporter" tier dilutes the decision on newsletter/home/about with negligible upside. Drop Supporter from `components/membership-tiers.hbs`; make the choice "subscribe free" or "join Knowii (store)".
3. **Nav de-clutter + commerce consolidation** (completes 1.6's deferred nav item; **Ghost Admin → Navigation, not theme**). Cut 11 items → ~6: Start Here · Articles · Newsletter · Community · Store · About. Fold Courses + Coaching under Store; move News / Notes / Projects to a "More" dropdown or the footer. Fix the two identical 📰 emojis (News + Articles).
4. **Consolidate the Projects / Courses / Store product pages + rename `/projects/`.** All three are near-zero-traffic, overlapping product/sales pages → SEO cannibalization + a maintenance tax, with no conversion upside (nobody visits them). Keep `/projects/` (most complete, 15.7k chars, 30 store links) as the single product overview and **rename it `/products/`** — "Projects" misreads as a dev portfolio. 301 `/courses/` into it or the store. (Alternative: if a genuine dev-credibility portfolio is wanted — tools, OSS, Obsidian plugins — rebuild `/projects/` as an actual projects page; that's different content.)
5. **Double down on the top-4 articles' offers.** The pillar-matched `contextual-offer` on every article (Tier 1.3, live) is the real revenue lever. Use the `CTA Click` `topic`/`cta` props to see which pillars drive Store Clicks, and feature those products harder inside the high-traffic Obsidian posts.

Caveats: steps 2-4 are Ghost-Admin / brand decisions the owner should approve before applying. Step 1 (2.4) is theme work, ready to build. Step 5 is measurement + copy.

---

## The One Thing

**Build Articles 2.4 — on-article exit-intent + scroll-triggered email capture.** The data is unambiguous: 95% of a 16k/mo audience lands on a single Obsidian article and bounces (85%) without subscribing or clicking to the store. Every other surface in this plan serves the ~5% who navigate; 2.4 serves the 95% who don't, on the exact pages they're already reading. It's the highest-leverage unbuilt lever on the site.

*(Superseded original: ship Tier 1.0 + Tier 1.3 together — both now DONE.)*
