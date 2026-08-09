# Copix public site

Marketing site for **Copix Desktop** and **Copix CLI**.

**Live:** https://ejh-bae.github.io/Copix/

- No accounts, no Copix Web app  
- Desktop installers from [Releases](https://github.com/EJH-BAE/Copix/releases)  
- Standalone CLI via `curl | bash` (macOS/Linux) and `irm | iex` (Windows) — see `main` branch `cli/`

Copix is **open source** under the [MIT License](https://github.com/EJH-BAE/Copix/blob/main/LICENSE.txt).

## Develop

```bash
./dev.sh
# or: cd app && npm run dev
```

## Build (GitHub Pages)

```bash
cd app
GITHUB_PAGES=true npm run build
```
