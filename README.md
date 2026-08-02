# Copix public site

Marketing site for https://github.com/EJH-BAE/Copix

**Live:** https://ejh-bae.github.io/Copix/

Original Copix positioning — local-first desktop agent + matching CLI. Not a Cursor clone.

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

## Screenshots needed (when Bae is awake)

Please drop these into the repo or chat so the hero can use real product art:

1. Copix Studio agents chat (full window, dark)
2. File tree open on a named project under `~/…`
3. Terminal / CLI session (`copix>` REPL)
4. Model picker showing Ollama models
5. Optional: macOS dock/window chrome for the download section
