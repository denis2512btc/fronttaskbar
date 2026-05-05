import { useState } from 'react'
import { KanbanSquare, Settings, Trash2 } from 'lucide-react'
import { Link, matchPath, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useAuthSession } from '@/features/auth/hooks/use-auth-session'
import { BoardSettingsDialog } from '@/features/boards/components/BoardSettingsDialog'
import { DeleteBoardConfirmDialog } from '@/features/boards/components/DeleteBoardConfirmDialog'
import { useBoardsQuery } from '@/features/boards/hooks/use-boards-queries'
import { boardGradientFromId } from '@/features/boards/utils/board-accent'
import { isSupabaseConfigured } from '@/lib/supabase/client'

export function BoardsSidebarList() {
  const { pathname } = useLocation()
  const { user } = useAuthSession()
  const boardMatch = matchPath({ path: '/board/:boardId', end: true }, pathname)
  const activeBoardId = boardMatch?.params.boardId

  const { data: boards, isLoading, isError, error } = useBoardsQuery(user?.id)
  const [settingsTarget, setSettingsTarget] = useState<{
    boardId: string
    boardTitle: string
    ownerId: string
  } | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{
    boardId: string
    boardTitle: string
  } | null>(null)

  if (!isSupabaseConfigured) {
    return (
      <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-2 py-1.5 text-xs text-amber-900 dark:text-amber-200">
        Укажите ключи Supabase в .env, чтобы загрузить доски.
      </p>
    )
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 px-0.5 py-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-9 animate-pulse rounded-lg bg-muted"
          />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <p className="text-xs text-destructive">
        {error instanceof Error ? error.message : 'Не удалось загрузить доски'}
      </p>
    )
  }

  if (!boards?.length) {
    return (
      <p className="text-xs text-muted-foreground">
        Пока нет досок. Нажмите «Новая доска», чтобы создать первую.
      </p>
    )
  }

  const isOwner = (board: { owner_id: string }) => user?.id === board.owner_id

  return (
    <>
      <BoardSettingsDialog
        open={settingsTarget !== null}
        onOpenChange={(next) => {
          if (!next) setSettingsTarget(null)
        }}
        boardId={settingsTarget?.boardId ?? ''}
        boardTitle={settingsTarget?.boardTitle}
        ownerId={settingsTarget?.ownerId ?? ''}
        currentUserId={user?.id ?? ''}
        canManageMembers={
          settingsTarget !== null && user?.id !== undefined && settingsTarget.ownerId === user.id
        }
      />
      <DeleteBoardConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(next) => {
          if (!next) setDeleteTarget(null)
        }}
        boardId={deleteTarget?.boardId ?? ''}
        boardTitle={deleteTarget?.boardTitle}
        onDeleted={(id) => {
          setSettingsTarget((prev) => (prev?.boardId === id ? null : prev))
        }}
      />
      <div className="flex flex-col gap-0.5">
        {boards.map((board) => {
          const href = `/board/${board.id}`
          const active = activeBoardId === board.id
          const gradient = boardGradientFromId(board.id)
          const showSettings = isOwner(board)
          return (
            <div
              key={board.id}
              className={cn(
                'group/item flex min-h-9 items-center gap-0.5 rounded-lg transition-colors',
                active
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <Link
                to={href}
                className="flex min-w-0 flex-1 items-center gap-2.5 px-3 py-2 text-sm font-medium"
              >
                <span
                  className={cn(
                    'flex size-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br',
                    gradient,
                  )}
                  aria-hidden
                >
                  <KanbanSquare className="size-3.5 text-white" />
                </span>
                <span className="truncate">{board.title}</span>
              </Link>
              {showSettings ? (
                <div className="mr-1 flex shrink-0 items-center gap-0.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setSettingsTarget({
                        boardId: board.id,
                        boardTitle: board.title,
                        ownerId: board.owner_id,
                      })
                    }}
                    className={cn(
                      'flex size-7 shrink-0 items-center justify-center rounded-md transition-colors hover:bg-background/70 hover:text-foreground',
                      active
                        ? 'text-indigo-700 opacity-100 dark:text-indigo-300'
                        : 'text-muted-foreground opacity-70 group-hover/item:opacity-100',
                    )}
                    aria-label={`Настройки доски ${board.title}`}
                  >
                    <Settings className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setDeleteTarget({ boardId: board.id, boardTitle: board.title })
                    }}
                    className={cn(
                      'flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-background/70 hover:text-destructive',
                      active ? 'opacity-100' : 'opacity-70 group-hover/item:opacity-100',
                    )}
                    aria-label={`Удалить доску ${board.title}`}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ) : null}
            </div>
          )
        })}
      </div>
    </>
  )
}
