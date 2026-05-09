import type { TFunction } from 'i18next'
import {
  COLUMN_COLOR_PRESET_CLASSES,
  type ColumnColorPreset,
} from '@/features/columns/constants/column-color-presets'

export const BOARD_COLUMN_TEMPLATE_IDS = ['empty', 'classic', 'delivery', 'support'] as const

export type BoardColumnTemplateId = (typeof BOARD_COLUMN_TEMPLATE_IDS)[number]

const TEMPLATE_COLUMN_TITLE_KEYS: Record<
  Exclude<BoardColumnTemplateId, 'empty'>,
  readonly string[]
> = {
  classic: [
    'boardCreate.columnTemplates.classic.columns.todo',
    'boardCreate.columnTemplates.classic.columns.inProgress',
    'boardCreate.columnTemplates.classic.columns.done',
  ],
  delivery: [
    'boardCreate.columnTemplates.delivery.columns.todo',
    'boardCreate.columnTemplates.delivery.columns.analysis',
    'boardCreate.columnTemplates.delivery.columns.inProgress',
    'boardCreate.columnTemplates.delivery.columns.onHold',
    'boardCreate.columnTemplates.delivery.columns.testing',
    'boardCreate.columnTemplates.delivery.columns.done',
  ],
  support: [
    'boardCreate.columnTemplates.support.columns.new',
    'boardCreate.columnTemplates.support.columns.inProgress',
    'boardCreate.columnTemplates.support.columns.waiting',
    'boardCreate.columnTemplates.support.columns.resolved',
  ],
}

export function resolveBoardColumnTemplateForInsert(
  templateId: BoardColumnTemplateId,
  t: TFunction,
): { title: string; color: ColumnColorPreset }[] {
  if (templateId === 'empty') return []
  const keys = TEMPLATE_COLUMN_TITLE_KEYS[templateId]
  return keys.map((key, i) => ({
    title: t(key),
    color: COLUMN_COLOR_PRESET_CLASSES[i % COLUMN_COLOR_PRESET_CLASSES.length],
  }))
}
