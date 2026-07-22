# Copix public site

Static marketing site for https://github.com/EJH-BAE/Copix

**Live URL:** https://ejh-bae.github.io/Copix/

## Enable GitHub Pages (required once)

Open **Settings → Pages** on the repo and use **one** of these:

### Option A — Deploy from branch (simplest)

1. Source: **Deploy from a branch**
2. Branch: **`public_site`** / folder **`/ (root)`**
3. Save

### Option B — GitHub Actions

1. Source: **GitHub Actions**
2. Open **Settings → Environments → github-pages**
3. Under **Deployment branches**, allow **`public_site`** (or “All branches”)
4. Re-run the **Deploy GitHub Pages** workflow

This branch contains only the built static files (`index.html`, `assets/`, `.nojekyll`).
