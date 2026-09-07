import { AlertTriangle, KeyRound, Loader2, Plus } from 'lucide-react'

import { cn } from '@/lib/utils'
import { describeReminder } from '@/lib/period-cycle'
import { describeExpiry, formatDate, keyStatus } from '@/lib/key-status'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { StatusChip, StatusDot } from '@/components/vault/StatusChip'

function LoadingRows() {
  return Array.from({ length: 4 }, (_, index) => (
    <TableRow key={index} className="border-border">
      <TableCell className="py-4">
        <Skeleton className="h-4 w-48 bg-ink-800" />
      </TableCell>
      <TableCell className="py-4">
        <Skeleton className="h-5 w-16 bg-ink-800" />
      </TableCell>
      <TableCell className="hidden py-4 md:table-cell">
        <Skeleton className="h-4 w-24 bg-ink-800" />
      </TableCell>
      <TableCell className="hidden py-4 lg:table-cell">
        <Skeleton className="h-4 w-20 bg-ink-800" />
      </TableCell>
    </TableRow>
  ))
}

function EmptyState({ filtered, onAdd }) {
  if (filtered) {
    return (
      <div className="px-6 py-16 text-center">
        <p className="text-sm text-ink-300">Nothing matches that.</p>
        <p className="mt-2 text-[0.8125rem] text-ink-500">
          Try a different name, or clear the filter.
        </p>
      </div>
    )
  }

  return (
    <div className="px-6 py-16 text-center">
      <span
        aria-hidden="true"
        className="mx-auto grid size-11 place-items-center rounded-lg border border-border bg-ink-900"
      >
        <KeyRound strokeWidth={1.5} className="size-5 text-ink-500" />
      </span>
      <h2 className="mt-5 text-h3 text-ink-100">Your vault is empty</h2>
      <p className="mx-auto mt-2 max-w-[42ch] text-[0.8125rem] leading-relaxed text-ink-400">
        Add your first credential and it gets sealed with AES-256-GCM before it
        leaves this page. We store the ciphertext — the passphrase stays with you.
      </p>
      <Button onClick={onAdd} className="mt-6">
        <Plus />
        Add a key
      </Button>
    </div>
  )
}

export function KeyTable({
  keys,
  status,
  error,
  filtered,
  onSelect,
  onAdd,
  onRetry,
  hasMore,
  loadingMore,
  onLoadMore,
}) {
  if (status === 'error') {
    return (
      <div className="px-6 py-16 text-center">
        <AlertTriangle aria-hidden="true" className="mx-auto size-5 text-flare" />
        <p className="mt-4 text-sm text-ink-200">{error}</p>
        <Button
          variant="outline"
          onClick={onRetry}
          className="mt-5 border-border bg-transparent text-ink-200 hover:border-border-strong hover:bg-ink-850 hover:text-ink-50"
        >
          Try again
        </Button>
      </div>
    )
  }

  if (status === 'ready' && keys.length === 0) {
    return <EmptyState filtered={filtered} onAdd={onAdd} />
  }

  return (
    <>
      <div className="overflow-x-auto">
        <Table className="min-w-[34rem]">
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="label-mono h-11 px-4 text-ink-600">Name</TableHead>
              <TableHead className="label-mono h-11 px-4 text-ink-600">Status</TableHead>
              <TableHead className="label-mono hidden h-11 px-4 text-ink-600 md:table-cell">
                Expires
              </TableHead>
              <TableHead className="label-mono hidden h-11 px-4 text-right text-ink-600 lg:table-cell">
                Reminder
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {status === 'loading' ? (
              <LoadingRows />
            ) : (
              keys.map((item) => {
                const state = keyStatus(item)
                return (
                  <TableRow
                    key={item.id}
                    className={cn(
                      'cursor-pointer border-border transition-colors hover:bg-ink-900/60',
                      item.is_deleted && 'opacity-60',
                    )}
                    onClick={() => onSelect(item)}
                  >
                    {/* Row header: the name is what identifies the row to a
                        screen reader reading the other cells. */}
                    <th scope="row" className="p-0 text-left font-normal">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation()
                          onSelect(item)
                        }}
                        className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
                      >
                        <StatusDot status={state} />
                        <span className="min-w-0">
                          <span className="block truncate font-mono text-[0.8125rem] text-ink-100">
                            {item.name}
                          </span>
                          {item.description ? (
                            <span className="mt-0.5 block truncate text-xs text-ink-500">
                              {item.description}
                            </span>
                          ) : null}
                        </span>
                      </button>
                    </th>

                    <TableCell className="px-4 py-3.5">
                      <StatusChip status={state} />
                    </TableCell>

                    <TableCell className="hidden px-4 py-3.5 md:table-cell">
                      <span className="block font-mono text-xs text-ink-300">
                        {describeExpiry(item.expiration_date)}
                      </span>
                      <span className="mt-0.5 block font-mono text-[0.625rem] text-ink-600">
                        {formatDate(item.expiration_date)}
                      </span>
                    </TableCell>

                    <TableCell className="hidden px-4 py-3.5 text-right lg:table-cell">
                      <span className="font-mono text-xs text-ink-500">
                        {describeReminder(item)}
                      </span>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {hasMore ? (
        <div className="border-t border-border p-4 text-center">
          <Button
            variant="outline"
            size="sm"
            onClick={onLoadMore}
            disabled={loadingMore}
            className="border-border bg-transparent text-ink-300 hover:border-border-strong hover:bg-ink-850 hover:text-ink-50"
          >
            {loadingMore ? <Loader2 className="animate-spin" /> : null}
            Load more
          </Button>
        </div>
      ) : null}
    </>
  )
}
