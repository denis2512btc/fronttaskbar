import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { isSupabaseConfigured } from '@/lib/supabase/client'
import { createBoard, fetchBoardById, fetchBoardsForUser } from '@/features/boards/api/boards-api'

export const boardQueryKeys = {
  list: (ownerId: string) => ['boards', ownerId] as const,
  detail: (ownerId: string, boardId: string) => ['boards', 'detail', ownerId, boardId] as const,
}

export function useBoardsQuery(ownerId: string | undefined) {
  return useQuery({
    queryKey: ownerId ? boardQueryKeys.list(ownerId) : ['boards', '__disabled'],
    queryFn: () => fetchBoardsForUser(ownerId!),
    enabled: Boolean(ownerId) && isSupabaseConfigured,
  })
}

export function useBoardQuery(ownerId: string | undefined, boardId: string | undefined) {
  return useQuery({
    queryKey:
      ownerId && boardId ? boardQueryKeys.detail(ownerId, boardId) : ['boards', 'detail', '__disabled'],
    queryFn: () => fetchBoardById(boardId!, ownerId!),
    enabled: Boolean(ownerId && boardId) && isSupabaseConfigured,
  })
}

export function useCreateBoardMutation(ownerId: string | undefined) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (title: string) => {
      if (!ownerId) throw new Error('Нужна авторизация')
      return createBoard({ title, ownerId })
    },
    onSuccess: async (result) => {
      if (ownerId) {
        await queryClient.invalidateQueries({ queryKey: boardQueryKeys.list(ownerId) })
      }
      navigate(`/board/${result.id}`)
    },
  })
}
