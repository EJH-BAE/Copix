# Copix Auth API

Account backend for Copix Desktop and CLI: password + 6-digit email 2FA, Google / GitHub / Apple OAuth.

## Quick start

```bash
cd api
cp .env.example .env
npm install
npm run dev
```

API: `http://127.0.0.1:8787`

## Auth routes

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/auth/signup` | Email + password → 2FA code |
| POST | `/auth/signup/verify` | Verify → JWT |
| POST | `/auth/login` | Email + password → 2FA |
| POST | `/auth/login/verify` | Verify → JWT |
| POST | `/auth/2fa/resend` | Resend code |
| GET | `/auth/oauth/:provider` | Google / GitHub / Apple |

## OAuth env

| Provider | Variables |
| --- | --- |
| Google | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` |
| GitHub | `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` |
| Apple | `APPLE_CLIENT_ID`, `APPLE_TEAM_ID`, `APPLE_KEY_ID`, `APPLE_PRIVATE_KEY` |

Redirect URIs: `{API_PUBLIC_URL}/auth/callback/{google,github,apple}`  
Set `APP_URL` to the site origin (e.g. `https://ejh-bae.github.io/Copix`).
