/* On-article engagement + capture (Tier 2.4).
 *
 * Targets the 85% who land on ONE article from search/social and leave without
 * subscribing. Three jobs, all POST-page + logged-out only (gated on the
 * presence of #scroll-capture / #subscribe-overlay, both of which Ghost only
 * renders inside {{#unless @member}}):
 *
 *   1. Scroll-depth instrumentation — Plausible "Scroll Depth" at 25/50/75/100%,
 *      once each. We currently have zero visibility into how far bouncers read.
 *   2. Scroll-triggered inline capture — relocate #scroll-capture to a mid-late
 *      anchor and reveal it when it scrolls into view (~60% through the read):
 *      a topic-matched free lead magnet + native Ghost members form.
 *   3. Exit-intent recovery — once the reader is "qualified" (scrolled >=50% OR
 *      dwelled >=25s), raise the existing subscribe overlay on desktop
 *      mouseleave-toward-top or mobile tab-hide/pagehide. Throttled to once per
 *      7 days via localStorage, once per page, suppressed after a conversion.
 *
 * Reuses the existing overlay via the "subscribe-overlay:open" custom event
 * (see subscribe-overlay.js) — no synthetic click, no duplicated open logic.
 * ES5 only — gulp-uglify chokes on ES6.
 */
(function () {
    'use strict';

    // Post pages only, logged-out only: the capture band is the cheapest tell.
    var overlay = document.getElementById('subscribe-overlay');
    var content = document.querySelector('.gh-content');
    if (!content) return;

    function track(name, props) {
        try {
            if (window.plausible) window.plausible(name, { props: props });
        } catch (e) {
            /* analytics must never break the page */
        }
    }

    var maxScrollPct = 0;
    var startTime = Date.now();
    var converted = false;

    // A native members-form submit anywhere on the page = intent satisfied.
    // Suppress the exit-intent nag after it.
    document.addEventListener(
        'submit',
        function (e) {
            var form = e.target;
            if (form && form.getAttribute && form.getAttribute('data-members-form') !== null) {
                converted = true;
            }
        },
        true
    );

    // ---- 1. Scroll-depth milestones -------------------------------------
    var milestones = [25, 50, 75, 100];
    var fired = {};

    function currentScrollPct() {
        var docEl = document.documentElement;
        var scrollTop = window.pageYOffset || docEl.scrollTop || 0;
        var winH = window.innerHeight || docEl.clientHeight || 0;
        var docH = Math.max(
            document.body.scrollHeight,
            docEl.scrollHeight,
            document.body.offsetHeight,
            docEl.offsetHeight
        );
        var scrollable = docH - winH;
        if (scrollable <= 0) return 100;
        return Math.min(100, Math.round(((scrollTop + winH) / docH) * 100));
    }

    // ---- 2. Scroll-triggered inline capture -----------------------------
    var capture = document.getElementById('scroll-capture');
    if (capture) {
        // Relocate to a mid-late anchor: the paragraph ~55% through the body,
        // but only on articles long enough to earn a mid-read interruption.
        var paras = content.querySelectorAll(':scope > p');
        if (paras.length >= 6) {
            var idx = Math.floor(paras.length * 0.55);
            var anchor = paras[idx];
            if (anchor && anchor.parentNode) {
                anchor.parentNode.insertBefore(capture, anchor.nextSibling);
            }
            // Reveal when it scrolls into view (progressive: if IO is missing,
            // just show it — better visible than trapped hidden).
            if ('IntersectionObserver' in window) {
                var io = new IntersectionObserver(
                    function (entries, obs) {
                        if (entries[0].isIntersecting) {
                            capture.removeAttribute('hidden');
                            // Reflow, then fade in.
                            void capture.offsetHeight;
                            capture.classList.add('is-visible');
                            track('Capture Shown', {
                                slot: 'scroll',
                                topic: capture.getAttribute('data-cta-topic') || 'unknown',
                                path: location.pathname
                            });
                            obs.disconnect();
                        }
                    },
                    { rootMargin: '0px 0px -20% 0px' }
                );
                io.observe(capture);
            } else {
                capture.removeAttribute('hidden');
                capture.classList.add('is-visible');
            }
        } else {
            // Too short for a mid-read band — leave it removed (it stays hidden
            // at its source position; drop it so it doesn't reappear pre-footer).
            if (capture.parentNode) capture.parentNode.removeChild(capture);
        }
    }

    // ---- 3. Exit-intent recovery ----------------------------------------
    var THROTTLE_KEY = 'ds_exit_intent_shown';
    var THROTTLE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
    var DWELL_MS = 25 * 1000;
    var shownThisPage = false;

    function recentlyShown() {
        try {
            var last = window.localStorage.getItem(THROTTLE_KEY);
            return last && Date.now() - parseInt(last, 10) < THROTTLE_MS;
        } catch (e) {
            return false; // storage blocked → treat as not shown, still once/page
        }
    }

    function qualified() {
        return maxScrollPct >= 50 || Date.now() - startTime >= DWELL_MS;
    }

    function isDesktop() {
        return (
            window.matchMedia &&
            window.matchMedia('(hover: hover) and (pointer: fine)').matches
        );
    }

    function maybeShowExitIntent(device) {
        if (shownThisPage || converted) return;
        if (!overlay) return; // logged-out only (overlay absent for members)
        if (overlay.classList.contains('is-open')) return; // don't stomp an open overlay
        if (!qualified()) return;
        if (recentlyShown()) return;

        shownThisPage = true;
        try {
            window.localStorage.setItem(THROTTLE_KEY, String(Date.now()));
        } catch (e) {
            /* storage blocked — once-per-page guard still holds */
        }
        track('Exit Intent', { device: device, path: location.pathname });
        document.dispatchEvent(new CustomEvent('subscribe-overlay:open'));
    }

    // Shared scroll listener (rAF-throttled) for both milestones + arming.
    var ticking = false;
    window.addEventListener(
        'scroll',
        function () {
            if (ticking) return;
            ticking = true;
            window.requestAnimationFrame(function () {
                var pct = currentScrollPct();
                if (pct > maxScrollPct) maxScrollPct = pct;
                for (var i = 0; i < milestones.length; i++) {
                    var m = milestones[i];
                    if (pct >= m && !fired[m]) {
                        fired[m] = true;
                        track('Scroll Depth', { depth: m, path: location.pathname });
                    }
                }
                ticking = false;
            });
        },
        { passive: true }
    );

    // Desktop: cursor leaves through the top of the viewport → about to close/switch.
    if (isDesktop() && overlay) {
        document.addEventListener('mouseout', function (e) {
            // Only when leaving the document (no related target) toward the top.
            if (e.relatedTarget || e.toElement) return;
            if (e.clientY > 0) return;
            maybeShowExitIntent('desktop');
        });
    }

    // Mobile / all: tab hidden or page being unloaded after real dwell.
    if (overlay) {
        document.addEventListener('visibilitychange', function () {
            if (document.visibilityState === 'hidden') maybeShowExitIntent('mobile');
        });
        // pagehide is more reliable than beforeunload on mobile; the overlay
        // won't render in time on a true unload, but tab-switch (bfcache) works.
        window.addEventListener('pagehide', function () {
            maybeShowExitIntent('mobile');
        });
    }
})();
