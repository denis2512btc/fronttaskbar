import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useLocation, useNavigate } from 'react-router-dom'
import { isSupabaseConfigured } from '@/lib/supabase/client'
import i18n from '@/lib/i18n/i18n'
import {
  addBoardMember,
  createBoard,
  deleteBoard,
  fetchAccessibleBoardsForUser,
  fetchBoardById,
  fetchBoardMembers,
  fetchProfileById,
  removeBoardMember,
  searchProfiles,
} from '@/features/boards/api/boards-api'
import {
  resolveBoardColumnTemplateForInsert,
  type BoardColumnTemplateId,
} from '@/features/boards/constants/board-column-templates'
import { createBoardColumnsBatch } from '@/features/columns/api/columns-api'

export const boardQueryKeys = {
  list: (userId: string) => ['boards', userId] as const,
  detail: (boardId: string) => ['boards', 'detail', boardId] as const,
  members: (boardId: string) => ['boardMembers', boardId] as const,
  profile: (userId: string) => ['profiles', 'detail', userId] as const,
  profileSearch: (q: string) => ['profiles', 'search', q] as const,
}

export function useBoardsQuery(userId: string | undefined) {
  return useQuery({
    queryKey: userId ? boardQueryKeys.list(userId) : ['boards', '__disabled'],
    queryFn: () => fetchAccessibleBoardsForUser(userId!),
    enabled: Boolean(userId) && isSupabaseConfigured,
  })
}

export function useBoardQuery(boardId: string | undefined, userId: string | undefined) {
  return useQuery({
    queryKey: boardId ? boardQueryKeys.detail(boardId) : ['boards', 'detail', '__disabled'],
    queryFn: () => fetchBoardById(boardId!),
    enabled: Boolean(boardId && userId) && isSupabaseConfigured,
  })
}

export function useBoardMembersQuery(boardId: string | undefined, enabled: boolean) {
  return useQuery({
    queryKey: boardId ? boardQueryKeys.members(boardId) : ['boardMembers', '__disabled'],
    queryFn: () => fetchBoardMembers(boardId!),
    enabled: Boolean(boardId) && enabled && isSupabaseConfigured,
  })
}

export function useOwnerProfileQuery(ownerId: string | undefined, enabled: boolean) {
  return useQuery({
    queryKey: ownerId ? boardQueryKeys.profile(ownerId) : ['profiles', '__disabled'],
    queryFn: () => fetchProfileById(ownerId!),
    enabled: Boolean(ownerId) && enabled && isSupabaseConfigured,
  })
}

export function useProfileSearchQuery(search: string, enabled: boolean) {
  const q = search.trim()
  return useQuery({
    queryKey: boardQueryKeys.profileSearch(q),
    queryFn: () => searchProfiles(q),
    enabled: enabled && q.length >= 2 && isSupabaseConfigured,
    staleTime: 30_000,
  })
}

export function useCreateBoardMutation(ownerId: string | undefined) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async (input: {
      title: string
      competencyRoleId: string
      columnTemplateId: BoardColumnTemplateId
    }) => {
      if (!ownerId) throw new Error(i18n.t('errors.needAuth'))
      const result = await createBoard({
        title: input.title,
        ownerId,
        competencyRoleId: input.competencyRoleId,
      })
      const columns = resolveBoardColumnTemplateForInsert(input.columnTemplateId, i18n.t.bind(i18n))
      if (columns.length === 0) return result
      try {
        await createBoardColumnsBatch({ boardId: result.id, columns })
      } catch (err) {
        await deleteBoard(result.id)
        throw err
      }
      return result
    },
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ['boards'] })
      navigate(`/board/${result.id}`)
    },
  })
}

export function useAddBoardMemberMutation(boardId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: { userId: string; competencyRoleId: string }) => {
      if (!boardId) throw new Error(i18n.t('errors.noBoard'))
      return addBoardMember(boardId, input.userId, input.competencyRoleId)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['boards'] })
      if (boardId) {
        await queryClient.invalidateQueries({ queryKey: boardQueryKeys.members(boardId) })
        await queryClient.invalidateQueries({ queryKey: boardQueryKeys.detail(boardId) })
      }
    },
  })
}

export function useRemoveBoardMemberMutation(boardId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (memberUserId: string) => {
      if (!boardId) throw new Error(i18n.t('errors.noBoard'))
      return removeBoardMember(boardId, memberUserId)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['boards'] })
      if (boardId) {
        await queryClient.invalidateQueries({ queryKey: boardQueryKeys.members(boardId) })
        await queryClient.invalidateQueries({ queryKey: boardQueryKeys.detail(boardId) })
      }
    },
  })
}

export function useDeleteBoardMutation() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const location = useLocation()

  return useMutation({
    mutationFn: (boardId: string) => deleteBoard(boardId),
    onSuccess: async (_, boardId) => {
      await queryClient.invalidateQueries({ queryKey: ['boards'] })
      await queryClient.invalidateQueries({ queryKey: boardQueryKeys.detail(boardId) })
      await queryClient.invalidateQueries({ queryKey: boardQueryKeys.members(boardId) })
      if (location.pathname === `/board/${boardId}`) {
        navigate('/')
      }
    },
  })
}
