import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useDeleteBoardColumnMutation } from '@/features/boards/hooks/use-board-kanban-queries'

export interface ColumnDeleteConfirmDialogProps {
  boardId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  columnId: string
  columnTitle: string
  taskCount: number
  onDeleted?: (columnId: string) => void
}

export function ColumnDeleteConfirmDialog({
  boardId,
  open,
  onOpenChange,
  columnId,
  columnTitle,
  taskCount,
  onDeleted,
}: ColumnDeleteConfirmDialogProps) {
  const { t } = useTranslation()
  const deleteMutation = useDeleteBoardColumnMutation(boardId)

  useEffect(() => {
    if (!open) deleteMutation.reset()
  }, [open, deleteMutation])

  const handleConfirm = () => {
    if (!columnId) return
    deleteMutation.mutate(columnId, {
      onSuccess: () => {
        onOpenChange(false)
        onDeleted?.(columnId)
      },
    })
  }

  const titleLabel = columnTitle.trim() || t('common.untitled')

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!deleteMutation.isPending) {
          onOpenChange(next)
        }
      }}
    >
      <DialogContent className="sm:max-w-sm" showCloseButton={!deleteMutation.isPending}>
        <DialogHeader>
          <DialogTitle className="text-lg">{t('columnDelete.title')}</DialogTitle>
          <DialogDescription>
            {taskCount === 0 ?
              t('columnDelete.descEmpty', { title: titleLabel })
            : t('columnDelete.descWithTasks', { title: titleLabel, count: taskCount })}
          </DialogDescription>
        </DialogHeader>
        {deleteMutation.isError ?
          <p className="text-xs text-destructive">
            {deleteMutation.error instanceof Error ?
              deleteMutation.error.message
            : t('columnDelete.deleteError')}
          </p>
        : null}
        <DialogFooter className="gap-2 border-0 bg-transparent p-0 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            disabled={deleteMutation.isPending}
            onClick={() => onOpenChange(false)}
          >
            {t('common.cancel')}
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="gap-2"
            disabled={deleteMutation.isPending || !columnId}
            onClick={handleConfirm}
          >
            {deleteMutation.isPending ?
              <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />
            : null}
            {t('common.deleteForever')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
