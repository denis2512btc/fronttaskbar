import { isSupabaseConfigured, supabase } from '@/lib/supabase/client'
import i18n from '@/lib/i18n/i18n'

function ensureConfigured(): void {
  if (!isSupabaseConfigured) {
    throw new Error(i18n.t('errors.supabaseNotConfigured'))
  }
}

export async function insertTaskBreakdownPrompt(params: {
  boardId: string
  promptText: string
}): Promise<string> {
  ensureConfigured()
  const promptText = params.promptText.trim()
  if (promptText.length === 0) {
    throw new Error(i18n.t('errors.taskBreakdownEmptyTask'))
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError) throw new Error(authError.message)
  if (!user) throw new Error(i18n.t('errors.needAuth'))

  const { data, error } = await supabase
    .from('board_task_breakdown_prompts')
    .insert({
      board_id: params.boardId,
      user_id: user.id,
      prompt_text: promptText,
    })
    .select('id')
    .single()

  if (error) throw new Error(error.message)
  if (!data?.id) throw new Error(i18n.t('board.saveCardError'))
  return data.id
}
