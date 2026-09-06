import { cn } from '@/lib/utils'
import markUrl from '@/assets/secryn-mark.png'

/**
 * The Secryn mark.
 *
 * The artwork is indigo (#394f95) on a light ground — 7.0:1 there, but only
 * 2.65:1 against this page's near-black. So it is set on a light plate, the
 * surface it was drawn for, rather than floated on the dark background where it
 * would go muddy. The plate is the same shape the favicon bakes in, so the tab
 * icon and the header lockup are the same object.
 */
export function LogoMark({ className, ...props }) {
  return (
    <span
      className={cn(
        'grid size-7 shrink-0 place-items-center overflow-hidden rounded-[0.5rem] bg-ink-50 ring-1 ring-ink-950/10 ring-inset',
        className,
      )}
      {...props}
    >
      <img
        src={markUrl}
        alt=""
        aria-hidden="true"
        width={128}
        height={128}
        decoding="async"
        className="size-full"
      />
    </span>
  )
}

/** Mark plus wordmark, used in the header and footer. */
export function Logo({ className, markClassName, showWordmark = true }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5 text-ink-50', className)}>
      <LogoMark className={markClassName} />
      {showWordmark ? (
        <span className="font-display text-[1.0625rem] font-medium tracking-[-0.03em]">
          Secryn
        </span>
      ) : null}
    </span>
  )
}
