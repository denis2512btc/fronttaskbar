import { useEffect, useId, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { KanbanSquare, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createBoardFormSchema, type CreateBoardFormInput } from '@/lib/validations/board'
import { useAuthSession } from '@/features/auth/hooks/use-auth-session'
import { useCreateBoardMutation } from '@/features/boards/hooks/use-boards-queries'
import { useProfileCompetencyRolesQuery } from '@/features/competencies/hooks/use-competencies-queries'
import { useUIStore } from '@/stores/ui.store'
import { isSupabaseConfigured } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

const emptyForm: CreateBoardFormInput = { title: '', competencyRoleId: '' }

export function CreateBoardDialog() {
  const { t } = useTranslation()
  const baseId = useId()
  const titleFieldId = `${baseId}-title`
  const { user } = useAuthSession()
  const createBoardDialogOpen = useUIStore((s) => s.createBoardDialogOpen)
  const setCreateBoardDialogOpen = useUIStore((s) => s.setCreateBoardDialogOpen)

  const createMutation = useCreateBoardMutation(user?.id)

  const rolesQuery = useProfileCompetencyRolesQuery(
    user?.id,
    createBoardDialogOpen && Boolean(user?.id) && isSupabaseConfigured,
  )

  const boardSchema = useMemo(() => createBoardFormSchema(t), [t])

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<CreateBoardFormInput>({
    resolver: zodResolver(boardSchema),
    defaultValues: emptyForm,
  })

  useEffect(() => {
    if (!createBoardDialogOpen) return
    createMutation.reset()
  }, [createBoardDialogOpen])

  useEffect(() => {
    if (!createBoardDialogOpen) return
    const roles = rolesQuery.data
    if (!roles?.length) return
    const cur = getValues('competencyRoleId')
    if (cur && roles.some((r) => r.role_id === cur)) return
    const primary = roles.find((r) => r.is_primary)
    setValue('competencyRoleId', primary?.role_id ?? roles[0]!.role_id)
  }, [createBoardDialogOpen, rolesQuery.data, getValues, setValue])

  const handleOpenChange = (next: boolean) => {
    setCreateBoardDialogOpen(next)
    if (!next) reset(emptyForm)
  }

  const onSubmit = async (input: CreateBoardFormInput) => {
    if (!user?.id || !isSupabaseConfigured) return
    try {
      await createMutation.mutateAsync({
        title: input.title.trim(),
        competencyRoleId: input.competencyRoleId,
      })
      setCreateBoardDialogOpen(false)
      reset(emptyForm)
    } catch {
      /* mutation error surfaced via isError */
    }
  }

  const submitBlockedBase = !user?.id || !isSupabaseConfigured
  const roles = rolesQuery.data ?? []
  const competencySectionEnabled =
    createBoardDialogOpen && Boolean(user?.id) && isSupabaseConfigured
  const competencyReady =
    !rolesQuery.isPending && !rolesQuery.isError && competencySectionEnabled
  const hasCompetencies = roles.length > 0
  const submitBlocked =
    submitBlockedBase ||
    createMutation.isPending ||
    !competencyReady ||
    !hasCompetencies

  return (
    <Dialog open={createBoardDialogOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <span className="mb-1 flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600">
            <KanbanSquare className="size-4 text-white" strokeWidth={2} />
          </span>
          <DialogTitle className="text-lg">{t('boardCreate.title')}</DialogTitle>
          <DialogDescription>{t('boardCreate.description')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {!isSupabaseConfigured && (
            <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-900 dark:text-amber-200">
              {t('boardCreate.supabaseHint')}
            </p>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor={titleFieldId}>{t('boardCreate.nameLabel')}</Label>
            <Input
              id={titleFieldId}
              placeholder={t('boardCreate.placeholder')}
              autoComplete="off"
              aria-invalid={!!errors.title}
              disabled={submitBlockedBase}
              {...register('title')}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          {competencySectionEnabled ? (
            <div className="flex flex-col gap-2" role="group" aria-labelledby={`${baseId}-competency-legend`}>
              <div>
                <p id={`${baseId}-competency-legend`} className="text-base font-medium">
                  {t('boardCreate.competencyLabel')}
                </p>
                <p className="text-sm text-muted-foreground">{t('boardCreate.competencyHint')}</p>
              </div>

              {rolesQuery.isPending ? (
                <div className="flex items-center gap-2 rounded-lg border border-border/60 px-3 py-2">
                  <Loader2 className="size-4 animate-spin text-muted-foreground" aria-hidden />
                  <span className="text-sm text-muted-foreground">
                    {t('boardCreate.competencyLoading')}
                  </span>
                </div>
              ) : rolesQuery.isError ? (
                <p className="text-xs text-destructive">
                  {rolesQuery.error instanceof Error
                    ? rolesQuery.error.message
                    : t('boardCreate.competencyLoadError')}
                </p>
              ) : !hasCompetencies ? (
                <p className="text-sm text-muted-foreground">
                  {t('boardCreate.noCompetencies')}{' '}
                  <Link
                    to="/settings"
                    className="font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400"
                  >
                    {t('settingsPage.title')}
                  </Link>
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {(rolesQuery.data ?? []).map((r) => (
                    <label
                      key={r.role_id}
                      className={cn(
                        'flex cursor-pointer items-center gap-3 rounded-lg border border-border/60 bg-card px-3 py-2',
                        submitBlockedBase && 'pointer-events-none opacity-60',
                      )}
                    >
                      <input
                        type="radio"
                        value={r.role_id}
                        disabled={submitBlockedBase}
                        className="size-4 border-input text-indigo-600"
                        aria-invalid={!!errors.competencyRoleId}
                        {...register('competencyRoleId')}
                      />
                      <span className="text-sm font-medium">
                        {t(`competencies.roles.${r.slug}`)}
                        {r.is_primary ? (
                          <span className="ml-2 text-xs font-normal text-muted-foreground">
                            ({t('boardSettings.invitePrimaryBadge')})
                          </span>
                        ) : null}
                      </span>
                    </label>
                  ))}
                  {errors.competencyRoleId && (
                    <p className="text-xs text-destructive">{errors.competencyRoleId.message}</p>
                  )}
                </div>
              )}
            </div>
          ) : null}

          {createMutation.isError && (
            <p className="text-xs text-destructive">
              {createMutation.error instanceof Error
                ? createMutation.error.message
                : t('boardCreate.createError')}
            </p>
          )}

          <DialogFooter className="gap-2 sm:gap-2">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={submitBlocked}
              className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm shadow-indigo-500/20 hover:opacity-90"
            >
              {createMutation.isPending ? t('common.creating') : t('boardCreate.create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
