# Plan: Improve Start Page

## Context

The start page (`start.hbs`) is the main onboarding funnel linked from the home page's "Get started, it's free" CTA. It has bugs, redundant sections, overwhelming article lists, and structural issues that hurt conversion and readability.

## Changes

### 1. Fix bugs
- **Line 118:** Wrong link on "Free Knowledge System Checklist" — currently points to `knowledge-management-for-beginners`, should be `knowledge-system-checklist`
- **Remove duplicate articles appearing in multiple areas:**
  - "How One System Feeds Everything I Do" (Area 4 line 354 AND Area 5 line 423) — keep in Area 5 only (Creation is the better fit)
  - "How to Capture Your Thoughts and Ideas" (Area 3 line 224 AND Area 5 line 425) — keep in Area 3 only (Practice)
  - "Making the Most of Daily Notes" (Area 3 line 222 AND Area 5 line 424) — keep in Area 3 only (Practice)
- **Remove irrelevant articles:**
  - "How to Self-Host OpenClaw Securely on a VPS" from Area 4 (line 352) and Area 5 (line 427) — dev/ops article, not knowledge work or creation

### 2. Add hero CTA button
Add an anchor link button below the hero stats pointing to `#area-foundation` so visitors have an immediate action.

### 3. Trim article lists to 6 per area + "See all" links
- **Foundation (currently 12):** Keep top 6, add "See all PKM articles →" link to `/tag/personal-knowledge-management/`
- **System - Tools (currently 8):** Keep top 5, add "See all Obsidian articles →" link to `/tag/obsidian/`
- **System - Frameworks (currently 8):** Keep top 5, add "See all →" link
- **Practice (currently 18):** Keep top 6, add "See all →" link to `/tag/note-taking/`
- **Application - Work (currently 5):** Keep as-is (already trim after removing duplicates)
- **Application - Balance (currently 6):** Keep top 5
- **Creation (currently 10):** Keep top 6 (after removing duplicates), add "See all →" link

### 4. Trim Builder OS teaser (lines 434-449)
Replace the 8-bullet-point list with 3 concise sentences + CTA. Keep it aspirational without over-promising.

### 5. Remove redundant bottom Community section (lines 543-566)
The mid-page Knowii Community block (lines 264-331) already has tiers, benefits, testimonials, and CTA. The bottom community section repeats the same 3 benefits with another identical CTA. Delete entirely.

### 6. Remove empty "Further Learning" section (lines 573-580)
Has an empty `<p></p>` and a single button. Replace with a compact final CTA row combining "Browse articles" + "Watch videos" + "Start here" links (similar to the home page bottom links).

### 7. Move Everything Bundle to final position
Move the Everything Bundle block (lines 505-541) to after the Timeline and before the lead magnet. This makes it the final pitch before the page ends.

### 8. Reorder bottom sections
New order after Area 5:
1. Transformation Timeline (keep)
2. Everything Bundle (moved here from between timeline and community)
3. Lead magnet for non-members (keep)
4. Final links row (replaces both Community and Further Learning)

## Files to modify
- `/home/dsebastien/wks/ghost-theme-dsebastien/src/start.hbs`

## Verification
- `bun run test` passes
- Visual check: page loads, all links work, no duplicates, article counts are ~6 per area
- Check mobile responsiveness
