import type { TFunction } from 'i18next'
import { z } from 'zod'
import { COLUMN_COLOR_PRESET_CLASSES } from '@/features/columns/constants/column-color-presets'

export function createColumnEditorFormSchema(t: TFunction) {
  return z.object({
    title: z
      .string()
      .min(1, t('validation.columnTitleRequired'))
      .max(80, t('validation.columnTitleMax')),
    color: z.enum(COLUMN_COLOR_PRESET_CLASSES),
  })
}

export type ColumnEditorFormInput = z.infer<ReturnType<typeof createColumnEditorFormSchema>>
