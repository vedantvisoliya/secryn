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
