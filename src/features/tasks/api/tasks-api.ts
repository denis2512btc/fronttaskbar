import { isSupabaseConfigured, supabase } from '@/lib/supabase/client'
import i18n from '@/lib/i18n/i18n'
import type { Database } from '@/types/database'
import type { ColumnColorPreset } from '@/features/columns/constants/column-color-presets'
import { COLUMN_COLOR_PRESET_CLASSES } from '@/features/columns/constants/column-color-presets'

export type TaskRow = Database['public']['Tables']['tasks']['Row']

const PRESET_SET = new Set<string>(COLUMN_COLOR_PRESET_CLASSES)

function ensureConfigured(): void {
  if (!isSupabaseConfigured) {
    throw new Error(i18n.t('errors.supabaseNotConfigured'))
  }
}

export function normalizeTaskColor(value: string): ColumnColorPreset {
  if (PRESET_SET.has(value)) return value as ColumnColorPreset
  return COLUMN_COLOR_PRESET_CLASSES[0]
}

export interface KanbanTaskFromApi {
  id: string
  boardId: string
  columnId: string
  title: string
  description: string
  color: ColumnColorPreset
  assigneeId: string | null
  position: number
  createdAt: string
  updatedAt: string
}

export function mapTaskRow(row: TaskRow): KanbanTaskFromApi {
  return {
    id: row.id,
    boardId: row.board_id,
    columnId: row.column_id,
    title: row.title,
    description: row.description,
    color: normalizeTaskColor(row.color),
    assigneeId: row.assignee_id,
    position: row.position,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function fetchBoardTasks(boardId: string): Promise<KanbanTaskFromApi[]> {
  ensureConfigured()
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('board_id', boardId)
    .order('column_id', { ascending: true })
    .order('position', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) throw new Error(error.message)
  return (data ?? []).map((row) => mapTaskRow(row as TaskRow))
}

export async function getNextTaskPosition(columnId: string): Promise<number> {
  ensureConfigured()
  const { data, error } = await supabase
    .from('tasks')
    .select('position')
    .eq('column_id', columnId)
    .order('position', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw new Error(error.message)
  const max = data?.position
  return typeof max === 'number' ? max + 1 : 0
}

export async function createBoardTask(params: {
  boardId: string
  columnId: string
  title: string
  description: string
  color: string
  assigneeId: string | null
}): Promise<KanbanTaskFromApi> {
  ensureConfigured()
  const position = await getNextTaskPosition(params.columnId)
  const { data, error } = await supabase
    .from('tasks')
    .insert({
      board_id: params.boardId,
      column_id: params.columnId,
      title: params.title.trim(),
      description: params.description,
      color: params.color,
      assignee_id: params.assigneeId,
      position,
    })
    .select('*')
    .single()

  if (error) throw new Error(error.message)
  if (!data) throw new Error(i18n.t('errors.createTaskFailed'))
  return mapTaskRow(data as TaskRow)
}

export async function updateBoardTask(params: {
  id: string
  title: string
  description: string
  color: string
  assigneeId: string | null
}): Promise<void> {
  ensureConfigured()
  const { error } = await supabase
    .from('tasks')
    .update({
      title: params.title.trim(),
      description: params.description,
      color: params.color,
      assignee_id: params.assigneeId,
    })
    .eq('id', params.id)

  if (error) throw new Error(error.message)
}

export async function deleteBoardTask(taskId: string): Promise<void> {
  ensureConfigured()
  const { error } = await supabase.from('tasks').delete().eq('id', taskId)

  if (error) throw new Error(error.message)
}

/** Droppable id for an empty column (prefix + UUID). */
export function kanbanColumnDroppableId(columnId: string): string {
  return `column:${columnId}`
}

/** Parse droppable id from {@link kanbanColumnDroppableId}; returns null if not a column zone. */
export function parseKanbanColumnDroppableId(id: string): string | null {
  return id.startsWith('column:') ? id.slice('column:'.length) : null
}

export async function syncColumnTaskOrder(
  columnId: string,
  orderedTaskIds: string[],
): Promise<void> {
  ensureConfigured()
  await Promise.all(
    orderedTaskIds.map(async (taskId, position) => {
      const { error } = await supabase
        .from('tasks')
        .update({ column_id: columnId, position })
        .eq('id', taskId)
      if (error) throw new Error(error.message)
    }),
  )
}

/** Applies column/task order after DnD. Validates ids against cached tasks for the board. */
export async function applyKanbanTaskMoves(params: {
  boardId: string
  tasksById: Map<string, KanbanTaskFromApi>
  columnSyncs: { columnId: string; orderedTaskIds: string[] }[]
}): Promise<void> {
  const { boardId, tasksById, columnSyncs } = params
  const seen = new Set<string>()
  for (const sync of columnSyncs) {
    for (const id of sync.orderedTaskIds) {
      if (seen.has(id)) {
        throw new Error(i18n.t('errors.invalidTaskOrder'))
      }
      seen.add(id)
      const t = tasksById.get(id)
      if (!t || t.boardId !== boardId) {
        throw new Error(i18n.t('errors.invalidTaskData'))
      }
    }
  }
  await Promise.all(
    columnSyncs.map((c) => syncColumnTaskOrder(c.columnId, c.orderedTaskIds)),
  )
}
