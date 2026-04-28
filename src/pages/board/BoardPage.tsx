import { PageContainer } from '@/components/shared/PageContainer'

export function BoardPage() {
  return (
    <PageContainer className="max-w-none">
      <h1 className="text-2xl font-semibold">Board</h1>
      <p className="mt-2 text-muted-foreground">
        Kanban columns and tasks will be rendered here.
      </p>
    </PageContainer>
  )
}
