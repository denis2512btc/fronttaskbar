import { useEffect, useId, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { KanbanSquare } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createBoardFormSchema, type CreateBoardFormInput } from '@/lib/validations/board'
import { useAuthSession } from '@/features/auth/hooks/use-auth-session'
import { useCreateBoardMutation } from '@/features/boards/hooks/use-boards-queries'
import { useUIStore } from '@/stores/ui.store'
import { isSupabaseConfigured } from '@/lib/supabase/client'

export function CreateBoardDialog() {
  const { t } = useTranslation()
  const baseId = useId()
  const titleFieldId = `${baseId}-title`
  const { user } = useAuthSession()
  const createBoardDialogOpen = useUIStore((s) => s.createBoardDialogOpen)
  const setCreateBoardDialogOpen = useUIStore((s) => s.setCreateBoardDialogOpen)

  const createMutation = useCreateBoardMutation(user?.id)

  const boardSchema = useMemo(() => createBoardFormSchema(t), [t])

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateBoardFormInput>({
    resolver: zodResolver(boardSchema),
    defaultValues: { title: '' },
  })

  useEffect(() => {
    if (createBoardDialogOpen) {
      createMutation.reset()
    }
  }, [createBoardDialogOpen, createMutation])

  const handleOpenChange = (next: boolean) => {
    setCreateBoardDialogOpen(next)
    if (!next) reset()
  }

  const onSubmit = async (input: CreateBoardFormInput) => {
    if (!user?.id || !isSupabaseConfigured) return
    try {
      await createMutation.mutateAsync(input.title.trim())
      setCreateBoardDialogOpen(false)
      reset()
    } catch {
      /* mutation error surfaced via isError */
    }
  }

  const submitBlocked = !user?.id || !isSupabaseConfigured

  return (
    <Dialog open={createBoardDialogOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <span className="mb-1 flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600">
            <KanbanSquare className="size-4 text-white" strokeWidth={2} />
          </span>
          <DialogTitle className="text-lg">{t('boardCreate.title')}</DialogTitle>
          <DialogDescription>
            {t('boardCreate.description')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {!isSupabaseConfigured && (
            <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-900 dark:text-amber-200">
              {t('boardCreate.supabaseHint')}
            </p>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor={titleFieldId}>{t('boardCreate.nameLabel')}</Label>
            <Input
              id={titleFieldId}
              placeholder={t('boardCreate.placeholder')}
              autoComplete="off"
              aria-invalid={!!errors.title}
              disabled={submitBlocked}
              {...register('title')}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          {createMutation.isError && (
            <p className="text-xs text-destructive">
              {createMutation.error instanceof Error
                ? createMutation.error.message
                : t('boardCreate.createError')}
            </p>
          )}

          <DialogFooter className="gap-2 sm:gap-2">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={submitBlocked || createMutation.isPending}
              className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm shadow-indigo-500/20 hover:opacity-90"
            >
              {createMutation.isPending ? t('common.creating') : t('boardCreate.create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
