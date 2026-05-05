import type { TFunction } from 'i18next'
import { z } from 'zod'
import { COLUMN_COLOR_PRESET_CLASSES } from '@/features/columns/constants/column-color-presets'

export function createTaskFormSchema(
  allowedAssigneeIds: readonly string[],
  t: TFunction,
) {
  const allowed = new Set(allowedAssigneeIds)
  return z.object({
    title: z
      .string()
      .min(1, t('validation.taskTitleRequired'))
      .max(200, t('validation.taskTitleMax')),
    description: z.string().max(2000, t('validation.taskDescMax')),
    color: z.enum(COLUMN_COLOR_PRESET_CLASSES),
    assigneeId: z
      .union([z.literal(''), z.string().uuid(t('validation.assigneeInvalid'))])
      .refine((v) => v === '' || allowed.has(v), {
        message: t('validation.assigneePickFromBoard'),
      }),
  })
}

export type TaskCreateFormValues = z.infer<ReturnType<typeof createTaskFormSchema>>
