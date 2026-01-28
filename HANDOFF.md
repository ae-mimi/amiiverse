# Developer Handoff & Architecture Guide

Welcome to the **amii** website project. This document explains the core architectural concepts, specifically the "Era" system and how to maintain the site long-term.

## 1. The "Era" System

The website is designed to visually transform based on the current musical "Era" of the group.

### How it Works
1.  **CMS Definition:** Eras are defined in the CMS (Collection: `Eras`). Each Era has a `slug` (ID), colors, logos, and fonts.
2.  **Global Toggle:** The "Active Era" is set in **Site Settings** in the CMS.
3.  **CSS Variables:**
    -   `src/styles/global.css` defines the default (Base) styles.
    -   It also contains the logic to override these variables when a specific `data-era` attribute is present on the `<html>` tag.
4.  **Injection:** `BaseLayout.astro` reads the Active Era from settings and applies `data-era="current-slug"` to the `<html>` tag.

### Adding a New Era
1.  Go to CMS -> Eras -> **New Era**.
2.  Fill in the details (Name, Slug, Colors, Logos).
3.  **Crucial Step:** You must effectively "activate" the styles in `global.css` if you want complex custom overrides beyond simple colors.
    -   *Simple:* The CMS data automatically injects colors into the CSS variables if you update `BaseLayout` to read them dynamically (Planned feature: currently manual CSS overrides are safest).
    -   *Manual (Current)*: Add a block in `global.css`:
        ```css
        [data-era="new-era-slug"] {
            --color-bg: #...;
            --font-heading: 'New Font';
            /* ... */
        }
        ```

## 2. Dynamic Assets (Logos & Icons)

The site automatically switches logos based on two factors:
1.  **Theme:** Light vs. Dark Mode.
2.  **Era:** Active Era vs. Base.

**Logic Loop (`Navigation.astro`):**
-   Is an Era active?
    -   Yes: Does this Era have a specific logo for the current mode (Light/Dark)?
        -   Yes: **Use Era Logo**.
        -   No: **Use Global Site Logo**.
    -   No: **Use Global Site Logo**.

## 3. Forms (Brevo Integration)

We do **not** use a backend database for forms. We use **Brevo (Sendinblue)**.

-   **Mechanism:** Standard HTML `<form>` posting to a Brevo Action URL.
-   **Configuration:** The Action URL is managed in **Site Settings** in the CMS (`Mailing List Embed Code`).
-   **Fields:**
    -   `EMAIL`: Subscriber email.
    -   `FIRSTNAME`: Subscriber name.
    -   `MESSAGE`: Contact form message (mapped to a custom attribute in Brevo).

**Spam Protection:**
-   Google reCAPTCHA v3 (Invisible) is implemented.
-   Legal text is automatically appended to all forms.

## 4. Updates & Maintenance

-   **Packages:** Keep Astro and Netlify adapters updated (`npm update`).
-   **CMS:** The CMS is a single HTML file (`public/admin/index.html`) using a CDN script. It rarely needs maintenance unless breaking changes occur in Decap CMS.
-   **Content:** All content is in `src/content/` (Markdown) or `src/data/` (JSON). You can edit these files manually if the CMS is unavailable.

## 5. Deployment

-   **Host:** Netlify.
-   **Trigger:** Push to `main`.
-   **Edge Functions:** Used by the Astro Netlify adapter for SSR features (like form handling if we ever move to server-side processing).

---
*Maintained by the Development Team (2026)*
