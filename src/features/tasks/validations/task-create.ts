import { z } from 'zod'
import { COLUMN_COLOR_PRESET_CLASSES } from '@/features/columns/constants/column-color-presets'

export function createTaskFormSchema(allowedAssigneeIds: readonly string[]) {
  const allowed = new Set(allowedAssigneeIds)
  return z.object({
    title: z
      .string()
      .min(1, 'Введите название задачи')
      .max(200, 'Не больше 200 символов'),
    description: z.string().max(2000, 'Не больше 2000 символов'),
    color: z.enum(COLUMN_COLOR_PRESET_CLASSES),
    assigneeId: z
      .union([z.literal(''), z.string().uuid('Некорректный идентификатор')])
      .refine((v) => v === '' || allowed.has(v), {
        message: 'Выберите участника из списка доски',
      }),
  })
}

export type TaskCreateFormValues = z.infer<ReturnType<typeof createTaskFormSchema>>
