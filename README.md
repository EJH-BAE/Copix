# Copix — Public Site

Marketing site for [Copix](https://github.com/EJH-BAE/Copix).

This branch (`public_site`) contains **only** the website. The desktop app and installers live on [`main`](https://github.com/EJH-BAE/Copix/tree/main).

## Develop

```powershell
npm install
npm run dev
```

## Build

```powershell
npm run build
```

## GitHub Pages

Pushes to `public_site` deploy via `.github/workflows/pages.yml` to:

**https://ejh-bae.github.io/Copix/**

In the repo **Settings → Pages**, set source to **GitHub Actions** if needed.
