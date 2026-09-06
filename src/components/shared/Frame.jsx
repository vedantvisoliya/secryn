import { cn } from '@/lib/utils'

/**
 * The page's structural spine.
 *
 * Every band renders the same fixed-width column with 1px side rules, so the
 * two vertical hairlines read as one continuous line down the whole document —
 * a technical drawing frame rather than a stack of unrelated cards.
 */
export function Frame({ as: Tag = 'div', className, children, ...props }) {
  return (
    <Tag
      className={cn(
        'mx-auto w-full max-w-page border-x border-border',
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  )
}

/** Horizontal padding that matches the frame gutter. */
export function FramePad({ as: Tag = 'div', className, children, ...props }) {
  return (
    <Tag className={cn('px-(--gutter)', className)} {...props}>
      {children}
    </Tag>
  )
}

/**
 * A crosshair tick drawn at a frame intersection. Purely decorative, so it is
 * hidden from assistive tech.
 */
export function Tick({ className }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        // Hidden below md, where the frame rules sit on the viewport edge and
        // the crosshair would be clipped in half.
        'pointer-events-none absolute z-10 hidden h-[9px] w-[9px] text-ink-600 md:block',
        'before:absolute before:top-1/2 before:left-0 before:h-px before:w-full before:-translate-y-1/2 before:bg-current',
        'after:absolute after:top-0 after:left-1/2 after:h-full after:w-px after:-translate-x-1/2 after:bg-current',
        className,
      )}
    />
  )
}
