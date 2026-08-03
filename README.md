# Copix public site + web product

Marketing site, auth UI, and **Copix Web** (logged-in browser agent).

**Live:** https://ejh-bae.github.io/Copix/

Copix is **free to use** and **not open source** (proprietary).

## What’s included

| Surface | Path | Notes |
| --- | --- | --- |
| Interactive landing | `/` | Cursor-style demo you can type into |
| Sign up / Sign in | `/signup`, `/login` | Google · GitHub · Apple · email 6-digit code |
| OAuth return | `/auth/callback` | Stores session JWT |
| Copix Web | `/app` | Requires login — chats via API → Ollama |

Auth emails use **our** templates in [`api/emails/`](api/emails/) (6-digit codes), not Supabase defaults.

## Develop

```bash
# API (auth + agent)
cd api
cp .env.example .env
npm install
npm run dev

# Site
cd ../app
echo 'VITE_API_URL=http://localhost:8787' > .env
npm install
npm run dev
```

Open the Vite URL, click **Sign up**, request a code. With SMTP unset you’ll see a **dev email preview** with the 6-digit code.

## Build (GitHub Pages)

```bash
cd app
GITHUB_PAGES=true VITE_API_URL=https://your-api.example.com npm run build
```

The `public_site` workflow builds `app/` and deploys `dist/`. Set repository variable `VITE_API_URL` to your deployed API.

## Screenshots needed (when Bae is awake)

1. Copix Studio agents chat (full window, dark)
2. File tree open on a named project
3. CLI session with the input rectangle
4. Model picker
5. Optional: macOS window chrome
