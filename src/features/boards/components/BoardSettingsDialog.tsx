import { useEffect, useId, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
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
import { DeleteBoardConfirmDialog } from '@/features/boards/components/DeleteBoardConfirmDialog'
import {
  useAddBoardMemberMutation,
  useBoardMembersQuery,
  useOwnerProfileQuery,
  useProfileSearchQuery,
  useRemoveBoardMemberMutation,
} from '@/features/boards/hooks/use-boards-queries'
import type { TFunction } from 'i18next'

function displayLabel(
  profile: { display_name: string | null; email: string | null },
  t: TFunction,
): string {
  return profile.display_name?.trim() || profile.email?.trim() || t('board.roleUser')
}

function initialsFromDisplay(profile: { display_name: string | null; email: string | null }, t: TFunction): string {
  const base = displayLabel(profile, t)
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
  const { t } = useTranslation()
  const baseId = useId()
  const searchId = `${baseId}-search`
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)

  const handleDialogOpenChange = (next: boolean) => {
    if (!next) {
      setSearchInput('')
      setDebouncedSearch('')
      setDeleteConfirmOpen(false)
    }
    onOpenChange(next)
  }

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(searchInput.trim()), 300)
    return () => window.clearTimeout(timer)
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
    <>
      <Dialog open={open} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="max-h-[90vh] gap-4 overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg">{t('boardSettings.title')}</DialogTitle>
          <DialogDescription>
            {boardTitle ?
              t('boardSettings.descWithTitle', { title: boardTitle })
            : t('boardSettings.descNoTitle')}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-5">
          <section className="flex flex-col gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t('boardSettings.owner')}
            </h3>
            {ownerQuery.isPending ? (
              <div className="flex items-center gap-2 rounded-lg border border-border/60 px-3 py-2">
                <Loader2 className="size-4 animate-spin text-muted-foreground" aria-hidden />
                <span className="text-sm text-muted-foreground">{t('boardSettings.ownerLoading')}</span>
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
                  {initialsFromDisplay(ownerQuery.data, t)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {displayLabel(ownerQuery.data, t)}
                    {ownerQuery.data.id === currentUserId ? (
                      <span className="ml-1.5 text-xs font-normal text-muted-foreground">{t('common.you')}</span>
                    ) : null}
                  </p>
                  {ownerQuery.data.email ? (
                    <p className="truncate text-xs text-muted-foreground">{ownerQuery.data.email}</p>
                  ) : null}
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">{t('boardSettings.ownerNotFound')}</p>
            )}
          </section>

          <section className="flex flex-col gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t('boardSettings.members')}
            </h3>
            {membersQuery.isPending ? (
              <div className="flex items-center gap-2 py-2">
                <Loader2 className="size-4 animate-spin text-muted-foreground" aria-hidden />
                <span className="text-sm text-muted-foreground">{t('boardSettings.membersLoading')}</span>
              </div>
            ) : membersQuery.isError ? (
              <p className="text-xs text-destructive">
                {membersQuery.error instanceof Error
                  ? membersQuery.error.message
                  : t('boardSettings.membersLoadError')}
              </p>
            ) : (membersQuery.data ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {canManageMembers
                  ? `${t('boardSettings.noMembers')}${t('boardSettings.noMembersHint')}`
                  : `${t('boardSettings.noMembers')}.`}
              </p>
            ) : (
              <ul
                className="flex max-h-40 flex-col gap-1 overflow-y-auto rounded-xl border border-border/60 bg-muted/30 p-1"
                aria-label={t('boardSettings.membersAria')}
              >
                {(membersQuery.data ?? []).map((row) => {
                  const p = row.profiles
                  const label = p ? displayLabel(p, t) : row.user_id
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
                          {initialsFromDisplay(p, t)}
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
                          aria-label={t('boardSettings.removeAccessFor', { name: label })}
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
                  : t('boardSettings.removeMemberError')}
              </p>
            )}
          </section>

          {canManageMembers ? (
            <section className="flex flex-col gap-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t('boardSettings.addMember')}
              </h3>
              <label htmlFor={searchId} className="sr-only">
                {t('boardSettings.searchUsers')}
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
                  placeholder={t('boardSettings.searchPlaceholder')}
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
                      : t('boardSettings.queryError')}
                </p>
              )}

              <div
                className="flex flex-col gap-1 overflow-y-auto rounded-xl border border-border/60 bg-muted/30 p-1 max-h-[min(40vh,14rem)]"
                role="list"
              >
                {debouncedSearch.length > 0 && debouncedSearch.length < 2 ? (
                  <p className="px-3 py-4 text-center text-sm text-muted-foreground">
                    {t('boardSettings.searchMinChars')}
                  </p>
                ) : searchQuery.isPending ? (
                  <div className="flex items-center justify-center gap-2 py-6">
                    <Loader2 className="size-4 animate-spin text-muted-foreground" aria-hidden />
                    <span className="text-sm text-muted-foreground">{t('common.search')}</span>
                  </div>
                ) : searchCandidates.length === 0 ? (
                  <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                    {debouncedSearch.length >= 2 ? t('boardSettings.searchEmpty') : t('boardSettings.searchStart')}
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
                        {initialsFromDisplay(profile, t)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">
                          {displayLabel(profile, t)}
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

          {canManageMembers ? (
            <section className="flex flex-col gap-2 rounded-xl border border-destructive/25 bg-destructive/5 p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-destructive">
                {t('boardSettings.dangerZone')}
              </h3>
              <p className="text-xs text-muted-foreground">
                {t('boardSettings.dangerDesc')}
              </p>
              <Button
                type="button"
                variant="destructive"
                className="w-full sm:w-auto"
                onClick={() => setDeleteConfirmOpen(true)}
              >
                {t('boardSettings.deleteBoard')}
              </Button>
            </section>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>

      <DeleteBoardConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        boardId={boardId}
        boardTitle={boardTitle}
        onDeleted={() => onOpenChange(false)}
      />
    </>
  )
}
