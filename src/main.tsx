import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/lib/i18n/i18n'
import '@/styles/globals.css'
import { App } from '@/app/App'
import { Providers } from '@/app/providers'

const rootEl = document.getElementById('root')
if (!rootEl) throw new Error('Root element not found')

createRoot(rootEl).render(
  <StrictMode>
    <Providers>
      <App />
    </Providers>
  </StrictMode>,
)
