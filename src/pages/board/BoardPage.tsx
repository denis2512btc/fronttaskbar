import { useState } from 'react'
import { Loader2, Plus, MoreHorizontal, ChevronLeft } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useAuthSession } from '@/features/auth/hooks/use-auth-session'
import { useBoardQuery } from '@/features/boards/hooks/use-boards-queries'
import { isSupabaseConfigured } from '@/lib/supabase/client'
import { ColumnEditorDialog } from '@/features/columns/components/ColumnEditorDialog'
import type { ColumnColorPreset } from '@/features/columns/constants/column-color-presets'
import type { ColumnEditorFormInput } from '@/features/columns/validations/column-editor'
import { TaskCreateDialog, type TaskCardDraft } from '@/features/tasks/components/TaskCreateDialog'
import { MOCK_BOARD_ASSIGNEES } from '@/features/tasks/constants/mock-assignees'
import { TASK_CARD_LEFT_BORDER } from '@/features/tasks/constants/task-card-accent'

interface Task {
  id: string
  title: string
  description: string
  color: ColumnColorPreset
  assigneeId: string | null
}

interface Column {
  id: string
  title: string
  color: ColumnColorPreset
  tasks: Task[]
}

function TaskCard({ task }: { task: Task }) {
  const assignee = task.assigneeId
    ? MOCK_BOARD_ASSIGNEES.find((a) => a.id === task.assigneeId)
    : undefined
  const leftBorder = TASK_CARD_LEFT_BORDER[task.color]

  return (
    <div
      className={cn(
        'group rounded-xl border border-border/60 border-l-4 bg-card p-3.5 pl-3 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md cursor-pointer',
        leftBorder,
      )}
    >
      <p className="text-sm font-medium leading-snug text-foreground">{task.title}</p>
      {task.description.length > 0 && (
        <p className="mt-2 line-clamp-4 text-xs leading-relaxed text-muted-foreground">
          {task.description}
        </p>
      )}
      <div className="mt-3 flex items-center justify-end gap-2">
        {assignee ? (
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'flex size-6 shrink-0 items-center justify-center rounded-full border border-card text-[9px] font-bold text-white',
                assignee.avatarClass,
              )}
              title={assignee.displayName}
            >
              {assignee.initials}
            </span>
            <span className="max-w-[120px] truncate text-[11px] text-muted-foreground">
              {assignee.displayName}
            </span>
          </div>
        ) : (
          <span className="text-[11px] text-muted-foreground">Без ответственного</span>
        )}
      </div>
    </div>
  )
}

function BoardKanbanDemo({ boardTitle }: { boardTitle: string }) {
  const [columns, setColumns] = useState<Column[]>([])
  const [columnEditorOpen, setColumnEditorOpen] = useState(false)
  const [columnEditorMode, setColumnEditorMode] = useState<'create' | 'edit'>('create')
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null)

  const [taskCreateOpen, setTaskCreateOpen] = useState(false)
  const [taskCreateColumnId, setTaskCreateColumnId] = useState<string | null>(null)

  const editingColumn = editingColumnId ? columns.find((c) => c.id === editingColumnId) : undefined

  const openCreateColumn = () => {
    setColumnEditorMode('create')
    setEditingColumnId(null)
    setColumnEditorOpen(true)
  }

  const openEditColumn = (columnId: string) => {
    setColumnEditorMode('edit')
    setEditingColumnId(columnId)
    setColumnEditorOpen(true)
  }

  const openTaskCreate = (columnId: string) => {
    setTaskCreateColumnId(columnId)
    setTaskCreateOpen(true)
  }

  const handleColumnEditorSubmit = (data: ColumnEditorFormInput) => {
    const title = data.title.trim()
    if (columnEditorMode === 'create') {
      setColumns((prev) => [
        ...prev,
        { id: crypto.randomUUID(), title, color: data.color, tasks: [] },
      ])
      return
    }
    if (!editingColumnId) return
    setColumns((prev) =>
      prev.map((c) =>
        c.id === editingColumnId ? { ...c, title, color: data.color } : c,
      ),
    )
  }

  const handleTaskCreateSubmit = (data: TaskCardDraft) => {
    if (!taskCreateColumnId) return
    const task: Task = {
      id: crypto.randomUUID(),
      title: data.title,
      description: data.description,
      color: data.color,
      assigneeId: data.assigneeId,
    }
    setColumns((prev) =>
      prev.map((c) =>
        c.id === taskCreateColumnId ? { ...c, tasks: [...c.tasks, task] } : c,
      ),
    )
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Board header */}
      <div className="flex items-center justify-between border-b border-border/60 px-6 py-3">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronLeft className="size-4" />
            Доски
          </Link>
          <span className="text-muted-foreground/40">/</span>
          <h1 className="text-sm font-semibold">{boardTitle}</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex -space-x-1.5">
            {MOCK_BOARD_ASSIGNEES.slice(0, 3).map((u) => (
              <span
                key={u.id}
                title={u.displayName}
                className={cn(
                  'flex size-7 items-center justify-center rounded-full border-2 border-background text-[10px] font-bold text-white',
                  u.avatarClass,
                )}
              >
                {u.initials}
              </span>
            ))}
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted"
          >
            <Plus className="size-3.5" />
            Участник
          </button>
          <button
            type="button"
            className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted"
          >
            <MoreHorizontal className="size-4" />
          </button>
        </div>
      </div>

      {/* Columns */}
      <div className="flex flex-1 gap-4 overflow-x-auto p-6">
        {columns.map((col) => (
          <div key={col.id} className="group flex w-72 shrink-0 flex-col gap-3">
            {/* Column header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={cn('size-2.5 rounded-full', col.color)} />
                <span className="text-sm font-semibold">{col.title}</span>
                <span className="flex size-5 items-center justify-center rounded-md bg-muted text-[11px] font-medium text-muted-foreground">
                  {col.tasks.length}
                </span>
              </div>
              <button
                type="button"
                aria-label="Редактировать колонку"
                onClick={() => openEditColumn(col.id)}
                className="flex size-6 items-center justify-center rounded-md text-muted-foreground opacity-0 transition hover:bg-muted group-hover:opacity-100 hover:opacity-100"
              >
                <MoreHorizontal className="size-3.5" />
              </button>
            </div>

            {/* Tasks */}
            <div className="flex flex-col gap-2.5">
              {col.tasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>

            <button
              type="button"
              onClick={() => openTaskCreate(col.id)}
              className="flex items-center gap-2 rounded-xl border border-dashed border-border/60 px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:border-indigo-400 hover:bg-indigo-50/40 hover:text-indigo-600 dark:hover:bg-indigo-950/20 dark:hover:text-indigo-400"
            >
              <Plus className="size-4" />
              Создать карточку
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={openCreateColumn}
          className="flex h-fit w-72 shrink-0 items-center gap-2 rounded-xl border border-dashed border-border/60 px-4 py-3 text-sm text-muted-foreground transition-colors hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400"
        >
          <Plus className="size-4" />
          Добавить колонку
        </button>
      </div>

      <ColumnEditorDialog
        open={columnEditorOpen}
        onOpenChange={setColumnEditorOpen}
        mode={columnEditorMode}
        initial={
          columnEditorMode === 'edit' && editingColumn
            ? { title: editingColumn.title, color: editingColumn.color }
            : undefined
        }
        onSubmit={handleColumnEditorSubmit}
      />

      <TaskCreateDialog
        open={taskCreateOpen}
        onOpenChange={(open) => {
          setTaskCreateOpen(open)
          if (!open) setTaskCreateColumnId(null)
        }}
        onSubmit={handleTaskCreateSubmit}
      />
    </div>
  )
}

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

  return <BoardKanbanDemo boardTitle={boardQuery.data.title} />
}
