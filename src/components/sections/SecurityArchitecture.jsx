import { Info } from 'lucide-react'

import { cn } from '@/lib/utils'
import { ARCHITECTURE } from '@/lib/content'
import { Section } from '@/components/shared/Section'
import { Reveal } from '@/components/shared/Reveal'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'

/**
 * One step in a plane.
 *
 * The hover card is a convenience for pointer users; the same detail is always
 * present for assistive tech, so nothing is hover-only.
 */
function PlaneNode({ node, tone, connected }) {
  return (
    <li className="relative">
      {connected ? (
        <span
          aria-hidden="true"
          className="absolute -top-5 left-[calc(1.25rem-0.5px)] h-5 w-px bg-border"
        />
      ) : null}

      <HoverCard openDelay={120} closeDelay={80}>
        <HoverCardTrigger asChild>
          <div
            tabIndex={0}
            className="group relative flex items-start gap-3 rounded-lg border border-border bg-ink-900/50 p-4 transition-colors duration-200 hover:border-border-strong hover:bg-ink-900"
          >
            <span
              aria-hidden="true"
              className={cn(
                'mt-1.5 size-1.5 shrink-0 rounded-full transition-transform duration-200 group-hover:scale-150',
                tone === 'cipher' ? 'bg-cipher' : 'bg-signal',
              )}
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-ink-100">{node.title}</p>
              <p className="label-mono mt-1.5 text-ink-500">{node.spec}</p>
              <p className="sr-only">{node.detail}</p>
            </div>
            <Info
              aria-hidden="true"
              className="mt-0.5 size-3.5 shrink-0 text-ink-700 opacity-0 transition-opacity group-hover:opacity-100"
            />
          </div>
        </HoverCardTrigger>
        <HoverCardContent
          side="top"
          align="start"
          className="w-80 border-border bg-ink-850 text-ink-300"
        >
          <p className="label-mono text-ink-500">{node.title}</p>
          <p className="mt-2 text-[0.8125rem] leading-relaxed">{node.detail}</p>
        </HoverCardContent>
      </HoverCard>
    </li>
  )
}

function Plane({ plane, tone }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4 border-b border-border pb-4">
        <h3 className="label-mono text-ink-200">{plane.title}</h3>
        <span
          aria-hidden="true"
          className={cn(
            'size-1.5 rounded-full',
            tone === 'cipher' ? 'bg-cipher' : 'bg-signal',
          )}
        />
      </div>
      <p className="mt-4 text-[0.8125rem] leading-relaxed text-ink-500">
        {plane.caption}
      </p>

      <ol className="mt-6 flex flex-col gap-5">
        {plane.nodes.map((node, index) => (
          <PlaneNode key={node.id} node={node} tone={tone} connected={index > 0} />
        ))}
      </ol>
    </div>
  )
}

/** Elbow join drawing both planes into the encrypted store. */
function Convergence() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 56"
      preserveAspectRatio="none"
      className="h-14 w-full text-border"
    >
      <path
        d="M25 0 V26 H50 V56"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d="M75 0 V26 H50 V56"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}

export function SecurityArchitecture() {
  const { terminal } = ARCHITECTURE

  return (
    <Section
      id="architecture"
      index={ARCHITECTURE.index}
      label={ARCHITECTURE.label}
      heading={ARCHITECTURE.heading}
      body={ARCHITECTURE.body}
    >
      <Reveal className="rounded-xl border border-border bg-ink-925/50 p-5 sm:p-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-8 lg:gap-16">
          <Plane plane={ARCHITECTURE.identity} tone="signal" />
          <Plane plane={ARCHITECTURE.data} tone="cipher" />
        </div>

        <div className="mt-8 hidden md:block">
          <Convergence />
        </div>
        <div
          aria-hidden="true"
          className="mx-auto mt-8 h-8 w-px bg-border md:hidden"
        />

        <div className="mx-auto max-w-md">
          <div className="rounded-lg border border-signal/25 bg-signal-deep/40 p-5 text-center">
            <p className="text-sm font-medium text-ink-50">{terminal.title}</p>
            <p className="label-mono mt-2 text-signal/70">{terminal.spec}</p>
            <p className="mx-auto mt-3 max-w-[46ch] text-[0.8125rem] leading-relaxed text-ink-400">
              {terminal.detail}
            </p>
          </div>
        </div>
      </Reveal>
    </Section>
  )
}
