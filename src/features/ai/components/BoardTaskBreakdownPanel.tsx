import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown, Loader2, Send, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { isSupabaseConfigured } from '@/lib/supabase/client'
import { requestTaskBreakdown, getTaskBreakdownApiUrl } from '@/features/ai/api/task-breakdown'
import { useCreateBoardTasksBatchMutation } from '@/features/boards/hooks/use-board-kanban-queries'

export interface BoardTaskBreakdownPanelProps {
  boardId: string
  columns: { id: string; title: string; position: number }[]
}

export function BoardTaskBreakdownPanel({ boardId, columns }: BoardTaskBreakdownPanelProps) {
  const { t } = useTranslation()
  const [expanded, setExpanded] = useState(true)
  const [taskText, setTaskText] = useState('')
  const [pickedColumnId, setPickedColumnId] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [successCount, setSuccessCount] = useState<number | null>(null)
  const [phase, setPhase] = useState<'idle' | 'api' | 'db'>('idle')

  const sortedColumns = useMemo(
    () => [...columns].sort((a, b) => a.position - b.position || a.title.localeCompare(b.title)),
    [columns],
  )

  const effectiveColumnId = useMemo(() => {
    if (sortedColumns.length === 0) return ''
    if (pickedColumnId && sortedColumns.some((c) => c.id === pickedColumnId)) {
      return pickedColumnId
    }
    return sortedColumns[0].id
  }, [sortedColumns, pickedColumnId])

  const batchMutation = useCreateBoardTasksBatchMutation(boardId)
  const apiConfigured = Boolean(getTaskBreakdownApiUrl())
  const hasColumns = sortedColumns.length > 0

  useEffect(() => {
    if (successCount === null) return
    const tmr = window.setTimeout(() => setSuccessCount(null), 5000)
    return () => window.clearTimeout(tmr)
  }, [successCount])

  const canSubmit =
    hasColumns &&
    isSupabaseConfigured &&
    apiConfigured &&
    Boolean(effectiveColumnId) &&
    taskText.trim().length > 0 &&
    phase === 'idle'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    setError(null)
    setSuccessCount(null)
    try {
      setPhase('api')
      const items = await requestTaskBreakdown(taskText)
      setPhase('db')
      await batchMutation.mutateAsync({
        columnId: effectiveColumnId,
        items,
        assigneeId: null,
      })
      setSuccessCount(items.length)
      setTaskText('')
    } catch (err) {
      setError(err instanceof Error ? err.message : t('board.saveCardError'))
    } finally {
      setPhase('idle')
    }
  }

  if (!expanded) {
    return (
      <div className="pointer-events-none fixed bottom-6 right-6 z-[200] flex justify-end p-0">
        <Button
          type="button"
          size="icon"
          variant="default"
          onClick={() => setExpanded(true)}
          className={cn(
            'pointer-events-auto size-12 rounded-full border border-indigo-400/40 bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-500 hover:to-violet-500',
          )}
          aria-label={t('board.taskBreakdownToggleExpand')}
        >
          <Sparkles className="size-5" aria-hidden />
        </Button>
      </div>
    )
  }

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-[200] w-[min(100vw-2rem,22rem)] p-0">
      <div
        className={cn(
          'pointer-events-auto rounded-xl border border-indigo-500/25 bg-card/95 p-4 shadow-lg shadow-indigo-500/10 backdrop-blur-md dark:border-violet-500/20 dark:shadow-violet-500/10',
        )}
      >
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-sm">
              <Sparkles className="size-4" aria-hidden />
            </span>
            {t('board.taskBreakdownTitle')}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="shrink-0 text-muted-foreground"
            onClick={() => setExpanded(false)}
            aria-label={t('board.taskBreakdownToggleCollapse')}
          >
            <ChevronDown className="size-4" aria-hidden />
          </Button>
        </div>

        {!isSupabaseConfigured && (
          <p className="mb-2 text-xs text-destructive">{t('errors.supabaseNotConfigured')}</p>
        )}
        {isSupabaseConfigured && !apiConfigured && (
          <p className="mb-2 text-xs text-destructive">{t('errors.taskBreakdownApiNotConfigured')}</p>
        )}
        {!hasColumns && isSupabaseConfigured && (
          <p className="mb-2 text-xs text-muted-foreground">{t('board.taskBreakdownNeedColumn')}</p>
        )}

        {hasColumns && (
          <div className="mb-3">
            <Label htmlFor="task-breakdown-column" className="mb-1.5 block text-xs text-muted-foreground">
              {t('board.taskBreakdownColumnLabel')}
            </Label>
            <select
              id="task-breakdown-column"
              value={effectiveColumnId}
              onChange={(ev) => setPickedColumnId(ev.target.value)}
              disabled={phase !== 'idle'}
              className="h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 dark:bg-input/30"
            >
              {sortedColumns.map((col) => (
                <option key={col.id} value={col.id}>
                  {col.title}
                </option>
              ))}
            </select>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label htmlFor="task-breakdown-input" className="sr-only">
              {t('board.taskBreakdownPlaceholder')}
            </label>
            <textarea
              id="task-breakdown-input"
              value={taskText}
              onChange={(ev) => setTaskText(ev.target.value)}
              placeholder={t('board.taskBreakdownPlaceholder')}
              disabled={phase !== 'idle' || !hasColumns}
              rows={4}
              className="w-full resize-y rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 dark:bg-input/30 md:text-sm"
            />
          </div>

          {error && (
            <p className="text-xs text-destructive" role="alert">
              {error}
            </p>
          )}
          {successCount !== null && (
            <p className="text-xs text-emerald-600 dark:text-emerald-400">
              {t('board.taskBreakdownSuccess', { count: successCount })}
            </p>
          )}

          <Button type="submit" disabled={!canSubmit} className="w-full gap-2">
            {phase === 'idle' ?
              <>
                <Send className="size-3.5 opacity-80" aria-hidden />
                {t('board.taskBreakdownSubmit')}
              </>
            : <>
                <Loader2 className="size-3.5 animate-spin" aria-hidden />
                {phase === 'api' ? t('board.taskBreakdownSending') : t('board.taskBreakdownSaving')}
              </>
            }
          </Button>
        </form>
      </div>
    </div>
  )
}
