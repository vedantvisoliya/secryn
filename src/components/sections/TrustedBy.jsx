import { TRUSTED_BY } from '@/lib/content'
import { Frame } from '@/components/shared/Frame'
import { Reveal } from '@/components/shared/Reveal'

/**
 * Six minimal marks so the row reads as logos rather than a list of words.
 * Each is a different primitive — the set has texture without any of them
 * pretending to be a real brand.
 */
const GLYPHS = [
  <circle key="a" cx="9" cy="9" r="6.2" strokeWidth="1.6" />,
  <rect key="b" x="3.6" y="3.6" width="10.8" height="10.8" rx="2" strokeWidth="1.6" transform="rotate(45 9 9)" />,
  <path key="c" d="M9 3.2 15.2 14.4H2.8Z" strokeWidth="1.6" strokeLinejoin="round" />,
  <path key="d" d="M9 2.8l5.4 3.1v6.2L9 15.2 3.6 12.1V5.9Z" strokeWidth="1.6" strokeLinejoin="round" />,
  <path key="e" d="M3 12a6 6 0 0 1 12 0" strokeWidth="1.6" strokeLinecap="round" />,
  <g key="f" strokeWidth="1.6" strokeLinecap="round">
    <path d="M4 6h10M4 9.5h6M4 13h8" />
  </g>,
]

export function TrustedBy() {
  return (
    <section aria-label={TRUSTED_BY.label} className="border-b border-border">
      <Frame>
        <div className="flex flex-col gap-6 px-(--gutter) py-9 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
          <Reveal as="p" className="label-mono shrink-0 text-ink-500">
            {TRUSTED_BY.label}
          </Reveal>

          <Reveal delay={0.08} as="ul" className="flex flex-wrap items-center gap-x-9 gap-y-5">
            {TRUSTED_BY.logos.map((name, index) => (
              <li key={name} className="group flex items-center gap-2.5">
                <svg
                  viewBox="0 0 18 18"
                  fill="none"
                  stroke="currentColor"
                  aria-hidden="true"
                  className="size-[18px] text-ink-600 transition-colors group-hover:text-signal-dim"
                >
                  {GLYPHS[index % GLYPHS.length]}
                </svg>
                <span className="font-display text-[0.9375rem] font-medium tracking-[-0.02em] text-ink-400 transition-colors group-hover:text-ink-200">
                  {name}
                </span>
              </li>
            ))}
          </Reveal>
        </div>
      </Frame>
    </section>
  )
}
