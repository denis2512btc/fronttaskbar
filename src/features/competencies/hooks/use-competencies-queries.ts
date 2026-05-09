import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ProfileCompetencyRow } from '@/features/competencies/api/competencies-api'
import {
  fetchCompetencyCatalog,
  fetchMyCompetencies,
  fetchProfileCompetencyRoles,
  replaceMyCompetencies,
} from '@/features/competencies/api/competencies-api'
import { isSupabaseConfigured } from '@/lib/supabase/client'

export const competencyQueryKeys = {
  catalog: ['competencies', 'catalog'] as const,
  mine: (userId: string) => ['competencies', 'mine', userId] as const,
  profileRoles: (profileId: string) => ['competencies', 'profileRoles', profileId] as const,
}

export function useCompetencyCatalogQuery() {
  return useQuery({
    queryKey: competencyQueryKeys.catalog,
    queryFn: fetchCompetencyCatalog,
    enabled: isSupabaseConfigured,
  })
}

export function useMyCompetenciesQuery(userId: string | undefined) {
  return useQuery({
    queryKey: competencyQueryKeys.mine(userId ?? ''),
    queryFn: () => fetchMyCompetencies(userId!),
    enabled: Boolean(userId) && isSupabaseConfigured,
  })
}

export function useProfileCompetencyRolesQuery(profileId: string | undefined, enabled: boolean) {
  return useQuery({
    queryKey: competencyQueryKeys.profileRoles(profileId ?? ''),
    queryFn: () => fetchProfileCompetencyRoles(profileId!),
    enabled: Boolean(profileId) && enabled && isSupabaseConfigured,
  })
}

export function useReplaceCompetenciesMutation(userId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: { roleIds: string[]; primaryRoleId: string }) => {
      if (!userId) throw new Error('No user')
      await replaceMyCompetencies(userId, input.roleIds, input.primaryRoleId)
    },
    onSuccess: async (_data, variables) => {
      if (!userId) return
      const optimistic: ProfileCompetencyRow[] = variables.roleIds.map((roleId) => ({
        id: `optimistic-${roleId}`,
        profile_id: userId,
        role_id: roleId,
        is_primary: roleId === variables.primaryRoleId,
      }))
      queryClient.setQueryData(competencyQueryKeys.mine(userId), optimistic)
      await queryClient.invalidateQueries({ queryKey: competencyQueryKeys.mine(userId) })
      await queryClient.invalidateQueries({
        queryKey: competencyQueryKeys.profileRoles(userId),
      })
    },
  })
}
