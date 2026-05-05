import type { ColumnColorPreset } from '@/features/columns/constants/column-color-presets'

/** Колонка в Supabase (доменная модель). */
export interface Column {
  id: string
  boardId: string
  title: string
  order: number
  createdAt: string
}

/** Метаданные колонки для локального канбана без привязки к БД. */
export interface KanbanDemoColumnMeta {
  id: string
  title: string
  color: ColumnColorPreset
}
