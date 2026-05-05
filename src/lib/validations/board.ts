import { z } from 'zod'

export const createBoardFormSchema = z.object({
  title: z
    .string()
    .min(1, 'Введите название доски')
    .max(120, 'Не больше 120 символов'),
})

export type CreateBoardFormInput = z.infer<typeof createBoardFormSchema>
