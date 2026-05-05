import type { TFunction } from 'i18next'
import { z } from 'zod'

export function createLoginSchema(t: TFunction) {
  return z.object({
    email: z.string().email(t('validation.emailInvalid')),
    password: z.string().min(8, t('validation.passwordMin')),
  })
}

export type LoginInput = z.infer<ReturnType<typeof createLoginSchema>>

export function createRegisterSchema(t: TFunction) {
  return createLoginSchema(t).extend({
    name: z.string().min(2, t('validation.nameMin')),
  })
}

export type RegisterInput = z.infer<ReturnType<typeof createRegisterSchema>>
