# TODO

- [ ] Blog page
    - [ ] Include description and subscription form
    - [ ] Start with featured posts
    - [ ] Include list of posts organized by content pillar with a "Show more" button pointing to the tag page
    - [ ] Include CTA to Unlock all past editions

- [ ] Free content page
- [ ] Free content page link in nav
```
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
```

- [ ] Newsletter page
    - [ ] Replace all links pointing to /tag/newsletter with the path to the newsletter theme template
- [ ] Newsletter archive page
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
- [ ] Add release-it
- [ ] Add commitizen etc
- [ ] Add icons: https://ghost.org/tutorials/add-social-media-icons/
- [ ] Create and use custom font with icons: https://fontello.com/ and https://stackoverflow.com/questions/74789159/how-includes-only-a-few-icons-from-bootstrap-icons
- [ ] Switch to Tailwind for breakpoints instead of pure CSS media queries
- [ ] Add a TOC to all blog posts:https://grantwinney.com/creating-a-table-of-contents-for-your-blog/
- [ ] Explore "feed" notion
