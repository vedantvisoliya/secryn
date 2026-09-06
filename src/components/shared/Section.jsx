import { cn } from '@/lib/utils'
import { Frame, FramePad, Tick } from '@/components/shared/Frame'
import { Reveal } from '@/components/shared/Reveal'

/**
 * Mono kicker used at the head of every band: `03 — SECURITY ARCHITECTURE`.
 * The index numbers give the page a documentation-like spine.
 */
export function SectionLabel({ index, label, className }) {
  return (
    <p className={cn('label-mono flex items-center gap-3 text-ink-400', className)}>
      {index ? <span className="text-ink-500 tabular">{index}</span> : null}
      <span aria-hidden="true" className="h-px w-6 bg-border-strong" />
      <span className="text-ink-300">{label}</span>
    </p>
  )
}

/**
 * A page band.
 *
 * Structure is fixed on purpose — full-bleed rule underneath, inset side rules,
 * a narrow label column and a wide text column. Repetition is what makes the
 * page read as one system instead of a stack of templates.
 */
export function Section({
  id,
  index,
  label,
  heading,
  body,
  aside,
  children,
  className,
  headerClassName,
  contentClassName,
  ticks = true,
  as: Tag = 'section',
}) {
  const labelledBy = id ? `${id}-heading` : undefined

  return (
    <Tag
      id={id}
      aria-labelledby={heading ? labelledBy : undefined}
      className={cn('relative border-b border-border', className)}
    >
      <Frame className="relative">
        {ticks ? (
          <>
            <Tick className="-top-[4px] -left-[4px]" />
            <Tick className="-top-[4px] -right-[4px]" />
          </>
        ) : null}

        <FramePad className="py-(--section-y)">
          {(label || heading || body) && (
            <header
              className={cn(
                'grid grid-cols-1 gap-x-10 gap-y-6 md:grid-cols-12',
                headerClassName,
              )}
            >
              <div className="md:col-span-4 lg:col-span-3">
                {label ? (
                  <Reveal>
                    <SectionLabel index={index} label={label} />
                  </Reveal>
                ) : null}
              </div>

              <div className="md:col-span-8 lg:col-span-9">
                {heading ? (
                  <Reveal as="h2" id={labelledBy} className="max-w-[19ch] text-h2 text-ink-50 lg:max-w-[24ch]">
                    {heading}
                  </Reveal>
                ) : null}
                {body ? (
                  <Reveal delay={0.06} as="p" className="mt-5 max-w-[62ch] text-lead text-ink-300">
                    {body}
                  </Reveal>
                ) : null}
                {aside}
              </div>
            </header>
          )}

          <div className={cn(heading || label ? 'mt-14 md:mt-20' : '', contentClassName)}>
            {children}
          </div>
        </FramePad>
      </Frame>
    </Tag>
  )
}
