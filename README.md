# amii | Official Website

This is the official website for **amii**, built with **Astro**, **TypeScript**, and **Decap CMS**.

## 🚀 Quick Start

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Start Development Server:**
    ```bash
    npm run dev
    ```
    - Website: `http://localhost:4321`
    - CMS Admin: `http://localhost:4321/admin`

3.  **Build for Production:**
    ```bash
    npm run build
    ```

## 🛠️ Tech Stack

-   **Framework:** [Astro v5](https://astro.build)
-   **CMS:** [Decap CMS](https://decapcms.org) (Git-based)
-   **Styling:** Vanilla CSS + CSS Variables (No frameworks)
-   **Forms:** Brevo (Sendinblue) Integration
-   **Hosting:** Netlify

## 🌍 Environment Variables

Create a `.env` file in the root directory (optional for local dev, required for specific features):

```ini
# (Optional) For verifying builds locally
NETLIFY_SITE_ID=your-site-id
```

*Note: Most configuration is handled via `src/data/settings.json` and the CMS, not env vars.*

## 📂 Project Structure

-   `src/components/`: Reusable UI components (Navigation, Forms, etc.)
-   `src/layouts/`: Page layouts (BaseLayout)
-   `src/pages/`: Astro pages (routes)
-   `src/styles/`: Global CSS and variables
-   `src/content/`: CMS Content collections (Eras, Releases, Members)
-   `public/admin/`: Decap CMS configuration (`config.yml`)

## 🎨 The Era System

This site uses a unique "Era" system to change its appearance.
See **[HANDOFF.md](./HANDOFF.md)** for a deep dive into how eras, themes, and dynamic assets work.

## 📝 CMS & Content

Access the CMS at `/admin`.
-   **Local:** You can edit content locally. Changes are saved to `.md` and `.json` files in `src/`.
-   **Production:** Changes made in the live CMS are committed to the GitHub repository automatically.

## 🚢 Deployment

The site is configured for automatic deployment on **Netlify**.
Any push to the `main` branch triggers a build/deploy.

**Build Settings:**
-   **Build Command:** `npm run build`
-   **Publish Directory:** `dist`
