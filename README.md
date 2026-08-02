# Copix public site

Marketing site for https://github.com/EJH-BAE/Copix

**Live:** https://ejh-bae.github.io/Copix/

Mirrors the [cursor.com](https://cursor.com/) landing structure with Copix branding: hero, agents, terminal install, quotes, frontier models, changelog, and research.

## Develop

```bash
cd app
npm install
npm run dev
```

## Build & publish

```bash
cd app
GITHUB_PAGES=true npm run build
cp -f dist/index.html ../index.html
rm -rf ../assets && cp -R dist/assets ../assets
# commit on public_site and push
```

Install CLI (from `main`):

```bash
curl -fsSL https://raw.githubusercontent.com/EJH-BAE/Copix/main/cli/install.sh | bash
```
