import { ArrowRight, ArrowUpRight, Check } from 'lucide-react'

import { HERO } from '@/lib/content'
import { Frame, Tick } from '@/components/shared/Frame'
import { Reveal } from '@/components/shared/Reveal'
import { EncryptionPipeline } from '@/components/sections/EncryptionPipeline'
import { Button } from '@/components/ui/button'

const GRID_MASK = 'radial-gradient(ellipse 78% 58% at 50% 0%, #000 30%, transparent 78%)'
const GLOW = 'radial-gradient(closest-side, var(--color-ink-50), transparent)'

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden border-b border-border">
      {/* One background treatment, masked so it never becomes wallpaper. */}
      <div
        aria-hidden="true"
        className="grid-field pointer-events-none absolute inset-0 opacity-70"
        style={{ maskImage: GRID_MASK, WebkitMaskImage: GRID_MASK }}
      />
      {/* Wide, shallow white wash centred on the top edge — ambient light, not a blob. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 h-[26rem] w-[72rem] max-w-[130vw] -translate-x-1/2 opacity-[0.15]"
        style={{ background: GLOW }}
      />

      <Frame className="relative">
        <Tick className="-bottom-[4px] -left-[4px]" />
        <Tick className="-bottom-[4px] -right-[4px]" />

        <div className="px-(--gutter) pt-28 pb-(--section-y) sm:pt-36">
          <Reveal as="div">
            <a
              href={HERO.release.href}
              className="group inline-flex items-center gap-2.5 rounded-full border border-border bg-ink-900/60 py-1 pr-3 pl-1.5 text-xs text-ink-300 transition-colors hover:border-border-strong hover:text-ink-100"
            >
              <span className="rounded-full bg-signal-deep px-2 py-0.5 font-mono text-[0.625rem] tracking-wide text-signal">
                {HERO.release.tag}
              </span>
              <span className="truncate">{HERO.release.text}</span>
              <ArrowRight
                aria-hidden="true"
                className="size-3 shrink-0 text-ink-500 transition-transform group-hover:translate-x-0.5"
              />
            </a>
          </Reveal>

          <h1 className="mt-8 text-display text-ink-50">
            <Reveal as="span" className="block">
              {HERO.headline[0]}
            </Reveal>
            <Reveal as="span" delay={0.08} className="block text-ink-400">
              {HERO.headline[1]}
            </Reveal>
          </h1>

          <div className="mt-10 grid grid-cols-1 gap-x-12 gap-y-8 md:grid-cols-12">
            <Reveal delay={0.14} className="md:col-span-7">
              <p className="max-w-[58ch] text-lead text-ink-300">{HERO.body}</p>
            </Reveal>

            <Reveal delay={0.2} className="md:col-span-5 lg:col-span-4 lg:col-start-9">
              <ul className="divide-y divide-border border-y border-border">
                {HERO.assurances.map((item) => (
                  <li key={item} className="flex items-center gap-3 py-2.5">
                    <Check aria-hidden="true" className="size-3.5 shrink-0 text-signal" />
                    <span className="font-mono text-xs text-ink-300">{item}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          <Reveal
            delay={0.26}
            className="mt-10 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center"
          >
            <Button asChild size="lg" className="h-11 px-5 text-[0.9375rem]">
              <a href={HERO.primaryCta.href}>
                {HERO.primaryCta.label}
                <ArrowUpRight aria-hidden="true" className="size-4" />
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-11 border-border bg-transparent px-5 text-[0.9375rem] text-ink-200 hover:border-border-strong hover:bg-ink-900 hover:text-ink-50"
            >
              <a href={HERO.secondaryCta.href}>{HERO.secondaryCta.label}</a>
            </Button>
          </Reveal>
        </div>

        <Reveal delay={0.12} y={16} className="px-(--gutter) pb-(--section-y)">
          <EncryptionPipeline />
        </Reveal>
      </Frame>
    </section>
  )
}
