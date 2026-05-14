import type { TFunction } from 'i18next'
import { z } from 'zod'

const TELEGRAM_USERNAME_RE = /^[a-z0-9_]{5,32}$/

export function normalizeTelegramUsername(raw: string): string {
  return raw.trim().replace(/^@+/, '').toLowerCase()
}

export function telegramUsernameFormSchema(t: TFunction) {
  return z.object({
    username: z
      .string()
      .min(1, t('validation.telegramUsernameRequired'))
      .transform(normalizeTelegramUsername)
      .pipe(
        z
          .string()
          .regex(TELEGRAM_USERNAME_RE, t('validation.telegramUsernameInvalid')),
      ),
  })
}

export type TelegramUsernameFormInput = z.infer<
  ReturnType<typeof telegramUsernameFormSchema>
>
