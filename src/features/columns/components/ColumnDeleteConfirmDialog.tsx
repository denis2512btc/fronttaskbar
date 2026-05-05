import { useEffect } from 'react'
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

  const titleLabel = columnTitle.trim() || 'Без названия'

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
          <DialogTitle className="text-lg">Удалить колонку?</DialogTitle>
          <DialogDescription>
            {taskCount === 0 ?
              <>Колонка «{titleLabel}» будет удалена навсегда. В колонке нет карточек.</>
            : <>
                Колонка «{titleLabel}» и все карточки в ней ({taskCount}&nbsp;шт.) будут удалены навсегда без
                восстановления.
              </>}
          </DialogDescription>
        </DialogHeader>
        {deleteMutation.isError ?
          <p className="text-xs text-destructive">
            {deleteMutation.error instanceof Error ?
              deleteMutation.error.message
            : 'Не удалось удалить колонку'}
          </p>
        : null}
        <DialogFooter className="gap-2 border-0 bg-transparent p-0 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            disabled={deleteMutation.isPending}
            onClick={() => onOpenChange(false)}
          >
            Отмена
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
            Удалить навсегда
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
