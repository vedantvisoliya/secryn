import { useMemo, useState } from 'react'
import { Lock, LockOpen, LogOut, Plus, Search } from 'lucide-react'

import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/auth-context'
import { useApiKeys } from '@/hooks/useApiKeys'
import { PassphraseProvider } from '@/hooks/PassphraseProvider'
import { usePassphrase } from '@/hooks/passphrase-context'
import { KEY_STATUS, keyStatus } from '@/lib/key-status'
import { Frame } from '@/components/shared/Frame'
import { Logo } from '@/components/shared/Logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { KeyTable } from '@/components/vault/KeyTable'
import { KeyDetail } from '@/components/vault/KeyDetail'
import { CreateKeyDialog, EditKeyDialog } from '@/components/vault/KeyDialogs'
import { PassphraseDialog } from '@/components/vault/PassphraseDialog'

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: KEY_STATUS.SEALED, label: 'Sealed' },
  { id: KEY_STATUS.EXPIRING, label: 'Expiring' },
  { id: KEY_STATUS.EXPIRED, label: 'Expired' },
  { id: KEY_STATUS.DELETED, label: 'Deleted' },
]

/** Lock state lives in the header so it is never ambiguous whether we hold a passphrase. */
function LockBadge() {
  const { isUnlocked, lock } = usePassphrase()

  if (!isUnlocked) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center gap-2 rounded-md border border-border px-2.5 py-1.5 label-mono text-ink-500">
            <Lock aria-hidden="true" className="size-3.5" />
            locked
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-64 text-xs">
          No passphrase held. You will be asked for one the first time you reveal
          a key.
        </TooltipContent>
      </Tooltip>
    )
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={lock}
          className="inline-flex items-center gap-2 rounded-md border border-signal/30 bg-signal-deep/50 px-2.5 py-1.5 label-mono text-signal transition-colors hover:border-signal/50"
        >
          <LockOpen aria-hidden="true" className="size-3.5" />
          unlocked
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-64 text-xs">
        Passphrase held in memory for this session. Click to lock now — it also
        locks itself after 5 minutes of inactivity.
      </TooltipContent>
    </Tooltip>
  )
}

function VaultScreen() {
  const { user, email, logout, busy } = useAuth()
  const { isUnlocked, unlock } = usePassphrase()
  const {
    keys,
    status,
    error,
    hasMore,
    loadingMore,
    reload,
    loadMore,
    create,
    update,
    remove,
    restore,
  } = useApiKeys()

  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [selectedId, setSelectedId] = useState(null)
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState(null)
  const [unlockOpen, setUnlockOpen] = useState(false)

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return keys.filter((item) => {
      const state = keyStatus(item)
      // Deleted keys stay out of every other view — they are an archive.
      if (filter === 'all' ? item.is_deleted : state !== filter) return false
      if (!needle) return true
      return (
        item.name?.toLowerCase().includes(needle) ||
        item.description?.toLowerCase().includes(needle)
      )
    })
  }, [keys, query, filter])

  const selected = keys.find((item) => item.id === selectedId) ?? null
  const counts = useMemo(() => {
    const live = keys.filter((item) => !item.is_deleted)
    return {
      total: live.length,
      attention: live.filter((item) =>
        [KEY_STATUS.EXPIRING, KEY_STATUS.EXPIRED].includes(keyStatus(item)),
      ).length,
    }
  }, [keys])

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-40 border-b border-border bg-ink-950/85 backdrop-blur-xl">
        <Frame>
          <div className="flex h-16 items-center justify-between gap-3 px-(--gutter)">
            <Logo />
            <div className="flex items-center gap-2 sm:gap-3">
              <LockBadge />
              <span className="hidden font-mono text-xs text-ink-400 md:inline">
                {user?.email ?? email}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                disabled={busy}
                className="border-border bg-transparent text-ink-200 hover:border-border-strong hover:bg-ink-900 hover:text-ink-50"
              >
                <LogOut />
                <span className="hidden sm:inline">Sign out</span>
              </Button>
            </div>
          </div>
        </Frame>
      </header>

      <main>
        <Frame>
          <div className="px-(--gutter) py-10 sm:py-14">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="text-h2 text-ink-50">Vault</h1>
                <p className="mt-2 text-[0.9375rem] text-ink-400">
                  {counts.total === 0
                    ? 'No keys yet.'
                    : `${counts.total} ${counts.total === 1 ? 'key' : 'keys'}`}
                  {counts.attention > 0 ? (
                    <span className="text-ember">
                      {' · '}
                      {counts.attention} needing attention
                    </span>
                  ) : null}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {!isUnlocked ? (
                  <Button
                    variant="outline"
                    onClick={() => setUnlockOpen(true)}
                    className="border-border bg-transparent text-ink-200 hover:border-border-strong hover:bg-ink-900 hover:text-ink-50"
                  >
                    <LockOpen />
                    Unlock
                  </Button>
                ) : null}
                <Button onClick={() => setCreating(true)}>
                  <Plus />
                  Add a key
                </Button>
              </div>
            </div>

            {/* Toolbar */}
            <div className="mt-8 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative max-w-sm flex-1">
                <Search
                  aria-hidden="true"
                  className="absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-ink-600"
                />
                <Input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search keys"
                  aria-label="Search keys by name or description"
                  className="h-10 border-border bg-ink-925/70 pl-9 text-sm text-ink-100 placeholder:text-ink-600 focus-visible:border-signal-dim focus-visible:ring-0"
                />
              </div>

              <div
                role="group"
                aria-label="Filter by status"
                className="flex flex-wrap gap-1"
              >
                {FILTERS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={filter === item.id}
                    onClick={() => setFilter(item.id)}
                    className={cn(
                      'rounded-md px-3 py-1.5 label-mono transition-colors',
                      filter === item.id
                        ? 'bg-ink-800 text-ink-50'
                        : 'text-ink-500 hover:bg-ink-900 hover:text-ink-200',
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 overflow-hidden rounded-xl border border-border bg-ink-900/40">
              <KeyTable
                keys={visible}
                status={status}
                error={error}
                filtered={Boolean(query) || filter !== 'all'}
                onSelect={(item) => setSelectedId(item.id)}
                onAdd={() => setCreating(true)}
                onRetry={reload}
                hasMore={hasMore}
                loadingMore={loadingMore}
                onLoadMore={loadMore}
              />
            </div>
          </div>
        </Frame>
      </main>

      <KeyDetail
        apiKey={selected}
        open={Boolean(selected)}
        onOpenChange={(next) => {
          if (!next) setSelectedId(null)
        }}
        onEdit={(item) => setEditing(item)}
        onDelete={async (item) => {
          await remove(item.id)
          setSelectedId(null)
        }}
        onRestore={async (item) => {
          await restore(item.id)
        }}
      />

      <CreateKeyDialog
        open={creating}
        onOpenChange={setCreating}
        onCreate={async (payload, usedPassphrase) => {
          await create(payload)
          // Creating proves you know the passphrase, so open the vault with it.
          if (!isUnlocked && usedPassphrase) unlock(usedPassphrase)
        }}
      />

      <EditKeyDialog
        open={Boolean(editing)}
        apiKey={editing}
        onOpenChange={(next) => {
          if (!next) setEditing(null)
        }}
        onSave={async (patch) => {
          await update(editing.id, patch)
        }}
      />

      <PassphraseDialog
        open={unlockOpen}
        onOpenChange={setUnlockOpen}
        onSubmit={(value) => {
          unlock(value)
          setUnlockOpen(false)
        }}
      />
    </div>
  )
}

export default function AppPage() {
  return (
    <PassphraseProvider>
      <VaultScreen />
    </PassphraseProvider>
  )
}
