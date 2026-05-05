import { Loader2 } from 'lucide-react'
import { Navigate, useParams } from 'react-router-dom'
import { useAuthSession } from '@/features/auth/hooks/use-auth-session'
import { useBoardQuery } from '@/features/boards/hooks/use-boards-queries'
import { BoardKanbanView } from '@/features/boards/components/BoardKanbanView'
import { isSupabaseConfigured } from '@/lib/supabase/client'

export function BoardPage() {
  const { boardId } = useParams<{ boardId: string }>()
  const { user, loading } = useAuthSession()
  const boardQuery = useBoardQuery(boardId, user?.id)

  if (!isSupabaseConfigured) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
        <p className="max-w-sm text-sm text-muted-foreground">
          Укажите VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY в .env для загрузки досок из Supabase.
        </p>
      </div>
    )
  }

  if (!loading && !user) {
    return <Navigate to="/auth" replace />
  }

  if (!boardId) {
    return <Navigate to="/" replace />
  }

  if (loading || boardQuery.isPending) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3">
        <Loader2 className="size-8 animate-spin text-indigo-600 dark:text-indigo-400" aria-hidden />
        <p className="text-sm text-muted-foreground">Загрузка доски…</p>
      </div>
    )
  }

  if (boardQuery.isError || boardQuery.data == null) {
    return <Navigate to="/" replace />
  }

  return (
    <BoardKanbanView
      boardId={boardId}
      boardTitle={boardQuery.data.title}
      boardOwnerId={boardQuery.data.owner_id}
    />
  )
}
