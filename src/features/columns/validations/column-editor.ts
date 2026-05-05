import { z } from 'zod'
import { COLUMN_COLOR_PRESET_CLASSES } from '@/features/columns/constants/column-color-presets'

export const columnEditorFormSchema = z.object({
  title: z
    .string()
    .min(1, 'Введите название колонки')
    .max(80, 'Не больше 80 символов'),
  color: z.enum(COLUMN_COLOR_PRESET_CLASSES),
})

export type ColumnEditorFormInput = z.infer<typeof columnEditorFormSchema>
