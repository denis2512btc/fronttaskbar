import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function AuthPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 to-violet-50 p-6 dark:from-indigo-950 dark:to-violet-950">
      <Card className="w-full max-w-md shadow-sm rounded-xl">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Welcome back</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            Auth forms will be built here.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
