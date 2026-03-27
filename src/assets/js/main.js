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

/* Sticky Table of Contents for long articles (posts and newsletters only) */
(function () {
    if (!document.body.classList.contains('post-template') && !document.body.classList.contains('tag-template')) return;

    var content = document.querySelector('.gh-content');
    if (!content) return;

    // Only use h2s from the article content, exclude signature headings
    var allH2s = content.querySelectorAll('h2');
    var headings = [];
    for (var i = 0; i < allH2s.length; i++) {
        var id = allH2s[i].id;
        if (id === 'about-sebastien' || id === 'ready-to-get-to-the-next-level') continue;
        headings.push(allH2s[i]);
    }

    // Only show TOC for articles with 4+ content headings
    if (headings.length < 4) return;

    // Ensure all headings have IDs
    headings.forEach(function (h, idx) {
        if (!h.id) {
            h.id = 'heading-' + idx;
        }
    });

    // Build the TOC element
    var toc = document.createElement('nav');
    toc.className = 'article-toc';
    toc.setAttribute('aria-label', 'Table of contents');

    var toggle = document.createElement('button');
    toggle.className = 'article-toc-toggle';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.innerHTML = '<span class="article-toc-toggle-label">Contents</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>';
    toc.appendChild(toggle);

    var list = document.createElement('ol');
    list.className = 'article-toc-list';
    headings.forEach(function (h) {
        var li = document.createElement('li');
        var a = document.createElement('a');
        a.href = '#' + h.id;
        a.textContent = h.textContent;
        a.className = 'article-toc-link';
        li.appendChild(a);
        list.appendChild(li);
    });
    toc.appendChild(list);

    // Insert into the page — place as first child of .gh-content so it
    // participates in the .gh-canvas grid (needed for col-[main] on mobile)
    content.insertBefore(toc, content.firstChild);

    // Desktop: hide the TOC until the user scrolls past the article header
    // so it doesn't overlap the navigation bar or article title
    var articleHeader = document.querySelector('.gh-article-header');
    function updateTocVisibility() {
        if (window.innerWidth >= 1280 && articleHeader) {
            var headerBottom = articleHeader.getBoundingClientRect().bottom;
            if (headerBottom > 0) {
                toc.style.opacity = '0';
                toc.style.pointerEvents = 'none';
            } else {
                toc.style.opacity = '1';
                toc.style.pointerEvents = '';
            }
        } else {
            toc.style.opacity = '';
            toc.style.pointerEvents = '';
        }
    }
    updateTocVisibility();

    // Mobile toggle
    toggle.addEventListener('click', function () {
        var expanded = toc.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', expanded);
    });

    // Close mobile TOC when a link is clicked
    list.addEventListener('click', function (e) {
        if (e.target.classList.contains('article-toc-link')) {
            toc.classList.remove('is-open');
            toggle.setAttribute('aria-expanded', 'false');
        }
    });

    // Highlight current section on scroll
    var tocLinks = list.querySelectorAll('.article-toc-link');
    var ticking = false;

    function updateActive() {
        var scrollY = window.scrollY;
        var current = null;

        for (var j = 0; j < headings.length; j++) {
            if (headings[j].getBoundingClientRect().top <= 80) {
                current = j;
            }
        }

        tocLinks.forEach(function (link, idx) {
            if (idx === current) {
                link.classList.add('is-active');
            } else {
                link.classList.remove('is-active');
            }
        });

        updateTocVisibility();
        ticking = false;
    }

    window.addEventListener('scroll', function () {
        if (!ticking) {
            requestAnimationFrame(updateActive);
            ticking = true;
        }
    }, { passive: true });

    updateActive();
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