import { PROBLEM } from '@/lib/content'
import { cn } from '@/lib/utils'
import { Section } from '@/components/shared/Section'
import { Reveal } from '@/components/shared/Reveal'

export function Problem() {
  return (
    <Section
      id="problem"
      index={PROBLEM.index}
      label={PROBLEM.label}
      heading={PROBLEM.heading}
      body={PROBLEM.body}
    >
      <ul className="grid grid-cols-1 border-y border-border md:grid-cols-3">
        {PROBLEM.items.map((item, index) => (
          <Reveal
            as="li"
            key={item.id}
            delay={index * 0.07}
            className={cn(
              'group relative flex flex-col',
              index > 0 && 'border-t border-border md:border-t-0 md:border-l',
            )}
          >
            {/* Hatching marks the surface as unprotected. */}
            <div className="hatch-field flex items-center justify-between gap-3 border-b border-border px-5 py-3">
              <span className="label-mono text-flare/80">{item.spec}</span>
              <span
                aria-hidden="true"
                className="size-1.5 rounded-full bg-flare/60 transition-transform duration-300 group-hover:scale-125"
              />
            </div>

            <div className="flex flex-1 flex-col p-5 transition-colors duration-300 group-hover:bg-ink-900/40 sm:p-6">
              <h3 className="text-h3 text-ink-100">{item.title}</h3>
              <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-400">
                {item.body}
              </p>
            </div>
          </Reveal>
        ))}
      </ul>

      <Reveal delay={0.1} className="mt-10 border-l-2 border-flare/50 pl-5 sm:pl-6">
        <p className="max-w-[52ch] text-h3 leading-snug text-ink-200">
          {PROBLEM.closer}
        </p>
      </Reveal>
    </Section>
  )
}
