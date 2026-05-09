import { isSupabaseConfigured, supabase } from '@/lib/supabase/client'
import i18n from '@/lib/i18n/i18n'
import type { Database } from '@/types/database'

export type CompetencyRoleRow = Database['public']['Tables']['competency_roles']['Row']
export type ProfileCompetencyRow = Database['public']['Tables']['profile_competencies']['Row']

function ensureConfigured(): void {
  if (!isSupabaseConfigured) {
    throw new Error(i18n.t('errors.supabaseNotConfigured'))
  }
}

export async function fetchCompetencyCatalog(): Promise<CompetencyRoleRow[]> {
  ensureConfigured()
  const { data, error } = await supabase
    .from('competency_roles')
    .select('id, slug, sort_order')
    .order('sort_order', { ascending: true })

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function fetchMyCompetencies(profileId: string): Promise<ProfileCompetencyRow[]> {
  ensureConfigured()
  const { data, error } = await supabase
    .from('profile_competencies')
    .select('id, profile_id, role_id, is_primary')
    .eq('profile_id', profileId)

  if (error) throw new Error(error.message)
  return data ?? []
}

export interface ProfileCompetencyRoleItem {
  role_id: string
  slug: string
  is_primary: boolean
}

export async function fetchProfileCompetencyRoles(
  profileId: string,
): Promise<ProfileCompetencyRoleItem[]> {
  ensureConfigured()
  const { data, error } = await supabase
    .from('profile_competencies')
    .select('role_id, is_primary, competency_roles(slug)')
    .eq('profile_id', profileId)
    .order('is_primary', { ascending: false })

  if (error) throw new Error(error.message)

  const rows = data ?? []
  return rows
    .map((row) => {
      const embed = row.competency_roles as { slug: string } | { slug: string }[] | null
      const slug = Array.isArray(embed) ? embed[0]?.slug : embed?.slug
      return {
        role_id: row.role_id,
        is_primary: row.is_primary,
        slug: slug ?? '',
      }
    })
    .filter((r) => Boolean(r.slug))
}

export async function replaceMyCompetencies(
  profileId: string,
  roleIds: string[],
  primaryRoleId: string,
): Promise<void> {
  ensureConfigured()
  const unique = [...new Set(roleIds)]
  if (unique.length < 1 || unique.length > 5) {
    throw new Error(i18n.t('validation.competenciesMax5'))
  }
  if (!unique.includes(primaryRoleId)) {
    throw new Error(i18n.t('validation.competenciesPrimaryMustBeSelected'))
  }

  const { error: delErr } = await supabase
    .from('profile_competencies')
    .delete()
    .eq('profile_id', profileId)

  if (delErr) throw new Error(delErr.message)

  const rows = unique.map((role_id) => ({
    profile_id: profileId,
    role_id,
    is_primary: role_id === primaryRoleId,
  }))

  const { error: insErr } = await supabase.from('profile_competencies').insert(rows)

  if (insErr) throw new Error(insErr.message)
}
