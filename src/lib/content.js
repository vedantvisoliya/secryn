/**
 * Single source of truth for landing-page copy and data.
 *
 * Voice: an engineer explaining their own system to another engineer.
 * Concrete nouns, real parameters, no adjectives that can't be measured.
 *
 * Secryn is a browser-based vault. There is no CLI, no SDK and no package to
 * install — everything on this page describes something the user does on screen.
 *
 * NOTE: customer names below are placeholders for design purposes. Every
 * cryptography figure (key sizes, iteration counts, TTLs) describes the real
 * Secryn design.
 */

export const NAV_LINKS = [
  { label: 'How it works', href: '#how' },
  { label: 'Architecture', href: '#architecture' },
  { label: 'Lifecycle', href: '#lifecycle' },
  { label: 'The vault', href: '#vault' },
  { label: 'FAQ', href: '#faq' },
]

export const HERO = {
  eyebrow: 'API key & secret management',
  release: {
    tag: 'v1.4',
    text: 'Bulk import from .env and expiry reminders',
    href: '#lifecycle',
  },
  headline: ['Secrets go in encrypted.', 'Nothing comes out that shouldn’t.'],
  body: 'Secryn seals every credential with AES-256-GCM under a key derived from your passphrase. The passphrase is never stored and never leaves your session, so what lands in the database is ciphertext, an IV, and an auth tag — nothing that can be replayed.',
  primaryCta: { label: 'Create a vault', href: '#cta' },
  secondaryCta: { label: 'See how it works', href: '#how' },
  assurances: [
    'Google SSO + TOTP',
    'No plaintext at rest',
    'No recovery backdoor',
  ],
}

export const TRUSTED_BY = {
  label: 'In production at',
  logos: [
    'Northbound',
    'Deriva',
    'Foundry Nine',
    'Cartridge',
    'Loamworks',
    'Metaphor Labs',
  ],
  footnote: 'Placeholder marks. Swap for real customer logos before launch.',
}

export const PROBLEM = {
  index: '01',
  label: 'The problem',
  heading: 'Your keys already leaked. You just haven’t been told yet.',
  body: 'Every team starts with the same three storage backends. None of them were designed to hold machine credentials, and none of them fail loudly.',
  items: [
    {
      id: 'dotenv',
      title: '.env files',
      spec: 'plaintext · 0644 · unversioned',
      body: 'Baked into an image layer, rsynced to a staging box, readable by every process running as your user. Rotating one means finding all of them first.',
    },
    {
      id: 'vaults',
      title: 'Shared password managers',
      spec: 'human-shaped · no TTL',
      body: 'Built for logins, not for service credentials. No expiry, no per-service scoping, and no record of which key is about to break a deploy.',
    },
    {
      id: 'chat',
      title: 'Slack threads and spreadsheets',
      spec: 'indexed · permanent',
      body: 'The moment a key is pasted into a channel it is in a search index, a mobile cache, and an export you do not control. Deleting the message changes none of that.',
    },
  ],
  closer:
    'The failure mode is never a dramatic breach. It is a contractor who still has a Stripe key from 2023.',
}

export const HOW_IT_WORKS = {
  index: '02',
  label: 'How it works',
  heading: 'Three screens from empty vault to sealed secret.',
  body: 'Sign in, seal a secret under a passphrase we never see, and reveal it only when you need it. Everything else — expiry, rotation, revocation — hangs off those three steps.',
  steps: [
    {
      id: 'authenticate',
      step: '01',
      title: 'Sign in',
      summary: 'Google, then a six-digit code, then a short-lived session.',
      detail:
        'Sign in with Google — there is no Secryn password to phish. On first login you enrol an authenticator app, and every new device asks for a code. The session that comes back lasts 15 minutes and renews silently while the tab is open.',
      visual: 'signin',
    },
    {
      id: 'seal',
      step: '02',
      title: 'Seal a secret',
      summary: 'Type it once, choose a passphrase, watch it become ciphertext.',
      detail:
        'Paste the credential, pick a passphrase, and set an expiry. Your browser is handed a 16-byte random salt, stretches the passphrase into a 256-bit key with PBKDF2-HMAC-SHA256 at 600,000 iterations, and seals the value with AES-256-GCM. The salt and IV are saved; the passphrase and the derived key are thrown away.',
      visual: 'seal',
    },
    {
      id: 'retrieve',
      step: '03',
      title: 'Reveal it',
      summary: 'The same passphrase, or nothing at all.',
      detail:
        'Values are masked by default. Reveal asks for the passphrase, re-derives the key from the stored salt, and checks the GCM auth tag before anything is shown. A wrong passphrase fails tag verification — there is no partial decrypt, no hint, and nothing to grind against.',
      visual: 'reveal',
    },
  ],
}

export const ARCHITECTURE = {
  index: '03',
  label: 'Security architecture',
  heading: 'Two planes. Neither one trusts the other.',
  body: 'Identity decides who is looking. Encryption decides whether the bytes are readable. Compromising a session gets you ciphertext; compromising the database gets you the same.',
  identity: {
    title: 'Identity plane',
    caption: 'Answers: who is here, and is the session still valid?',
    nodes: [
      {
        id: 'google',
        title: 'Google OAuth 2.0',
        spec: 'OIDC · PKCE',
        detail:
          'No password to phish and no credential for Secryn to store. Identity is asserted by Google and verified against the ID token signature.',
      },
      {
        id: 'mfa',
        title: 'TOTP second factor',
        spec: 'RFC 6238 · 30s · 6 digits',
        detail:
          'Enrolled on first login and required on every new device. Codes are checked against a ±1 step window; used codes are burned to block replay.',
      },
      {
        id: 'jwt',
        title: 'Session token',
        spec: 'JWT · 15 min TTL',
        detail:
          'Short-lived and stateless. Carries the subject, session id, and scope set — never key material or passphrase-derived data.',
      },
      {
        id: 'refresh',
        title: 'Refresh rotation',
        spec: 'Redis · reuse detection',
        detail:
          'Each renewal mints a new token and revokes the old one. Presenting a spent token kills the entire family and signs every device out.',
      },
    ],
  },
  data: {
    title: 'Data plane',
    caption: 'Answers: can these bytes be turned back into a secret?',
    nodes: [
      {
        id: 'passphrase',
        title: 'Passphrase',
        spec: 'never persisted',
        detail:
          'Held for the length of the action and then dropped. It is not in the database, not in logs, and not recoverable by support.',
      },
      {
        id: 'salt',
        title: 'Salt',
        spec: '16 B · CSPRNG · per secret',
        detail:
          'Unique per secret, so identical passphrases produce different keys and precomputed tables are worthless.',
      },
      {
        id: 'kdf',
        title: 'PBKDF2-HMAC-SHA256',
        spec: '600,000 iterations',
        detail:
          'Stretches a human passphrase into a 256-bit key. The iteration count is stored per record, so it can be raised without a migration.',
      },
      {
        id: 'aead',
        title: 'AES-256-GCM',
        spec: '96-bit IV · 128-bit tag',
        detail:
          'Authenticated encryption. Tampering with a single byte of ciphertext fails tag verification, so corrupted records fail closed instead of decrypting to garbage.',
      },
    ],
  },
  terminal: {
    id: 'store',
    title: 'Encrypted store',
    spec: 'ciphertext + IV + tag + KDF params',
    detail:
      'A database dump is a table of opaque blobs. There is no column, backup, or replica anywhere that contains a readable secret.',
  },
}

export const FEATURES = {
  index: '04',
  label: 'Platform',
  heading: 'The parts you would otherwise improvise.',
  body: 'Every one of these exists because a team shipped a workaround for it at 2am.',
  items: [
    {
      id: 'auth',
      icon: 'fingerprint',
      title: 'Identity and MFA',
      body: 'Google sign-in with mandatory authenticator enrolment. Device-scoped sessions, and a sign-out that actually invalidates rather than clearing a cookie.',
    },
    {
      id: 'encryption',
      icon: 'lock-keyhole',
      title: 'Envelope encryption',
      body: 'AES-256-GCM per secret with a per-record salt and IV. KDF parameters are versioned so the iteration count can move as hardware does.',
    },
    {
      id: 'rotation',
      icon: 'refresh-cw',
      title: 'Rotation and revocation',
      body: 'Rotate a secret and keep the previous version readable for a grace window, so deploys drain instead of breaking. Revoke and it is gone from every session at once.',
    },
    {
      id: 'reminders',
      icon: 'alarm-clock',
      title: 'Expiry reminders',
      body: 'A background worker scans active keys, finds the ones inside their expiry window, emails you, and records that it did — so nobody gets the same nag twice.',
    },
    {
      id: 'sessions',
      icon: 'radio-tower',
      title: 'Session control',
      body: 'See every device holding a live session and end any of them from the browser. Refresh-token reuse signs the whole family out automatically.',
    },
    {
      id: 'import',
      icon: 'file-input',
      title: 'Bulk import',
      body: 'Drop a .env file into the browser. Secryn parses it locally, shows you every key it found, seals each value under your passphrase, and never uploads the file.',
    },
  ],
  closer:
    'No agent to install, no package to add, no key file sitting on a laptop. A browser and a passphrase are the whole client.',
}

export const LIFECYCLE = {
  index: '05',
  label: 'Secret lifecycle',
  heading: 'A key is not a row. It is a thing with a lifespan.',
  body: 'Secryn tracks each credential through six states and tells you when one is overdue to move.',
  stages: [
    {
      id: 'create',
      step: '01',
      title: 'Create',
      tone: 'neutral',
      body: 'Named, filed under a project and environment, and given an expiry at the moment it is written. No untagged secrets.',
      meta: 'scope · owner · ttl',
    },
    {
      id: 'encrypt',
      step: '02',
      title: 'Encrypt',
      tone: 'cipher',
      body: 'Salt generated, key derived, plaintext sealed. The readable version stops existing here.',
      meta: 'pbkdf2 → aes-gcm',
    },
    {
      id: 'store',
      step: '03',
      title: 'Store',
      tone: 'signal',
      body: 'Ciphertext, IV, auth tag, and KDF parameters are persisted. Nothing else about the secret is recorded.',
      meta: 'ciphertext + tag',
    },
    {
      id: 'monitor',
      step: '04',
      title: 'Monitor',
      tone: 'signal',
      body: 'Every reveal is stamped with a time and a device and shown in the secret’s own activity list. No log file to go digging in.',
      meta: 'reveals · devices',
    },
    {
      id: 'rotate',
      step: '05',
      title: 'Rotate',
      tone: 'ember',
      body: 'A new version is sealed while the previous one stays readable for a grace window, so rotation is a deploy, not an outage.',
      meta: 'v2 live · v1 drains',
    },
    {
      id: 'retire',
      step: '06',
      title: 'Retire',
      tone: 'flare',
      body: 'Revoked, unreadable, and kept only as a record: when it was created, when it was last revealed, when it died.',
      meta: 'revoked · recorded',
    },
  ],
}

export const VAULT = {
  index: '06',
  label: 'The vault',
  heading: 'Everything is one click from the list.',
  body: 'Names, scopes, expiry and last use in a single table. Values stay masked until you ask for one, and asking costs a passphrase every time.',
  projects: [
    { id: 'payments', name: 'payments', count: 12 },
    { id: 'infra', name: 'infra', count: 7 },
    { id: 'web', name: 'web', count: 5 },
  ],
  secrets: [
    {
      id: 'stripe',
      name: 'STRIPE_SECRET_KEY',
      scope: 'production',
      status: 'sealed',
      used: '2 min ago',
      expires: 'in 88 days',
      value: 'sk_live_51H8xQ2LkpM4vNc7RtYbGf3',
    },
    {
      id: 'twilio',
      name: 'TWILIO_AUTH_TOKEN',
      scope: 'production',
      status: 'expiring',
      used: '6 h ago',
      expires: 'in 9 days',
      value: '7f1c4a9be2d84f0aa16c3e5b90d7f284',
    },
    {
      id: 'database',
      name: 'DATABASE_URL',
      scope: 'staging',
      status: 'rotating',
      used: '1 d ago',
      expires: 'in 41 days',
      value: 'postgres://secryn:9Qp2vLx@db.internal:5432/app',
    },
    {
      id: 'sendgrid',
      name: 'SENDGRID_API_KEY',
      scope: 'production',
      status: 'sealed',
      used: '3 d ago',
      expires: 'in 120 days',
      value: 'SG.k4Zt9RmQ2xJd7Lb0PvA1sY.nW8cUgHf3iEoTr6MaX5',
    },
    {
      id: 'mailgun',
      name: 'MAILGUN_LEGACY_KEY',
      scope: 'production',
      status: 'revoked',
      used: 'never',
      expires: 'retired',
      value: null,
    },
  ],
  statusHints: {
    sealed: 'Encrypted and inside its expiry window. Nothing to do.',
    expiring: 'Inside the reminder window. You have been emailed once about it.',
    rotating: 'A new version is live while the previous one drains.',
    revoked: 'Unreadable. Kept only as a record that it existed.',
  },
  notes: [
    'Revealing a value is an action with a record: it is stamped with the time and the device that asked.',
    'A revoked secret keeps its name and its history so you can see it existed. The ciphertext is unrecoverable.',
  ],
}

export const STATS = {
  index: '07',
  label: 'By the numbers',
  heading: 'The parameters, stated plainly.',
  body: 'Not benchmarks. The actual constants the system runs on, so you can decide whether they are good enough before you sign up.',
  items: [
    {
      id: 'iterations',
      value: '600,000',
      unit: 'iterations',
      title: 'PBKDF2-HMAC-SHA256',
      body: 'Stored per record, so it can be raised for new secrets without touching old ones.',
    },
    {
      id: 'keysize',
      value: '256',
      unit: 'bit',
      title: 'AES-GCM keys',
      body: 'With a 96-bit random IV and a 128-bit authentication tag on every record.',
    },
    {
      id: 'plaintext',
      value: '0',
      unit: 'bytes',
      title: 'Plaintext at rest',
      body: 'Across primaries, replicas, backups, and logs. There is no column to read.',
    },
    {
      id: 'ttl',
      value: '15',
      unit: 'minutes',
      title: 'Session lifetime',
      body: 'Renewal tokens rotate on every use, and reuse revokes the whole family.',
    },
  ],
}

export const FAQ = {
  index: '08',
  label: 'Questions worth asking',
  heading: 'The things you would ask in a security review.',
  items: [
    {
      id: 'forgot',
      q: 'What happens if I forget my passphrase?',
      a: 'You lose those secrets. Permanently. There is no reset link and no support path, because any mechanism that could recover your data for you could recover it for someone else. Secryn holds ciphertext and a salt — without the passphrase there is nothing to derive the key from. Treat the passphrase like a root key, because that is what it is.',
    },
    {
      id: 'breach',
      q: 'What does an attacker get if your database leaks?',
      a: 'Secret names, scopes, timestamps, and a blob per record. To turn a blob into a credential they would need the passphrase, and grinding one costs 600,000 SHA-256 rounds per guess against a per-record salt. Metadata is real exposure and we will not pretend otherwise — but no key material is recoverable from the dump.',
    },
    {
      id: 'session',
      q: 'Someone got hold of my session. How bad is it?',
      a: 'They have at most 15 minutes and cannot read a single secret value, because every reveal asks for the passphrase and the passphrase is not derivable from the session. If they try to renew a token that has already been used once, reuse detection revokes the whole family and signs you out of every device.',
    },
    {
      id: 'browser',
      q: 'Does a secret ever sit in plaintext in my browser?',
      a: 'Only while it is on screen, and only for the one value you revealed. It is held in memory for that view, never written to localStorage, sessionStorage, or IndexedDB, and it is cleared when you navigate away or the tab closes. What we cannot defend against is the machine itself — a compromised browser or a keylogger sees whatever you see.',
    },
    {
      id: 'migrate',
      q: 'I have 300 secrets in .env files. Now what?',
      a: 'Drag the file into the vault. Parsing happens in your browser, so the file never leaves the machine. You get a list of every key it found, you choose which ones to keep, and each value is sealed under your passphrase before anything is sent. Names that already exist are flagged rather than silently overwritten.',
    },
    {
      id: 'selfhost',
      q: 'Can I run this myself?',
      a: 'Yes. Secryn is a web application, Postgres, and Redis. The container image and Helm chart are the same ones we run, and the encryption path has no dependency on our infrastructure — a self-hosted vault is unreadable by us by construction, not by policy.',
    },
  ],
}

export const CTA = {
  heading: 'Move your keys somewhere they cannot be grepped.',
  body: 'Free for one project and up to 50 secrets. No card, nothing to install, and no sales call between you and a working vault.',
  primary: { label: 'Create a vault', href: '#' },
  secondary: { label: 'Read the threat model', href: '#architecture' },
  note: 'Runs in any modern browser. Sign in with Google and you are in.',
}

export const FOOTER = {
  tagline: 'Secure secrets. Ship faster.',
  status: 'All systems operational',
  columns: [
    {
      title: 'Product',
      links: [
        { label: 'How it works', href: '#how' },
        { label: 'Secret lifecycle', href: '#lifecycle' },
        { label: 'The vault', href: '#vault' },
        { label: 'Pricing', href: '#' },
        { label: 'Changelog', href: '#' },
      ],
    },
    {
      title: 'Guides',
      links: [
        { label: 'Getting started', href: '#how' },
        { label: 'Importing from .env', href: '#faq' },
        { label: 'Choosing a passphrase', href: '#faq' },
        { label: 'Expiry and rotation', href: '#lifecycle' },
        { label: 'Self-hosting', href: '#faq' },
      ],
    },
    {
      title: 'Security',
      links: [
        { label: 'Threat model', href: '#architecture' },
        { label: 'Encryption spec', href: '#architecture' },
        { label: 'Disclosure policy', href: '#' },
        { label: 'Sub-processors', href: '#' },
        { label: 'Status', href: '#' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About', href: '#' },
        { label: 'Blog', href: '#' },
        { label: 'Careers', href: '#' },
        { label: 'Contact', href: '#' },
      ],
    },
  ],
  legal: [
    { label: 'Privacy', href: '#' },
    { label: 'Terms', href: '#' },
    { label: 'DPA', href: '#' },
  ],
}
