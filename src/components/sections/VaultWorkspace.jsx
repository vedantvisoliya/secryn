import { useState } from 'react'
import { Check, Copy, Eye, EyeOff, Folder, Search } from 'lucide-react'

import { cn } from '@/lib/utils'
import { VAULT } from '@/lib/content'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'
import { Section } from '@/components/shared/Section'
import { Reveal } from '@/components/shared/Reveal'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

/** Status is the one place colour is allowed to carry meaning in the list. */
const STATUS_STYLES = {
  sealed: { chip: 'border-signal/30 bg-signal-deep/60 text-signal', dot: 'bg-signal' },
  expiring: { chip: 'border-ember/30 bg-ember-deep/60 text-ember', dot: 'bg-ember' },
  rotating: { chip: 'border-cipher/30 bg-cipher-deep/60 text-cipher', dot: 'bg-cipher' },
  revoked: { chip: 'border-flare/30 bg-flare-deep/60 text-flare', dot: 'bg-flare' },
}

function SecretRow({ secret, selected, onSelect }) {
  const status = STATUS_STYLES[secret.status] ?? STATUS_STYLES.sealed

  return (
    <tr
      className={cn(
        'cursor-pointer border-t border-border transition-colors',
        selected ? 'bg-ink-850/70' : 'hover:bg-ink-900/60',
      )}
      onClick={() => onSelect(secret.id)}
    >
      <th scope="row" className="p-0 text-left font-normal">
        <button
          type="button"
          aria-pressed={selected}
          onClick={(event) => {
            event.stopPropagation()
            onSelect(secret.id)
          }}
          className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
        >
          <span
            aria-hidden="true"
            className={cn('size-1.5 shrink-0 rounded-full', status.dot)}
          />
          <span className="truncate font-mono text-[0.8125rem] text-ink-100">
            {secret.name}
          </span>
        </button>
      </th>

      <td className="hidden px-4 py-3.5 font-mono text-xs text-ink-400 sm:table-cell">
        {secret.scope}
      </td>

      <td className="px-4 py-3.5">
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant="outline"
              className={cn('rounded-md font-mono text-[0.625rem] tracking-wide', status.chip)}
            >
              {secret.status}
            </Badge>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-56 text-xs">
            {VAULT.statusHints[secret.status]}
          </TooltipContent>
        </Tooltip>
      </td>

      <td className="hidden px-4 py-3.5 font-mono text-xs text-ink-500 md:table-cell">
        {secret.expires}
      </td>

      <td className="hidden px-4 py-3.5 text-right font-mono text-xs text-ink-500 tabular lg:table-cell">
        {secret.used}
      </td>
    </tr>
  )
}

function DetailPanel({ secret }) {
  const [revealed, setRevealed] = useState(false)
  const { copied, copy } = useCopyToClipboard()
  const readable = Boolean(secret.value)

  return (
    <div className="border-t border-border bg-ink-925/60 p-4 sm:p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="font-mono text-[0.8125rem] text-ink-100">{secret.name}</p>
        <p className="label-mono text-ink-600">
          {secret.scope} · expires {secret.expires}
        </p>
      </div>

      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
        <p
          className={cn(
            'flex-1 rounded-md border border-border bg-ink-950/60 px-3 py-2.5 font-mono text-[0.8125rem] break-all',
            !readable && 'text-ink-600 italic',
            readable && revealed ? 'text-ink-50' : 'text-ink-400',
          )}
        >
          {!readable
            ? 'revoked — ciphertext unrecoverable'
            : revealed
              ? secret.value
              : '••••••••••••••••••••••••••••'}
        </p>

        <span className="flex shrink-0 gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!readable}
            onClick={() => setRevealed((current) => !current)}
            className="h-9 border-border bg-transparent text-ink-200 hover:border-border-strong hover:bg-ink-850 hover:text-ink-50"
          >
            {revealed ? <EyeOff /> : <Eye />}
            {revealed ? 'Hide' : 'Reveal'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={!readable || !revealed}
            onClick={() => copy(secret.value)}
            aria-label={copied ? 'Copied' : `Copy value of ${secret.name}`}
            className="size-9 text-ink-400 hover:bg-ink-850 hover:text-ink-100"
          >
            {copied ? <Check className="text-signal" /> : <Copy />}
          </Button>
        </span>
      </div>

      <p className="mt-3 label-mono text-ink-600">
        {readable
          ? 'reveal requires your passphrase · last used ' + secret.used
          : 'retained as a record · last used ' + secret.used}
      </p>
    </div>
  )
}

export function VaultWorkspace() {
  const [selectedId, setSelectedId] = useState(VAULT.secrets[0].id)
  const [projectId, setProjectId] = useState(VAULT.projects[0].id)
  const selected =
    VAULT.secrets.find((secret) => secret.id === selectedId) ?? VAULT.secrets[0]

  return (
    <Section
      id="vault"
      index={VAULT.index}
      label={VAULT.label}
      heading={VAULT.heading}
      body={VAULT.body}
    >
      <Reveal className="overflow-hidden rounded-xl border border-border bg-ink-900/50">
        <div className="flex items-center justify-between gap-4 border-b border-border bg-ink-925/70 px-4 py-2.5">
          <span className="label-mono text-ink-500">secryn · vault</span>
          <span className="flex items-center gap-2 text-ink-600">
            <Search aria-hidden="true" className="size-3.5" />
            <span className="label-mono">search secrets</span>
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Project rail */}
          <div className="border-b border-border p-3 lg:col-span-3 lg:border-r lg:border-b-0">
            <p className="label-mono px-2 py-2 text-ink-600">Projects</p>
            <ul className="flex flex-wrap gap-1 lg:flex-col lg:flex-nowrap">
              {VAULT.projects.map((project) => {
                const active = project.id === projectId
                return (
                  <li key={project.id} className="flex-1 lg:flex-none">
                    <button
                      type="button"
                      aria-pressed={active}
                      onClick={() => setProjectId(project.id)}
                      className={cn(
                        'flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left transition-colors',
                        active
                          ? 'bg-ink-850 text-ink-50'
                          : 'text-ink-400 hover:bg-ink-900 hover:text-ink-200',
                      )}
                    >
                      <Folder
                        aria-hidden="true"
                        strokeWidth={1.5}
                        className={cn('size-3.5 shrink-0', active ? 'text-signal' : 'text-ink-600')}
                      />
                      <span className="flex-1 truncate font-mono text-xs">
                        {project.name}
                      </span>
                      <span className="font-mono text-[0.625rem] text-ink-600 tabular">
                        {project.count}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Secret list */}
          <div className="lg:col-span-9">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[26rem] border-collapse text-left">
                <caption className="sr-only">
                  Secrets in the selected project, with scope, status, expiry and
                  last use. Select a row to inspect it.
                </caption>
                <thead>
                  <tr className="label-mono text-ink-600">
                    <th scope="col" className="px-4 py-3 font-medium">Name</th>
                    <th scope="col" className="hidden px-4 py-3 font-medium sm:table-cell">Scope</th>
                    <th scope="col" className="px-4 py-3 font-medium">Status</th>
                    <th scope="col" className="hidden px-4 py-3 font-medium md:table-cell">Expires</th>
                    <th scope="col" className="hidden px-4 py-3 text-right font-medium lg:table-cell">
                      Last used
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {VAULT.secrets.map((secret) => (
                    <SecretRow
                      key={secret.id}
                      secret={secret}
                      selected={secret.id === selectedId}
                      onSelect={setSelectedId}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            <DetailPanel key={selected.id} secret={selected} />
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.08} as="ul" className="mt-8 grid gap-x-10 gap-y-4 md:grid-cols-2">
        {VAULT.notes.map((note) => (
          <li
            key={note}
            className="flex gap-3 text-[0.8125rem] leading-relaxed text-ink-400"
          >
            <span aria-hidden="true" className="mt-1.5 size-1 shrink-0 rounded-full bg-ink-600" />
            {note}
          </li>
        ))}
      </Reveal>
    </Section>
  )
}
