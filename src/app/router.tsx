import { createBrowserRouter, Outlet } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { ProtectedRoute } from '@/features/auth/components/protected-route'
import { CompetenciesCompleteGate } from '@/features/competencies/components/CompetenciesCompleteGate'
import { AuthCallbackPage } from '@/pages/auth/AuthCallbackPage'
import { AuthPage } from '@/pages/auth/AuthPage'
import { DashboardPage } from '@/pages/dashboard/DashboardPage'
import { BoardPage } from '@/pages/board/BoardPage'
import { CompetenciesOnboardingPage } from '@/pages/onboarding/CompetenciesOnboardingPage'
import { SettingsPage } from '@/pages/settings/SettingsPage'
import { NotFoundPage } from '@/pages/NotFoundPage'

export const router = createBrowserRouter([
  {
    path: '/auth',
    element: <AuthPage />,
  },
  {
    path: '/auth/callback',
    element: <AuthCallbackPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Outlet />
      </ProtectedRoute>
    ),
    children: [
      {
        path: 'onboarding/competencies',
        element: <CompetenciesOnboardingPage />,
      },
      {
        element: (
          <CompetenciesCompleteGate>
            <AppLayout />
          </CompetenciesCompleteGate>
        ),
        children: [
          { index: true, element: <DashboardPage /> },
          { path: 'board/:boardId', element: <BoardPage /> },
          { path: 'settings', element: <SettingsPage /> },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
])
