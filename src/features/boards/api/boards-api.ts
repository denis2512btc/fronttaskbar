import type { User } from '@supabase/supabase-js'
import { isSupabaseConfigured, supabase } from '@/lib/supabase/client'
import { fetchProfileCompetencyRoles } from '@/features/competencies/api/competencies-api'
import i18n from '@/lib/i18n/i18n'
import type { Database } from '@/types/database'

export type BoardRow = Database['public']['Tables']['boards']['Row']
export type ProfileRow = Pick<
  Database['public']['Tables']['profiles']['Row'],
  'id' | 'display_name' | 'email'
>

export interface BoardMemberWithProfile {
  user_id: string
  created_at: string
  competency_role_id: string
  profiles: ProfileRow | null
  competency_roles: { slug: string } | null
}

function ensureConfigured(): void {
  if (!isSupabaseConfigured) {
    throw new Error(i18n.t('errors.supabaseNotConfigured'))
  }
}

/** Escape % and _ for Postgres ILIKE inside PostgREST filter strings. */
function escapeIlikePattern(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_')
}

function mergeBoardsById(owned: BoardRow[], shared: BoardRow[]): BoardRow[] {
  const map = new Map<string, BoardRow>()
  for (const b of shared) map.set(b.id, b)
  for (const b of owned) map.set(b.id, b)
  return [...map.values()].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )
}

async function ensureCompetencyRoleAllowedForUser(
  userId: string,
  competencyRoleId: string,
): Promise<void> {
  const roles = await fetchProfileCompetencyRoles(userId)
  if (roles.length === 0) {
    throw new Error(i18n.t('errors.boardMemberNoCompetencies'))
  }
  if (!roles.some((r) => r.role_id === competencyRoleId)) {
    throw new Error(i18n.t('errors.boardMemberRoleInvalid'))
  }
}

export async function upsertCurrentUserProfile(user: User): Promise<void> {
  ensureConfigured()
  const email = user.email ?? ''
  const displayName =
    (typeof user.user_metadata?.full_name === 'string' && user.user_metadata.full_name) ||
    (typeof user.user_metadata?.name === 'string' && user.user_metadata.name) ||
    (email.includes('@') ? email.split('@')[0] : '') ||
    'User'

  const { error } = await supabase.from('profiles').upsert(
    { id: user.id, email: email || null, display_name: displayName },
    { onConflict: 'id' },
  )

  if (error) throw new Error(error.message)
}

export async function fetchProfileById(userId: string): Promise<ProfileRow | null> {
  ensureConfigured()
  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, email')
    .eq('id', userId)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return data
}

export async function searchProfiles(search: string, limit = 20): Promise<ProfileRow[]> {
  ensureConfigured()
  const q = search.trim()
  if (q.length < 2) return []

  const safe = escapeIlikePattern(q)
  const pattern = `%${safe}%`

  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, email')
    .or(`display_name.ilike.${pattern},email.ilike.${pattern}`)
    .limit(limit)

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function fetchAccessibleBoardsForUser(userId: string): Promise<BoardRow[]> {
  ensureConfigured()

  const [{ data: owned, error: ownedErr }, { data: memberRows, error: memberErr }] =
    await Promise.all([
      supabase
        .from('boards')
        .select('*')
        .eq('owner_id', userId)
        .order('created_at', { ascending: false }),
      supabase.from('board_members').select('board_id').eq('user_id', userId),
    ])

  if (ownedErr) throw new Error(ownedErr.message)
  if (memberErr) throw new Error(memberErr.message)

  const memberBoardIds = [...new Set((memberRows ?? []).map((r) => r.board_id).filter(Boolean))]
  let shared: BoardRow[] = []
  if (memberBoardIds.length > 0) {
    const { data: sharedData, error: sharedErr } = await supabase
      .from('boards')
      .select('*')
      .in('id', memberBoardIds)
      .order('created_at', { ascending: false })

    if (sharedErr) throw new Error(sharedErr.message)
    shared = sharedData ?? []
  }

  return mergeBoardsById(owned ?? [], shared)
}

export async function createBoard(params: {
  title: string
  ownerId: string
  competencyRoleId: string
}): Promise<{ id: string }> {
  ensureConfigured()
  await ensureCompetencyRoleAllowedForUser(params.ownerId, params.competencyRoleId)

  const { data, error } = await supabase
    .from('boards')
    .insert({ title: params.title.trim(), owner_id: params.ownerId })
    .select('id')
    .single()

  if (error) {
    if (error.code === '23505') throw new Error(i18n.t('errors.boardTitleNotUnique'))
    throw new Error(error.message)
  }
  if (!data) throw new Error(i18n.t('errors.createBoardFailed'))

  const { error: memberErr } = await supabase.from('board_members').insert({
    board_id: data.id,
    user_id: params.ownerId,
    competency_role_id: params.competencyRoleId,
  })

  if (memberErr) throw new Error(memberErr.message)
  return { id: data.id }
}

export async function fetchBoardById(boardId: string): Promise<BoardRow | null> {
  ensureConfigured()
  const { data, error } = await supabase.from('boards').select('*').eq('id', boardId).maybeSingle()

  if (error) throw new Error(error.message)
  return data
}

export async function fetchBoardMembers(boardId: string): Promise<BoardMemberWithProfile[]> {
  ensureConfigured()
  const { data, error } = await supabase
    .from('board_members')
    .select(
      'user_id, created_at, competency_role_id, profiles(id, display_name, email), competency_roles(slug)',
    )
    .eq('board_id', boardId)
    .order('created_at', { ascending: true })

  if (error) throw new Error(error.message)
  return (data ?? []) as BoardMemberWithProfile[]
}

export async function addBoardMember(
  boardId: string,
  userId: string,
  competencyRoleId: string,
): Promise<void> {
  ensureConfigured()
  await ensureCompetencyRoleAllowedForUser(userId, competencyRoleId)
  const { error } = await supabase.from('board_members').insert({
    board_id: boardId,
    user_id: userId,
    competency_role_id: competencyRoleId,
  })

  if (error) throw new Error(error.message)
}

export async function removeBoardMember(boardId: string, userId: string): Promise<void> {
  ensureConfigured()
  const { error } = await supabase
    .from('board_members')
    .delete()
    .eq('board_id', boardId)
    .eq('user_id', userId)

  if (error) throw new Error(error.message)
}

export async function deleteBoard(boardId: string): Promise<void> {
  ensureConfigured()
  const { error } = await supabase.from('boards').delete().eq('id', boardId)

  if (error) throw new Error(error.message)
}
