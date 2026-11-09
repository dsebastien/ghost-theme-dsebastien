/* Mobile menu burger toggle */
(function () {
    const navigation = document.querySelector('.gh-navigation');
    const burger = navigation.querySelector('.gh-burger');
    if (!burger) return;

    burger.addEventListener('click', function () {
        if (!navigation.classList.contains('is-open')) {
            navigation.classList.add('is-open');
            document.documentElement.style.overflowY = 'hidden';
        } else {
            navigation.classList.remove('is-open');
            document.documentElement.style.overflowY = null;
        }
    });
})();

/* Add lightbox to gallery images */
(function () {
    lightbox(
        '.kg-image-card > .kg-image[width][height], .kg-gallery-image > img'
    );
})();

/* YouTube facade: replace iframes with click-to-load placeholders */
(function () {
    var iframes = document.querySelectorAll('.gh-content iframe[src*="youtube.com"], .gh-content iframe[src*="youtube-nocookie.com"]');

    iframes.forEach(function (iframe) {
        var src = iframe.src;
        // Switch to privacy-enhanced mode
        src = src.replace('youtube.com/embed/', 'youtube-nocookie.com/embed/');

        // Extract video ID for thumbnail
        var match = src.match(/embed\/([a-zA-Z0-9_-]+)/);
        if (!match) return;
        var videoId = match[1];

        var facade = document.createElement('div');
        facade.className = 'youtube-facade';
        facade.setAttribute('role', 'button');
        facade.setAttribute('aria-label', 'Play video');
        facade.setAttribute('tabindex', '0');
        facade.style.cssText = 'position:relative;cursor:pointer;background:#000;aspect-ratio:16/9;width:100%;';

        // Use low-res thumbnail to save bandwidth
        var img = document.createElement('img');
        img.src = 'https://i.ytimg.com/vi/' + videoId + '/hqdefault.jpg';
        img.alt = 'Video thumbnail';
        img.loading = 'lazy';
        img.style.cssText = 'width:100%;height:100%;object-fit:cover;opacity:0.8;';
        facade.appendChild(img);

        // Play button overlay
        var btn = document.createElement('div');
        btn.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:68px;height:48px;background:rgba(255,0,0,0.8);border-radius:12px;display:flex;align-items:center;justify-content:center;';
        btn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>';
        facade.appendChild(btn);

        function loadVideo() {
            var newIframe = document.createElement('iframe');
            newIframe.src = src + (src.includes('?') ? '&' : '?') + 'autoplay=1';
            newIframe.setAttribute('frameborder', '0');
            newIframe.setAttribute('allowfullscreen', '');
            newIframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
            newIframe.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;';
            facade.innerHTML = '';
            facade.style.position = 'relative';
            facade.appendChild(newIframe);
            // Apply reframe to the newly loaded iframe
            reframe(facade.querySelectorAll('iframe'));
        }

        facade.addEventListener('click', loadVideo);
        facade.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                loadVideo();
            }
        });

        iframe.parentNode.replaceChild(facade, iframe);
    });
})();

/* Responsive video in post content (non-YouTube iframes) */
(function () {
    const sources = [
        '.gh-content iframe[src*="player.vimeo.com"]',
        '.gh-content iframe[src*="kickstarter.com"][src*="video.html"]',
        '.gh-content object',
        '.gh-content embed',
    ];
    reframe(document.querySelectorAll(sources.join(',')));
})();

/* Turn the main nav into dropdown menu when there are more than 5 menu items */
(function () {
    dropdown();
})();

/* Infinite scroll pagination */
(function () {
    if (!document.body.classList.contains('home-template') && !document.body.classList.contains('post-template')) {
        pagination();
    }
})();

/* Reading progress bar */
(function () {
    var progress = document.getElementById('reading-progress');
    if (!progress) return;

    var fill = progress.querySelector('.reading-progress-fill');
    var ticking = false;

    function updateProgress() {
        var scrollTop = window.scrollY;
        var docHeight = document.documentElement.scrollHeight - window.innerHeight;

        if (docHeight <= 0) {
            progress.classList.remove('is-active');
            return;
        }

        var percent = Math.min((scrollTop / docHeight) * 100, 100);

        if (scrollTop > 50) {
            progress.classList.add('is-active');
        } else {
            progress.classList.remove('is-active');
        }

        fill.style.width = percent + '%';
        ticking = false;
    }

    window.addEventListener('scroll', function () {
        if (!ticking) {
            requestAnimationFrame(updateProgress);
            ticking = true;
        }
    }, { passive: true });

    updateProgress();
})();

/* Add accessible label to Circle.so widget trigger */
(function () {
    var observer = new MutationObserver(function (mutations) {
        var trigger = document.querySelector('.circle-widget-trigger');
        if (trigger && !trigger.getAttribute('aria-label')) {
            trigger.setAttribute('aria-label', 'Open community chat');
            observer.disconnect();
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    // Stop observing after 10s to avoid unnecessary overhead
    setTimeout(function () { observer.disconnect(); }, 10000);
})();

/* Section anchors: every article h2/h3 gets a stable id and a link button
   that copies the section URL (posts only). Runs before the TOC so both
   share the same ids. ES5 only. */
(function () {
    if (!document.body.classList.contains('post-template')) return;

    var content = document.querySelector('.gh-content');
    if (!content) return;

    // Direct children only: skips headings in the side rail, CTAs and cards.
    var SKIP = { 'about-sebastien': true, 'ready-to-get-to-the-next-level': true };
    var all = content.querySelectorAll(':scope > h2, :scope > h3');
    var headings = [];
    for (var i = 0; i < all.length; i++) {
        if (!SKIP[all[i].id]) headings.push(all[i]);
    }
    if (!headings.length) return;

    // Readable slug ids (citable by answer engines, stable when sections
    // move). Ghost already sets ids on most headings; only fill the gaps.
    function slugify(text) {
        return text.toLowerCase().trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_]+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
    headings.forEach(function (h, idx) {
        if (h.id) return;
        var base = slugify(h.textContent) || 'section-' + (idx + 1);
        var id = base, n = 2;
        while (document.getElementById(id)) { id = base + '-' + n; n++; }
        h.id = id;
    });

    var ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>';

    headings.forEach(function (h) {
        var a = document.createElement('a');
        a.className = 'heading-anchor';
        a.href = '#' + h.id;
        a.setAttribute('aria-label', 'Copy link to section: ' + h.textContent.trim());
        a.setAttribute('title', 'Copy link to this section');
        a.innerHTML = ICON;

        // Glue the button to the last word so it never wraps onto a line
        // of its own. Only when the heading ends in plain text.
        var last = h.lastChild;
        var match = last && last.nodeType === 3 && /(\S+)\s*$/.exec(last.nodeValue);
        if (match) {
            last.nodeValue = last.nodeValue.slice(0, match.index);
            var wrap = document.createElement('span');
            wrap.className = 'heading-anchor-wrap';
            wrap.appendChild(document.createTextNode(match[1]));
            wrap.appendChild(a);
            h.appendChild(wrap);
        } else {
            h.appendChild(a);
        }
    });

    var toast = null, toastTimer = null;
    function showToast(text) {
        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'section-link-toast';
            toast.setAttribute('role', 'status');
            toast.setAttribute('aria-live', 'polite');
            document.body.appendChild(toast);
        }
        toast.textContent = text;
        // Force a reflow so the transition replays on repeated copies
        void toast.offsetWidth;
        toast.classList.add('is-visible');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(function () { toast.classList.remove('is-visible'); }, 2000);
    }

    function fallbackCopy(text) {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;';
        document.body.appendChild(ta);
        ta.select();
        var ok = false;
        try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
        document.body.removeChild(ta);
        return ok;
    }

    function copy(text) {
        if (navigator.clipboard && window.isSecureContext) {
            return navigator.clipboard.writeText(text).then(
                function () { return true; },
                function () { return fallbackCopy(text); }
            );
        }
        return { then: function (cb) { cb(fallbackCopy(text)); } };
    }

    content.addEventListener('click', function (e) {
        var anchor = e.target.closest && e.target.closest('.heading-anchor');
        if (!anchor) return;
        e.preventDefault();

        var id = anchor.getAttribute('href').slice(1);
        // Clean URL: no query string (drops ref/utm params from shared links)
        var url = location.origin + location.pathname + '#' + id;
        if (history.replaceState) history.replaceState(null, '', '#' + id);
        var heading = document.getElementById(id);
        if (heading) heading.scrollIntoView({ behavior: 'smooth', block: 'start' });

        copy(url).then(function (ok) {
            showToast(ok ? 'Link copied' : 'Press and hold the link to copy it');
        });

        try {
            if (window.plausible) window.plausible('Section Link Copy', { props: { section: id, path: location.pathname } });
        } catch (err) { /* analytics must never break the page */ }
    });

    // The browser scrolls to the hash before this script runs; when the id
    // was just assigned above, do the scroll now.
    if (location.hash) {
        var target = null;
        try { target = document.getElementById(decodeURIComponent(location.hash.slice(1))); } catch (e) { target = null; }
        if (target && headings.indexOf(target) !== -1) target.scrollIntoView({ block: 'start' });
    }
})();

/* Table of Contents for long articles (posts and newsletters only):
   inline collapsible box at the top of the article, plus a sticky bar on
   mobile/tablet that shows the current section and opens the full list. */
(function () {
    if (!document.body.classList.contains('post-template') && !document.body.classList.contains('tag-template')) return;

    var content = document.querySelector('.gh-content');
    if (!content) return;

    // Direct-child h2s only (side rail, "Keep reading" and CTA headings are
    // nested), excluding the signature headings
    var allH2s = content.querySelectorAll(':scope > h2');
    var headings = [];
    for (var i = 0; i < allH2s.length; i++) {
        var id = allH2s[i].id;
        if (id === 'about-sebastien' || id === 'ready-to-get-to-the-next-level') continue;
        headings.push(allH2s[i]);
    }

    // Only show TOC for articles with 4+ content headings
    if (headings.length < 4) return;

    // Ids are normally set already (by Ghost or the section-anchors block).
    // Fallback for tag pages, which that block does not handle.
    function slugify(text) {
        return text.toLowerCase().trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_]+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
    headings.forEach(function (h, idx) {
        if (h.id) return;
        var base = slugify(h.textContent) || 'section-' + (idx + 1);
        var nid = base, n = 2;
        while (document.getElementById(nid)) { nid = base + '-' + n; n++; }
        h.id = nid;
    });

    function headingText(h) {
        return h.textContent.trim();
    }

    var CHEVRON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';

    function buildList(className) {
        var list = document.createElement('ol');
        list.className = className;
        headings.forEach(function (h) {
            var li = document.createElement('li');
            var a = document.createElement('a');
            a.href = '#' + h.id;
            a.textContent = headingText(h);
            a.className = 'article-toc-link';
            li.appendChild(a);
            list.appendChild(li);
        });
        return list;
    }

    // Inline TOC
    var toc = document.createElement('nav');
    toc.className = 'article-toc';
    toc.setAttribute('aria-label', 'Table of contents');

    var toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'article-toc-toggle';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.innerHTML = '<span class="article-toc-toggle-label">Contents</span>' + CHEVRON;
    toc.appendChild(toggle);

    var list = buildList('article-toc-list');
    toc.appendChild(list);

    // First child of .gh-content so it participates in the .gh-canvas grid
    // (needed for col-[main] on mobile)
    content.insertBefore(toc, content.firstChild);

    toggle.addEventListener('click', function () {
        var expanded = toc.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', expanded);
    });

    list.addEventListener('click', function (e) {
        if (e.target.classList.contains('article-toc-link')) {
            toc.classList.remove('is-open');
            toggle.setAttribute('aria-expanded', 'false');
        }
    });

    // Sticky bar (hidden by CSS on wide screens)
    var bar = document.createElement('nav');
    bar.className = 'article-toc-sticky';
    bar.setAttribute('aria-label', 'Table of contents');

    var barToggle = document.createElement('button');
    barToggle.type = 'button';
    barToggle.className = 'article-toc-sticky-toggle';
    barToggle.setAttribute('aria-expanded', 'false');
    barToggle.innerHTML = '<span class="article-toc-sticky-label">Contents</span><span class="article-toc-sticky-current"></span>' + CHEVRON;
    bar.appendChild(barToggle);

    var barCurrent = barToggle.querySelector('.article-toc-sticky-current');
    var barList = buildList('article-toc-sticky-list');
    bar.appendChild(barList);
    document.body.appendChild(bar);

    function closeBar() {
        bar.classList.remove('is-open');
        barToggle.setAttribute('aria-expanded', 'false');
    }

    barToggle.addEventListener('click', function () {
        var expanded = bar.classList.toggle('is-open');
        barToggle.setAttribute('aria-expanded', expanded);
        if (expanded) {
            var active = barList.querySelector('.is-active');
            if (active) barList.scrollTop = active.offsetTop - barList.clientHeight / 2;
        }
    });
    barList.addEventListener('click', function (e) {
        if (e.target.classList.contains('article-toc-link')) closeBar();
    });
    document.addEventListener('click', function (e) {
        if (bar.classList.contains('is-open') && !bar.contains(e.target)) closeBar();
    });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && bar.classList.contains('is-open')) {
            closeBar();
            barToggle.focus();
        }
    });

    // Highlight current section; show the sticky bar between the inline TOC
    // and the end of the article
    var tocLinks = list.querySelectorAll('.article-toc-link');
    var barLinks = barList.querySelectorAll('.article-toc-link');
    var ticking = false;
    var lastCurrent = -2;

    function update() {
        var current = null;
        for (var j = 0; j < headings.length; j++) {
            if (headings[j].getBoundingClientRect().top <= 80) current = j;
        }

        if (current !== lastCurrent) {
            for (var k = 0; k < headings.length; k++) {
                tocLinks[k].classList.toggle('is-active', k === current);
                barLinks[k].classList.toggle('is-active', k === current);
            }
            barCurrent.textContent = current === null ? '' : headingText(headings[current]);
            lastCurrent = current;
        }

        var visible = toc.getBoundingClientRect().bottom < 0 &&
            content.getBoundingClientRect().bottom > window.innerHeight / 2;
        if (!visible && bar.classList.contains('is-open')) closeBar();
        bar.classList.toggle('is-visible', visible);

        ticking = false;
    }

    window.addEventListener('scroll', function () {
        if (!ticking) {
            requestAnimationFrame(update);
            ticking = true;
        }
    }, { passive: true });
    window.addEventListener('resize', update, { passive: true });

    update();
})();

/* Mid-article CTA: inject CTAs at regular intervals throughout long articles */
(function () {
    var cta = document.getElementById('mid-article-cta');
    if (!cta) return;

    // Collect content headings, excluding signature ones
    var allH2s = document.querySelectorAll('.gh-content > h2');
    var headings = [];
    for (var i = 0; i < allH2s.length; i++) {
        var id = allH2s[i].id;
        if (id === 'about-sebastien' || id === 'ready-to-get-to-the-next-level') continue;
        headings.push(allH2s[i]);
    }

    // Need at least 3 content headings
    if (headings.length < 3) return;

    // Place first CTA before the 4th heading (or 3rd for shorter articles)
    var firstSlot = headings.length >= 5 ? 3 : 2;

    // For long articles (8+ headings), add a second CTA roughly 2/3 through
    // For very long articles (13+ headings), add a third at ~5-heading intervals
    var slots = [firstSlot];
    if (headings.length >= 8) {
        var second = Math.min(firstSlot + 5, headings.length - 2);
        if (second > firstSlot + 2) slots.push(second);
    }
    if (headings.length >= 13) {
        var third = Math.min(slots[slots.length - 1] + 5, headings.length - 2);
        if (third > slots[slots.length - 1] + 2) slots.push(third);
    }

    // Place the original CTA at the first slot
    headings[slots[0]].parentNode.insertBefore(cta, headings[slots[0]]);
    cta.removeAttribute('hidden');

    // Clone for additional slots
    for (var j = 1; j < slots.length; j++) {
        var clone = cta.cloneNode(true);
        clone.removeAttribute('id');
        headings[slots[j]].parentNode.insertBefore(clone, headings[slots[j]]);
    }
})();

/* Sticky CTA bar: show after 30% scroll, hide near footer or when dismissed */
(function () {
    var stickyCta = document.getElementById('sticky-cta');
    if (!stickyCta) return;

    var closeBtn = stickyCta.querySelector('.sticky-cta-close');
    var dismissed = false;
    var ticking = false;

    function update() {
        if (dismissed) {
            ticking = false;
            return;
        }

        var scrollTop = window.scrollY;
        var docHeight = document.documentElement.scrollHeight - window.innerHeight;
        var percent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

        // Show after 30% scroll, hide in last 5% (footer area)
        if (percent > 30 && percent < 95) {
            stickyCta.classList.add('is-visible');
            document.body.classList.add('has-sticky-cta');
        } else {
            stickyCta.classList.remove('is-visible');
            document.body.classList.remove('has-sticky-cta');
        }

        ticking = false;
    }

    window.addEventListener('scroll', function () {
        if (!ticking) {
            requestAnimationFrame(update);
            ticking = true;
        }
    }, { passive: true });

    if (closeBtn) {
        closeBtn.addEventListener('click', function () {
            dismissed = true;
            stickyCta.classList.remove('is-visible');
            document.body.classList.remove('has-sticky-cta');
            // Remember dismissal for this session
            try { sessionStorage.setItem('sticky-cta-dismissed', '1'); } catch (e) {}
        });
    }

    // Check if already dismissed this session
    try {
        if (sessionStorage.getItem('sticky-cta-dismissed') === '1') {
            dismissed = true;
        }
    } catch (e) {}

    update();
})();

/* Responsive HTML table */
(function () {
    const tables = document.querySelectorAll('.gh-content > table:not(.gist table)');

    tables.forEach(function (table) {
        const wrapper = document.createElement('div');
        wrapper.className = 'gh-table';
        table.parentNode.insertBefore(wrapper, table);
        wrapper.appendChild(table);
    });
})();

/* Native share button (Web Share API) — see partials/components/social-share.hbs */
(function () {
    const buttons = document.querySelectorAll('[data-share-native]');
    if (!buttons.length) return;

    // No Web Share API: fall back to the explicit share links everywhere
    if (!navigator.share) {
        document.querySelectorAll('.social-share').forEach(function (container) {
            container.classList.add('is-no-native');
        });
        return;
    }

    buttons.forEach(function (button) {
        button.addEventListener('click', function () {
            navigator.share({
                title: button.dataset.shareTitle || document.title,
                url: button.dataset.shareUrl || window.location.href
            }).catch(function () {
                /* user dismissed the share sheet */
            });
        });
    });
})();