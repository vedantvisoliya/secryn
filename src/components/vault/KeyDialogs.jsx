import { useState } from 'react'
import { Loader2 } from 'lucide-react'

import { cn } from '@/lib/utils'
import {
  DEFAULT_REMINDER_DAYS,
  MAX_REMINDER_DAYS,
  MIN_REMINDER_DAYS,
  decodeReminderDays,
  encodeSchedule,
  toDateInputValue,
} from '@/lib/period-cycle'
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
import { PassphraseField } from '@/components/vault/PassphraseDialog'

const fieldClass =
  'h-11 border-border bg-ink-925/70 text-sm text-ink-100 placeholder:text-ink-600 focus-visible:border-signal-dim focus-visible:ring-0'

/** API limits, mirrored here so users are told before the request, not after a 422. */
const LIMITS = { name: 50, value: 255, description: 500 }

function isoDaysFromNow(days) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

function Field({ label, htmlFor, hint, error, children }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <Label htmlFor={htmlFor} className="label-mono text-ink-500">
          {label}
        </Label>
        {hint ? (
          <span className="font-mono text-[0.625rem] text-ink-600">{hint}</span>
        ) : null}
      </div>
      <div className="mt-2">{children}</div>
      {error ? <p className="mt-1.5 text-xs text-flare">{error}</p> : null}
    </div>
  )
}

function ReminderField({ value, onChange, error }) {
  return (
    <Field
      label="Remind me every"
      htmlFor="reminder-days"
      hint={`${MIN_REMINDER_DAYS}–${MAX_REMINDER_DAYS} days`}
      error={error}
    >
      <div className="flex items-center gap-3">
        <Input
          id="reminder-days"
          type="number"
          inputMode="numeric"
          min={MIN_REMINDER_DAYS}
          max={MAX_REMINDER_DAYS}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={cn(fieldClass, 'w-24 tabular')}
        />
        <span className="text-sm text-ink-400">days before it expires</span>
      </div>
    </Field>
  )
}

function ErrorNote({ children }) {
  if (!children) return null
  return (
    <p
      role="alert"
      className="rounded-md border border-flare/25 bg-flare-deep/40 px-3 py-2 text-[0.8125rem] text-flare"
    >
      {children}
    </p>
  )
}

function reminderProblem(value) {
  const days = Number(value)
  return days < MIN_REMINDER_DAYS || days > MAX_REMINDER_DAYS
    ? `Between ${MIN_REMINDER_DAYS} and ${MAX_REMINDER_DAYS}.`
    : null
}

function nameProblem(value) {
  if (!value.trim()) return 'Required.'
  return value.length > LIMITS.name ? `Max ${LIMITS.name} characters.` : null
}

/* ── Create ─────────────────────────────────────────────────────────────── */

/**
 * Mounted only while the dialog is open (Radix unmounts portal content), so
 * state starts fresh every time without a reset effect.
 */
function CreateKeyForm({ onClose, onCreate }) {
  const [form, setForm] = useState({
    name: '',
    api_key: '',
    description: '',
    expiration_date: isoDaysFromNow(90),
    reminder: String(DEFAULT_REMINDER_DAYS),
  })
  const [passphrase, setPassphrase] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  const set = (patch) => setForm((current) => ({ ...current, ...patch }))

  const problems = {
    name: nameProblem(form.name),
    api_key: !form.api_key.trim()
      ? 'Required.'
      : form.api_key.length > LIMITS.value
        ? `Max ${LIMITS.value} characters.`
        : null,
    description:
      form.description.length > LIMITS.description
        ? `Max ${LIMITS.description} characters.`
        : null,
    expiration_date: !form.expiration_date ? 'Required.' : null,
    reminder: reminderProblem(form.reminder),
    passphrase: passphrase.length < 8 ? 'At least 8 characters.' : null,
  }
  const valid = Object.values(problems).every((problem) => problem === null)

  const submit = async (event) => {
    event.preventDefault()
    if (!valid || busy) return
    setBusy(true)
    setError(null)
    try {
      await onCreate({
        name: form.name.trim(),
        api_key: form.api_key.trim(),
        description: form.description.trim() || null,
        ...encodeSchedule(form.expiration_date, form.reminder),
        passphrase,
      })
      onClose()
    } catch (caught) {
      setError(caught?.message ?? 'Could not save the key.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-ink-50">Add a key</DialogTitle>
        <DialogDescription className="text-ink-400">
          The value is sealed with AES-256-GCM before it is stored. Each key gets
          its own passphrase — you will need this exact one to read it back.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={submit} className="grid gap-5">
        <Field label="Name" htmlFor="key-name" error={problems.name}>
          <Input
            id="key-name"
            value={form.name}
            maxLength={LIMITS.name}
            placeholder="STRIPE_SECRET_KEY"
            onChange={(event) => set({ name: event.target.value })}
            className={cn(fieldClass, 'font-mono')}
          />
        </Field>

        <Field label="Value" htmlFor="key-value" error={problems.api_key}>
          <PassphraseField
            id="key-value"
            value={form.api_key}
            onChange={(next) => set({ api_key: next })}
            placeholder="sk_live_…"
            invalid={Boolean(problems.api_key)}
          />
        </Field>

        <Field
          label="Description"
          htmlFor="key-description"
          hint="optional"
          error={problems.description}
        >
          <Input
            id="key-description"
            value={form.description}
            maxLength={LIMITS.description}
            placeholder="Payments API, production"
            onChange={(event) => set({ description: event.target.value })}
            className={fieldClass}
          />
        </Field>

        <Field label="Expires on" htmlFor="key-expiry" error={problems.expiration_date}>
          <Input
            id="key-expiry"
            type="date"
            value={form.expiration_date}
            min={isoDaysFromNow(1)}
            onChange={(event) => set({ expiration_date: event.target.value })}
            className={cn(fieldClass, 'w-full')}
          />
        </Field>

        <ReminderField
          value={form.reminder}
          onChange={(next) => set({ reminder: next })}
          error={problems.reminder}
        />

        <div className="rounded-lg border border-border bg-ink-925/60 p-4">
          <Field
            label="Passphrase for this key"
            htmlFor="key-passphrase"
            error={problems.passphrase}
          >
            <PassphraseField
              id="key-passphrase"
              value={passphrase}
              onChange={setPassphrase}
              placeholder="At least 8 characters"
              invalid={Boolean(problems.passphrase)}
            />
            <p className="mt-2 text-xs leading-relaxed text-ink-600">
              This passphrase belongs to this key alone, and there is no
              recovery. Lose it and the value is unreadable — not by us either.
            </p>
          </Field>
        </div>

        <ErrorNote>{error}</ErrorNote>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="border-border bg-transparent text-ink-300 hover:bg-ink-850 hover:text-ink-50"
          >
            Cancel
          </Button>
          <Button type="submit" disabled={!valid || busy}>
            {busy ? <Loader2 className="animate-spin" /> : null}
            Seal and store
          </Button>
        </DialogFooter>
      </form>
    </>
  )
}

export function CreateKeyDialog({ open, onOpenChange, onCreate }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto border-border bg-ink-900 sm:max-w-lg">
        <CreateKeyForm onClose={() => onOpenChange(false)} onCreate={onCreate} />
      </DialogContent>
    </Dialog>
  )
}

/* ── Edit (metadata only — the ciphertext is never touched) ─────────────── */

function EditKeyForm({ apiKey, onClose, onSave }) {
  const [form, setForm] = useState({
    name: apiKey.name ?? '',
    description: apiKey.description ?? '',
    expiration_date: toDateInputValue(apiKey.expiration_date),
    reminder: String(decodeReminderDays(apiKey)),
  })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  const set = (patch) => setForm((current) => ({ ...current, ...patch }))
  const problems = {
    name: nameProblem(form.name),
    reminder: reminderProblem(form.reminder),
    expiration_date: !form.expiration_date ? 'Required.' : null,
  }
  const valid = Object.values(problems).every((problem) => problem === null)

  const submit = async (event) => {
    event.preventDefault()
    if (!valid || busy) return
    setBusy(true)
    setError(null)
    try {
      await onSave({
        name: form.name.trim(),
        description: form.description.trim() || null,
        ...encodeSchedule(form.expiration_date, form.reminder),
      })
      onClose()
    } catch (caught) {
      setError(caught?.message ?? 'Could not save changes.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-ink-50">Edit key</DialogTitle>
        <DialogDescription className="text-ink-400">
          Metadata only. The encrypted value and its passphrase are untouched.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={submit} className="grid gap-5">
        <Field label="Name" htmlFor="edit-name" error={problems.name}>
          <Input
            id="edit-name"
            value={form.name}
            maxLength={LIMITS.name}
            onChange={(event) => set({ name: event.target.value })}
            className={cn(fieldClass, 'font-mono')}
          />
        </Field>

        <Field label="Description" htmlFor="edit-description" hint="optional">
          <Input
            id="edit-description"
            value={form.description}
            maxLength={LIMITS.description}
            onChange={(event) => set({ description: event.target.value })}
            className={fieldClass}
          />
        </Field>

        <Field label="Expires on" htmlFor="edit-expiry" error={problems.expiration_date}>
          <Input
            id="edit-expiry"
            type="date"
            value={form.expiration_date}
            onChange={(event) => set({ expiration_date: event.target.value })}
            className={cn(fieldClass, 'w-full')}
          />
        </Field>

        <ReminderField
          value={form.reminder}
          onChange={(next) => set({ reminder: next })}
          error={problems.reminder}
        />

        <ErrorNote>{error}</ErrorNote>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="border-border bg-transparent text-ink-300 hover:bg-ink-850 hover:text-ink-50"
          >
            Cancel
          </Button>
          <Button type="submit" disabled={!valid || busy}>
            {busy ? <Loader2 className="animate-spin" /> : null}
            Save changes
          </Button>
        </DialogFooter>
      </form>
    </>
  )
}

export function EditKeyDialog({ open, onOpenChange, apiKey, onSave }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto border-border bg-ink-900 sm:max-w-lg">
        {apiKey ? (
          <EditKeyForm
            apiKey={apiKey}
            onClose={() => onOpenChange(false)}
            onSave={onSave}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
