import { PageContainer } from '@/components/shared/PageContainer'

export function BoardPage() {
  return (
    <PageContainer>
      <h1 className="text-2xl font-semibold">Доска</h1>
      <p className="mt-2 text-muted-foreground">
        Канбан и задачи для этой доски появятся здесь.
      </p>
    </PageContainer>
  )
}
