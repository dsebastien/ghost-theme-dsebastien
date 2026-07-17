/* Blog topic nav: scroll-spy + smooth scrolling for the sticky pill bar on
   the /blog/ page (see blog.hbs). Bails out silently on pages without it. */
(function () {
    var nav = document.getElementById('blog-topic-nav');
    if (!nav) return;

    var inner = nav.querySelector('.blog-topic-nav-inner');
    var pills = nav.querySelectorAll('.blog-topic-pill');
    if (!pills.length) return;

    // Map each pill to the section it targets; skip pills whose anchor is missing
    var items = [];
    pills.forEach(function (pill) {
        var href = pill.getAttribute('href') || '';
        if (href.charAt(0) !== '#') return;
        var section = document.getElementById(href.slice(1));
        if (section) {
            items.push({ pill: pill, section: section, visible: false });
        }
    });
    if (!items.length) return;

    function setActive(activeItem) {
        items.forEach(function (item) {
            item.pill.classList.toggle('is-active', item === activeItem);
        });

        // Keep the active pill in view when the bar overflows horizontally (mobile)
        if (activeItem && inner && inner.scrollWidth > inner.clientWidth) {
            inner.scrollTo({
                left: activeItem.pill.offsetLeft - (inner.clientWidth - activeItem.pill.offsetWidth) / 2,
                behavior: 'smooth'
            });
        }
    }

    /* Scroll-spy: the active pill is the topmost section intersecting the band
       below the sticky bar (rootMargin trims the bar height at the top and the
       lower 40% of the viewport so short sections don't fight for the spot).
       The -140px matches the anchor offset in screen.css (scroll-margin-top on
       .blog :is(.gh-feed[id], span[id])) — keep the two in sync. */
    if ('IntersectionObserver' in window) {
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                items.forEach(function (item) {
                    if (item.section === entry.target) {
                        item.visible = entry.isIntersecting;
                    }
                });
            });

            var current = null;
            for (var i = 0; i < items.length; i++) {
                if (items[i].visible) {
                    current = items[i];
                    break;
                }
            }
            setActive(current);
        }, { rootMargin: '-140px 0px -40% 0px' });

        items.forEach(function (item) {
            observer.observe(item.section);
        });
    }

    /* Smooth-scroll to the section when a pill is clicked (scroll-margin-top on
       the anchored sections keeps their titles visible below the bar) */
    nav.addEventListener('click', function (event) {
        var pill = event.target.closest ? event.target.closest('.blog-topic-pill') : null;
        if (!pill) return;

        var href = pill.getAttribute('href') || '';
        if (href.charAt(0) !== '#') return;
        var section = document.getElementById(href.slice(1));
        if (!section) return;

        event.preventDefault();
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (history.replaceState) {
            history.replaceState(null, '', href);
        }
    });
})();
