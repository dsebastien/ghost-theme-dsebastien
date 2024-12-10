# TODO

- [ ] Add Tailwind color theme
- [ ] Rework home.hbs and integrate homepage HTML
- [ ] Blog page

Show featured posts on blog page on desktop
{{#get "posts" filter="featured:true" include="authors" limit=limit as |featured|}}
    <section class="gh-featured gh-outer">
        <div class="gh-featured-inner gh-inner">
            <h2 class="gh-featured-title">Featured</h2>
            <div class="gh-featured-feed">
                {{#foreach featured}}
                    {{> "post-card" imageSizes="80px"}}
                {{/foreach}}
            </div>
        </div>
    </section>
{{/get}}


- [ ] Remove settings and associated styles (i.e., hardcode MY style)
- [ ] Newsletter page
- [ ] Replace all links pointing to /tag/newsletter with the path to the newsletter theme template

- [ ] Newsletter archive page
- [ ] Articles page with posts lists organized by content pillar (cfr content strategy)
- [ ] Free content page
- [ ] Free content page link in nav
- [ ] Logo in top left of the header
- [ ] Subscribe button in header

Blog page
		- [ ] Start with featured posts (all!)
		- [ ] Include list of posts per section with a "Show more" button pointing to the tag page
			- [ ] Match the content pillars
	- [ ] Newsletter page
		- [ ] Include description and subscription form
		- [ ] Include CTA to Unlock all past editions
		- [ ] List past newsletter editions



- [ ] Add a "back to top" link at the bottom of the page
- [ ] Improve footer
    - [ ] Title such as "Sébastien Dubois | Knowledge Management Coach
    - [ ] CTA for newsletter + signup form
    - [ ] Hardcode Social links and add icons
    - [ ] Gradient background
    - [ ] Sections in columns (similar to knowii.net)
        - [ ] About
        - [ ] About: link to about page
        - [ ] Newsletter: link to newsletter page
        - [ ] Free content: link to free content page
        - [ ] Contact: link to contact page
    - [ ] Resources
        - [ ] Knowledge Management: Link to PKM page
        - [ ] Courses
        - [ ] Coaching
        - [ ] Blog
    - [ ] Knowledge Management
        - [ ] OSK
        - [ ] OSC
        - [ ] ...
- [ ] Add start page (header or not?)
- [ ] Add release-it
- [ ] Add commitizen etc
- [ ] Explore "feed" notion for Ghost theme
- [ ] Add icons: https://ghost.org/tutorials/add-social-media-icons/
- [ ] Create and use custom font with icons: https://fontello.com/ and https://stackoverflow.com/questions/74789159/how-includes-only-a-few-icons-from-bootstrap-icons
- [ ] Switch to Tailwind for breakpoints instead of pure CSS media queries

In footer.hbs
<nav class="gh-footer-menu">
    {{navigation type="secondary"}}
</nav>
