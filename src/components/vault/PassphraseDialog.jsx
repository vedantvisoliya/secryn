import { useState } from 'react'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

/** Shared input styling so every passphrase field looks identical. */
export const secretInputClass =
  'h-11 border-border bg-ink-925/70 font-mono text-sm text-ink-50 placeholder:text-ink-600 focus-visible:border-signal-dim focus-visible:ring-0'

export function PassphraseField({
  id,
  value,
  onChange,
  autoFocus = false,
  placeholder = 'Your vault passphrase',
  invalid = false,
  describedBy,
}) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="relative">
      <Input
        id={id}
        type={visible ? 'text' : 'password'}
        value={value}
        autoFocus={autoFocus}
        autoComplete="off"
        spellCheck={false}
        placeholder={placeholder}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        onChange={(event) => onChange(event.target.value)}
        className={cn(secretInputClass, 'pr-11', invalid && 'border-flare/60')}
      />
      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        aria-label={visible ? 'Hide passphrase' : 'Show passphrase'}
        className="absolute top-1/2 right-2 grid size-7 -translate-y-1/2 place-items-center rounded-md text-ink-500 transition-colors hover:text-ink-200"
      >
        {visible ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
      </button>
    </div>
  )
}

/**
 * Asked for once per session (or per key, when a key was sealed with a
 * different passphrase). The value goes into memory only — see
 * hooks/PassphraseProvider.jsx.
 *
 * The form is a child so it mounts fresh with the dialog; no reset effect.
 */
function PassphraseForm({ onSubmit, onCancel, submitLabel, busy, error }) {
  const [value, setValue] = useState('')
  const tooShort = value.length > 0 && value.length < 8

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        if (value.length >= 8 && !busy) onSubmit(value)
      }}
    >
      <Label htmlFor="vault-passphrase" className="label-mono text-ink-500">
        Passphrase
      </Label>
      <div className="mt-2">
        <PassphraseField
          id="vault-passphrase"
          value={value}
          onChange={setValue}
          autoFocus
          invalid={Boolean(error) || tooShort}
          describedBy={error ? 'passphrase-error' : undefined}
        />
      </div>

      {tooShort ? (
        <p className="mt-2 text-xs text-ink-500">At least 8 characters.</p>
      ) : null}

      {error ? (
        <p
          id="passphrase-error"
          role="alert"
          className="mt-3 rounded-md border border-flare/25 bg-flare-deep/40 px-3 py-2 text-[0.8125rem] text-flare"
        >
          {error}
        </p>
      ) : null}

      <DialogFooter className="mt-6">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="border-border bg-transparent text-ink-300 hover:bg-ink-850 hover:text-ink-50"
        >
          Cancel
        </Button>
        <Button type="submit" disabled={busy || value.length < 8}>
          {busy ? <Loader2 className="animate-spin" /> : null}
          {submitLabel}
        </Button>
      </DialogFooter>
    </form>
  )
}

export function PassphraseDialog({
  open,
  onOpenChange,
  onSubmit,
  title = 'Unlock your vault',
  description = 'Your passphrase decrypts the keys in this vault. It is held in memory for this session only and never stored.',
  submitLabel = 'Unlock',
  busy = false,
  error = null,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border bg-ink-900 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-ink-50">{title}</DialogTitle>
          <DialogDescription className="text-ink-400">{description}</DialogDescription>
        </DialogHeader>

        <PassphraseForm
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
          submitLabel={submitLabel}
          busy={busy}
          error={error}
        />
      </DialogContent>
    </Dialog>
  )
}
