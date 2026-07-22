# Copix public site

Marketing site for https://github.com/EJH-BAE/Copix

**Live:** https://ejh-bae.github.io/Copix/

## Features

- Pretendard + IBM Plex Mono (English / Korean)
- Automatic light / dark theme via `prefers-color-scheme`
- EN / 한국어 language toggle

## Develop

```powershell
cd app
npm install
npm run dev
```

## Build & publish

```powershell
cd app
$env:GITHUB_PAGES='true'
npm run build
# copy dist → branch root, then commit
```