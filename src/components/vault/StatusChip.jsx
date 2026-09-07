import { cn } from '@/lib/utils'
import { KEY_STATUS } from '@/lib/key-status'
import { Badge } from '@/components/ui/badge'

/** Same four state colours the rest of the product uses. */
const STYLES = {
  [KEY_STATUS.SEALED]: {
    chip: 'border-signal/30 bg-signal-deep/60 text-signal',
    dot: 'bg-signal',
    hint: 'Encrypted and inside its expiry window.',
  },
  [KEY_STATUS.EXPIRING]: {
    chip: 'border-ember/30 bg-ember-deep/60 text-ember',
    dot: 'bg-ember',
    hint: 'Inside its reminder window — rotate it soon.',
  },
  [KEY_STATUS.EXPIRED]: {
    chip: 'border-flare/30 bg-flare-deep/60 text-flare',
    dot: 'bg-flare',
    hint: 'Past its expiry date.',
  },
  [KEY_STATUS.DELETED]: {
    chip: 'border-border bg-ink-800 text-ink-400',
    dot: 'bg-ink-500',
    hint: 'Deleted. The record is kept and can be restored.',
  },
}

function statusStyle(status) {
  return STYLES[status] ?? STYLES[KEY_STATUS.SEALED]
}

export function StatusDot({ status, className }) {
  return (
    <span
      aria-hidden="true"
      className={cn('size-1.5 shrink-0 rounded-full', statusStyle(status).dot, className)}
    />
  )
}

export function StatusChip({ status, className }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'rounded-md font-mono text-[0.625rem] tracking-wide',
        statusStyle(status).chip,
        className,
      )}
    >
      {status}
    </Badge>
  )
}
