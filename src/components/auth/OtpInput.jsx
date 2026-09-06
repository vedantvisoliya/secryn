import { useEffect, useRef } from 'react'

import { cn } from '@/lib/utils'

const LENGTH = 6

/**
 * Six-box TOTP input.
 *
 * `value` is always dense and left-filled — an OTP has no gaps — which keeps
 * the index maths honest when digits are typed, pasted or deleted.
 */
export function OtpInput({
  value,
  onChange,
  onComplete,
  disabled = false,
  hasError = false,
  autoFocus = true,
  id = 'totp',
  describedBy,
}) {
  const inputs = useRef([])

  useEffect(() => {
    if (autoFocus) inputs.current[0]?.focus()
  }, [autoFocus])

  // Move focus to the first empty box whenever the value is reset externally.
  useEffect(() => {
    if (value === '') inputs.current[0]?.focus()
  }, [value])

  const focusAt = (index) => {
    inputs.current[Math.max(0, Math.min(index, LENGTH - 1))]?.focus()
  }

  const commit = (next) => {
    onChange(next)
    if (next.length === LENGTH) onComplete?.(next)
  }

  const handleChange = (index, event) => {
    const digits = event.target.value.replace(/\D/g, '')
    if (!digits) return
    const next = (value.slice(0, index) + digits + value.slice(index + 1)).slice(
      0,
      LENGTH,
    )
    commit(next)
    focusAt(index + digits.length)
  }

  const handleKeyDown = (index, event) => {
    if (event.key === 'Backspace') {
      event.preventDefault()
      if (value[index]) {
        onChange(value.slice(0, index) + value.slice(index + 1))
        focusAt(index)
      } else if (index > 0) {
        onChange(value.slice(0, index - 1) + value.slice(index))
        focusAt(index - 1)
      }
      return
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      focusAt(index - 1)
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      focusAt(index + 1)
    }
  }

  // Insert at the focused box rather than replacing the whole field, so
  // pasting a fragment into a half-filled code does the obvious thing. A
  // paste into the first box (the common case) still replaces everything.
  const handlePaste = (index, event) => {
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '')
    if (!pasted) return
    event.preventDefault()
    const next = (
      value.slice(0, index) +
      pasted +
      value.slice(index + pasted.length)
    ).slice(0, LENGTH)
    commit(next)
    focusAt(index + pasted.length)
  }

  return (
    <div
      role="group"
      aria-label="Six digit authentication code"
      aria-describedby={describedBy}
      className="flex gap-2 sm:gap-2.5"
    >
      {Array.from({ length: LENGTH }, (_, index) => (
        <input
          key={index}
          id={index === 0 ? id : undefined}
          ref={(node) => {
            inputs.current[index] = node
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          maxLength={1}
          disabled={disabled}
          aria-label={`Digit ${index + 1}`}
          aria-invalid={hasError || undefined}
          value={value[index] ?? ''}
          onChange={(event) => handleChange(index, event)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={(event) => handlePaste(index, event)}
          onFocus={(event) => event.target.select()}
          className={cn(
            'h-13 w-full min-w-0 rounded-md border bg-ink-925/70 text-center font-mono text-lg text-ink-50 tabular',
            'transition-colors outline-none',
            'focus:border-signal-dim focus:bg-ink-900',
            'disabled:cursor-not-allowed disabled:opacity-50',
            hasError
              ? 'border-flare/60'
              : 'border-border hover:border-border-strong',
          )}
        />
      ))}
    </div>
  )
}
