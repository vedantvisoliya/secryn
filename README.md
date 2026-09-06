# Secryn — landing page

Marketing site for Secryn, an API key and secret management platform.

Design and content reasoning lives in [DESIGN.md](DESIGN.md).

## Stack

- **React 19** + **Vite 8** (JavaScript / JSX — matching the existing project setup)
- **Tailwind CSS v4** (CSS-first config; all tokens in `src/index.css`)
- **shadcn/ui** (new-york, JSX variant) as the component foundation
- **Motion** for scroll reveals and the lifecycle scroll rail
- **lucide-react** for icons

## Commands

```bash
npm run dev
```

```bash
npm run build
```

```bash
npm run lint
```

## Authentication

Google sign-in (via Firebase) → mandatory TOTP → Secryn's own JWT session.
Routes: `/` landing, `/login` the auth sequence, `/app` behind the session.

### Environment

Copy `.env.example` to `.env` and set the Firebase web config. On Vercel, add
the same keys under Project Settings → Environment Variables.

```bash
cp .env.example .env
```

### How the flow maps to the API

| Step | Call | Notes |
| --- | --- | --- |
| Sign in | `POST /api/v1/auth/login` | Body `{ id_token }` |
| Branch | `GET /api/v1/users/me` | `mfa_enabled` picks enroll vs verify |
| Enroll | `POST /api/v1/auth/mfa/enroll/start` → `/confirm` | `{ secret, provisioning_uri }` → `{ code, secret }` |
| Verify | `POST /api/v1/auth/mfa/verify` | Body `{ email, code }`, unauthenticated |
| Rotate | `POST /api/v1/auth/refresh` | Body `{ refresh_token }` |
| Log out | `POST /api/v1/auth/logout` | Body `{ refresh_token }`, returns 204 |

### Three things the API does that are easy to get wrong

**1. `/auth/login` wants a Google ID token, not a Firebase one.** The backend
verifies against `GOOGLE_CLIENT_ID` with Google's own verifier, so
`user.getIdToken()` (issuer `securetoken.google.com`) fails with
`401 Unable to verify Google credentials`. We send
`GoogleAuthProvider.credentialFromResult(result).idToken` instead — issuer
`accounts.google.com`, audience your OAuth client id. This is why the Firebase
Google provider must be wired to your own OAuth client, and why that client id
must equal the backend's `GOOGLE_CLIENT_ID`. Set `VITE_GOOGLE_CLIENT_ID` to
catch a mismatch in the browser instead of as an opaque 401.

**2. There are no `Set-Cookie` headers.** Tokens come back in the JSON body and
`/auth/refresh` takes the refresh token in the *request body*, so the token has
to be readable by JavaScript. `httpOnly` is therefore impossible in this SPA —
there is no server of ours in the request path to set it. Tokens live in
`Secure` + `SameSite=Strict` cookies (see the note at the top of
`src/lib/tokens.js`). **An XSS on this origin can read them.** Closing that
requires a backend-for-frontend: a Vercel serverless route holding the refresh
token in an httpOnly cookie and proxying `/auth/refresh`. Worth doing before
real secrets are in play.

**3. `mfa_pending` alone doesn't say which branch you're on.** It only means
"MFA still required". `GET /users/me` carries both `mfa_enabled` and
`mfa_pending`, so it decides enroll vs verify. If a pending-scope token can't
reach that endpoint, `resolveStage()` falls back to probing `enroll/start`.

### Session handling

- Refresh timing comes from the access token's own `exp` claim, not a hardcoded
  15 minutes. Rotation fires 60s before expiry (`REFRESH_SKEW_MS`).
- Refresh is **single-flight**: concurrent 401s share one in-flight promise, so
  they can't race the server-side rotation and invalidate each other.
- A 401 on any authenticated call triggers exactly one refresh-and-replay, never
  a loop. A rejected refresh clears the session and returns to `/login`.
- Logout calls the API first, then clears locally **regardless** of the result.
- A sleeping tab misses its timer, so rotation is re-checked on `visibilitychange`.

## Structure

```
src/
├── components/
│   ├── layout/      SiteHeader, SiteFooter
│   ├── sections/    one file per page band + EncryptionPipeline
│   ├── shared/      Frame, Section, Reveal, Logo
│   └── ui/          shadcn/ui primitives
├── hooks/           useCopyToClipboard
├── lib/             content.js (all copy), utils.js
├── assets/          secryn-mark.png
├── pages/           LandingPage
└── index.css        design tokens + base layer + custom utilities
```

Brand artwork lives in [`brand/`](brand/README.md). `brand/secryn-icon-512.png`
is the master; the favicon, touch icon, OG card and component asset are all
generated from it.

**All copy is in `src/lib/content.js`.** Sections read from it; none of them
hardcode strings. Design tokens are in `src/index.css` under `@theme`; no
component contains a raw hex colour or font size.

## Before launch

- `TRUSTED_BY.logos` in `src/lib/content.js` are **placeholder** wordmarks —
  replace with real customer logos (and delete `TRUSTED_BY.footnote`).
- The vault mock in `VaultWorkspace.jsx` and the step panels in
  `StepVisuals.jsx` use sample secrets. Keep them in step with the real UI.
- The GitHub star count in `SiteHeader.jsx` is hardcoded; wire it to the API or
  remove it.
- CTA/nav hrefs point at in-page anchors. Point them at real routes.

Every cryptography figure on the page (600,000 PBKDF2 iterations, AES-256-GCM,
96-bit IV, 128-bit tag, 15-minute access token TTL) describes the intended
architecture. Keep the page and the implementation in sync, or change both.

## Bundle

Vendor code is split for caching (`vite.config.js`):

| chunk | gzip |
| --- | --- |
| react | ~60 kB |
| motion | ~42 kB |
| radix | ~38 kB |
| app + CSS | ~47 kB |

If the motion budget matters more than the scroll effects, `Reveal` and the
lifecycle rail are the only two consumers — both are replaceable with an
IntersectionObserver and a scroll listener.
