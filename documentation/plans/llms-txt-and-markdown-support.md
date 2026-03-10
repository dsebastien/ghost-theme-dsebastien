# Plan: Add llms.txt and .md (Markdown) Support for dsebastien.net

## Context

Make Ghost blog content accessible to LLMs, note-taking apps, and archival tools by serving:
1. **`/llms.txt`** - Site description following the llms.txt standard
2. **`/llms-full.txt`** - Comprehensive version listing all posts
3. **`/{slug}.md`** - Any published post as Markdown by appending `.md` to the URL

**Constraint**: The site runs on **Ghost(Pro)**, so we can't intercept requests on the main domain. Ghost only outputs HTML from themes. The solution uses a **Cloudflare Worker on a subdomain** (`md.dsebastien.net`) with Ghost redirects bridging the gap.

## Architecture

```
dsebastien.net (Ghost Pro)          md.dsebastien.net (Cloudflare Worker)
┌─────────────────────────┐         ┌──────────────────────────────┐
│ /llms.txt ──redirect──────────────▶ /llms.txt (dynamic)         │
│ /llms-full.txt ──redirect─────────▶ /llms-full.txt (dynamic)    │
│                         │         │                              │
│ Post pages contain:     │         │ /blog/{slug}.md              │
│ <link rel="alternate"   │         │ /newsletter/{slug}.md        │
│   href="md.dseb.../     │         │ /{slug}.md                   │
│   {slug}.md">           │         │                              │
│                         │         │ Fetches from Ghost Content   │
│ Ghost Content API ◀─────────────── API, converts HTML→Markdown  │
└─────────────────────────┘         └──────────────────────────────┘
```

**How it works:**
- Visitors/LLMs hitting `dsebastien.net/llms.txt` get redirected to `md.dsebastien.net/llms.txt`
- The `<link rel="alternate">` on post pages points directly to `md.dsebastien.net/{path}.md`
- The Worker fetches post content via Ghost Content API and converts HTML → Markdown using Turndown

---

## Part 1: Cloudflare Worker (`worker/` directory in this repo)

### File Structure
```
worker/
  src/
    index.ts          # Entry point & request router
    llms-txt.ts       # /llms.txt and /llms-full.txt generation
    markdown.ts       # *.md endpoint - fetch post, convert, return
    ghost-api.ts      # Ghost Content API client
    html-to-md.ts     # Turndown + linkedom HTML-to-Markdown conversion
  wrangler.toml       # Worker config (name, custom domain, vars)
  package.json        # Worker dependencies
  tsconfig.json       # TypeScript config
```

### Worker Config (`wrangler.toml`)
```toml
name = "dsebastien-md"
main = "src/index.ts"
compatibility_date = "2025-01-01"

# Custom domain - requires DNS CNAME in Cloudflare
routes = [
  { pattern = "md.dsebastien.net/*", custom_domain = true }
]

[vars]
GHOST_URL = "https://dsebastien.net"
SITE_TITLE = "Sebastien Dubois"
# GHOST_CONTENT_API_KEY set via: wrangler secret put GHOST_CONTENT_API_KEY
```

### Dependencies
- **`turndown`** (~30KB) - Battle-tested HTML-to-Markdown converter
- **`linkedom`** via `linkedom/worker` (~50KB) - Lightweight DOM for Workers (Turndown needs a DOM)
- **`wrangler`** (dev) - Cloudflare Workers CLI

### Request Router (`src/index.ts`)
```
GET /llms.txt        → generate concise llms.txt (20 recent posts)
GET /llms-full.txt   → generate full llms.txt (all posts)
GET /*.md            → fetch post by slug, convert HTML→MD, return
GET /robots.txt      → return robots.txt allowing crawlers
Everything else      → 404
```

The `.md` matcher handles all three collection paths from `configuration/routes.yaml`:
- `/{slug}.md` → root collection
- `/blog/{slug}.md` → blog collection
- `/newsletter/{slug}.md` → newsletter collection

CORS headers included to allow fetching from dsebastien.net.

### Ghost Content API Client (`src/ghost-api.ts`)
- **Single post**: `GET /ghost/api/content/posts/slug/{slug}/?key={key}&include=tags,authors&formats=html`
- **All posts** (paginated, max 100/page): `fields=title,slug,custom_excerpt,published_at,primary_tag&include=tags`
- Ghost's `plaintext` format strips ALL formatting - unusable. HTML conversion is required.

### HTML-to-Markdown Conversion (`src/html-to-md.ts`)
- Parse HTML with `linkedom/worker` (Workers-compatible DOM)
- Convert with Turndown (ATX headings, fenced code blocks, `-` bullets)
- Optional: custom Turndown rules for Ghost cards (galleries, bookmarks, callouts)

### Markdown Endpoint Response (`src/markdown.ts`)
```markdown
---
title: "Post Title"
date: 2025-01-15
author: Sebastien Dubois
tags: [knowledge-management, obsidian]
canonical_url: https://dsebastien.net/blog/my-post/
---

# Post Title

[Converted content...]
```

Response headers:
- `Content-Type: text/markdown; charset=utf-8`
- `Cache-Control: public, max-age=3600, s-maxage=86400` (1h browser, 24h edge)
- `X-Robots-Tag: noindex` (prevent duplicate content indexing)
- `Access-Control-Allow-Origin: https://dsebastien.net`

### llms.txt Content (`src/llms-txt.ts`)

Following the llms.txt standard (H1, blockquote, H2 sections with link lists):

**`/llms.txt`** - concise:
- Site title + description blockquote
- Key pages: About, Start Here, Blog, Newsletter
- Topic tags: PKM, Obsidian, Knowledge Work, AI, Productivity, etc.
- Products & Services links (store, courses, coaching)
- 20 most recent articles (dynamic from Ghost API)

**`/llms-full.txt`** - same structure but ALL posts listed

### Caching
- Cloudflare Cache API (free, no KV needed)
- `/llms.txt`: 1 hour TTL
- `/llms-full.txt`: 6 hours TTL
- `/*.md`: 24 hours edge, 1 hour browser
- TTL-based expiration (sufficient for blog content)

### Error Handling
- Post not found → `404 text/plain`
- Ghost API unavailable → `502`
- Members-only content → serve public excerpt with note

---

## Part 2: Theme Changes

### 2.1 `<link rel="alternate">` for Markdown — `src/default.hbs`

Add in `<head>` before `{{ghost_head}}` (before line 139):

```handlebars
{{!-- llms.txt discovery --}}
<link rel="alternate" type="text/plain" href="https://md.dsebastien.net/llms.txt" title="LLM-friendly site description">

{{!-- Markdown version of posts --}}
{{#is "post"}}
    {{#post}}
        {{#match primary_tag.slug "newsletter"}}
            <link rel="alternate" type="text/markdown" href="https://md.dsebastien.net/newsletter/{{slug}}.md" title="{{title}} (Markdown)">
        {{else match primary_tag.slug "blog"}}
            <link rel="alternate" type="text/markdown" href="https://md.dsebastien.net/blog/{{slug}}.md" title="{{title}} (Markdown)">
        {{else}}
            <link rel="alternate" type="text/markdown" href="https://md.dsebastien.net/{{slug}}.md" title="{{title}} (Markdown)">
        {{/match}}
    {{/post}}
{{/is}}
```

This builds the correct URL based on the post's primary tag (matching the collection routing in routes.yaml).

### 2.2 "View as Markdown" link — `src/partials/components/social-share.hbs`

Add a markdown link after the existing share buttons (after line 14):

```handlebars
{{#match primary_tag.slug "newsletter"}}
    <a class="social-share-link" href="https://md.dsebastien.net/newsletter/{{slug}}.md" title="View as Markdown" rel="alternate">
        {{> "icons/markdown"}}
    </a>
{{else match primary_tag.slug "blog"}}
    <a class="social-share-link" href="https://md.dsebastien.net/blog/{{slug}}.md" title="View as Markdown" rel="alternate">
        {{> "icons/markdown"}}
    </a>
{{else}}
    <a class="social-share-link" href="https://md.dsebastien.net/{{slug}}.md" title="View as Markdown" rel="alternate">
        {{> "icons/markdown"}}
    </a>
{{/match}}
```

### 2.3 Markdown SVG icon — `src/partials/icons/markdown.hbs` (NEW)

Simple Markdown "M↓" SVG icon matching the existing icon style.

### 2.4 Ghost Redirects — `configuration/redirects.yaml`

Add redirects so `dsebastien.net/llms.txt` works:

```yaml
302:
  /llms.txt: https://md.dsebastien.net/llms.txt
  /llms-full.txt: https://md.dsebastien.net/llms-full.txt
```

---

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `worker/` (entire dir) | **Create** | Cloudflare Worker for .md and llms.txt |
| `src/default.hbs` | Modify (line ~138) | Add `<link rel="alternate">` tags |
| `src/partials/components/social-share.hbs` | Modify (after line 14) | Add "View as Markdown" button |
| `src/partials/icons/markdown.hbs` | **Create** | Markdown SVG icon |
| `configuration/redirects.yaml` | Modify | Add /llms.txt and /llms-full.txt redirects |

---

## Deployment Steps

1. **Ghost Custom Integration**: Create in Ghost Admin > Settings > Integrations to get a Content API key
2. **Cloudflare DNS**: Add CNAME record `md` → Worker (or use `wrangler` custom domain setup)
3. **Deploy Worker**: `cd worker && wrangler deploy`
4. **Set secret**: `wrangler secret put GHOST_CONTENT_API_KEY`
5. **Deploy theme**: `bun zip` → upload to Ghost Admin
6. **Upload redirects**: Upload updated `redirects.yaml` in Ghost Admin > Settings > Labs

---

## Verification

1. `curl https://md.dsebastien.net/llms.txt` → structured site description with recent posts
2. `curl https://md.dsebastien.net/llms-full.txt` → complete post listing
3. `curl https://md.dsebastien.net/blog/{known-slug}.md` → well-formatted Markdown with frontmatter
4. `curl https://md.dsebastien.net/newsletter/{known-slug}.md` → newsletter post as Markdown
5. `curl https://md.dsebastien.net/{known-slug}.md` → root collection post as Markdown
6. `curl https://md.dsebastien.net/nonexistent.md` → 404
7. `curl -L https://dsebastien.net/llms.txt` → redirects to Worker, returns llms.txt
8. View source of any post page → `<link rel="alternate" type="text/markdown">` present
9. Visual check → Markdown icon appears next to share buttons on posts
10. `bun test` → theme validation passes
