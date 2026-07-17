/**
 * Live price hydration from the store catalog (products-light.json).
 *
 * Elements opt in via data-price="<product-id>", with optional
 * data-price-variant="<variant name>" (e.g. "Knowledge Builder") and
 * data-price-format="amount" (bare "€NN.NN" instead of the full
 * priceDisplay string — used where suffixes like "/quarter" are separate
 * markup). The server-rendered text is the no-JS/SEO fallback and is only
 * replaced when the catalog provides a value.
 *
 * Requires www.store.dsebastien.net in the site CSP connect-src
 * (configured 2026-07-17). ES5 only — gulp-uglify chokes on ES6.
 */
(function () {
    'use strict';

    var nodes = document.querySelectorAll('[data-price]');
    if (!nodes.length) {
        return;
    }

    fetch('https://www.store.dsebastien.net/products-light.json')
        .then(function (response) {
            if (!response.ok) {
                throw new Error('HTTP ' + response.status);
            }
            return response.json();
        })
        .then(function (payload) {
            var byId = {};
            (payload.products || []).forEach(function (product) {
                byId[product.id] = product;
            });

            nodes.forEach(function (el) {
                var product = byId[el.getAttribute('data-price')];
                var pricing = product && product.pricing;
                if (!pricing) {
                    return;
                }

                var variantName = el.getAttribute('data-price-variant');
                var amountOnly = el.getAttribute('data-price-format') === 'amount';
                var price = pricing.price;
                var display = pricing.priceDisplay;

                if (variantName) {
                    var variant = null;
                    (pricing.variants || []).forEach(function (v) {
                        if (v.name === variantName) {
                            variant = v;
                        }
                    });
                    if (!variant) {
                        return;
                    }
                    price = variant.price;
                    display = variant.priceDisplay;
                }

                var text = amountOnly && typeof price === 'number' ? '€' + price : display;
                if (text) {
                    el.textContent = text;
                }
            });
        })
        .catch(function () {
            /* offline / CSP / catalog error: keep the server-rendered fallback */
        });
})();
