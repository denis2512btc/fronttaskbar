import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

export function AuthCallbackPage() {
  const navigate = useNavigate()

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      const { error } = await supabase.auth.exchangeCodeForSession(window.location.href)
      if (cancelled) return
      if (error) {
        navigate(`/auth?error=${encodeURIComponent(error.message)}`, { replace: true })
        return
      }
      navigate('/', { replace: true })
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [navigate])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-gradient-to-br from-indigo-50 to-violet-50 p-6 dark:from-indigo-950 dark:to-violet-950">
      <Loader2
        className="size-8 animate-spin text-indigo-600 dark:text-indigo-400"
        aria-hidden
      />
      <p className="text-sm text-muted-foreground">Signing you in…</p>
    </div>
  )
}
