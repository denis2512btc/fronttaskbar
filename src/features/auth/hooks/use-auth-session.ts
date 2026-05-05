import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { upsertCurrentUserProfile } from '@/features/boards/api/boards-api'
import { isSupabaseConfigured, supabase } from '@/lib/supabase/client'

interface AuthSessionState {
  user: User | null
  loading: boolean
}

export function useAuthSession(): AuthSessionState {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!user || !isSupabaseConfigured) return
    void upsertCurrentUserProfile(user).catch((err) => {
      console.warn('[profiles] sync failed:', err)
    })
  }, [user])

  return { user, loading }
}
