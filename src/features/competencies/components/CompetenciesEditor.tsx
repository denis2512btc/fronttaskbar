import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import type { CompetencyRoleRow, ProfileCompetencyRow } from '@/features/competencies/api/competencies-api'
import { fetchMyCompetencies } from '@/features/competencies/api/competencies-api'
import {
  competencyQueryKeys,
  useCompetencyCatalogQuery,
  useMyCompetenciesQuery,
  useReplaceCompetenciesMutation,
} from '@/features/competencies/hooks/use-competencies-queries'
import {
  createCompetenciesFormSchema,
  type CompetenciesFormValues,
} from '@/features/competencies/validations/competencies-form'
import { cn } from '@/lib/utils'

/** Stable ref when `mine` is undefined so `useEffect` deps do not change every render. */
const EMPTY_MINE: ProfileCompetencyRow[] = []

export interface CompetenciesEditorProps {
  userId: string
  variant: 'onboarding' | 'settings'
  onSaved?: () => void
  className?: string
}

export function CompetenciesEditor({
  userId,
  variant,
  onSaved,
  className,
}: CompetenciesEditorProps) {
  const { t } = useTranslation()
  const {
    data: catalog,
    isLoading: catalogLoading,
    isError: catalogError,
    error: catalogErrObj,
  } = useCompetencyCatalogQuery()
  const { data: mine, isLoading: mineLoading } = useMyCompetenciesQuery(userId)

  const loading = catalogLoading || mineLoading

  if (loading) {
    return (
      <div className={cn('flex items-center gap-2 text-muted-foreground', className)}>
        <Loader2 className="size-5 animate-spin text-indigo-600 dark:text-indigo-400" aria-hidden />
        <span className="text-sm">{t('common.loading')}</span>
      </div>
    )
  }

  if (catalogError) {
    const msg = catalogErrObj instanceof Error ? catalogErrObj.message : t('competencies.catalogEmpty')
    return <p className="text-sm text-destructive">{msg}</p>
  }

  if (!catalog?.length) {
    return (
      <p className="text-sm text-muted-foreground">{t('competencies.catalogEmpty')}</p>
    )
  }

  return (
    <CompetenciesEditorLoaded
      userId={userId}
      variant={variant}
      catalog={catalog}
      mine={mine ?? EMPTY_MINE}
      onSaved={onSaved}
      className={className}
    />
  )
}

interface CompetenciesEditorLoadedProps {
  userId: string
  variant: 'onboarding' | 'settings'
  catalog: CompetencyRoleRow[]
  mine: ProfileCompetencyRow[]
  onSaved?: () => void
  className?: string
}

function CompetenciesEditorLoaded({
  userId,
  variant,
  catalog,
  mine,
  onSaved,
  className,
}: CompetenciesEditorLoadedProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const replaceMutation = useReplaceCompetenciesMutation(userId)

  const catalogIds = useMemo(() => catalog.map((c) => c.id), [catalog])
  const schema = useMemo(
    () => createCompetenciesFormSchema(t, catalogIds),
    [t, catalogIds],
  )

  const form = useForm<CompetenciesFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { roleIds: [], primaryRoleId: '' },
  })

  const {
    watch,
    setValue,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = form

  const roleIds = watch('roleIds')
  const primaryRoleId = watch('primaryRoleId')

  useEffect(() => {
    const ids = mine.map((m) => m.role_id)
    const primary = mine.find((m) => m.is_primary)?.role_id ?? ''
    reset({ roleIds: ids, primaryRoleId: primary })
  }, [mine, reset])

  useEffect(() => {
    if (roleIds.length === 1) {
      setValue('primaryRoleId', roleIds[0], { shouldValidate: true })
    }
    if (roleIds.length > 1 && primaryRoleId && !roleIds.includes(primaryRoleId)) {
      setValue('primaryRoleId', roleIds[0], { shouldValidate: true })
    }
    if (roleIds.length === 0 && primaryRoleId) {
      setValue('primaryRoleId', '', { shouldValidate: false })
    }
  }, [roleIds, primaryRoleId, setValue])

  const toggleRole = (roleId: string) => {
    const cur = form.getValues('roleIds')
    if (cur.includes(roleId)) {
      setValue(
        'roleIds',
        cur.filter((x) => x !== roleId),
        { shouldValidate: true },
      )
      return
    }
    if (cur.length >= 5) return
    setValue('roleIds', [...cur, roleId], { shouldValidate: true })
  }

  const onSubmit = async (values: CompetenciesFormValues) => {
    try {
      await replaceMutation.mutateAsync({
        roleIds: values.roleIds,
        primaryRoleId: values.primaryRoleId,
      })
      await queryClient.ensureQueryData({
        queryKey: competencyQueryKeys.mine(userId),
        queryFn: () => fetchMyCompetencies(userId),
      })
      onSaved?.()
    } catch {
      /* surfaced below */
    }
  }

  const apiErr = replaceMutation.error instanceof Error ? replaceMutation.error.message : null

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn('flex flex-col gap-6', className)}
    >
      <div className="flex flex-col gap-2">
        <Label className="text-base font-medium">{t('competencies.pickRoles')}</Label>
        <p className="text-sm text-muted-foreground">{t('competencies.pickRolesHint')}</p>
        <div className="mt-2 flex flex-col gap-3">
          {catalog.map((role) => {
            const checked = roleIds.includes(role.id)
            const label = t(`competencies.roles.${role.slug}`)
            return (
              <label
                key={role.id}
                className={cn(
                  'flex cursor-pointer items-start gap-3 rounded-xl border border-border/60 bg-card p-4 shadow-sm transition-colors',
                  checked && 'border-indigo-500/40 bg-indigo-50/50 dark:bg-indigo-950/30',
                )}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => {
                    toggleRole(role.id)
                  }}
                  className="mt-1 size-4 shrink-0 rounded border-input text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm font-medium leading-tight">{label}</span>
              </label>
            )
          })}
        </div>
        {errors.roleIds && (
          <p className="text-xs text-destructive">{errors.roleIds.message}</p>
        )}
      </div>

      {roleIds.length > 1 && (
        <div className="flex flex-col gap-2">
          <Label className="text-base font-medium">{t('competencies.primaryRole')}</Label>
          <p className="text-sm text-muted-foreground">{t('competencies.primaryRoleHint')}</p>
          <div className="mt-2 flex flex-col gap-2">
            {roleIds.map((id) => {
              const role = catalog.find((r) => r.id === id)
              if (!role) return null
              return (
                <label
                  key={id}
                  className="flex cursor-pointer items-center gap-3 rounded-xl border border-border/60 bg-card px-4 py-3 shadow-sm"
                >
                  <input
                    type="radio"
                    name="primaryRoleId"
                    value={id}
                    checked={primaryRoleId === id}
                    onChange={() => setValue('primaryRoleId', id, { shouldValidate: true })}
                    className="size-4 border-input text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium">
                    {t(`competencies.roles.${role.slug}`)}
                  </span>
                </label>
              )
            })}
          </div>
          {errors.primaryRoleId && (
            <p className="text-xs text-destructive">{errors.primaryRoleId.message}</p>
          )}
        </div>
      )}

      {roleIds.length === 1 && errors.primaryRoleId ? (
        <p className="text-xs text-destructive">{errors.primaryRoleId.message}</p>
      ) : null}

      {apiErr ? <p className="text-sm text-destructive">{apiErr}</p> : null}

      <Button
        type="submit"
        disabled={isSubmitting || replaceMutation.isPending}
        className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm hover:from-indigo-500 hover:to-violet-500"
        size="lg"
      >
        {isSubmitting || replaceMutation.isPending
          ? t('common.saving')
          : variant === 'onboarding'
            ? t('competencies.continue')
            : t('common.save')}
      </Button>
    </form>
  )
}
