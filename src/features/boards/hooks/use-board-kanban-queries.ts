import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { isSupabaseConfigured } from '@/lib/supabase/client'
import i18n from '@/lib/i18n/i18n'
import {
  createBoardColumn,
  deleteBoardColumn,
  fetchBoardColumns,
  updateBoardColumn,
} from '@/features/columns/api/columns-api'
import {
  applyKanbanTaskMoves,
  createBoardTask,
  createBoardTasksBatch,
  deleteBoardTask,
  fetchBoardTasks,
  updateBoardTask,
  type KanbanTaskFromApi,
} from '@/features/tasks/api/tasks-api'

export const boardKanbanKeys = {
  columns: (boardId: string) => ['board', boardId, 'columns'] as const,
  tasks: (boardId: string) => ['board', boardId, 'tasks'] as const,
}

function invalidateBoardKanban(queryClient: ReturnType<typeof useQueryClient>, boardId: string) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: boardKanbanKeys.columns(boardId) }),
    queryClient.invalidateQueries({ queryKey: boardKanbanKeys.tasks(boardId) }),
  ])
}

export function useBoardColumnsQuery(boardId: string | undefined) {
  return useQuery({
    queryKey: boardId ? boardKanbanKeys.columns(boardId) : ['board', '__disabled', 'columns'],
    queryFn: () => fetchBoardColumns(boardId!),
    enabled: Boolean(boardId) && isSupabaseConfigured,
  })
}

export function useBoardTasksQuery(boardId: string | undefined) {
  return useQuery({
    queryKey: boardId ? boardKanbanKeys.tasks(boardId) : ['board', '__disabled', 'tasks'],
    queryFn: () => fetchBoardTasks(boardId!),
    enabled: Boolean(boardId) && isSupabaseConfigured,
  })
}

export function useCreateBoardColumnMutation(boardId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: { title: string; color: string }) => {
      if (!boardId) throw new Error(i18n.t('errors.noBoard'))
      return createBoardColumn({ boardId, title: input.title, color: input.color })
    },
    onSuccess: async () => {
      if (boardId) await invalidateBoardKanban(queryClient, boardId)
    },
  })
}

export function useUpdateBoardColumnMutation(boardId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: { id: string; title: string; color: string }) =>
      updateBoardColumn(input),
    onSuccess: async () => {
      if (boardId) await invalidateBoardKanban(queryClient, boardId)
    },
  })
}

export function useDeleteBoardColumnMutation(boardId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (columnId: string) => deleteBoardColumn(columnId),
    onSuccess: async () => {
      if (boardId) await invalidateBoardKanban(queryClient, boardId)
    },
  })
}

export function useCreateBoardTaskMutation(boardId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: {
      columnId: string
      title: string
      description: string
      color: string
      assigneeId: string | null
    }) => {
      if (!boardId) throw new Error(i18n.t('errors.noBoard'))
      return createBoardTask({
        boardId,
        columnId: input.columnId,
        title: input.title,
        description: input.description,
        color: input.color,
        assigneeId: input.assigneeId,
      })
    },
    onSuccess: async () => {
      if (boardId) await invalidateBoardKanban(queryClient, boardId)
    },
  })
}

export function useCreateBoardTasksBatchMutation(boardId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: {
      columnId: string
      items: {
        title: string
        description: string
        color: string
        assigneeId: string | null
      }[]
      breakdownPromptId?: string | null
    }) => {
      if (!boardId) throw new Error(i18n.t('errors.noBoard'))
      return createBoardTasksBatch({
        boardId,
        columnId: input.columnId,
        items: input.items,
        breakdownPromptId: input.breakdownPromptId,
      })
    },
    onSuccess: async () => {
      if (boardId) await invalidateBoardKanban(queryClient, boardId)
    },
  })
}

export function useUpdateBoardTaskMutation(boardId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: {
      id: string
      title: string
      description: string
      color: string
      assigneeId: string | null
    }) => updateBoardTask(input),
    onSuccess: async () => {
      if (boardId) await invalidateBoardKanban(queryClient, boardId)
    },
  })
}

export function useDeleteBoardTaskMutation(boardId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (taskId: string) => deleteBoardTask(taskId),
    onSuccess: async () => {
      if (boardId) await invalidateBoardKanban(queryClient, boardId)
    },
  })
}

export function useReorderKanbanTasksMutation(boardId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: {
      tasksById: Map<string, KanbanTaskFromApi>
      columnSyncs: { columnId: string; orderedTaskIds: string[] }[]
    }) => {
      if (!boardId) throw new Error(i18n.t('errors.noBoard'))
      return applyKanbanTaskMoves({
        boardId,
        tasksById: input.tasksById,
        columnSyncs: input.columnSyncs,
      })
    },
    onSuccess: async () => {
      if (boardId) await invalidateBoardKanban(queryClient, boardId)
    },
  })
}
