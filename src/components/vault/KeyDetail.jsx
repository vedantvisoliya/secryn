import { useCallback, useEffect, useState } from 'react'
import {
  Check,
  Copy,
  Eye,
  EyeOff,
  Loader2,
  Pencil,
  RotateCcw,
  Trash2,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { ApiError, keysApi } from '@/lib/api'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'
import { describeReminder } from '@/lib/period-cycle'
import { describeExpiry, formatDate, keyStatus } from '@/lib/key-status'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { StatusChip } from '@/components/vault/StatusChip'
import { PassphraseDialog } from '@/components/vault/PassphraseDialog'

/** A revealed value re-masks itself after this long on screen. */
const AUTO_HIDE_MS = 45_000

function Row({ label, children, mono = true }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-border py-3 last:border-b-0">
      <span className="label-mono shrink-0 text-ink-600">{label}</span>
      <span
        className={cn(
          'min-w-0 text-right text-[0.8125rem] break-all text-ink-200',
          mono && 'font-mono',
        )}
      >
        {children}
      </span>
    </div>
  )
}

export function KeyDetail({ apiKey, open, onOpenChange, onEdit, onDelete, onRestore }) {
  const { copied, copy } = useCopyToClipboard()

  /**
   * Every key has its own passphrase, so nothing is held between reveals — the
   * plaintext is stamped with the key it belongs to and dropped on close, on
   * hide, and on the auto-hide timer.
   */
  const [revealed, setRevealed] = useState(null)
  const [revealing, setRevealing] = useState(false)
  const [error, setError] = useState(null)
  const [promptOpen, setPromptOpen] = useState(false)
  const [promptError, setPromptError] = useState(null)
  const [acting, setActing] = useState(false)

  // Both guards matter: with optional chaining alone, `undefined === undefined`
  // is true on the first render (no key selected, nothing revealed) and we
  // would dereference null.
  const plaintext =
    revealed && apiKey && revealed.keyId === apiKey.id ? revealed.value : null

  // Only timer-driven; nothing here runs synchronously on render.
  useEffect(() => {
    if (plaintext === null) return undefined
    const timer = window.setTimeout(() => setRevealed(null), AUTO_HIDE_MS)
    return () => window.clearTimeout(timer)
  }, [plaintext])

  const reveal = useCallback(
    async (secret) => {
      setRevealing(true)
      setError(null)
      try {
        const value = await keysApi.decrypt(apiKey.id, secret)
        if (!value) {
          setError('The server returned no value for this key.')
          setPromptOpen(false)
          return
        }
        setRevealed({ keyId: apiKey.id, value })
        setPromptOpen(false)
        setPromptError(null)
      } catch (caught) {
        const wrongPassphrase =
          caught instanceof ApiError && [400, 401, 403, 422].includes(caught.status)
        if (wrongPassphrase) {
          setPromptError('That is not the passphrase for this key.')
        } else {
          setError(caught?.message ?? 'Could not decrypt this key.')
          setPromptOpen(false)
        }
      } finally {
        setRevealing(false)
      }
    },
    [apiKey],
  )

  const runAction = async (action) => {
    setActing(true)
    setError(null)
    try {
      await action()
    } catch (caught) {
      setError(caught?.message ?? 'That did not work.')
    } finally {
      setActing(false)
    }
  }

  if (!apiKey) return null

  const status = keyStatus(apiKey)
  const deleted = Boolean(apiKey.is_deleted)

  return (
    <>
      <Sheet
        open={open}
        onOpenChange={(next) => {
          // Closing drops any revealed value — an event, not an effect.
          if (!next) {
            setRevealed(null)
            setError(null)
          }
          onOpenChange(next)
        }}
      >
        <SheetContent
          side="right"
          className="w-full overflow-y-auto border-border bg-ink-925 sm:max-w-md"
        >
          <SheetHeader className="border-b border-border">
            <SheetTitle className="flex flex-wrap items-center gap-3 text-left">
              <span className="font-mono text-[0.9375rem] break-all text-ink-50">
                {apiKey.name}
              </span>
              <StatusChip status={status} />
            </SheetTitle>
            {apiKey.description ? (
              <SheetDescription className="text-left text-ink-400">
                {apiKey.description}
              </SheetDescription>
            ) : null}
          </SheetHeader>

          <div className="p-4 sm:p-5">
            {/* Value */}
            <p className="label-mono text-ink-600">Value</p>
            <div className="mt-2 flex flex-col gap-2">
              <p
                className={cn(
                  'rounded-md border border-border bg-ink-950/60 px-3 py-2.5 font-mono text-[0.8125rem] break-all',
                  plaintext ? 'text-ink-50' : 'text-ink-500',
                )}
              >
                {plaintext ?? '••••••••••••••••••••••••••••'}
              </p>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={revealing || deleted}
                  onClick={() => {
                    if (plaintext) {
                      setRevealed(null)
                      return
                    }
                    setPromptError(null)
                    setPromptOpen(true)
                  }}
                  className="border-border bg-transparent text-ink-200 hover:border-border-strong hover:bg-ink-850 hover:text-ink-50"
                >
                  {revealing ? (
                    <Loader2 className="animate-spin" />
                  ) : plaintext ? (
                    <EyeOff />
                  ) : (
                    <Eye />
                  )}
                  {plaintext ? 'Hide' : 'Reveal'}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={!plaintext}
                  onClick={() => copy(plaintext)}
                  className="text-ink-400 hover:bg-ink-850 hover:text-ink-100"
                >
                  {copied ? <Check className="text-signal" /> : <Copy />}
                  {copied ? 'Copied' : 'Copy'}
                </Button>

                {plaintext ? (
                  <span className="label-mono text-ink-600">hides after 45s</span>
                ) : null}
              </div>
            </div>

            {error ? (
              <p
                role="alert"
                className="mt-3 rounded-md border border-flare/25 bg-flare-deep/40 px-3 py-2 text-[0.8125rem] text-flare"
              >
                {error}
              </p>
            ) : null}

            {/* Lifecycle */}
            <div className="mt-7">
              <p className="label-mono mb-1 text-ink-600">Lifecycle</p>
              <Row label="Expires" mono={false}>
                <span className="font-mono">{formatDate(apiKey.expiration_date)}</span>{' '}
                <span className="text-ink-500">
                  ({describeExpiry(apiKey.expiration_date)})
                </span>
              </Row>
              <Row label="Reminder">{describeReminder(apiKey)}</Row>
              <Row label="Created">{formatDate(apiKey.created_at)}</Row>
              <Row label="Updated">{formatDate(apiKey.updated_at)}</Row>
            </div>

            {/* Actions */}
            <div className="mt-8 flex flex-wrap gap-2 border-t border-border pt-5">
              {deleted ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={acting}
                  onClick={() => runAction(() => onRestore(apiKey))}
                  className="border-border bg-transparent text-ink-200 hover:border-signal/40 hover:bg-ink-850 hover:text-signal"
                >
                  {acting ? <Loader2 className="animate-spin" /> : <RotateCcw />}
                  Restore
                </Button>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={acting}
                    onClick={() => onEdit(apiKey)}
                    className="border-border bg-transparent text-ink-200 hover:border-border-strong hover:bg-ink-850 hover:text-ink-50"
                  >
                    <Pencil />
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={acting}
                    onClick={() => runAction(() => onDelete(apiKey))}
                    className="text-ink-400 hover:bg-flare-deep/50 hover:text-flare"
                  >
                    {acting ? <Loader2 className="animate-spin" /> : <Trash2 />}
                    Delete
                  </Button>
                </>
              )}
            </div>

            {deleted ? (
              <p className="mt-4 text-xs leading-relaxed text-ink-500">
                Deleted keys keep their name and history so you can see they
                existed. The value stays encrypted and unreadable until restored.
              </p>
            ) : null}
          </div>
        </SheetContent>
      </Sheet>

      <PassphraseDialog
        open={promptOpen}
        onOpenChange={(next) => {
          setPromptOpen(next)
          if (!next) setPromptError(null)
        }}
        onSubmit={reveal}
        busy={revealing}
        error={promptError}
        title="Enter this key's passphrase"
        description={`${apiKey.name} was sealed with its own passphrase, set when you added it. It is used to decrypt this value and is never stored.`}
        submitLabel="Reveal"
      />
    </>
  )
}
