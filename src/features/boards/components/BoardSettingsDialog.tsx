import { useEffect, useId, useMemo, useState } from 'react'
import { Loader2, Search, Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { boardGradientFromId } from '@/features/boards/utils/board-accent'
import {
  useAddBoardMemberMutation,
  useBoardMembersQuery,
  useOwnerProfileQuery,
  useProfileSearchQuery,
  useRemoveBoardMemberMutation,
} from '@/features/boards/hooks/use-boards-queries'

function displayLabel(profile: { display_name: string | null; email: string | null }): string {
  return profile.display_name?.trim() || profile.email?.trim() || 'Пользователь'
}

function initialsFromDisplay(profile: { display_name: string | null; email: string | null }): string {
  const base = displayLabel(profile)
  const parts = base.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase()
  return base.slice(0, 2).toUpperCase()
}

export interface BoardSettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  boardId: string
  boardTitle?: string
  ownerId: string
  currentUserId: string
  canManageMembers: boolean
}

export function BoardSettingsDialog({
  open,
  onOpenChange,
  boardId,
  boardTitle,
  ownerId,
  currentUserId,
  canManageMembers,
}: BoardSettingsDialogProps) {
  const baseId = useId()
  const searchId = `${baseId}-search`
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    if (!open) {
      setSearchInput('')
      setDebouncedSearch('')
    }
  }, [open])

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedSearch(searchInput.trim()), 300)
    return () => window.clearTimeout(t)
  }, [searchInput])

  const membersQuery = useBoardMembersQuery(boardId, open && Boolean(boardId))
  const ownerQuery = useOwnerProfileQuery(ownerId, open && Boolean(ownerId))

  const searchEnabled = open && canManageMembers && debouncedSearch.length >= 2
  const searchQuery = useProfileSearchQuery(debouncedSearch, searchEnabled)

  const addMutation = useAddBoardMemberMutation(boardId || undefined)
  const removeMutation = useRemoveBoardMemberMutation(boardId || undefined)

  const memberIds = useMemo(() => {
    const set = new Set<string>()
    for (const row of membersQuery.data ?? []) set.add(row.user_id)
    return set
  }, [membersQuery.data])

  const searchCandidates = useMemo(() => {
    const rows = searchQuery.data ?? []
    return rows.filter((p) => p.id !== ownerId && !memberIds.has(p.id))
  }, [searchQuery.data, ownerId, memberIds])

  const handleAddMember = async (userId: string) => {
    try {
      await addMutation.mutateAsync(userId)
    } catch {
      /* surfaced via addMutation.isError */
    }
  }

  const handleRemoveMember = async (userId: string) => {
    try {
      await removeMutation.mutateAsync(userId)
    } catch {
      /* surfaced via removeMutation.isError */
    }
  }

  const dialogActive = open && Boolean(boardId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] gap-4 overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg">Настройки доски</DialogTitle>
          <DialogDescription>
            {boardTitle ? (
              <>Доска «{boardTitle}». Управление доступом участников через Supabase.</>
            ) : (
              <>Управление доступом участников через Supabase.</>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-5">
          <section className="flex flex-col gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Владелец
            </h3>
            {ownerQuery.isPending ? (
              <div className="flex items-center gap-2 rounded-lg border border-border/60 px-3 py-2">
                <Loader2 className="size-4 animate-spin text-muted-foreground" aria-hidden />
                <span className="text-sm text-muted-foreground">Загрузка…</span>
              </div>
            ) : ownerQuery.data ? (
              <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/30 px-3 py-2">
                <span
                  className={cn(
                    'flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-xs font-semibold text-white',
                    boardGradientFromId(ownerQuery.data.id),
                  )}
                  aria-hidden
                >
                  {initialsFromDisplay(ownerQuery.data)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {displayLabel(ownerQuery.data)}
                    {ownerQuery.data.id === currentUserId ? (
                      <span className="ml-1.5 text-xs font-normal text-muted-foreground">(вы)</span>
                    ) : null}
                  </p>
                  {ownerQuery.data.email ? (
                    <p className="truncate text-xs text-muted-foreground">{ownerQuery.data.email}</p>
                  ) : null}
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Профиль владельца не найден.</p>
            )}
          </section>

          <section className="flex flex-col gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Участники
            </h3>
            {membersQuery.isPending ? (
              <div className="flex items-center gap-2 py-2">
                <Loader2 className="size-4 animate-spin text-muted-foreground" aria-hidden />
                <span className="text-sm text-muted-foreground">Загрузка списка…</span>
              </div>
            ) : membersQuery.isError ? (
              <p className="text-xs text-destructive">
                {membersQuery.error instanceof Error
                  ? membersQuery.error.message
                  : 'Не удалось загрузить участников'}
              </p>
            ) : (membersQuery.data ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Пока нет приглашённых участников{canManageMembers ? '. Найдите пользователя ниже.' : '.'}
              </p>
            ) : (
              <ul
                className="flex max-h-40 flex-col gap-1 overflow-y-auto rounded-xl border border-border/60 bg-muted/30 p-1"
                aria-label="Участники доски"
              >
                {(membersQuery.data ?? []).map((row) => {
                  const p = row.profiles
                  const label = p ? displayLabel(p) : row.user_id
                  const email = p?.email ?? null
                  const gid = row.user_id
                  return (
                    <li
                      key={row.user_id}
                      className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-muted"
                    >
                      {p ? (
                        <span
                          className={cn(
                            'flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-[10px] font-semibold text-white',
                            boardGradientFromId(gid),
                          )}
                          aria-hidden
                        >
                          {initialsFromDisplay(p)}
                        </span>
                      ) : (
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-medium">
                          ?
                        </span>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{label}</p>
                        {email ? <p className="truncate text-xs text-muted-foreground">{email}</p> : null}
                      </div>
                      {canManageMembers ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="shrink-0 text-muted-foreground hover:text-destructive"
                          aria-label={`Убрать доступ для ${label}`}
                          disabled={removeMutation.isPending}
                          onClick={() => void handleRemoveMember(row.user_id)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      ) : null}
                    </li>
                  )
                })}
              </ul>
            )}
            {removeMutation.isError && (
              <p className="text-xs text-destructive">
                {removeMutation.error instanceof Error
                  ? removeMutation.error.message
                  : 'Не удалось удалить участника'}
              </p>
            )}
          </section>

          {canManageMembers ? (
            <section className="flex flex-col gap-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Добавить участника
              </h3>
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
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Имя или email (от 2 символов)…"
                  autoComplete="off"
                  className="pl-8"
                  disabled={!dialogActive}
                />
              </div>

              {(addMutation.isError || searchQuery.isError) && (
                <p className="text-xs text-destructive">
                  {addMutation.error instanceof Error
                    ? addMutation.error.message
                    : searchQuery.error instanceof Error
                      ? searchQuery.error.message
                      : 'Ошибка запроса'}
                </p>
              )}

              <div
                className="flex flex-col gap-1 overflow-y-auto rounded-xl border border-border/60 bg-muted/30 p-1 max-h-[min(40vh,14rem)]"
                role="list"
              >
                {debouncedSearch.length > 0 && debouncedSearch.length < 2 ? (
                  <p className="px-3 py-4 text-center text-sm text-muted-foreground">
                    Введите минимум 2 символа для поиска по всем профилям.
                  </p>
                ) : searchQuery.isPending ? (
                  <div className="flex items-center justify-center gap-2 py-6">
                    <Loader2 className="size-4 animate-spin text-muted-foreground" aria-hidden />
                    <span className="text-sm text-muted-foreground">Поиск…</span>
                  </div>
                ) : searchCandidates.length === 0 ? (
                  <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                    {debouncedSearch.length >= 2 ? 'Никого не найдено' : 'Начните вводить запрос'}
                  </p>
                ) : (
                  searchCandidates.map((profile) => (
                    <button
                      key={profile.id}
                      type="button"
                      role="listitem"
                      disabled={addMutation.isPending}
                      onClick={() => void handleAddMember(profile.id)}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-60"
                    >
                      <span
                        className={cn(
                          'flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-xs font-semibold text-white',
                          boardGradientFromId(profile.id),
                        )}
                        aria-hidden
                      >
                        {initialsFromDisplay(profile)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">
                          {displayLabel(profile)}
                        </p>
                        {profile.email ? (
                          <p className="truncate text-xs text-muted-foreground">{profile.email}</p>
                        ) : null}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </section>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}
