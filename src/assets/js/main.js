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