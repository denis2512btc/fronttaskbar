import { Plus, Users, KanbanSquare, TrendingUp } from 'lucide-react'
import { PageContainer } from '@/components/shared/PageContainer'
import { useAuthSession } from '@/features/auth/hooks/use-auth-session'
import { useUIStore } from '@/stores/ui.store'

const STATS = [
  { label: 'Активных задач', value: '94', icon: KanbanSquare, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40' },
  { label: 'Выполнено сегодня', value: '12', icon: TrendingUp, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40' },
  { label: 'Участников', value: '8', icon: Users, color: 'text-violet-600 bg-violet-50 dark:bg-violet-950/40' },
]

export function DashboardPage() {
  const openCreateBoardDialog = useUIStore((s) => s.openCreateBoardDialog)
  const { user } = useAuthSession()

  return (
    <PageContainer>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Обзор</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Доски — в левой панели навигации
          </p>
        </div>
        {user ? (
          <button
            type="button"
            onClick={openCreateBoardDialog}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-indigo-500/20 transition-all hover:opacity-90 active:scale-95"
          >
            <Plus className="size-4" />
            Новая доска
          </button>
        ) : null}
      </div>

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
    </PageContainer>
  )
}
