/* Keyboard shortcut to open Ghost's Sodo search overlay.
 *
 * Two shortcuts, bound once on document keydown:
 *   - Cmd/Ctrl-K : fires globally (even inside inputs). Cmd-K is not a native
 *     browser shortcut; Ctrl-K focuses the address bar on Firefox/Chrome, which
 *     we deliberately override in-page.
 *   - Plain "/"  : fires only when NOT typing in an editable field.
 *
 * Both reuse Ghost's own trigger ([data-ghost-search]) by clicking it — this
 * mounts the working Sodo overlay. We build no custom UI and touch no /search/
 * URL. Pure progressive enhancement: if this file errors before running, the
 * visible search button still works by click. Sodo binds Escape-to-close
 * itself, so we bind no close logic. ES5 only — gulp-uglify chokes on ES6.
 */
(function () {
    'use strict';

    if (!document.addEventListener || !document.querySelector) return;

    // Is the Sodo overlay already open? It injects its root as
    // #sodo-search-root and mounts a visible child when open.
    function isSearchOpen() {
        var root = document.getElementById('sodo-search-root');
        return !!(root && root.childElementCount > 0 && root.firstElementChild);
    }

    // Query the trigger lazily (survives responsive show/hide + late DOM),
    // bail if absent (e.g. Sodo disabled), no-op if already open.
    // Returns true when the shortcut is "ours" to handle (a trigger exists), so
    // the caller only suppresses the browser default when Sodo is actually
    // present. No-ops (but still claims the key) if the overlay is already open.
    function openSearch() {
        var trigger = document.querySelector('[data-ghost-search]');
        if (!trigger) return false;
        if (!isSearchOpen()) trigger.click();
        return true;
    }

    // True when focus is in an editable field, where "/" must type normally.
    function isEditableTarget(el) {
        if (!el) return false;
        var tag = (el.tagName || '').toLowerCase();
        if (tag === 'input' || tag === 'textarea' || tag === 'select') return true;
        if (el.isContentEditable === true) return true;
        if (el.closest && el.closest('[contenteditable=""], [contenteditable="true"]')) return true;
        return false;
    }

    document.addEventListener('keydown', function (e) {
        var key = String(e.key).toLowerCase();

        // Branch A: Cmd/Ctrl-K — global override, no editable-field guard.
        // Require !altKey && !shiftKey to avoid clobbering OS/browser combos
        // (e.g. Ctrl-Shift-K devtools/console).
        if ((e.metaKey || e.ctrlKey) && !e.altKey && !e.shiftKey && key === 'k') {
            if (openSearch()) e.preventDefault();
            return;
        }

        // Branch B: plain "/" — only when not typing and no modifier held.
        // shiftKey is ignored (some layouts need shift for "/") but we gate on
        // the resolved e.key === '/'. preventDefault only in this open branch
        // so a stray "/" inside inputs still types normally.
        if (e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey) {
            var el = e.target || document.activeElement;
            if (isEditableTarget(el)) return;
            if (openSearch()) e.preventDefault();
        }
    });
})();
