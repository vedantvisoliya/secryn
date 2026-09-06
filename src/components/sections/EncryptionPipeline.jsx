import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import { ArrowRight } from 'lucide-react'

import { cn } from '@/lib/utils'

const PLAINTEXT = 'sk_live_51H8xQ2LkpM4vNc7RtYbGf3'

const CIPHERTEXT =
  'k4Zt9RmQ2xJd7Lb0PvA1sYnW8cUgHf3iEoTr6MaX5DzB' +
  'q7NwSjV0yKpG2hFuCeI9tRbLmXd4AoZP1sYvN8cWkJgU'

const SCRAMBLE_CHARS =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

const STAGES = [
  { id: 'passphrase', name: 'Passphrase', spec: 'held in memory', ms: 620 },
  { id: 'salt', name: 'Salt', spec: '16 B · CSPRNG', ms: 560 },
  { id: 'kdf', name: 'PBKDF2-SHA256', spec: '600,000 iters', ms: 1100 },
  { id: 'aead', name: 'AES-256-GCM', spec: '96-bit IV · 128-bit tag', ms: 900 },
]

const HOLD_MS = 3400

const STATUS = [
  { label: 'reading plaintext', tone: 'text-ink-400' },
  { label: 'salting', tone: 'text-ink-300' },
  { label: 'deriving key', tone: 'text-cipher' },
  { label: 'encrypting', tone: 'text-cipher' },
  { label: 'sealed', tone: 'text-signal' },
]

/**
 * Progressive reveal: characters that have not been "encrypted" yet render as
 * churning noise, so the block visibly resolves from garbage into ciphertext.
 */
function useCipherReveal(active, complete) {
  const [revealed, setRevealed] = useState(0)
  const [noise, setNoise] = useState(0)

  useEffect(() => {
    if (!active || complete) return undefined

    const step = window.setInterval(() => {
      setRevealed((current) => Math.min(current + 3, CIPHERTEXT.length))
      setNoise((current) => current + 1)
    }, 28)

    // Resetting on teardown keeps the next cycle starting from noise.
    // oxlint-disable-next-line react/set-state-in-effect -- timer teardown, not a render cascade
    return () => {
      window.clearInterval(step)
      setRevealed(0)
    }
  }, [active, complete])

  const shown = complete ? CIPHERTEXT.length : active ? revealed : 0
  const tail = CIPHERTEXT.length - shown
  const scrambled =
    tail > 0
      ? Array.from({ length: tail }, (_, index) => {
          const pick = (index * 7 + noise * 13 + 5) % SCRAMBLE_CHARS.length
          return SCRAMBLE_CHARS[pick]
        }).join('')
      : ''

  return { head: CIPHERTEXT.slice(0, shown), tail: scrambled }
}

/**
 * The hero's product visual: one secret moving through the real seal path.
 *
 * It is the same pipeline described in the architecture section, animated once
 * per cycle. Under `prefers-reduced-motion` it renders the terminal state —
 * sealed — with no timers running at all.
 */
export function EncryptionPipeline({ className }) {
  const reduceMotion = useReducedMotion()
  const [stage, setStage] = useState(reduceMotion ? STAGES.length : -1)
  const [cycle, setCycle] = useState(0)
  const timers = useRef([])

  useEffect(() => {
    if (reduceMotion) {
      // useReducedMotion resolves after first paint, so the terminal state has
      // to be applied here rather than derived at init.
      // oxlint-disable-next-line react/set-state-in-effect
      setStage(STAGES.length)
      return undefined
    }

    const queue = timers.current
    let elapsed = 260

    queue.push(window.setTimeout(() => setStage(-1), 0))
    queue.push(window.setTimeout(() => setStage(0), 200))

    STAGES.forEach((item, index) => {
      elapsed += item.ms
      queue.push(window.setTimeout(() => setStage(index + 1), elapsed))
    })

    queue.push(
      window.setTimeout(() => setCycle((current) => current + 1), elapsed + HOLD_MS),
    )

    return () => {
      queue.forEach(window.clearTimeout)
      timers.current = []
    }
  }, [cycle, reduceMotion])

  const sealed = stage >= STAGES.length
  const encrypting = stage === STAGES.length - 1
  const { head, tail } = useCipherReveal(encrypting, sealed)
  const status = STATUS[Math.max(0, Math.min(stage, STATUS.length - 1))]
  const progress = Math.max(0, Math.min(stage / STAGES.length, 1)) * 100

  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border border-border bg-ink-900/70 shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset]',
        className,
      )}
    >
      {/* chrome */}
      <div className="flex items-center justify-between gap-4 border-b border-border bg-ink-925/80 px-4 py-2.5">
        <span className="label-mono text-ink-500">secryn · seal</span>
        <span className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className={cn(
              'size-1.5 rounded-full',
              sealed ? 'bg-signal' : 'bg-cipher',
              !sealed && !reduceMotion && 'animate-[secryn-pulse_1.1s_ease-in-out_infinite]',
            )}
          />
          <span className={cn('label-mono transition-colors', status.tone)}>
            {status.label}
          </span>
        </span>
      </div>

      {/* payload */}
      <div className="relative grid grid-cols-1 md:grid-cols-2">
        <div className="border-b border-border p-5 md:border-r md:border-b-0 md:p-6">
          <p className="label-mono text-ink-500">Plaintext · STRIPE_SECRET_KEY</p>
          <p
            className={cn(
              'mt-3 font-mono text-[0.8125rem] break-all transition-all duration-500 sm:text-sm',
              sealed ? 'text-ink-600 line-through decoration-flare/60' : 'text-ink-100',
            )}
          >
            {PLAINTEXT}
          </p>
          <p className="mt-3 label-mono text-ink-600">
            {sealed ? 'discarded · not persisted' : '31 bytes · in memory'}
          </p>
        </div>

        <div className="p-5 md:p-6">
          <p className="label-mono text-ink-500">Ciphertext · stored</p>
          <p className="mt-3 font-mono text-[0.8125rem] break-all sm:text-sm">
            <span className="text-cipher">{head}</span>
            <span className="text-ink-600">{tail}</span>
          </p>
          <p className="mt-3 label-mono text-ink-600">
            {sealed ? '88 B · iv 12 B · tag 16 B' : 'awaiting seal'}
          </p>
        </div>

        <span
          aria-hidden="true"
          className="absolute top-1/2 left-1/2 hidden size-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-border bg-ink-900 md:grid"
        >
          <ArrowRight
            className={cn(
              'size-3.5 transition-colors duration-500',
              sealed ? 'text-signal' : 'text-ink-600',
            )}
          />
        </span>
      </div>

      {/* pipeline */}
      <div className="relative border-t border-border bg-ink-925/60">
        <span aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-border" />
        <span
          aria-hidden="true"
          className="absolute top-0 left-0 h-px bg-signal transition-[width] duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />

        <ol className="grid grid-cols-2 sm:grid-cols-4">
          {STAGES.map((item, index) => {
            const done = stage > index
            const active = stage === index
            return (
              <li
                key={item.id}
                className={cn(
                  'flex items-start gap-2.5 border-border p-4',
                  index % 2 === 1 && 'border-l',
                  index >= 2 && 'border-t sm:border-t-0',
                  index === 2 && 'sm:border-l',
                  index === 3 && 'sm:border-l',
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    'mt-1 size-1.5 shrink-0 rounded-full transition-colors duration-300',
                    done && 'bg-signal',
                    active && 'bg-cipher',
                    !done && !active && 'bg-ink-600',
                    active && !reduceMotion && 'animate-[secryn-pulse_1s_ease-in-out_infinite]',
                  )}
                />
                <span className="min-w-0">
                  <span
                    className={cn(
                      'block font-mono text-[0.6875rem] tracking-tight transition-colors duration-300',
                      done || active ? 'text-ink-100' : 'text-ink-500',
                    )}
                  >
                    {item.name}
                  </span>
                  <span className="mt-1 block font-mono text-[0.625rem] text-ink-600">
                    {item.spec}
                  </span>
                </span>
              </li>
            )
          })}
        </ol>
      </div>
    </div>
  )
}
