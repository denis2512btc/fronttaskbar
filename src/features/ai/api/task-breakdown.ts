import { z } from 'zod'
import i18n from '@/lib/i18n/i18n'

/** Must match `openRouterDevProxyPath` in `vite.config.ts` — dev-only same-origin proxy (Worker без CORS). */
const OPENROUTER_DEV_PROXY_PATH = '/api/openrouter-proxy'

export interface TaskBreakdownMemberPayload {
  user_id: string
  competency_role_id: string
}

const rawBreakdownItemSchema = z.object({
  title: z.string(),
  description: z.string(),
  color: z.string(),
  user_id: z.preprocess(
    (v) => (typeof v === 'string' && v.trim() === '' ? undefined : v),
    z.union([z.string().uuid(), z.null()]).optional(),
  ),
})

const taskBreakdownResponseSchema = z.object({
  items: z.array(rawBreakdownItemSchema),
})

export type TaskBreakdownItem = {
  title: string
  description: string
  color: string
  assigneeId: string | null
}

export function getTaskBreakdownApiUrl(): string | null {
  const raw = (import.meta.env.VITE_OPENROUTER_API_URL as string | undefined)?.trim()
  if (!raw) return null
  if (import.meta.env.DEV) return OPENROUTER_DEV_PROXY_PATH
  return raw
}

function normalizeBreakdownItems(
  rawItems: z.infer<typeof rawBreakdownItemSchema>[],
  allowedUserIds: ReadonlySet<string>,
): TaskBreakdownItem[] {
  return rawItems.map((item) => {
    const uid = item.user_id
    const assigneeId =
      uid != null && typeof uid === 'string' && allowedUserIds.has(uid) ? uid : null
    return {
      title: item.title,
      description: item.description,
      color: item.color,
      assigneeId,
    }
  })
}

export async function requestTaskBreakdown(params: {
  prompt: string
  members: TaskBreakdownMemberPayload[]
}): Promise<TaskBreakdownItem[]> {
  const url = getTaskBreakdownApiUrl()
  if (!url) {
    throw new Error(i18n.t('errors.taskBreakdownApiNotConfigured'))
  }

  const trimmed = params.prompt.trim()
  if (!trimmed) {
    throw new Error(i18n.t('errors.taskBreakdownEmptyTask'))
  }

  const allowedUserIds = new Set(params.members.map((m) => m.user_id))

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: trimmed,
      members: params.members,
    }),
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

  return normalizeBreakdownItems(parsed.data.items, allowedUserIds)
}
