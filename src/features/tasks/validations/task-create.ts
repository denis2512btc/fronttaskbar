import { z } from 'zod'
import { COLUMN_COLOR_PRESET_CLASSES } from '@/features/columns/constants/column-color-presets'
import { MOCK_ASSIGNEE_ID_LIST } from '@/features/tasks/constants/mock-assignees'

const assigneeSchema = z.union([z.literal(''), z.enum(MOCK_ASSIGNEE_ID_LIST)])

export const taskCreateFormSchema = z.object({
  title: z
    .string()
    .min(1, 'Введите название задачи')
    .max(200, 'Не больше 200 символов'),
  description: z.string().max(2000, 'Не больше 2000 символов'),
  color: z.enum(COLUMN_COLOR_PRESET_CLASSES),
  assigneeId: assigneeSchema,
})

export type TaskCreateFormValues = z.infer<typeof taskCreateFormSchema>
