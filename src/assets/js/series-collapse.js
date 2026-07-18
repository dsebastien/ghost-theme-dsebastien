/**
 * series-collapse.js — condense long on-post series strips.
 *
 * A big series (e.g. Obsidian deep dives, 20+ parts) would render its full
 * outline on every member post via components/series-strip.hbs. On an individual
 * article that is too tall, so here we collapse the list to the current part's
 * neighbourhood (first + last + current ±WINDOW) with a "Show all N parts"
 * toggle. The /series/ index (.series-index-grid) is left fully expanded — that
 * page IS the full map — and this runs on post pages only (body.post-template).
 *
 * ES5 only: this file is concatenated + uglified with the rest of the bundle.
 */
(function () {
    'use strict';

    var WINDOW = 2;    // parts shown each side of the current one
    var THRESHOLD = 8; // only collapse series longer than this

    function ce(tag, cls, text) {
        var el = document.createElement(tag);
        if (cls) { el.className = cls; }
        if (text != null) { el.appendChild(document.createTextNode(text)); }
        return el;
    }

    function hasClass(el, cls) {
        return el && el.className && (' ' + el.className + ' ').indexOf(' ' + cls + ' ') !== -1;
    }

    function inIndexGrid(el) {
        var n = el;
        while (n) {
            if (hasClass(n, 'series-index-grid')) { return true; }
            n = n.parentNode;
        }
        return false;
    }

    function ellipsis(count) {
        var li = ce('li', 'series-nav-ellipsis');
        li.appendChild(ce('span', 'series-nav-ellipsis-dots', '···'));
        li.appendChild(ce('span', 'series-nav-ellipsis-label', count + ' more'));
        return li;
    }

    function collapse(list) {
        var children = list.children;
        var items = [];
        var i;
        for (i = 0; i < children.length; i++) {
            if (hasClass(children[i], 'series-nav-item')) { items.push(children[i]); }
        }
        var total = items.length;
        if (total <= THRESHOLD) { return; }

        var current = 0;
        for (i = 0; i < total; i++) {
            if (hasClass(items[i], 'is-current')) { current = i; break; }
        }

        var keepStart = current - WINDOW;
        var keepEnd = current + WINDOW;

        for (i = 0; i < total; i++) {
            var keep = i === 0 || i === total - 1 || (i >= keepStart && i <= keepEnd);
            if (!keep) { items[i].className += ' is-collapsed-hidden'; }
        }

        // gap between the first part and the window
        if (keepStart > 1) {
            list.insertBefore(ellipsis(keepStart - 1), items[keepStart]);
        }
        // gap between the window and the last part
        if (keepEnd < total - 2) {
            list.insertBefore(ellipsis((total - 1) - (keepEnd + 1)), items[total - 1]);
        }

        var btn = ce('button', 'series-nav-toggle', 'Show all ' + total + ' parts');
        btn.type = 'button';
        btn.setAttribute('aria-expanded', 'false');
        btn.onclick = function () {
            var hidden = list.querySelectorAll('.is-collapsed-hidden');
            var dots = list.querySelectorAll('.series-nav-ellipsis');
            var j;
            for (j = 0; j < hidden.length; j++) {
                hidden[j].className = hidden[j].className.replace(/\s*is-collapsed-hidden/g, '');
            }
            for (j = dots.length - 1; j >= 0; j--) {
                dots[j].parentNode.removeChild(dots[j]);
            }
            if (btn.parentNode) { btn.parentNode.removeChild(btn); }
        };
        list.parentNode.appendChild(btn);
    }

    function init() {
        if (!document.body || !hasClass(document.body, 'post-template')) { return; }
        var lists = document.querySelectorAll('.series-nav-list');
        for (var i = 0; i < lists.length; i++) {
            if (!inIndexGrid(lists[i])) { collapse(lists[i]); }
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
