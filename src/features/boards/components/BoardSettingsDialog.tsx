import { useEffect, useId, useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { MOCK_USERS } from '@/features/boards/mocks/mock-users'
import { boardGradientFromId } from '@/features/boards/utils/board-accent'

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase()
  const single = parts[0] ?? '?'
  return single.slice(0, 2).toUpperCase()
}

export interface BoardSettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  boardTitle?: string
}

export function BoardSettingsDialog({ open, onOpenChange, boardTitle }: BoardSettingsDialogProps) {
  const baseId = useId()
  const searchId = `${baseId}-search`
  const [query, setQuery] = useState('')

  useEffect(() => {
    if (!open) {
      setQuery('')
    }
  }, [open])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return MOCK_USERS
    return MOCK_USERS.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q),
    )
  }, [query])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-4 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg">Настройки доски</DialogTitle>
          <DialogDescription>
            {boardTitle ? (
              <>
                Доска «{boardTitle}». Участники и поиск — демонстрация интерфейса, без сохранения и без
                запросов к серверу.
              </>
            ) : (
              <>
                Участники и поиск — демонстрация интерфейса, без сохранения и без запросов к серверу.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <label htmlFor={searchId} className="sr-only">
            Поиск пользователей
          </label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              id={searchId}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Имя или email…"
              autoComplete="off"
              className="pl-8"
            />
          </div>

          <div
            className="flex flex-col gap-1 overflow-y-auto rounded-xl border border-border/60 bg-muted/30 p-1 max-h-[min(50vh,20rem)]"
            role="list"
          >
            {filtered.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-muted-foreground">Никого не найдено</p>
            ) : (
              filtered.map((user) => {
                const gradient = boardGradientFromId(user.id)
                return (
                  <div
                    key={user.id}
                    role="listitem"
                    className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-muted"
                  >
                    <span
                      className={cn(
                        'flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-xs font-semibold text-white',
                        gradient,
                      )}
                      aria-hidden
                    >
                      {initialsFromName(user.name)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
