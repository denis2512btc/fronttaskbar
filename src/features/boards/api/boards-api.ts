import { isSupabaseConfigured, supabase } from '@/lib/supabase/client'
import type { Database } from '@/types/database'

export type BoardRow = Database['public']['Tables']['boards']['Row']

function ensureConfigured(): void {
  if (!isSupabaseConfigured) {
    throw new Error(
      'Supabase не настроен. Укажите VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY в .env.',
    )
  }
}

export async function fetchBoardsForUser(ownerId: string): Promise<BoardRow[]> {
  ensureConfigured()
  const { data, error } = await supabase
    .from('boards')
    .select('*')
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function createBoard(params: {
  title: string
  ownerId: string
}): Promise<{ id: string }> {
  ensureConfigured()
  const { data, error } = await supabase
    .from('boards')
    .insert({ title: params.title.trim(), owner_id: params.ownerId })
    .select('id')
    .single()

  if (error) throw new Error(error.message)
  if (!data) throw new Error('Не удалось создать доску')
  return { id: data.id }
}

export async function fetchBoardById(boardId: string, ownerId: string): Promise<BoardRow | null> {
  ensureConfigured()
  const { data, error } = await supabase
    .from('boards')
    .select('*')
    .eq('id', boardId)
    .eq('owner_id', ownerId)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return data
}
