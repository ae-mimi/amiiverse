# SOFTWARE REQUIREMENTS SPECIFICATION (SRS)
## amii Official Website (Final v1.0)

---

## 1. INTRODUCTION

### 1.1 Purpose
This Software Requirements Specification (SRS) defines the complete and final requirements for building the **amii official website** using an AI website/app builder (Google Antigravity powered by Gemini Flash).

This document is written to:
- eliminate ambiguity during AI-driven development
- prevent UI/UX drift or overengineering
- support smooth handover to a future human developer
- ensure long-term scalability without rework

This SRS is the **single source of truth** for the website.

### 1.2 Product Vision
The amii website is a **brand home**, not a generic artist page.

It must:
- center amii as a group, not a product
- showcase music and releases clearly
- adapt visually per release (era system)
- create a direct relationship with fans
- signal professionalism to press, partners, and industry stakeholders

The site should feel intentional, calm, and editorial.

### 1.3 Out of Scope (Explicit)
The following must NOT be built in v1:
- user accounts or login areas
- comment systems
- full e-commerce checkout
- forums or community features
- complex backend or database logic

---

## 2. BRAND & CONTENT GUIDELINES

### 2.1 Brand Description
**amii is a Nigerian girl group creating pop music rooted in honesty, growth, and shared experience.**

This description must be used consistently across:
- metadata
- OpenGraph previews
- press materials

### 2.2 Voice & Language Rules
- use clear, everyday language
- avoid hype, marketing jargon, or corporate tone
- avoid generic girl-power or empowerment phrasing
- write as people, not as a brand mascot

Tone: grounded, warm, confident, human.

### 2.3 Localization
- Primary language: English
- Site must allow browser-based translation tools (e.g. Chrome Translate)
- No critical text should be baked into images

---

## 3. INFORMATION ARCHITECTURE

### 3.1 Primary Navigation (v1)
The navigation must include exactly:
- Home
- Music
- About
- Press
- Contact
- Shop

No dropdowns in v1.

### 3.2 Pages & Goals

#### 3.2.1 Home (/)
Goals:
- introduce amii clearly
- reflect current visual era or base identity
- drive the primary call to action

Required sections:
- hero section (CMS-selectable layout)
- featured release or coming-soon block
- lookbook-style image grid
- email signup (Join)
- footer with social links

Primary CTA before debut:
- Join the mailing list

Incentive copy:
- early access to music
- private updates and notes
- release reminders

---

#### 3.2.2 Music (/music)
Goals:
- present discography cleanly
- route listeners to their preferred platforms

Requirements:
- grid or list of releases
- each release links to a release detail page
- one embed maximum per page
- platform buttons for all supported DSPs

---

#### 3.2.3 Release Detail (/releases/[slug])
Goals:
- present a single release clearly
- immerse visitors in the era

Requirements:
- release title and artwork
- story/notes
- credits
- streaming platform buttons
- one embedded player
- image gallery
- social sharing metadata

Release pages must always apply their own era styling.

---

#### 3.2.4 About (/about)
Goals:
- explain who amii is
- show the people behind the group

Requirements:
- group overview section
- meaning of the name amii
- values or guiding principles
- member profiles (photo + short bio)

---

#### 3.2.5 Press (/press)
Goals:
- serve journalists, curators, and partners

Requirements:
- short, medium, and long bios
- promo photos (downloadable)
- logo assets (downloadable)
- EPK PDF link
- booking and partnership contact info

---

#### 3.2.6 Contact (/contact)
Goals:
- allow communication without friction

Requirements:
- fan mail form (stored submissions)
- booking email: bookings@amiiverse.com
- partnership email: partner@amiiverse.com

---

#### 3.2.7 Shop (/shop)
Goals:
- hold space for future commerce

Requirements:
- "Coming Soon" messaging
- optional email capture for merch interest
- no checkout or payment logic

---

#### 3.2.8 Links (/links)
Goals:
- act as a branded link-in-bio hub

Requirements:
- platform links
- era-aware styling
- fast load, mobile-first

---

## 4. ERA (RELEASE) SYSTEM

### 4.1 Concept
The website must support **visual eras** tied to music releases.

Two modes exist:
- Base amii site
- Active era takeover

### 4.2 Era Overrides
When an era is active, it overrides:
- color palette
- fonts
- layout structure
- button styles
- background textures

### 4.3 Control Rules
- Only one era active at a time
- Era activation is manual
- Controlled via CMS

### 4.4 Base amii Mode
- editorial grid
- clean spacing
- neutral backgrounds
- minimal textures

### 4.5 Ordinary People Era
Visual direction:
- pink VHS textures
- scrap paper edges
- sticker-like accents
- grain and noise overlays
- clean, legible typography

Fonts:
- display: Starbim
- body: Archivo

Palette:
- #E44598
- #43B2E5
- #FCBF12
- #15499D
- #FDF38A

---

## 5. DESIGN SYSTEM

### 5.1 Token-Based Styling
All styling must use CSS variables.

No hard-coded colors or fonts inside components.

Required tokens:
- --color-primary
- --color-secondary
- --color-accent
- --background
- --text
- --font-display
- --font-body

### 5.2 Typography

Base amii:
- display: Clash Display
- body: Archivo

Ordinary People:
- display: Starbim
- body: Archivo

### 5.3 Dark Mode
Requirements:
- supports system preference
- manual toggle available
- separate dark palette (not inverted colors)
- works for base theme and all eras

---

## 6. UI / UX PRINCIPLES

- magazine / lookbook feel
- strong grids and alignment
- generous whitespace
- image-led sections

Avoid:
- dashboard layouts
- excessive cards
- long text blocks
- visual clutter

Homepage hero must be CMS-selectable:
- cover art layout
- full-bleed photo layout
- video loop layout

Only one hero active at a time.

---

## 7. CONTENT MANAGEMENT SYSTEM (CMS)

### 7.1 CMS Choice
- Decap CMS (open source, Git-based)

### 7.2 Authentication
Editors can log in using:
- GitHub
- Google
- email + password

CMS must live at /admin.

### 7.3 CMS Collections
Required collections:
- Site Settings
- Eras
- Releases
- Pages
- Members
- Press Assets

CMS must allow non-technical editors to update content safely.

---

## 8. FUNCTIONAL REQUIREMENTS

### 8.1 Mailing List
- embed-based integration
- provider-agnostic
- editable via CMS

### 8.2 Forms

Fan Mail:
- handled via Netlify Forms
- submissions stored and exportable

Bookings:
- direct email only

Partnerships:
- direct email only

### 8.3 Music Platforms
Each release must support links to:
- Spotify
- Apple Music
- YouTube
- Audiomack
- Boomplay
- SoundCloud
- Deezer
- Tidal
- Amazon Music

---

## 9. ANALYTICS & TRACKING

### 9.1 Analytics Strategy
- analytics implemented through an abstraction layer
- default provider: Google Analytics
- provider must be swappable later

Tracked events:
- join CTA clicks
- platform link clicks
- press asset downloads

---

## 10. PERFORMANCE, SEO & ACCESSIBILITY

### 10.1 Performance
- static-first rendering
- optimized images
- minimal JavaScript

### 10.2 SEO
- page titles and descriptions
- OpenGraph images per era
- MusicGroup structured data
- sitemap.xml and robots.txt

### 10.3 Accessibility
- semantic HTML
- keyboard navigation
- readable contrast ratios
- alt text for meaningful images

---

## 11. DEPLOYMENT

### 11.1 Hosting
- Netlify (free tier)

### 11.2 Domain
- amiiverse.com

### 11.3 CI/CD
- Git-based deployments
- preview builds enabled

---

## 12. MAINTENANCE & FUTURE SCALING

### 12.1 Adding New Releases
- create release entry in CMS
- define era tokens
- upload assets
- toggle era takeover if needed

### 12.2 Future Database Integration
- no database in v1
- architecture must allow later integration via serverless functions

### 12.3 Developer Handoff
- code documented
- tokens centralized
- CMS schema versioned

---

## 13. ACCEPTANCE CRITERIA

The website is complete when:
- era takeover works site-wide
- dark mode functions correctly
- CMS edits do not break layout
- mobile experience is clean
- integrations function as specified
- no hard-coded brand values exist

---

END OF DOCUMENT