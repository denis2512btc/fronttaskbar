import { Loader2, Plus, MoreHorizontal, Zap, ChevronLeft } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useAuthSession } from '@/features/auth/hooks/use-auth-session'
import { useBoardQuery } from '@/features/boards/hooks/use-boards-queries'
import { isSupabaseConfigured } from '@/lib/supabase/client'

type Priority = 'low' | 'medium' | 'high' | 'urgent'

interface Task {
  id: string
  title: string
  tags: string[]
  priority: Priority
  avatars: number
  subtasks?: { done: number; total: number }
}

interface Column {
  id: string
  title: string
  color: string
  tasks: Task[]
}

const PRIORITY_COLORS: Record<Priority, string> = {
  low: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
  high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400',
  urgent: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
}

const PRIORITY_LABELS: Record<Priority, string> = {
  low: 'Низкий',
  medium: 'Средний',
  high: 'Высокий',
  urgent: 'Срочно',
}

const TAG_COLORS: Record<string, string> = {
  Design: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
  Frontend: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  AI: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
  DevOps: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  Backend: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300',
  QA: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
}

const COLUMNS: Column[] = [
  {
    id: 'todo',
    title: 'К выполнению',
    color: 'bg-slate-400',
    tasks: [
      { id: 't1', title: 'Проработать дизайн онбординга', tags: ['Design'], priority: 'medium', avatars: 1 },
      { id: 't2', title: 'Написать unit-тесты для API', tags: ['Backend', 'QA'], priority: 'high', avatars: 2, subtasks: { done: 0, total: 5 } },
      { id: 't3', title: 'Настроить CI/CD pipeline', tags: ['DevOps'], priority: 'low', avatars: 1 },
    ],
  },
  {
    id: 'in-progress',
    title: 'В работе',
    color: 'bg-indigo-500',
    tasks: [
      { id: 't4', title: 'Собрать секции лендинга', tags: ['Frontend', 'Design'], priority: 'high', avatars: 2, subtasks: { done: 3, total: 6 } },
      { id: 't5', title: 'Интегрировать AI-разбивку задач', tags: ['AI', 'Backend'], priority: 'urgent', avatars: 1, subtasks: { done: 1, total: 4 } },
    ],
  },
  {
    id: 'review',
    title: 'Ревью',
    color: 'bg-amber-400',
    tasks: [
      { id: 't6', title: 'Ревью дизайн-системы', tags: ['Design'], priority: 'medium', avatars: 3 },
    ],
  },
  {
    id: 'done',
    title: 'Готово',
    color: 'bg-emerald-500',
    tasks: [
      { id: 't7', title: 'Настроить Supabase Auth', tags: ['Backend'], priority: 'high', avatars: 1, subtasks: { done: 4, total: 4 } },
      { id: 't8', title: 'Telegram-бот уведомления', tags: ['Backend', 'DevOps'], priority: 'medium', avatars: 2 },
    ],
  },
]

function TaskCard({ task }: { task: Task }) {
  return (
    <div className="group rounded-xl border border-border/60 bg-card p-3.5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 cursor-pointer">
      {/* Tags */}
      {task.tags.length > 0 && (
        <div className="mb-2.5 flex flex-wrap gap-1">
          {task.tags.map((tag) => (
            <span
              key={tag}
              className={cn(
                'rounded-md px-1.5 py-0.5 text-[10px] font-semibold',
                TAG_COLORS[tag] ?? 'bg-muted text-muted-foreground',
              )}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Title */}
      <p className="text-sm font-medium leading-snug text-foreground">{task.title}</p>

      {/* Subtasks progress */}
      {task.subtasks && (
        <div className="mt-2.5">
          <div className="mb-1 flex items-center justify-between text-[10px] text-muted-foreground">
            <span>Подзадачи</span>
            <span>{task.subtasks.done}/{task.subtasks.total}</span>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-indigo-500 transition-all"
              style={{ width: `${(task.subtasks.done / task.subtasks.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between">
        <span className={cn('rounded-md px-1.5 py-0.5 text-[10px] font-medium', PRIORITY_COLORS[task.priority])}>
          {PRIORITY_LABELS[task.priority]}
        </span>
        <div className="flex items-center gap-1.5">
          <button
            className="hidden items-center gap-1 rounded-lg px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground hover:bg-muted group-hover:flex"
            title="AI-разбивка"
          >
            <Zap className="size-3 text-indigo-500" />
            AI
          </button>
          <div className="flex -space-x-1.5">
            {Array.from({ length: Math.min(task.avatars, 3) }).map((_, i) => (
              <span
                key={i}
                className="flex size-5 items-center justify-center rounded-full border border-card bg-gradient-to-br from-indigo-400 to-violet-500 text-[8px] font-bold text-white"
              >
                {String.fromCharCode(65 + i)}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function BoardKanbanDemo({ boardTitle }: { boardTitle: string }) {
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
            {['from-indigo-400 to-violet-500', 'from-blue-400 to-indigo-500', 'from-violet-400 to-purple-500'].map((g, i) => (
              <span
                key={i}
                className={`flex size-7 items-center justify-center rounded-full border-2 border-background bg-gradient-to-br ${g} text-[10px] font-bold text-white`}
              >
                {String.fromCharCode(65 + i)}
              </span>
            ))}
          </div>
          <button className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted">
            <Plus className="size-3.5" />
            Участник
          </button>
          <button className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted">
            <MoreHorizontal className="size-4" />
          </button>
        </div>
      </div>

      {/* Columns */}
      <div className="flex flex-1 gap-4 overflow-x-auto p-6">
        {COLUMNS.map((col) => (
          <div key={col.id} className="flex w-72 shrink-0 flex-col gap-3">
            {/* Column header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={cn('size-2.5 rounded-full', col.color)} />
                <span className="text-sm font-semibold">{col.title}</span>
                <span className="flex size-5 items-center justify-center rounded-md bg-muted text-[11px] font-medium text-muted-foreground">
                  {col.tasks.length}
                </span>
              </div>
              <button className="flex size-6 items-center justify-center rounded-md text-muted-foreground opacity-0 transition hover:bg-muted group-hover:opacity-100 hover:opacity-100">
                <MoreHorizontal className="size-3.5" />
              </button>
            </div>

            {/* Tasks */}
            <div className="flex flex-col gap-2.5">
              {col.tasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>

            {/* Add task */}
            <button className="flex items-center gap-2 rounded-xl border border-dashed border-border/60 px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:border-indigo-400 hover:bg-indigo-50/40 hover:text-indigo-600 dark:hover:bg-indigo-950/20">
              <Plus className="size-4" />
              Добавить задачу
            </button>
          </div>
        ))}

        {/* Add column */}
        <button className="flex h-fit w-72 shrink-0 items-center gap-2 rounded-xl border border-dashed border-border/60 px-4 py-3 text-sm text-muted-foreground transition-colors hover:border-indigo-400 hover:text-indigo-600">
          <Plus className="size-4" />
          Добавить колонку
        </button>
      </div>
    </div>
  )
}

export function BoardPage() {
  const { boardId } = useParams<{ boardId: string }>()
  const { user, loading } = useAuthSession()
  const boardQuery = useBoardQuery(user?.id, boardId)

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
