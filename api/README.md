# Copix Auth & Web API

Backend for Copix Web: password auth + 6-digit email 2FA, Google / GitHub / Apple OAuth, and the logged-in agent chat proxy (SSE streaming).

## Features

- **Password first**, then **6-digit email 2FA** (custom templates in `emails/` — not Supabase)
- **OAuth**: Google, GitHub, Sign in with Apple (enable via env)
- **Sessions**: JWT (`Authorization: Bearer …`)
- **Agent**: `/agent/chats` + `/agent/chats/:id/stream` (SSE → Ollama)

## Quick start

From the repo root on `public_site`:

```bash
./dev.sh
```

Or two terminals:

```bash
cd api && npm install && npm run dev   # frees :8787 if needed, then listens
cd app && npm install && npm run dev   # Vite proxies /auth /agent /health → :8787
```

You do **not** need `VITE_API_URL` for local Vite — the app uses a same-origin proxy.

API: `http://127.0.0.1:8787` · Site: `http://localhost:5173`

If you see `EADDRINUSE`:

```bash
cd api && npm run free-port && npm run dev
```

## Email (SMTP)

```env
SMTP_HOST=smtp.resend.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=resend
SMTP_PASS=re_xxx
EMAIL_FROM="Copix <noreply@yourdomain.com>"
```

Until SMTP is set, signup/login return `demoCode` so local 2FA still works.

## Auth routes

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/auth/signup` | Email + password → send 2FA code |
| POST | `/auth/signup/verify` | Verify code → JWT |
| POST | `/auth/login` | Email + password → 2FA challenge |
| POST | `/auth/login/verify` | Verify 2FA → JWT |
| POST | `/auth/2fa/resend` | Resend code |

## OAuth

| Provider | Redirect URI |
| --- | --- |
| Google | `{API_PUBLIC_URL}/auth/callback/google` |
| GitHub | `{API_PUBLIC_URL}/auth/callback/github` |
| Apple | `{API_PUBLIC_URL}/auth/callback/apple` |

Set `APP_URL` to your site origin (e.g. `https://ejh-bae.github.io/Copix`).

## Deploy

Run this Node service on Fly, Railway, Render, or a VPS. Set GitHub Pages variable `VITE_API_URL` to the public API origin so the static site can call it.
