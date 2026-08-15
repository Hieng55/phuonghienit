# SEO / GEO / UI-UX Implementation Report — V4

Build date: 2026-08-15  
Website: https://phuonghienit.netlify.app/

## 1. Strategic target

Primary commercial queries:

- `thiết kế website tphcm`
- `thiết kế website nha trang`

Top 10–20 is the working KPI target, **not a guaranteed ranking**. The website controls technical quality, relevance, content depth, internal linking, entity clarity and UX; final rankings also depend on competitors, authority, local distance, reviews, citations, backlinks and Google systems.

## 2. UI / UX

V4 uses the original uploaded portfolio source as the visual master rather than a generic SEO template.

Retained / reused:

- Jost body typography + Space Grotesk display typography
- original dark/light design tokens
- original full-screen preloader visual
- original text reveal style
- gradient / outline display typography
- glass surfaces
- custom cursor on fine-pointer desktop devices
- magnetic buttons
- tilt interactions
- marquee
- scroll progress
- GSAP + ScrollTrigger progressive enhancement
- Three.js particle background
- responsive behavior and reduced-motion support

Performance changes:

- preloader no longer waits for `window.load`
- full loader appears once per browser session
- important text exists in HTML before animation
- GSAP is loaded progressively; content remains visible if CDN fails
- Three.js loads when the browser is idle
- WebGL particle count and pixel ratio are reduced on mobile / lower-memory devices
- render cadence is limited to approximately 30fps and paused when the tab is hidden
- homepage uses full WebGL, money/case pages use lighter mode, knowledge pages avoid unnecessary WebGL

## 3. Information architecture

Indexable pages: 18

- `/`
- `/dich-vu-thiet-ke-website/`
- `/thiet-ke-website-tphcm/`
- `/thiet-ke-website-nha-trang/`
- `/bang-gia-thiet-ke-website/`
- `/du-an/`
- five project case studies
- `/gioi-thieu/`
- `/lien-he/`
- `/kien-thuc/`
- four supporting knowledge articles

Noindex utility pages:

- `/cam-on/`
- `/404.html`

## 4. On-page SEO

Every indexable page has:

- unique `<title>`
- unique meta description
- self-referencing canonical
- one H1
- crawlable HTML content
- shared navigation
- contextual internal links
- appropriate OG/Twitter metadata

Primary money pages now contain over ~1,000 visible words each, with distinct local content rather than city-name substitution.

### TP.HCM

Uses the real physical location:

35/6H Ấp Hưng Lân, Hóc Môn, Hồ Chí Minh, Việt Nam

The page targets the city-wide service query while transparently stating the real Hóc Môn location.

### Nha Trang

Physical location remains:

223 Đường Bến Đò, Hòa Thắng, Khánh Hòa, Việt Nam

Nha Trang is represented as a **service area**, not a fabricated addressLocality.

## 5. Content quality

Commercial pages are structured around the questions a buying customer needs answered:

1. What service is provided?
2. Is the provider relevant to my location / business?
3. What kinds of website can be built?
4. What is the process?
5. What is the price range?
6. How long does delivery usually take?
7. Is SEO included in the technical foundation?
8. What proof of work exists?
9. What is the warranty / maintenance period?
10. How do I contact the provider?

Content avoids unsupported claims. No fabricated traffic, revenue, ranking, conversion, testimonial or review claims were inserted.

## 6. Case studies / E-E-A-T evidence

Five selected case-study URLs use the user-approved project logos and link to the live client websites.

Confirmed role used consistently:

- Design
- Development
- SEO
- Google Business Profile

Each case study explicitly states its evidence boundary instead of inventing KPI outcomes.

## 7. Entity / GEO architecture

Core entity graph:

- `WebSite`
- `Organization`: Thiết Kế Website Phương Hiển IT
- `Person`: Phương Hiển / Phương Hiển IT / phuonghienitdev
- two `ProfessionalService` local entities
- `Service`
- `BreadcrumbList`
- `FAQPage` where visible FAQ content exists
- `CreativeWork` for project case studies
- `ProfilePage`
- `Article`
- `ItemList`

Organization, Person, location and service entities reuse consistent IDs instead of creating unrelated identities per page.

The build intentionally does **not** include self-serving `aggregateRating` markup.

## 8. AI / generative search readiness

The build follows the same foundation required for normal Search:

- crawlable text
- clear page hierarchy
- descriptive internal links
- visible business facts
- structured data matching visible content
- local landing pages with truthful location details
- project evidence
- factual entity page

`robots.txt` explicitly allows:

- Googlebot
- Bingbot
- OAI-SearchBot
- ChatGPT-User

`llms.txt` is included as a factual helper file, but the site does not depend on it for Google ranking or AI inclusion.

## 9. Technical files

Included:

- `robots.txt`
- `sitemap.xml`
- `_redirects`
- `netlify.toml`
- `site.webmanifest`
- `llms.txt`
- custom 404
- noindex thank-you page
- Netlify contact form
- GA4 event hook ready for a future `G-...` Measurement ID

Tracking hooks prepared:

- phone clicks
- email clicks
- Maps clicks
- project clicks
- form submits

## 10. Validation results

Automated local validator:

```text
HTML pages: 20; indexable: 18
PASS: titles, descriptions, canonicals, single H1 on indexable pages, JSON-LD, internal links
```

Additional QA:

- duplicate indexable titles: 0
- duplicate canonical URLs: 0
- JSON-LD parse errors: 0
- aggregateRating markup: 0
- TP.HCM page: ~1,025 visible words
- Nha Trang page: ~1,034 visible words
- homepage: ~1,177 visible words

## 11. What is still required after deployment

Website code alone cannot create a Top 10–20 result. After production deployment:

1. submit sitemap and inspect money pages in Google Search Console
2. connect GA4
3. connect/import Bing Webmaster Tools
4. map each GBP website link to its correct local landing page with UTM tracking
5. maintain real permanent signage and real location photos for both public-facing locations
6. continue genuine review acquisition
7. synchronize public entity details across social / professional profiles
8. earn legitimate business citations, partner/client mentions and relevant backlinks
9. monitor query impressions, CTR and ranking in Search Console and improve content based on real query data
10. measure local ranking by geographic grid around the real locations rather than a single manual search

## 12. Official guidance used for V4 direction

- Google Search AI features: standard SEO fundamentals remain relevant; no special AI schema or AI file is required.
- Google Organization structured data: helps Google understand and disambiguate an organization.
- Google LocalBusiness structured data: communicates business/location details such as address and opening hours.
- OpenAI publisher guidance: public sites can appear in ChatGPT Search; OAI-SearchBot should not be blocked when discovery is desired.

