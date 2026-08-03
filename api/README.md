# Copix Auth API

Account backend for **Copix Desktop** and **CLI**: password + 6-digit email 2FA, Google / GitHub / Apple OAuth.

There is no Copix Web agent in this API.

## Quick start

```bash
cd api
cp .env.example .env
npm install
npm run check-oauth   # shows redirect URIs + what’s configured
npm run dev
```

## Enable OAuth (required for Google / GitHub / Apple buttons)

I can’t create provider apps from this environment — you create them once, then paste secrets into `api/.env` (and your hosted API).

### 1. Set public URLs in `.env`

Local:

```env
APP_URL=http://localhost:5173
API_PUBLIC_URL=http://localhost:8787
```

Production (example):

```env
APP_URL=https://ejh-bae.github.io/Copix
API_PUBLIC_URL=https://YOUR-API-HOST
```

### 2. Create apps — use these redirect URIs exactly

| Provider | Console | Redirect URI |
| --- | --- | --- |
| **Google** | [Google Cloud → Credentials](https://console.cloud.google.com/apis/credentials) → OAuth client ID → **Web application** | `{API_PUBLIC_URL}/auth/callback/google` |
| **GitHub** | [GitHub → Developer settings → OAuth Apps](https://github.com/settings/developers) → New OAuth App | `{API_PUBLIC_URL}/auth/callback/github` |
| **Apple** | [Apple Developer → Identifiers](https://developer.apple.com/account/resources/identifiers) → Services ID + key | `{API_PUBLIC_URL}/auth/callback/apple` |

Homepage / callback for GitHub Authorization callback URL = the redirect URI above.  
Google Authorized JavaScript origins = your `APP_URL` origin (e.g. `https://ejh-bae.github.io`).

### 3. Paste into `.env`

```env
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
# Apple optional:
APPLE_CLIENT_ID=...
APPLE_TEAM_ID=...
APPLE_KEY_ID=...
APPLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
```

### 4. Verify

```bash
npm run check-oauth
# → Google ready / GitHub ready / …
curl -s http://127.0.0.1:8787/auth/providers
```

Then open the site → Sign in → Continue with Google / GitHub / Apple.

## Auth routes

| Method | Path |
| --- | --- |
| POST | `/auth/signup` · `/auth/signup/verify` |
| POST | `/auth/login` · `/auth/login/verify` |
| POST | `/auth/2fa/resend` |
| GET | `/auth/oauth/:provider` |
| GET | `/auth/providers` |
| GET | `/auth/me` |
