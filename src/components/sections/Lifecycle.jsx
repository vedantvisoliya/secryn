import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useSpring } from 'motion/react'

import { cn } from '@/lib/utils'
import { LIFECYCLE } from '@/lib/content'
import { Section } from '@/components/shared/Section'
import { Reveal } from '@/components/shared/Reveal'

/** Stage colour carries meaning: violet is ciphertext, ember is due, red is dead. */
const TONE = {
  neutral: { dot: 'bg-ink-400', text: 'text-ink-400' },
  cipher: { dot: 'bg-cipher', text: 'text-cipher' },
  signal: { dot: 'bg-signal', text: 'text-signal' },
  ember: { dot: 'bg-ember', text: 'text-ember' },
  flare: { dot: 'bg-flare', text: 'text-flare' },
}

export function Lifecycle() {
  const railRef = useRef(null)
  const reduceMotion = useReducedMotion()

  const { scrollYProgress } = useScroll({
    target: railRef,
    offset: ['start 85%', 'end 55%'],
  })
  const progress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 24,
    restDelta: 0.001,
  })

  return (
    <Section
      id="lifecycle"
      index={LIFECYCLE.index}
      label={LIFECYCLE.label}
      heading={LIFECYCLE.heading}
      body={LIFECYCLE.body}
    >
      <div ref={railRef} className="relative">
        {/* Single-row rail only where all six stages fit; the jade fill tracks scroll. */}
        <span
          aria-hidden="true"
          className="absolute top-[7px] right-0 left-0 hidden h-px bg-border xl:block"
        />
        <motion.span
          aria-hidden="true"
          className="absolute top-[7px] right-0 left-0 hidden h-px origin-left bg-signal xl:block"
          style={{ scaleX: reduceMotion ? 1 : progress }}
        />

        <ol className="relative grid grid-cols-1 gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 xl:gap-y-0">
          {LIFECYCLE.stages.map((stage, index) => {
            const tone = TONE[stage.tone] ?? TONE.neutral
            return (
              <Reveal
                as="li"
                key={stage.id}
                delay={index * 0.05}
                className="relative pl-8 xl:pt-8 xl:pl-0"
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    'absolute top-1 left-0 size-3.5 rounded-full border-[3px] border-ink-950 xl:top-0',
                    tone.dot,
                  )}
                />

                <p className="label-mono flex flex-wrap items-center gap-x-2 gap-y-1 text-ink-500">
                  <span className="tabular">{stage.step}</span>
                  <span className={tone.text}>{stage.meta}</span>
                </p>

                <h3 className="mt-3 text-h3 text-ink-100">{stage.title}</h3>
                <p className="mt-2 max-w-[38ch] text-sm leading-relaxed text-ink-400 xl:pr-4">
                  {stage.body}
                </p>
              </Reveal>
            )
          })}
        </ol>
      </div>
    </Section>
  )
}
