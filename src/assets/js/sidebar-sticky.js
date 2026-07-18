/* Smart sticky sidebar.
 *
 * A CSS `position: sticky` sidebar TALLER than the viewport can't win: capping
 * its height adds an inner scrollbar, not capping it clips the top edge near the
 * page bottom. So we do it in JS — a direction-aware "sticky until its own edge"
 * follow:
 *   - sidebar shorter than the viewport -> pin its top (classic sticky).
 *   - taller than the viewport -> scrolling DOWN, let it ride up until its BOTTOM
 *     meets the viewport bottom, then hold; scrolling UP, let it ride down until
 *     its TOP meets the viewport top, then hold. Nothing is ever clipped, no
 *     inner scrollbar, and it follows the reader.
 *
 * Positions are computed against the sidebar's OWN natural document top
 * (naturalTop) — NOT its column's top, which sits above it by the grid padding
 * and would leave the reveal short by exactly that gap.
 *
 * Listing sidebar (.gh-sidebar-inner in .gh-container.has-sidebar), md+ only
 * (hidden on mobile). No-JS fallback = the CSS static sidebar. ES5 only.
 */
(function () {
    'use strict';

    var inner = document.querySelector('.gh-container.has-sidebar .gh-sidebar-inner');
    var container = inner && inner.closest ? inner.closest('.gh-sidebar') : null;
    if (!inner || !container || !window.requestAnimationFrame) return;

    var mq = window.matchMedia('(min-width: 768px)');

    function gap() {
        var v = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--grid-gap'));
        return isNaN(v) ? 40 : v;
    }
    function clamp(v, lo, hi) { return v < lo ? lo : (v > hi ? hi : v); }

    var translate = 0;
    var lastScroll = window.pageYOffset;
    var naturalTop = 0;        // the sidebar's natural document-space top (no transform)
    var containerBottom = 0;   // the column's document-space bottom (for clamping)
    var ticking = false;

    // Re-read the natural geometry with the transform removed, so measurements
    // reflect the untransformed layout.
    function measure() {
        inner.style.transform = 'none';
        var scroll = window.pageYOffset;
        naturalTop = inner.getBoundingClientRect().top + scroll;
        containerBottom = container.getBoundingClientRect().top + scroll + container.offsetHeight;
        apply();
    }

    function apply() {
        ticking = false;
        if (!mq.matches) { inner.style.position = ''; inner.style.transform = ''; translate = 0; return; }

        inner.style.position = 'relative';
        var TOP = gap() / 2;
        var BOTTOM = gap() / 2;
        var scroll = window.pageYOffset;
        var vh = window.innerHeight;
        var innerH = inner.offsetHeight;
        var maxTranslate = Math.max(0, containerBottom - naturalTop - innerH);
        var target = translate;

        if (innerH + TOP + BOTTOM <= vh) {
            // Fits: pin the top.
            target = scroll + TOP - naturalTop;
        } else {
            var delta = scroll - lastScroll;
            var innerTopDoc = naturalTop + translate;
            var innerBottomDoc = innerTopDoc + innerH;
            var vpTop = scroll + TOP;
            var vpBottom = scroll + vh - BOTTOM;
            if (delta > 0) {
                if (innerBottomDoc < vpBottom) target = vpBottom - innerH - naturalTop;
            } else if (delta < 0) {
                if (innerTopDoc > vpTop) target = vpTop - naturalTop;
            }
        }

        translate = clamp(target, 0, maxTranslate);
        lastScroll = scroll;
        inner.style.transform = 'translate3d(0,' + translate + 'px,0)';
    }

    window.addEventListener('scroll', function () {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(apply);
    }, { passive: true });

    var resizeTimer;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () { translate = 0; measure(); }, 150);
    });
    if (mq.addEventListener) mq.addEventListener('change', function () { translate = 0; measure(); });
    // Re-measure once images/fonts settle (content above the sidebar shifts naturalTop).
    window.addEventListener('load', function () { translate = 0; measure(); });

    measure();
})();
