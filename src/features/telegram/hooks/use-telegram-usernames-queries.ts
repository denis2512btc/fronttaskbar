import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ProfileTelegramUsernameRow } from '@/features/telegram/api/telegram-usernames-api'
import {
  deleteProfileTelegramUsername,
  fetchProfileTelegramUsernames,
  insertProfileTelegramUsername,
} from '@/features/telegram/api/telegram-usernames-api'
import { isSupabaseConfigured } from '@/lib/supabase/client'

export const telegramUsernamesQueryKeys = {
  list: (profileId: string) => ['telegram-usernames', profileId] as const,
}

export function useProfileTelegramUsernamesQuery(profileId: string | undefined) {
  return useQuery({
    queryKey: telegramUsernamesQueryKeys.list(profileId ?? ''),
    queryFn: () => fetchProfileTelegramUsernames(profileId!),
    enabled: Boolean(profileId) && isSupabaseConfigured,
  })
}

export function useInsertTelegramUsernameMutation(profileId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (username: string) => {
      if (!profileId) throw new Error('No profile')
      return insertProfileTelegramUsername(profileId, username)
    },
    onSuccess: async (row: ProfileTelegramUsernameRow) => {
      if (!profileId) return
      await queryClient.cancelQueries({ queryKey: telegramUsernamesQueryKeys.list(profileId) })
      queryClient.setQueryData(
        telegramUsernamesQueryKeys.list(profileId),
        (prev: ProfileTelegramUsernameRow[] | undefined) => [...(prev ?? []), row],
      )
    },
  })
}

export function useDeleteTelegramUsernameMutation(profileId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (rowId: string) => {
      if (!profileId) throw new Error('No profile')
      return deleteProfileTelegramUsername(profileId, rowId)
    },
    onSuccess: async (_data, rowId) => {
      if (!profileId) return
      await queryClient.cancelQueries({ queryKey: telegramUsernamesQueryKeys.list(profileId) })
      queryClient.setQueryData(
        telegramUsernamesQueryKeys.list(profileId),
        (prev: ProfileTelegramUsernameRow[] | undefined) =>
          (prev ?? []).filter((r) => r.id !== rowId),
      )
    },
  })
}
