import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Loader2, Send, Sparkles } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { isSupabaseConfigured } from '@/lib/supabase/client'
import { requestTaskBreakdown, getTaskBreakdownApiUrl } from '@/features/ai/api/task-breakdown'
import { insertTaskBreakdownPrompt } from '@/features/ai/api/task-breakdown-prompt'
import { useCreateBoardTasksBatchMutation } from '@/features/boards/hooks/use-board-kanban-queries'

export interface BoardTaskBreakdownPanelProps {
  boardId: string
  columns: { id: string; title: string; position: number }[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BoardTaskBreakdownPanel({
  boardId,
  columns,
  open,
  onOpenChange,
}: BoardTaskBreakdownPanelProps) {
  const { t } = useTranslation()
  const [taskText, setTaskText] = useState('')
  const [pickedColumnId, setPickedColumnId] = useState('')
  const [error, setError] = useState<string | null>(null)
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
    const promptText = taskText.trim()
    try {
      setPhase('api')
      const items = await requestTaskBreakdown(promptText)
      setPhase('db')
      const promptId = await insertTaskBreakdownPrompt({ boardId, promptText })
      await batchMutation.mutateAsync({
        columnId: effectiveColumnId,
        items,
        assigneeId: null,
        breakdownPromptId: promptId,
      })
      setTaskText('')
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('board.saveCardError'))
    } finally {
      setPhase('idle')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(90vh,40rem)] overflow-y-auto sm:max-w-2xl sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-left text-lg">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-sm">
              <Sparkles className="size-4" aria-hidden />
            </span>
            {t('board.taskBreakdownTitle')}
          </DialogTitle>
        </DialogHeader>

        {!isSupabaseConfigured && (
          <p className="text-xs text-destructive">{t('errors.supabaseNotConfigured')}</p>
        )}
        {isSupabaseConfigured && !apiConfigured && (
          <p className="text-xs text-destructive">{t('errors.taskBreakdownApiNotConfigured')}</p>
        )}
        {!hasColumns && isSupabaseConfigured && (
          <p className="text-xs text-muted-foreground">{t('board.taskBreakdownNeedColumn')}</p>
        )}

        {hasColumns && (
          <div>
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
              rows={8}
              className="min-h-[12rem] w-full resize-y rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 dark:bg-input/30 md:text-sm"
            />
          </div>

          {error && (
            <p className="text-xs text-destructive" role="alert">
              {error}
            </p>
          )}
          <Button type="submit" disabled={!canSubmit} className="w-full gap-2 sm:w-auto">
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
      </DialogContent>
    </Dialog>
  )
}
