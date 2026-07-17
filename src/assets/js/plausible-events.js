/**
 * Plausible custom events. The Plausible script is proxied through the
 * blue-bar Cloudflare worker (see default.hbs: data-api + data-domain);
 * manual window.plausible() calls flow through the same proxy.
 *
 * Events (create matching custom-event goals in Plausible):
 *   CTA Click        props: cta (product|magnet|knowii), topic, path
 *   Subscribe Intent props: path            (overlay/portal signup opened)
 *   Signup           props: form, path      (native members form submitted)
 *   Store Click      props: product, path   (outbound to the store)
 *
 * ES5 only — gulp-uglify chokes on ES6.
 */
(function () {
    'use strict';

    // Queue shim so events fired before the deferred script loads are kept
    window.plausible =
        window.plausible ||
        function () {
            (window.plausible.q = window.plausible.q || []).push(arguments);
        };

    function track(name, props) {
        try {
            window.plausible(name, { props: props });
        } catch (e) {
            /* analytics must never break the page */
        }
    }

    document.addEventListener('click', function (event) {
        if (!event.target || !event.target.closest) {
            return;
        }

        // Contextual offer clicks (components/offer-card.hbs)
        var cta = event.target.closest('[data-cta]');
        if (cta) {
            var wrap = cta.closest('[data-cta-topic]');
            track('CTA Click', {
                cta: cta.getAttribute('data-cta'),
                topic: wrap ? wrap.getAttribute('data-cta-topic') : 'unknown',
                path: location.pathname
            });
            return;
        }

        // Subscribe intent: theme overlay triggers + portal signup buttons
        if (event.target.closest('[data-subscribe-overlay], [data-portal="signup"]')) {
            track('Subscribe Intent', { path: location.pathname });
            return;
        }

        // Outbound clicks to the store
        var link = event.target.closest('a[href]');
        if (link && link.hostname && /(^|\.)store\.dsebastien\.net$/.test(link.hostname)) {
            var match = link.pathname.match(/\/product\/([^/?#]+)/);
            track('Store Click', {
                product: match ? match[1] : 'store',
                path: location.pathname
            });
        }
    });

    // Free signups via the native Ghost members forms (email-subscription,
    // subscribe overlay, lead magnets). Capture phase: Ghost's own handler
    // does not stop propagation, but be first anyway.
    document.addEventListener(
        'submit',
        function (event) {
            var form = event.target;
            if (form && form.getAttribute && form.getAttribute('data-members-form') !== null) {
                var email = form.querySelector('input[type="email"]');
                track('Signup', {
                    form: (email && email.id) || 'unknown',
                    path: location.pathname
                });
            }
        },
        true
    );
})();
