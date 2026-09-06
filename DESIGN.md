# Secryn — design and content strategy

This is the reasoning behind the landing page in `src/`. It exists so the next
person to touch the page changes it on purpose rather than by accident.

---

## 1. What FastAPI actually gets right

FastAPI's homepage is not a marketing page. It is documentation with a headline
on top, and that is the source of its credibility.

**Layout.** One column, left-aligned, ~700px measure, no hero image. Content
starts immediately below the nav. There is no "above the fold" negotiation —
the reader is reading real material within one screen.

**Typography.** A single sans family, three sizes, heavy use of **bold runs**
inside body copy and `inline code` to mark technical nouns. The hierarchy is
carried by weight and colour, not by size jumps. Headings carry a `¶` anchor
link, which quietly signals "this is a document you will link into".

**Spacing.** Docs rhythm: tight paragraph spacing, generous section spacing.
The vertical rhythm is boring and consistent, which is why long pages stay
readable.

**Colour.** One accent (teal) doing three jobs: logo, links, and the code-block
frame. Everything else is black text on white. Colour is never decorative.

**Information architecture.** Sponsors → social proof → features → install →
example → run it → see the docs UI → advanced example → deploy → performance →
dependencies. It is ordered by *what a developer needs next*, not by what a
marketer wants said first. The install command appears before any persuasion.

**Trust.** Build/coverage/version badges at the top. Named quotes from named
engineers at named companies. A benchmark link. Nothing is asserted that is not
checkable.

**Why it doesn't read as SaaS.** No stock photography, no gradient hero, no
three-card feature row, no testimonial carousel. Every pixel is either content
or a link to content.

**The core lesson:** credibility comes from *specificity and checkability*, and
simplicity is what makes technical depth legible.

## 2. Where Secryn goes further

FastAPI is a great docs page. It is not a great *product* page — it has almost
no visual system, weak hierarchy at a glance, and no way to convey a
mechanism without reading paragraphs.

Secryn keeps the documentation-first substance and adds a designed system on top:

| FastAPI | Secryn |
| --- | --- |
| Docs page with a headline | Product page with docs-grade content |
| One accent, decorative-free | Four-state palette where colour *encodes* state |
| Prose describes the mechanism | The mechanism is drawn (encryption pipeline, two-plane architecture, lifecycle rail) |
| Flat, unstructured page | A visible structural frame — full-bleed rules crossing inset column rules |
| No motion | Motion used only to sequence reading and to show the seal actually happening |
| Light, docs-neutral | Dark, instrument-panel; a security tool should feel like infrastructure |

Same philosophy, higher production value.

## 3. Visual strategy

**The signature.** Every band renders the same 78rem column with 1px side
rules, and every band closes with a full-bleed 1px rule. The verticals line up
down the whole document, so the page reads as one technical drawing rather than
a stack of sections. Crosshair ticks (`+`) mark the intersections on desktop.

**No decoration budget.** No blobs, no glassmorphism, no floating cards, no
stock art. The two background treatments are a masked 4rem engineering grid and
a single low-opacity neutral wash — both used exactly twice (hero, final CTA).
The accent colour is deliberately kept out of the page background: jade means
"sealed", and a green haze behind the nav would spend that meaning on nothing.

**Diagrams instead of illustrations.** Four custom visual components carry the
argument:

- `EncryptionPipeline` (hero) — a real secret moving through passphrase → salt →
  PBKDF2 → AES-256-GCM, with the ciphertext resolving out of noise.
- `SecurityArchitecture` — two independent planes converging on the store,
  drawn with an SVG elbow join.
- `Lifecycle` — a six-stage rail whose jade fill tracks scroll position.
- `VaultWorkspace` — a working mock of the product: project rail, secret
  table with live selection, and a masked value you can actually reveal.

**No security clichés.** No padlocks, shields, or hooded figures. The mark is an
angular `S` cut with a cyan offset — a letterform, not a metaphor.

**The mark sits on a plate, not on the page.** The artwork is indigo `#394f95`,
which measures 7.0:1 on a light ground and only 2.65:1 on this page's near-black.
Rather than recolour someone's logo or let it go muddy, `LogoMark` sets it on a
light rounded plate — the surface it was drawn for. The favicon bakes the same
plate in, so the tab icon and the header lockup read as one object.

## 4. Content strategy

**Voice:** an engineer explaining their own system to another engineer.
Concrete nouns, real parameters, no adjective that cannot be measured.

**Rules applied throughout:**

- Numbers over adverbs. "600,000 iterations", not "military-grade".
- Name the failure. The FAQ leads with *"What happens if I forget my
  passphrase?"* → *"You lose those secrets. Permanently."* Admitting the sharp
  edge is the most credible thing on the page.
- Admit the exposure. The breach answer says metadata leaks, because it does.
- The stats section reports **design constants**, not invented traction
  ("0 bytes plaintext at rest", "15 minute token TTL") — every number is
  checkable against the architecture section.
- The problem section describes mechanisms, not fears: *"Baked into an image
  layer, rsynced to a staging box, readable by every process running as your
  user."*

All copy lives in `src/lib/content.js`. Placeholder content is labelled there:
the six customer wordmarks and the GitHub star count are invented and should be
replaced before launch. Every crypto parameter is real to the described design.

## 5. Typography strategy

| Role | Family | Why |
| --- | --- | --- |
| Display / headings | **Geist** | Drawn for developer product surfaces. Tight apertures and near-zero optical wobble at large sizes let headlines set at `-0.042em` without collapsing. Its flat terminals give the page a machined feel that Inter's warmer curves don't. |
| Body / UI | **Inter** | Best-in-class small-size legibility: large x-height, open apertures, excellent hinting. Long technical paragraphs at 15–19px stay comfortable, which matters because this page asks people to read. |
| Code / labels | **JetBrains Mono** | Designed for code: tall x-height, unmistakable `0/O`, `1/l/I`, and a generous letterform width that survives uppercase tracking at 11px. |

**Why the pairing works.** Geist and Inter share a neo-grotesque skeleton, so
they never look like two competing voices — but Geist is tighter and more
geometric, which gives headlines a distinct register from body copy without a
style clash. JetBrains Mono is the third voice and it is *load-bearing*: every
section index, every spec, every state label is mono. That single decision does
more for the "built by engineers" feeling than any illustration could.

**The scale** (in `@theme`, so there are no magic font sizes in components):

```
display  clamp(2.375rem, 1.1rem + 3.6vw, 4rem)   lh 0.98   ls -0.042em
h2       clamp(1.875rem, 1.2rem + 2.2vw, 2.875rem) lh 1.05 ls -0.034em
h3       clamp(1.0625rem, 0.95rem + 0.45vw, 1.3125rem)
lead     clamp(1.0625rem, 0.98rem + 0.36vw, 1.1875rem) lh 1.6
micro    0.6875rem  ls 0.12em  uppercase  (the `label-mono` utility)
```

Tracking tightens as size grows; line-height loosens as size shrinks. Standard
optical correction, applied consistently.

## 6. Colour system

Neutrals do roughly 92% of the work. Colour is reserved for **state**, so it
always carries information.

```
ink-950 … ink-50   cool, blue-shifted neutral ramp (page → text)
signal   #35e0a1   sealed · verified · healthy
cipher   #9a8bff   ciphertext · derived key material
ember    #f2b45c   expiring · needs rotation
flare    #ff7a6b   exposed · revoked
```

Consequences of treating colour as semantics:

- The primary button is **near-white**, not jade. Jade is a status colour; using
  it for a CTA would dilute its meaning (and is what makes most dev-tool pages
  look identical).
- Secret status reuses the same palette — sealed is jade, rotating is cipher,
  expiring is ember, revoked is red. The vault table and the lifecycle rail read
  as one system because they use the same four colours for the same four states.
- In the lifecycle rail, `Encrypt` is violet, `Store` is jade, `Rotate` is
  ember, `Retire` is red. The colours are the state machine.
- Focus rings are jade — the one place the accent appears in UI chrome.

Single dark theme, declared in `index.html` (`class="dark"`, `color-scheme`,
`theme-color`) so there is no flash and no half-supported light mode.

## 7. Spacing system

One knob drives the page rhythm:

```
--section-y  clamp(4.5rem, 2.75rem + 6.5vw, 8rem)   vertical band padding
--gutter     clamp(1.25rem, 0.5rem + 2.4vw, 3rem)   horizontal frame padding
```

Everything else is Tailwind's 4px scale. Inside a band the rhythm is fixed:
header → `mt-14 md:mt-20` → content. Within a block: heading → `mt-2/mt-3` →
body; block → `mt-5/mt-6` → next block. Because the two clamps are shared by
every section, changing page density is a two-line edit rather than a sweep.

Grid: 12 columns at `md`, `gap-x-10/12`. The section header is a fixed 4/8 (or
3/9 at `lg`) split — narrow mono label column, wide text column — which is
where the page's strong left edge comes from.

## 8. Motion

Three effects, all opt-out under `prefers-reduced-motion`:

1. **Reveal** — 10px rise + fade, `once: true`, 0.55s, `cubic-bezier(.22,1,.36,1)`.
   Staggered in 60ms steps within a group to set reading order.
2. **Encryption pipeline** — a timed state machine, ~4s per cycle. Under reduced
   motion it renders the terminal *sealed* state and starts no timers at all.
3. **Lifecycle rail** — jade fill driven by `useScroll` + `useSpring`, pinned to
   1 under reduced motion.

No parallax, no particles, no continuous background animation.

## 9. Accessibility notes

- Skip link; landmarks (`header`/`main`/`footer`/`nav`); `aria-labelledby` on
  every section from its own `h2`.
- Hover-card detail in the architecture diagram is duplicated as `sr-only` text,
  so nothing is pointer-only.
- The vault list is a real `<table>` with `<caption>` and `<th scope>`; row
  selection is a real `<button>` with `aria-pressed`, and status is carried by a
  text label, not colour alone.
- Decorative rules, dots, ticks and connector SVGs are all `aria-hidden`.
- Focus-visible ring is defined once in the base layer at 2px/2px offset.
- Body text sits at `ink-300`+ on `ink-950`; mono micro-labels never go below
  `ink-500` on a `ink-900`-or-lighter surface.
