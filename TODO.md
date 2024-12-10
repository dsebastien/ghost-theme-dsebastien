# TODO

- [ ] Rework home.hbs and integrate homepage HTML
- [ ] Blog page
- [ ] Remove settings and associated styles (i.e., hardcode MY style)
- [ ] Add fontawesome or similar to use icons (without the CDN!)
- [ ] Newsletter page
- [ ] Newsletter archive page
- [ ] Articles page with posts lists organized by content pillar (cfr content strategy)
- [ ] Free content page
- [ ] Free content page link in nav
- [ ] Logo in top left of the header
- [ ] Subscribe button in header


Show featured posts on blog page
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