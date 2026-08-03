# Copix public site

Marketing site and account auth for **Copix Desktop** and **CLI**.

**Live:** https://ejh-bae.github.io/Copix/

Copix is **free to use** and **not open source** (proprietary).

## What’s included

| Surface | Path | Notes |
| --- | --- | --- |
| Landing | `/` | Product + install |
| Sign up / Sign in | `/signup`, `/login` | Google · GitHub · Apple · email + password · 6-digit 2FA |
| Account | `/account` | After sign-in — download Desktop / use CLI |
| OAuth return | `/auth/callback` | Stores session JWT |

## Develop

```bash
./dev.sh
# or:
cd api && npm run dev
cd app && npm run dev
```

Set OAuth credentials in `api/.env` for Google / GitHub / Apple. Set SMTP for real 2FA email.

## Build (GitHub Pages)

```bash
cd app
GITHUB_PAGES=true VITE_API_URL=https://your-api.example.com npm run build
```

Set repository variable `VITE_API_URL` to your deployed API.
