import { STATS } from '@/lib/content'
import { Section } from '@/components/shared/Section'
import { Reveal } from '@/components/shared/Reveal'

export function SecurityStats() {
  return (
    <Section
      id="numbers"
      index={STATS.index}
      label={STATS.label}
      heading={STATS.heading}
      body={STATS.body}
    >
      <dl className="grid grid-cols-1 border-t border-l border-border sm:grid-cols-2 xl:grid-cols-4">
        {STATS.items.map((item, index) => (
          <Reveal
            key={item.id}
            delay={index * 0.06}
            className="group border-r border-b border-border p-6 sm:p-7"
          >
            <dt className="label-mono text-ink-500">{item.title}</dt>
            <dd className="mt-5">
              <span className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <span className="font-display text-[clamp(2.25rem,1.6rem+1.9vw,3.25rem)] leading-none font-medium tracking-[-0.04em] text-ink-50 tabular">
                  {item.value}
                </span>
                <span className="font-mono text-xs text-ink-500">{item.unit}</span>
              </span>
              <p className="mt-4 max-w-[34ch] text-[0.8125rem] leading-relaxed text-ink-400">
                {item.body}
              </p>
            </dd>
          </Reveal>
        ))}
      </dl>
    </Section>
  )
}
