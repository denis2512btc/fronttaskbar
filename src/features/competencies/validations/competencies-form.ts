import type { TFunction } from 'i18next'
import { z } from 'zod'

export function createCompetenciesFormSchema(t: TFunction, catalogRoleIds: string[]) {
  const idSet = new Set(catalogRoleIds)
  return z
    .object({
      roleIds: z.array(z.string().uuid()),
      primaryRoleId: z.string(),
    })
    .superRefine((data, ctx) => {
      if (data.roleIds.length < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t('validation.competenciesMinOne'),
          path: ['roleIds'],
        })
      }
      if (data.roleIds.length > 5) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t('validation.competenciesMax5'),
          path: ['roleIds'],
        })
      }
      const uniq = new Set(data.roleIds)
      if (uniq.size !== data.roleIds.length) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t('validation.competenciesUnique'),
          path: ['roleIds'],
        })
      }
      for (const id of data.roleIds) {
        if (!idSet.has(id)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t('validation.competenciesInvalid'),
            path: ['roleIds'],
          })
          return
        }
      }
      if (data.roleIds.length > 0) {
        const uuidOk = z.string().uuid().safeParse(data.primaryRoleId).success
        if (!uuidOk) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t('validation.competenciesPrimaryRequired'),
            path: ['primaryRoleId'],
          })
        } else if (!data.roleIds.includes(data.primaryRoleId)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t('validation.competenciesPrimaryMustBeSelected'),
            path: ['primaryRoleId'],
          })
        }
      }
    })
}

export interface CompetenciesFormValues {
  roleIds: string[]
  primaryRoleId: string
}
