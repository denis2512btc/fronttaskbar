import { PageContainer } from '@/components/shared/PageContainer'

export function DashboardPage() {
  return (
    <PageContainer>
      <h1 className="text-2xl font-semibold">Мои доски</h1>
      <p className="mt-2 text-muted-foreground">
        Список досок и проектов появится здесь.
      </p>
    </PageContainer>
  )
}
