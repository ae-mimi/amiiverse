# Deployment & CMS Setup Guide

Follow these steps to get your **amii** website live and the CMS working.

## Prerequisite: GitHub Repository
Since Netlify pulls from GitHub, you need to push this code to a new repository.

1. Create a new **empty** repository on [GitHub](https://github.com/new).
2. Run these commands in your terminal (replace `YOUR_REPO_URL` with the one from GitHub):
   ```bash
   git remote add origin YOUR_REPO_URL
   git branch -M main
   git push -u origin main
   ```

## Step 1: Deploy to Netlify
1. Log in to your [Netlify](https://www.netlify.com/) account.
2. Click **"Add new site"** > **"Import from Git"**.
3. Select **GitHub** and authorize it if needed.
4. Pick the repository you just created.
5. Netlify will detect Astro automatically:
   - **Build Command**: `astro build`
   - **Publish Directory**: `dist`
6. Click **"Deploy site"**.

## Step 2: Enable Identity (For CMS Access)
Decap CMS requires Netlify Identity to let you log in.

1. Go to your **Site Settings** in Netlify.
2. Navigate to **Identity** (sidebar).
3. Click **"Enable Identity"**.
4. Scroll down to **Registration** and ensure it's set to **"Invite only"** (so random people can't create admin accounts) OR **"Open"** if you want to allow signups (not recommended for admin).
   - *Tip: Set to "Generic OAuth" or "Email" as needed.*
5. **IMPORTANT**: Scroll down to **Services** -> **Git Gateway** and click **"Enable Git Gateway"**. This allows the CMS to write changes back to your GitHub repo.

## Step 3: Create Your Admin Account
1. Trgger a new deployment or ensure the site is live.
2. Go to `https://your-site-name.netlify.app/admin/`.
3. You should see a login button.
4. Since you haven't created a user yet:
   - Go back to Netlify Identity tab.
   - Click **"Invite users"**.
   - Enter your email address.
   - You will get an email with a confirmation link. Click it to create your password.

## Step 4: Uploading Assets (Images/Fonts)
You have two ways to add images (like textures, cover art) or fonts:

### Option A: Via the CMS (Easier)
1. Log in to the admin panel (`/admin`).
2. Open the **Media** tab at the top.
3. Drag and drop your images here. They will be saved to `public/uploads` in your repo automatically.

### Option B: Manual Upload (For Developers)
1. Put files directly into the `public/uploads` folder on your computer.
2. Put font files (e.g., `Starbim.woff2`) into `public/fonts`.
3. Commit and push these changes to GitHub. Netlify will rebuild the site.

## Troubleshooting
- **"Failed to load settings from .netlify/identity"**: You didn't enable Identity or Git Gateway.
- **CMS doesn't save**: Make sure Git Gateway is enabled and you are logged in.
