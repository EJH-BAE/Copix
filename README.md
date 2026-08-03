# Copix public site + web product

Marketing site, auth UI, and **Copix Web** (logged-in browser agent).

**Live:** https://ejh-bae.github.io/Copix/

Copix is **free to use** and **not open source** (proprietary).

## What’s included

| Surface | Path | Notes |
| --- | --- | --- |
| Interactive landing | `/` | Cursor-style agent demo |
| Sign up / Sign in | `/signup`, `/login` | Password first → 6-digit email 2FA · optional OAuth |
| OAuth return | `/auth/callback` | Stores session JWT |
| Copix Web | `/app` | Requires login — SSE chats via API → Ollama |

Auth emails use **our** templates in [`api/emails/`](api/emails/) (6-digit codes), not Supabase defaults.

## Develop

One command (recommended):

```bash
git checkout public_site
git pull
./dev.sh
```

Or two terminals:

```bash
cd api && npm install && npm run dev
# frees :8787 if something else is stuck on it

cd app && npm install && npm run dev
# Vite proxies /auth /agent /health → http://127.0.0.1:8787
# no VITE_API_URL needed locally
```

Open the Vite URL → **Sign up** → password → enter the **dev email preview** 6-digit code.

If login says the API is offline:

```bash
cd api && npm run free-port && npm run dev
```

Then click **Retry connection** on the login card (or refresh).

## Build (GitHub Pages)

```bash
cd app
GITHUB_PAGES=true VITE_API_URL=https://your-api.example.com npm run build
```

The `public_site` workflow builds `app/` and deploys `dist/`. Set repository variable `VITE_API_URL` to your deployed API.
