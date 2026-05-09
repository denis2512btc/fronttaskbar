import { isSupabaseConfigured, supabase } from '@/lib/supabase/client'
import i18n from '@/lib/i18n/i18n'
import type { Database } from '@/types/database'
import type { ColumnColorPreset } from '@/features/columns/constants/column-color-presets'
import { COLUMN_COLOR_PRESET_CLASSES } from '@/features/columns/constants/column-color-presets'

export type BoardColumnRow = Database['public']['Tables']['board_columns']['Row']

const PRESET_SET = new Set<string>(COLUMN_COLOR_PRESET_CLASSES)

function ensureConfigured(): void {
  if (!isSupabaseConfigured) {
    throw new Error(i18n.t('errors.supabaseNotConfigured'))
  }
}

export function normalizeColumnColor(value: string): ColumnColorPreset {
  if (PRESET_SET.has(value)) return value as ColumnColorPreset
  return COLUMN_COLOR_PRESET_CLASSES[0]
}

export function mapBoardColumnRow(row: BoardColumnRow): KanbanColumnFromApi {
  return {
    id: row.id,
    boardId: row.board_id,
    title: row.title,
    color: normalizeColumnColor(row.color),
    position: row.position,
    createdAt: row.created_at,
  }
}

export interface KanbanColumnFromApi {
  id: string
  boardId: string
  title: string
  color: ColumnColorPreset
  position: number
  createdAt: string
}

export async function fetchBoardColumns(boardId: string): Promise<KanbanColumnFromApi[]> {
  ensureConfigured()
  const { data, error } = await supabase
    .from('board_columns')
    .select('*')
    .eq('board_id', boardId)
    .order('position', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) throw new Error(error.message)
  return (data ?? []).map((row) => mapBoardColumnRow(row as BoardColumnRow))
}

export async function getNextColumnPosition(boardId: string): Promise<number> {
  ensureConfigured()
  const { data, error } = await supabase
    .from('board_columns')
    .select('position')
    .eq('board_id', boardId)
    .order('position', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw new Error(error.message)
  const max = data?.position
  return typeof max === 'number' ? max + 1 : 0
}

export async function createBoardColumnsBatch(params: {
  boardId: string
  columns: { title: string; color: string }[]
}): Promise<void> {
  if (params.columns.length === 0) return
  ensureConfigured()
  const rows = params.columns.map((c, i) => ({
    board_id: params.boardId,
    title: c.title.trim(),
    color: normalizeColumnColor(c.color),
    position: i,
  }))
  const { error } = await supabase.from('board_columns').insert(rows)
  if (error) throw new Error(error.message)
}

export async function createBoardColumn(params: {
  boardId: string
  title: string
  color: string
}): Promise<KanbanColumnFromApi> {
  ensureConfigured()
  const position = await getNextColumnPosition(params.boardId)
  const { data, error } = await supabase
    .from('board_columns')
    .insert({
      board_id: params.boardId,
      title: params.title.trim(),
      color: params.color,
      position,
    })
    .select('*')
    .single()

  if (error) throw new Error(error.message)
  if (!data) throw new Error(i18n.t('errors.createColumnFailed'))
  return mapBoardColumnRow(data as BoardColumnRow)
}

export async function updateBoardColumn(params: {
  id: string
  title: string
  color: string
}): Promise<void> {
  ensureConfigured()
  const { error } = await supabase
    .from('board_columns')
    .update({
      title: params.title.trim(),
      color: params.color,
    })
    .eq('id', params.id)

  if (error) throw new Error(error.message)
}

export async function deleteBoardColumn(columnId: string): Promise<void> {
  ensureConfigured()
  const { error } = await supabase.from('board_columns').delete().eq('id', columnId)

  if (error) throw new Error(error.message)
}
