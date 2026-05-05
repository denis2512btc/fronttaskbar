import { useEffect, useId } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ClipboardList } from 'lucide-react'
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
import { cn } from '@/lib/utils'
import { COLUMN_COLOR_PRESET_CLASSES } from '@/features/columns/constants/column-color-presets'
import { MOCK_BOARD_ASSIGNEES } from '@/features/tasks/constants/mock-assignees'
import { taskCreateFormSchema, type TaskCreateFormValues } from '@/features/tasks/validations/task-create'

export type TaskCardDraft = {
  title: string
  description: string
  color: TaskCreateFormValues['color']
  assigneeId: string | null
}

const textareaClassName = cn(
  'flex min-h-[100px] w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40',
)

export type TaskCreateDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: TaskCardDraft) => void
}

export function TaskCreateDialog({ open, onOpenChange, onSubmit: onSubmitProp }: TaskCreateDialogProps) {
  const baseId = useId()
  const titleFieldId = `${baseId}-title`
  const descriptionFieldId = `${baseId}-description`
  const assigneeFieldId = `${baseId}-assignee`

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<TaskCreateFormValues>({
    resolver: zodResolver(taskCreateFormSchema),
    defaultValues: {
      title: '',
      description: '',
      color: COLUMN_COLOR_PRESET_CLASSES[0],
      assigneeId: '',
    },
  })

  useEffect(() => {
    if (!open) return
    reset({
      title: '',
      description: '',
      color: COLUMN_COLOR_PRESET_CLASSES[0],
      assigneeId: '',
    })
  }, [open, reset])

  const handleOpenChange = (next: boolean) => {
    onOpenChange(next)
    if (!next) {
      reset({
        title: '',
        description: '',
        color: COLUMN_COLOR_PRESET_CLASSES[0],
        assigneeId: '',
      })
    }
  }

  const onSubmit = (data: TaskCreateFormValues) => {
    const description = data.description.trim()
    onSubmitProp({
      title: data.title.trim(),
      description,
      color: data.color,
      assigneeId: data.assigneeId === '' ? null : data.assigneeId,
    })
    handleOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <span className="mb-1 flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600">
            <ClipboardList className="size-4 text-white" strokeWidth={2} />
          </span>
          <DialogTitle className="text-lg">Новая карточка</DialogTitle>
          <DialogDescription>
            Задайте название, описание, цвет акцента и ответственного. Данные сохраняются только в интерфейсе.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={titleFieldId}>Название задачи</Label>
            <Input
              id={titleFieldId}
              placeholder="Кратко, что сделать"
              autoComplete="off"
              aria-invalid={!!errors.title}
              {...register('title')}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor={descriptionFieldId}>Описание</Label>
            <textarea
              id={descriptionFieldId}
              placeholder="Детали, контекст, критерии…"
              aria-invalid={!!errors.description}
              className={cn(textareaClassName, 'resize-y')}
              {...register('description')}
            />
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label>Цвет карточки</Label>
            <Controller
              name="color"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-4 gap-2">
                  {COLUMN_COLOR_PRESET_CLASSES.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      aria-label={`Цвет ${preset}`}
                      onClick={() => field.onChange(preset)}
                      className={cn(
                        'size-9 rounded-full border border-border/40 shadow-sm transition-transform outline-none hover:scale-105 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-background',
                        preset,
                        field.value === preset &&
                          'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-background',
                      )}
                    />
                  ))}
                </div>
              )}
            />
            {errors.color && (
              <p className="text-xs text-destructive">{errors.color.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor={assigneeFieldId}>Ответственный</Label>
            <select
              id={assigneeFieldId}
              aria-invalid={!!errors.assigneeId}
              className={cn(
                'h-10 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30',
                errors.assigneeId && 'border-destructive',
              )}
              {...register('assigneeId')}
            >
              <option value="">Не назначен</option>
              {MOCK_BOARD_ASSIGNEES.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.displayName}
                </option>
              ))}
            </select>
            {errors.assigneeId && (
              <p className="text-xs text-destructive">{errors.assigneeId.message}</p>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Отмена
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm shadow-indigo-500/20 hover:opacity-90"
            >
              Создать карточку
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
