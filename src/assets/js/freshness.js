/**
 * freshness.js — reveal an "Updated" badge only on genuinely-refreshed posts.
 *
 * post.hbs renders a hidden .gh-article-freshness badge carrying published/updated
 * unix timestamps. We reveal it (and the "updated …" date in the meta line) only when:
 *   1. updated_at is at least 30 days newer than published_at (a real refresh of older
 *      content, not a just-published post), AND
 *   2. updated_at is on/after CUTOFF — a guard against the 2026-06 site-wide
 *      re-timestamp that bumped every post's updated_at and would otherwise badge the
 *      entire back-catalogue as "updated". Raise/remove CUTOFF once that's no longer
 *      a concern.
 *
 * ES5 only: concatenated + uglified with the rest of the bundle.
 */
(function () {
    'use strict';
    var THRESHOLD_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
    var CUTOFF_MS = Date.parse('2026-07-01T00:00:00Z'); // after the 2026-06 re-timestamp

    var badge = document.querySelector('.gh-article-freshness');
    if (!badge) { return; }
    var pub = parseInt(badge.getAttribute('data-published'), 10) * 1000;
    var upd = parseInt(badge.getAttribute('data-updated'), 10) * 1000;
    if (!pub || !upd) { return; }

    if (upd - pub > THRESHOLD_MS && upd >= CUTOFF_MS) {
        badge.removeAttribute('hidden');
        var meta = document.querySelector('.gh-article-meta-updated');
        if (meta) { meta.removeAttribute('hidden'); }
    }
})();
