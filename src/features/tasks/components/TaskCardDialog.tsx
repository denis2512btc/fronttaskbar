import { useEffect, useId, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ClipboardList, Loader2 } from 'lucide-react'
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
import { createTaskFormSchema, type TaskCreateFormValues } from '@/features/tasks/validations/task-create'

export type TaskCardDraft = {
  title: string
  description: string
  color: TaskCreateFormValues['color']
  assigneeId: string | null
}

export type TaskAssigneeOption = {
  value: string
  label: string
}

const textareaClassName = cn(
  'flex min-h-[100px] w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40',
)

function defaultFormValues(): TaskCreateFormValues {
  return {
    title: '',
    description: '',
    color: COLUMN_COLOR_PRESET_CLASSES[0],
    assigneeId: '',
  }
}

type TaskCardDialogFormProps = {
  mode: 'create' | 'edit'
  initial?: TaskCardDraft | null
  assigneeOptions: TaskAssigneeOption[]
  onSubmitSuccess: (data: TaskCardDraft) => void | Promise<void>
  onCancel: () => void
  onRequestDelete?: () => void
}

function TaskCardDialogForm({
  mode,
  initial,
  assigneeOptions,
  onSubmitSuccess,
  onCancel,
  onRequestDelete,
}: TaskCardDialogFormProps) {
  const baseId = useId()
  const titleFieldId = `${baseId}-title`
  const descriptionFieldId = `${baseId}-description`
  const assigneeFieldId = `${baseId}-assignee`

  const allowedIds = useMemo(() => assigneeOptions.map((o) => o.value), [assigneeOptions])
  const schema = useMemo(() => createTaskFormSchema(allowedIds), [allowedIds])

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TaskCreateFormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaultFormValues(),
  })

  useEffect(() => {
    if (mode === 'edit' && initial) {
      reset({
        title: initial.title,
        description: initial.description,
        color: initial.color,
        assigneeId: (initial.assigneeId ?? '') as TaskCreateFormValues['assigneeId'],
      })
    } else {
      reset(defaultFormValues())
    }
  }, [mode, initial, reset, allowedIds])

  const onSubmit = async (data: TaskCreateFormValues) => {
    const description = data.description.trim()
    await onSubmitSuccess({
      title: data.title.trim(),
      description,
      color: data.color,
      assigneeId: data.assigneeId === '' ? null : data.assigneeId,
    })
  }

  const isEdit = mode === 'edit'

  return (
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
        {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
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
        {errors.color && <p className="text-xs text-destructive">{errors.color.message}</p>}
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
          {assigneeOptions.map((u) => (
            <option key={u.value} value={u.value}>
              {u.label}
            </option>
          ))}
        </select>
        {errors.assigneeId && (
          <p className="text-xs text-destructive">{errors.assigneeId.message}</p>
        )}
      </div>

      {isEdit && onRequestDelete ?
        <div className="border-t border-border/60 pt-4">
          <Button
            type="button"
            variant="outline"
            className="w-full border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={onRequestDelete}
          >
            Удалить карточку…
          </Button>
        </div>
      : null}

      <DialogFooter className="gap-2 sm:gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Отмена
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm shadow-indigo-500/20 hover:opacity-90"
        >
          {isSubmitting ? 'Сохранение…' : isEdit ? 'Сохранить' : 'Создать карточку'}
        </Button>
      </DialogFooter>
    </form>
  )
}

export type TaskCardDialogProps = {
  mode: 'create' | 'edit'
  open: boolean
  onOpenChange: (open: boolean) => void
  assigneeOptions: TaskAssigneeOption[]
  initial?: TaskCardDraft | null
  onSubmit: (data: TaskCardDraft) => void | Promise<void>
  /** Режим редактирования: удаление задачи после подтверждения */
  onDeleteTask?: () => void | Promise<void>
}

export function TaskCardDialog({
  mode,
  open,
  onOpenChange,
  assigneeOptions,
  initial,
  onSubmit: onSubmitProp,
  onDeleteTask,
}: TaskCardDialogProps) {
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [deletePending, setDeletePending] = useState(false)

  const assigneeKey = useMemo(
    () => [...assigneeOptions.map((o) => o.value)].sort().join('|'),
    [assigneeOptions],
  )

  const handleOpenChange = (next: boolean) => {
    onOpenChange(next)
    if (!next) setConfirmDeleteOpen(false)
  }

  const isEdit = mode === 'edit'
  const previewTitle = (initial?.title ?? '').trim() || 'Без названия'

  const handleConfirmDelete = async () => {
    if (!onDeleteTask) return
    setDeletePending(true)
    try {
      await onDeleteTask()
      setConfirmDeleteOpen(false)
      handleOpenChange(false)
    } catch {
      /* ошибку показывает родитель */
    } finally {
      setDeletePending(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <span className="mb-1 flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600">
            <ClipboardList className="size-4 text-white" strokeWidth={2} />
          </span>
          <DialogTitle className="text-lg">
            {isEdit ? 'Редактировать карточку' : 'Новая карточка'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Измените поля карточки. Данные сохраняются в Supabase.'
              : 'Задайте поля карточки. Данные сохраняются в Supabase.'}
          </DialogDescription>
        </DialogHeader>

        {open ? (
          <TaskCardDialogForm
            key={`${mode}-${assigneeKey}`}
            mode={mode}
            initial={initial}
            assigneeOptions={assigneeOptions}
            onCancel={() => handleOpenChange(false)}
            onRequestDelete={
              isEdit && onDeleteTask ?
                () => {
                  setConfirmDeleteOpen(true)
                }
              : undefined
            }
            onSubmitSuccess={async (data) => {
              try {
                await onSubmitProp(data)
                handleOpenChange(false)
              } catch {
                /* мутация — сообщение снаружи */
              }
            }}
          />
        ) : null}
        </DialogContent>
      </Dialog>

      <Dialog
        open={confirmDeleteOpen}
        onOpenChange={(next) => {
          if (!deletePending) setConfirmDeleteOpen(next)
        }}
      >
        <DialogContent className="sm:max-w-sm" showCloseButton={!deletePending}>
          <DialogHeader>
            <DialogTitle className="text-lg">Удалить карточку?</DialogTitle>
            <DialogDescription>
              Карточку «{previewTitle}» нельзя будет восстановить.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 border-0 bg-transparent p-0 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={deletePending}
              onClick={() => setConfirmDeleteOpen(false)}
            >
              Отмена
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deletePending || !onDeleteTask}
              className="gap-2"
              onClick={handleConfirmDelete}
            >
              {deletePending ?
                <>
                  <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />
                  Удаление…
                </>
              : 'Удалить навсегда'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
