# Copix Auth & Web API

Backend for Copix Web: custom email OTP, Google / GitHub / Apple OAuth, and the logged-in agent chat proxy.

## Features

- **Email sign-in** with a **custom 6-digit Copix template** (`emails/otp.html`) — not Supabase default mailers
- **OAuth**: Google, GitHub, Sign in with Apple (enable via env)
- **Sessions**: JWT (`Authorization: Bearer …`)
- **Agent**: `/agent/chats` for Copix Web (proxies to Ollama)

## Quick start

```bash
cd api
cp .env.example .env
npm install
npm run dev
```

API listens on `http://localhost:8787`.

Point the website at it:

```bash
cd ../app
echo 'VITE_API_URL=http://localhost:8787' > .env
npm run dev
```

## Email (SMTP)

Configure any SMTP provider (Resend, Postmark, SES, …):

```env
SMTP_HOST=smtp.resend.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=resend
SMTP_PASS=re_xxx
EMAIL_FROM="Copix <noreply@yourdomain.com>"
```

Until SMTP is set, `/auth/email/start` returns `demoCode` so local development still works. The HTML/text templates in `emails/` are always used when mail is sent.

## OAuth

Set the provider credentials in `.env`, then add redirect URIs:

| Provider | Redirect URI |
| --- | --- |
| Google | `{API_PUBLIC_URL}/auth/callback/google` |
| GitHub | `{API_PUBLIC_URL}/auth/callback/github` |
| Apple | `{API_PUBLIC_URL}/auth/callback/apple` |

Also set `APP_URL` to your site origin (e.g. `https://ejh-bae.github.io/Copix`).

## Deploy

Run this Node service on Fly, Railway, Render, or a VPS. Set GitHub Pages variable `VITE_API_URL` to the public API origin so the static site can call it.
