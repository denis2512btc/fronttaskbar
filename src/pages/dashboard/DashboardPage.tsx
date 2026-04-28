import { Link } from 'react-router-dom'
import { Plus, Star, Users, KanbanSquare, MoreHorizontal, TrendingUp } from 'lucide-react'
import { PageContainer } from '@/components/shared/PageContainer'

const BOARDS = [
  {
    id: '1',
    title: 'Product Roadmap',
    description: 'Планирование и трекинг фич продукта',
    taskCount: 24,
    memberCount: 5,
    progress: 68,
    color: 'from-indigo-500 to-violet-600',
    starred: true,
  },
  {
    id: '2',
    title: 'Frontend Sprint',
    description: 'Текущий спринт команды фронтенда',
    taskCount: 12,
    memberCount: 3,
    progress: 42,
    color: 'from-blue-500 to-indigo-600',
    starred: false,
  },
  {
    id: '3',
    title: 'Marketing Q2',
    description: 'Кампании и контент на второй квартал',
    taskCount: 31,
    memberCount: 4,
    progress: 85,
    color: 'from-violet-500 to-purple-600',
    starred: false,
  },
  {
    id: '4',
    title: 'Bug Tracker',
    description: 'Баги и задачи на исправление',
    taskCount: 8,
    memberCount: 6,
    progress: 20,
    color: 'from-rose-500 to-pink-600',
    starred: true,
  },
  {
    id: '5',
    title: 'Design System',
    description: 'Компоненты и токены дизайна',
    taskCount: 19,
    memberCount: 2,
    progress: 55,
    color: 'from-emerald-500 to-teal-600',
    starred: false,
  },
]

const STATS = [
  { label: 'Активных задач', value: '94', icon: KanbanSquare, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40' },
  { label: 'Выполнено сегодня', value: '12', icon: TrendingUp, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40' },
  { label: 'Участников', value: '8', icon: Users, color: 'text-violet-600 bg-violet-50 dark:bg-violet-950/40' },
]

export function DashboardPage() {
  return (
    <PageContainer>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Мои доски</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Все ваши проекты в одном месте</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-indigo-500/20 transition-all hover:opacity-90 active:scale-95">
          <Plus className="size-4" />
          Новая доска
        </button>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {STATS.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="flex items-center gap-4 rounded-xl border border-border/60 bg-card p-4 shadow-sm"
          >
            <div className={`flex size-10 items-center justify-center rounded-xl ${color}`}>
              <Icon className="size-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Boards grid */}
      <div className="mt-8">
        <h2 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Все доски
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {BOARDS.map((board) => (
            <Link
              key={board.id}
              to={`/board/${board.id}`}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
            >
              {/* Color bar */}
              <div className={`h-1.5 w-full bg-gradient-to-r ${board.color}`} />

              <div className="flex flex-1 flex-col p-5">
                {/* Title row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className={`flex size-8 items-center justify-center rounded-lg bg-gradient-to-br ${board.color}`}>
                      <KanbanSquare className="size-4 text-white" />
                    </div>
                    <h3 className="font-semibold text-foreground">{board.title}</h3>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={(e) => e.preventDefault()}
                      className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
                    >
                      <Star
                        className={`size-3.5 ${board.starred ? 'fill-amber-400 text-amber-400' : ''}`}
                      />
                    </button>
                    <button
                      onClick={(e) => e.preventDefault()}
                      className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
                    >
                      <MoreHorizontal className="size-3.5" />
                    </button>
                  </div>
                </div>

                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{board.description}</p>

                {/* Progress */}
                <div className="mt-4">
                  <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                    <span>Прогресс</span>
                    <span>{board.progress}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${board.color} transition-all`}
                      style={{ width: `${board.progress}%` }}
                    />
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <KanbanSquare className="size-3.5" />
                    {board.taskCount} задач
                  </div>
                  <div className="flex -space-x-1.5">
                    {Array.from({ length: Math.min(board.memberCount, 3) }).map((_, i) => (
                      <span
                        key={i}
                        className={`flex size-6 items-center justify-center rounded-full border-2 border-card bg-gradient-to-br ${board.color} text-[9px] font-bold text-white`}
                      >
                        {String.fromCharCode(65 + i)}
                      </span>
                    ))}
                    {board.memberCount > 3 && (
                      <span className="flex size-6 items-center justify-center rounded-full border-2 border-card bg-muted text-[9px] font-medium text-muted-foreground">
                        +{board.memberCount - 3}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}

          {/* Create new board card */}
          <button className="flex min-h-[180px] items-center justify-center rounded-2xl border border-dashed border-border/80 bg-muted/20 text-muted-foreground transition-colors hover:border-indigo-400 hover:bg-indigo-50/40 hover:text-indigo-600 dark:hover:bg-indigo-950/20">
            <div className="flex flex-col items-center gap-2">
              <div className="flex size-10 items-center justify-center rounded-xl border-2 border-dashed border-current">
                <Plus className="size-5" />
              </div>
              <span className="text-sm font-medium">Создать доску</span>
            </div>
          </button>
        </div>
      </div>
    </PageContainer>
  )
}
