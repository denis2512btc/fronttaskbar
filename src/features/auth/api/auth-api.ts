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
