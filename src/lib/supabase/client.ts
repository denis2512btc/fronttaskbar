import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

/** Valid URL + non-empty key so createClient does not throw when .env is missing locally. */
const DEV_PLACEHOLDER_URL = 'https://placeholder.supabase.co'
const DEV_PLACEHOLDER_ANON_KEY = 'eyJhbGciOiJIUzI1NiJ9.dev-placeholder-key'

const rawUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim()
const rawKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim()

const supabaseUrl = rawUrl || DEV_PLACEHOLDER_URL
const supabaseAnonKey = rawKey || DEV_PLACEHOLDER_ANON_KEY

if (import.meta.env.DEV && (!rawUrl || !rawKey)) {
  console.warn(
    '[supabase] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing. Using placeholders — copy .env.example to .env and set your Supabase keys for real auth and data.',
  )
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

export const isSupabaseConfigured = Boolean(rawUrl && rawKey)
