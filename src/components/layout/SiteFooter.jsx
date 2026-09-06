import { FOOTER } from '@/lib/content'
import { Logo } from '@/components/shared/Logo'
import { Frame } from '@/components/shared/Frame'

export function SiteFooter() {
  return (
    <footer className="border-b border-border">
      <Frame>
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 px-(--gutter) py-(--section-y) md:grid-cols-12">
          <div className="col-span-2 md:col-span-4">
            <Logo />
            <p className="mt-4 max-w-[28ch] text-sm leading-relaxed text-ink-400">
              {FOOTER.tagline}
            </p>
            <p className="mt-6 inline-flex items-center gap-2.5 rounded-full border border-border bg-ink-900/60 py-1.5 pr-3.5 pl-3">
              <span
                aria-hidden="true"
                className="size-1.5 rounded-full bg-signal shadow-[0_0_0_3px_var(--color-signal-deep)]"
              />
              <span className="label-mono text-ink-300">{FOOTER.status}</span>
            </p>
          </div>

          {FOOTER.columns.map((column) => (
            <nav
              key={column.title}
              aria-label={column.title}
              className="md:col-span-2"
            >
              <h2 className="label-mono text-ink-500">{column.title}</h2>
              <ul className="mt-4 flex flex-col gap-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-ink-400 transition-colors hover:text-ink-100"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="flex flex-col gap-4 border-t border-border px-(--gutter) py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-xs text-ink-600">
            © {new Date().getFullYear()} Secryn.
            {/* {TRUSTED_BY.footnote} — restore alongside the "In production at" band. */}
          </p>
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {FOOTER.legal.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="font-mono text-xs text-ink-500 transition-colors hover:text-ink-200"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </Frame>
    </footer>
  )
}
