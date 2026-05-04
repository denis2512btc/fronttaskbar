import type { Session, User } from '@supabase/supabase-js'
import { isSupabaseConfigured, supabase } from '@/lib/supabase/client'
import type { LoginInput, RegisterInput } from '@/lib/validations/auth'

/** Result of email/password sign-up; `session` is null when email confirmation is required. */
export interface SignUpResult {
  user: User | null
  session: Session | null
  needsEmailConfirmation: boolean
}

function requireSupabaseConfigured() {
  if (!isSupabaseConfigured) {
    throw new Error(
      'Supabase is not configured. Copy .env.example to .env and set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
    )
  }
}

export async function signIn({ email, password }: LoginInput) {
  requireSupabaseConfigured()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw new Error(error.message)
  return data
}

export async function signUp({ email, password, name }: RegisterInput): Promise<SignUpResult> {
  requireSupabaseConfigured()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  })
  if (error) throw new Error(error.message)
  const user = data.user ?? null
  const session = data.session ?? null
  return {
    user,
    session,
    needsEmailConfirmation: Boolean(user && !session),
  }
}

export async function signOut() {
  requireSupabaseConfigured()
  const { error } = await supabase.auth.signOut()
  if (error) throw new Error(error.message)
}

/**
 * Browser redirect OAuth. Configure Google in Supabase Dashboard → Authentication → Providers (Client ID + Secret from Google Cloud).
 * In Google Cloud → OAuth client: add Authorized redirect URI `https://<project-ref>.supabase.co/auth/v1/callback`.
 * In Supabase → URL configuration: allow `${origin}/auth/callback` in Redirect URLs. No Google secrets in frontend `.env`.
 */
export async function signInWithGoogle() {
  requireSupabaseConfigured()
  const redirectTo = `${window.location.origin}/auth/callback`
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo },
  })
  if (error) throw new Error(error.message)
  if (data.url) window.location.assign(data.url)
}
