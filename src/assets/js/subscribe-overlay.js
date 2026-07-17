/* Theme-owned subscribe overlay (see partials/components/subscribe-overlay.hbs).
 *
 * Opens the overlay for any element with data-subscribe-overlay instead of
 * Ghost Portal's signup modal. Progressive enhancement: triggers keep
 * href="#/portal/signup" WITHOUT data-portal — Portal binds click handlers to
 * [data-portal] elements, so the attribute would open Portal's modal alongside
 * ours; the bare hash href still opens Portal if this script fails to run
 * (e.g. an earlier error in the concatenated bundle) while Portal loaded —
 * Portal reacts to #/portal/* hash changes. ES5 only — gulp-uglify chokes on ES6.
 */
(function () {
    'use strict';

    var overlay = document.getElementById('subscribe-overlay');
    if (!overlay) return;

    var triggers = document.querySelectorAll('[data-subscribe-overlay]');
    if (!triggers.length) return;

    var emailInput = overlay.querySelector('[data-members-email]');
    var lastFocused = null;
    var hideTimer = null;

    function openOverlay() {
        lastFocused = document.activeElement;
        if (hideTimer) {
            clearTimeout(hideTimer);
            hideTimer = null;
        }
        overlay.removeAttribute('hidden');
        // Force a reflow so the opacity transition runs after display changes
        void overlay.offsetHeight;
        overlay.classList.add('is-open');
        document.documentElement.style.overflowY = 'hidden';
        if (emailInput) emailInput.focus();
    }

    function closeOverlay() {
        overlay.classList.remove('is-open');
        // Hide after the 0.25s opacity transition so the fade-out renders
        hideTimer = setTimeout(function () {
            overlay.setAttribute('hidden', '');
            hideTimer = null;
        }, 250);
        document.documentElement.style.overflowY = '';
        if (lastFocused && lastFocused.focus) lastFocused.focus();
        lastFocused = null;
    }

    triggers.forEach(function (trigger) {
        trigger.addEventListener('click', function (e) {
            // Prevent the #/portal/signup hash change so Portal never reacts
            e.preventDefault();
            openOverlay();
        });
    });

    // Close button + backdrop click
    overlay.querySelectorAll('[data-subscribe-overlay-close]').forEach(function (el) {
        el.addEventListener('click', closeOverlay);
    });

    // Footer links that open Portal's own modal: close our overlay first so
    // the user doesn't land back on it after dismissing Portal
    overlay.querySelectorAll('[data-portal]').forEach(function (el) {
        el.addEventListener('click', function () {
            closeOverlay();
        });
    });

    // Escape key
    document.addEventListener('keydown', function (e) {
        if ((e.key === 'Escape' || e.key === 'Esc') && overlay.classList.contains('is-open')) {
            closeOverlay();
        }
    });
})();
