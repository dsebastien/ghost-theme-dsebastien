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
- [ ] Add a TOC to all blog posts:https://grantwinney.com/creating-a-table-of-contents-for-your-blog/


Integrate signature at the end of all blog posts:

<!-- Signature -->
<h2 id="about-sebastien">About Sébastien</h2>
<p>I am <a href="/about/">Sébastien Dubois</a>. You can <a href="https://x.com/dSebastien" rel="no-referrer">follow me on X</a> 🐦 and on <a href="https://bsky.app/profile/dsebastien.net" rel="no-referrer">BlueSky</a> 🦋.</p>
<br />
<p>I am an author, founder, and coach. I write books and articles about <a href="/tag/knowledge-work/">Knowledge Work</a>, <a href="/tag/personal-knowledge-management/">Personal Knowledge Management</a>, <a href="/tag/note-taking/">Note-taking</a>, Lifelong Learning, <a href="/tag/personal-organization/">Personal Organization</a>, and Zen <a href="/tag/productivity/">Productivity</a>. I also craft lovely digital products . You can learn more about my projects <a href="/projects/">here</a>.<br><br>If you want to follow my work, then <a href="/#/portal/signup">become a member</a>.</p><br /><h2 id="ready-to-get-to-the-next-level">Ready to get to the next level?</h2><p>To embark on your Knowledge Management journey, consider investing in resources that will equip you with the tools and strategies you need. Check out the <a href="https://developassion.gumroad.com/l/obsidian-starter-kit" rel="noreferrer">Obsidian Starter Kit</a> and the <a href="https://developassion.gumroad.com/l/obsidian-starter-course">accompanying video course</a>. It will give you a rock-solid starting point for your note-taking and Knowledge Management efforts.</p><br /><p>If you want to take a more holistic approach, then the <a href="https://developassion.gumroad.com/l/knowledge-worker-kit" rel="noreferrer">Knowledge Worker Kit</a> is for you. It covers PKM, but expands into productivity, personal organization, project/task management, and more:</p><figure class="kg-card kg-bookmark-card"><a class="kg-bookmark-container" href="https://developassion.gumroad.com/l/knowledge-worker-kit"><div class="kg-bookmark-content"><div class="kg-bookmark-title">Knowledge Worker Kit and community</div><div class="kg-bookmark-description">Unlock the next level of your career. Stop feeling disorganized, unproductive, or overwhelmed.</div><div class="kg-bookmark-metadata"><img class="kg-bookmark-icon" src="https://public-files.gumroad.com/39uqrcaxowvpvf4srzeq97jpcecb" alt=""><span class="kg-bookmark-author">Gumroad</span></div></div><div class="kg-bookmark-thumbnail"><img src="https://public-files.gumroad.com/soezrho2f78afs46f7n148mfah2n" alt=""></div></a></figure><br /><p>If you are in a hurry, then do not hesitate to <a href="https://developassion.gumroad.com/l/pkm-coaching">book a coaching session with me</a>:</p><figure class="kg-card kg-bookmark-card"><a class="kg-bookmark-container" href="https://developassion.gumroad.com/l/pkm-coaching"><div class="kg-bookmark-content"><div class="kg-bookmark-title">Personal Knowledge Management Coaching</div><div class="kg-bookmark-description">Receive personalized coaching to quickly reach your goals</div><div class="kg-bookmark-metadata"><img class="kg-bookmark-icon" src="https://public-files.gumroad.com/39uqrcaxowvpvf4srzeq97jpcecb" alt=""><span class="kg-bookmark-author">Gumroad</span></div></div><div class="kg-bookmark-thumbnail"><img src="https://public-files.gumroad.com/zx5o75oood282lidm5a0ze0nb7zb" alt=""></div></a></figure></p>


