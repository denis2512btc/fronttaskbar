import type { TFunction } from 'i18next'
import { z } from 'zod'

export function createBoardFormSchema(t: TFunction) {
  return z.object({
    title: z
      .string()
      .min(1, t('validation.boardTitleRequired'))
      .max(120, t('validation.boardTitleMax')),
    competencyRoleId: z
      .string()
      .uuid(t('validation.boardCompetencyRequired')),
  })
}

export type CreateBoardFormInput = z.infer<ReturnType<typeof createBoardFormSchema>>
