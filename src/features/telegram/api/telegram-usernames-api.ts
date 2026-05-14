import { isSupabaseConfigured, supabase } from '@/lib/supabase/client'
import i18n from '@/lib/i18n/i18n'
import type { Database } from '@/types/database'
import { normalizeTelegramUsername } from '@/lib/validations/telegram-user'

export type ProfileTelegramUsernameRow =
  Database['public']['Tables']['profile_telegram_usernames']['Row']

function ensureConfigured(): void {
  if (!isSupabaseConfigured) {
    throw new Error(i18n.t('errors.supabaseNotConfigured'))
  }
}

function isUniqueViolation(error: { code?: string; message: string }): boolean {
  return error.code === '23505' || error.message.includes('duplicate key')
}

export async function fetchProfileTelegramUsernames(
  profileId: string,
): Promise<ProfileTelegramUsernameRow[]> {
  ensureConfigured()
  const { data, error } = await supabase
    .from('profile_telegram_usernames')
    .select('id, profile_id, username, created_at')
    .eq('profile_id', profileId)
    .order('created_at', { ascending: true })

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function insertProfileTelegramUsername(
  profileId: string,
  rawUsername: string,
): Promise<ProfileTelegramUsernameRow> {
  ensureConfigured()
  const username = normalizeTelegramUsername(rawUsername)
  const { data, error } = await supabase
    .from('profile_telegram_usernames')
    .insert({ profile_id: profileId, username })
    .select('id, profile_id, username, created_at')
    .single()

  if (error) {
    if (isUniqueViolation(error)) {
      throw new Error(i18n.t('settingsPage.telegram.duplicate'))
    }
    throw new Error(error.message)
  }
  return data as ProfileTelegramUsernameRow
}

export async function deleteProfileTelegramUsername(
  profileId: string,
  rowId: string,
): Promise<void> {
  ensureConfigured()
  const { error } = await supabase
    .from('profile_telegram_usernames')
    .delete()
    .eq('id', rowId)
    .eq('profile_id', profileId)

  if (error) throw new Error(error.message)
}
