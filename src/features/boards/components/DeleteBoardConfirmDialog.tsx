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
import { useDeleteBoardMutation } from '@/features/boards/hooks/use-boards-queries'

export interface DeleteBoardConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  boardId: string
  boardTitle?: string
  onDeleted?: (boardId: string) => void
}

export function DeleteBoardConfirmDialog({
  open,
  onOpenChange,
  boardId,
  boardTitle,
  onDeleted,
}: DeleteBoardConfirmDialogProps) {
  const deleteBoardMutation = useDeleteBoardMutation()

  useEffect(() => {
    if (!open) deleteBoardMutation.reset()
  }, [open, deleteBoardMutation])

  const handleConfirm = () => {
    if (!boardId) return
    deleteBoardMutation.mutate(boardId, {
      onSuccess: () => {
        onOpenChange(false)
        onDeleted?.(boardId)
      },
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!deleteBoardMutation.isPending) {
          onOpenChange(next)
        }
      }}
    >
      <DialogContent className="sm:max-w-sm" showCloseButton={!deleteBoardMutation.isPending}>
        <DialogHeader>
          <DialogTitle className="text-lg">Удалить доску?</DialogTitle>
          <DialogDescription>
            Доска «{boardTitle ?? 'без названия'}» и все связанные данные будут удалены без возможности
            восстановления.
          </DialogDescription>
        </DialogHeader>
        {deleteBoardMutation.isError ? (
          <p className="text-xs text-destructive">
            {deleteBoardMutation.error instanceof Error
              ? deleteBoardMutation.error.message
              : 'Не удалось удалить доску'}
          </p>
        ) : null}
        <DialogFooter className="gap-2 border-0 bg-transparent p-0 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            disabled={deleteBoardMutation.isPending}
            onClick={() => onOpenChange(false)}
          >
            Отмена
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="gap-2"
            disabled={deleteBoardMutation.isPending || !boardId}
            onClick={handleConfirm}
          >
            {deleteBoardMutation.isPending ? (
              <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />
            ) : null}
            Удалить навсегда
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
