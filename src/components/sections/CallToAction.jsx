import { ArrowUpRight } from 'lucide-react'

import { CTA } from '@/lib/content'
import { Frame, Tick } from '@/components/shared/Frame'
import { Reveal } from '@/components/shared/Reveal'
import { Button } from '@/components/ui/button'

const GRID_MASK = 'radial-gradient(ellipse 70% 90% at 20% 50%, #000 20%, transparent 80%)'
const GLOW = 'radial-gradient(closest-side, var(--color-ink-100), transparent)'

export function CallToAction() {
  return (
    <section id="cta" className="relative overflow-hidden border-b border-border">
      <div
        aria-hidden="true"
        className="grid-field pointer-events-none absolute inset-0 opacity-60"
        style={{ maskImage: GRID_MASK, WebkitMaskImage: GRID_MASK }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-64 left-1/4 h-[26rem] w-[46rem] -translate-x-1/2 opacity-[0.05]"
        style={{ background: GLOW }}
      />

      <Frame className="relative">
        <Tick className="-top-[4px] -left-[4px]" />
        <Tick className="-top-[4px] -right-[4px]" />

        <div className="grid grid-cols-1 items-end gap-10 px-(--gutter) py-(--section-y) lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            <Reveal as="h2" className="max-w-[16ch] text-h2 text-ink-50">
              {CTA.heading}
            </Reveal>
            <Reveal as="p" delay={0.06} className="mt-5 max-w-[52ch] text-lead text-ink-300">
              {CTA.body}
            </Reveal>
          </div>

          <Reveal delay={0.12} className="flex flex-col gap-3 lg:col-span-5">
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-11 flex-1 px-5 text-[0.9375rem]">
                <a href={CTA.primary.href}>
                  {CTA.primary.label}
                  <ArrowUpRight aria-hidden="true" className="size-4" />
                </a>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-11 flex-1 border-border bg-transparent px-5 text-[0.9375rem] text-ink-200 hover:border-border-strong hover:bg-ink-900 hover:text-ink-50"
              >
                <a href={CTA.secondary.href}>{CTA.secondary.label}</a>
              </Button>
            </div>
            <p className="label-mono text-ink-600">{CTA.note}</p>
          </Reveal>
        </div>
      </Frame>
    </section>
  )
}
