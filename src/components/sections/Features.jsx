import {
  AlarmClock,
  ArrowUpRight,
  FileInput,
  Fingerprint,
  LockKeyhole,
  RadioTower,
  RefreshCw,
} from 'lucide-react'

import { FEATURES } from '@/lib/content'
import { Section } from '@/components/shared/Section'
import { Reveal } from '@/components/shared/Reveal'

const ICONS = {
  fingerprint: Fingerprint,
  'lock-keyhole': LockKeyhole,
  'refresh-cw': RefreshCw,
  'alarm-clock': AlarmClock,
  'radio-tower': RadioTower,
  'file-input': FileInput,
}

export function Features() {
  return (
    <Section
      id="platform"
      index={FEATURES.index}
      label={FEATURES.label}
      heading={FEATURES.heading}
      body={FEATURES.body}
    >
      {/* Cells are defined by the grid's own rules — no floating cards. */}
      <ul className="grid grid-cols-1 border-t border-l border-border sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.items.map((item, index) => {
          const Icon = ICONS[item.icon]
          return (
            <Reveal
              as="li"
              key={item.id}
              delay={(index % 3) * 0.06}
              className="group relative flex flex-col border-r border-b border-border p-6 transition-colors duration-300 hover:bg-ink-900/50 sm:p-7"
            >
              <span
                aria-hidden="true"
                className="absolute top-0 left-0 h-6 w-px origin-top scale-y-0 bg-signal transition-transform duration-300 group-hover:scale-y-100"
              />

              <span className="flex items-center justify-between gap-4">
                {Icon ? (
                  <Icon
                    aria-hidden="true"
                    strokeWidth={1.5}
                    className="size-5 text-ink-500 transition-colors duration-300 group-hover:text-signal"
                  />
                ) : (
                  <span />
                )}
                <span className="label-mono text-ink-700 tabular">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </span>

              <h3 className="mt-6 text-h3 text-ink-100">{item.title}</h3>
              <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-ink-400">
                {item.body}
              </p>
            </Reveal>
          )
        })}

        {/* Closes the final row rather than leaving ragged empty cells. */}
        <Reveal
          as="li"
          delay={0.12}
          className="flex flex-col justify-between gap-6 border-r border-b border-border bg-ink-925/40 p-6 sm:col-span-2 sm:flex-row sm:items-end sm:p-7 lg:col-span-3"
        >
          <p className="max-w-[54ch] text-[0.9375rem] leading-relaxed text-ink-400">
            {FEATURES.closer}
          </p>
          <a
            href="#vault"
            className="group/link inline-flex w-fit shrink-0 items-center gap-2 text-sm font-medium text-ink-100 transition-colors hover:text-signal"
          >
            See the vault
            <ArrowUpRight
              aria-hidden="true"
              className="size-4 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5"
            />
          </a>
        </Reveal>
      </ul>
    </Section>
  )
}
