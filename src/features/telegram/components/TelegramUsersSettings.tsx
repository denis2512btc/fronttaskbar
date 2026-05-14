import { useMemo, useId } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Loader2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  useDeleteTelegramUsernameMutation,
  useInsertTelegramUsernameMutation,
  useProfileTelegramUsernamesQuery,
} from '@/features/telegram/hooks/use-telegram-usernames-queries'
import { isSupabaseConfigured } from '@/lib/supabase/client'
import {
  telegramUsernameFormSchema,
  type TelegramUsernameFormInput,
} from '@/lib/validations/telegram-user'

interface TelegramUsersSettingsProps {
  userId: string
}

const emptyForm: TelegramUsernameFormInput = { username: '' }

export function TelegramUsersSettings({ userId }: TelegramUsersSettingsProps) {
  const { t } = useTranslation()
  const baseId = useId()
  const fieldId = `${baseId}-username`

  const listQuery = useProfileTelegramUsernamesQuery(userId)
  const insertMut = useInsertTelegramUsernameMutation(userId)
  const deleteMut = useDeleteTelegramUsernameMutation(userId)

  const schema = useMemo(() => telegramUsernameFormSchema(t), [t])
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<TelegramUsernameFormInput>({
    resolver: zodResolver(schema),
    defaultValues: emptyForm,
  })

  const entries = listQuery.data ?? []

  const onSubmit = async (data: TelegramUsernameFormInput) => {
    const normalized = data.username
    if (entries.some((e) => e.username === normalized)) {
      setError('username', {
        type: 'manual',
        message: t('settingsPage.telegram.duplicate'),
      })
      return
    }
    try {
      await insertMut.mutateAsync(normalized)
      reset(emptyForm)
    } catch (err) {
      const msg = err instanceof Error ? err.message : t('auth.genericError')
      setError('username', { type: 'manual', message: msg })
    }
  }

  const remove = (rowId: string) => {
    deleteMut.mutate(rowId)
  }

  return (
    <section
      id="saas-telegram"
      className="mt-10 rounded-xl border border-border/60 bg-card p-6 shadow-sm"
    >
      <h2 className="text-lg font-semibold">{t('settingsPage.telegramSection')}</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {t('settingsPage.telegramSectionHint')}
      </p>
      <p className="mt-2 text-xs text-muted-foreground">{t('settingsPage.telegram.privacyNotice')}</p>

      {!isSupabaseConfigured ? (
        <p className="mt-6 text-sm text-amber-600 dark:text-amber-400" role="status">
          {t('errors.supabaseNotConfigured')}
        </p>
      ) : null}

      {listQuery.isError ? (
        <p className="mt-6 text-sm text-destructive" role="alert">
          {listQuery.error instanceof Error ? listQuery.error.message : t('auth.genericError')}
        </p>
      ) : null}

      {isSupabaseConfigured && listQuery.isLoading ? (
        <p className="mt-6 text-sm text-muted-foreground">{t('common.loading')}</p>
      ) : null}

      {isSupabaseConfigured && !listQuery.isLoading && !listQuery.isError ? (
        <>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end"
            noValidate
          >
            <div className="flex flex-1 flex-col gap-2">
              <Label htmlFor={fieldId}>{t('settingsPage.telegram.usernameLabel')}</Label>
              <div className="flex gap-2">
                <span className="flex h-9 shrink-0 items-center rounded-lg border border-border bg-muted/40 px-2.5 text-sm text-muted-foreground">
                  @
                </span>
                <Input
                  id={fieldId}
                  type="text"
                  autoComplete="off"
                  placeholder={t('settingsPage.telegram.placeholder')}
                  className="flex-1"
                  disabled={insertMut.isPending}
                  aria-invalid={Boolean(errors.username)}
                  {...register('username')}
                />
              </div>
              {errors.username ? (
                <p className="text-sm text-destructive" role="alert">
                  {errors.username.message}
                </p>
              ) : null}
            </div>
            <Button type="submit" className="sm:shrink-0" disabled={insertMut.isPending}>
              {insertMut.isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  {t('common.saving')}
                </>
              ) : (
                t('settingsPage.telegram.add')
              )}
            </Button>
          </form>

          <div className="mt-6">
            {entries.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('settingsPage.telegram.empty')}</p>
            ) : (
              <ul className="divide-y divide-border/60 rounded-lg border border-border/60">
                {entries.map((row) => (
                  <li
                    key={row.id}
                    className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
                  >
                    <span className="font-medium text-foreground">@{row.username}</span>
                    <button
                      type="button"
                      onClick={() => remove(row.id)}
                      disabled={deleteMut.isPending}
                      className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-destructive disabled:pointer-events-none disabled:opacity-50"
                      title={t('settingsPage.telegram.remove')}
                      aria-label={t('settingsPage.telegram.remove')}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      ) : null}
    </section>
  )
}
