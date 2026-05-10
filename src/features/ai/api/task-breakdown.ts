import { z } from 'zod'
import i18n from '@/lib/i18n/i18n'

/** Must match `openRouterDevProxyPath` in `vite.config.ts` — dev-only same-origin proxy (Worker без CORS). */
const OPENROUTER_DEV_PROXY_PATH = '/api/openrouter-proxy'

const taskBreakdownItemSchema = z.object({
  title: z.string(),
  description: z.string(),
  color: z.string(),
})

const taskBreakdownResponseSchema = z.object({
  items: z.array(taskBreakdownItemSchema),
})

export type TaskBreakdownItem = z.infer<typeof taskBreakdownItemSchema>

export function getTaskBreakdownApiUrl(): string | null {
  const raw = (import.meta.env.VITE_OPENROUTER_API_URL as string | undefined)?.trim()
  if (!raw) return null
  if (import.meta.env.DEV) return OPENROUTER_DEV_PROXY_PATH
  return raw
}

export async function requestTaskBreakdown(task: string): Promise<TaskBreakdownItem[]> {
  const url = getTaskBreakdownApiUrl()
  if (!url) {
    throw new Error(i18n.t('errors.taskBreakdownApiNotConfigured'))
  }

  const trimmed = task.trim()
  if (!trimmed) {
    throw new Error(i18n.t('errors.taskBreakdownEmptyTask'))
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: trimmed }),
  })

  if (!res.ok) {
    throw new Error(
      i18n.t('errors.taskBreakdownHttpError', { status: String(res.status) }),
    )
  }

  let json: unknown
  try {
    json = await res.json()
  } catch {
    throw new Error(i18n.t('errors.taskBreakdownInvalidResponse'))
  }

  const parsed = taskBreakdownResponseSchema.safeParse(json)
  if (!parsed.success) {
    throw new Error(i18n.t('errors.taskBreakdownInvalidResponse'))
  }

  if (parsed.data.items.length === 0) {
    throw new Error(i18n.t('errors.taskBreakdownEmptyItems'))
  }

  return parsed.data.items
}
