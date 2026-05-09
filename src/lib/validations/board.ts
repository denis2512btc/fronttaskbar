import type { TFunction } from 'i18next'
import { z } from 'zod'
import { BOARD_COLUMN_TEMPLATE_IDS } from '@/features/boards/constants/board-column-templates'

export function createBoardFormSchema(t: TFunction) {
  return z.object({
    title: z
      .string()
      .min(1, t('validation.boardTitleRequired'))
      .max(120, t('validation.boardTitleMax')),
    competencyRoleId: z
      .string()
      .uuid(t('validation.boardCompetencyRequired')),
    columnTemplateId: z.enum(BOARD_COLUMN_TEMPLATE_IDS),
  })
}

export type CreateBoardFormInput = z.infer<ReturnType<typeof createBoardFormSchema>>
