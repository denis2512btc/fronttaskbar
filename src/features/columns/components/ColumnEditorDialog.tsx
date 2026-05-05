import { useEffect, useId } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { LayoutGrid } from 'lucide-react'
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
import {
  columnEditorFormSchema,
  type ColumnEditorFormInput,
} from '@/features/columns/validations/column-editor'

export type ColumnEditorDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'create' | 'edit'
  initial?: Pick<ColumnEditorFormInput, 'title' | 'color'>
  onSubmit: (data: ColumnEditorFormInput) => void
}

export function ColumnEditorDialog({
  open,
  onOpenChange,
  mode,
  initial,
  onSubmit: onSubmitProp,
}: ColumnEditorDialogProps) {
  const baseId = useId()
  const titleFieldId = `${baseId}-title`

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ColumnEditorFormInput>({
    resolver: zodResolver(columnEditorFormSchema),
    defaultValues: {
      title: '',
      color: COLUMN_COLOR_PRESET_CLASSES[0],
    },
  })

  useEffect(() => {
    if (!open) return
    reset({
      title: initial?.title ?? '',
      color: initial?.color ?? COLUMN_COLOR_PRESET_CLASSES[0],
    })
  }, [open, initial?.title, initial?.color, reset])

  const handleOpenChange = (next: boolean) => {
    onOpenChange(next)
    if (!next) {
      reset({
        title: '',
        color: COLUMN_COLOR_PRESET_CLASSES[0],
      })
    }
  }

  const onSubmit = (data: ColumnEditorFormInput) => {
    onSubmitProp(data)
    handleOpenChange(false)
  }

  const isEdit = mode === 'edit'

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <span className="mb-1 flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600">
            <LayoutGrid className="size-4 text-white" strokeWidth={2} />
          </span>
          <DialogTitle className="text-lg">
            {isEdit ? 'Редактировать колонку' : 'Новая колонка'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Измените название и цвет индикатора колонки. Изменения только на этой странице.'
              : 'Укажите название и цвет новой колонки. Данные не сохраняются на сервере.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={titleFieldId}>Название</Label>
            <Input
              id={titleFieldId}
              placeholder="Например, Бэклог"
              autoComplete="off"
              aria-invalid={!!errors.title}
              {...register('title')}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label>Цвет</Label>
            <Controller
              name="color"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-4">
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

          <DialogFooter className="gap-2 sm:gap-2">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Отмена
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm shadow-indigo-500/20 hover:opacity-90"
            >
              {isEdit ? 'Сохранить' : 'Добавить'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
