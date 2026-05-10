import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const openRouterUrl = env.VITE_OPENROUTER_API_URL?.trim()

  /** Same path as `OPENROUTER_DEV_PROXY_PATH` in `task-breakdown.ts` (avoids CORS in dev). */
  const openRouterDevProxyPath = '/api/openrouter-proxy'

  let server:
    | {
        proxy: Record<
          string,
          { target: string; changeOrigin: boolean; rewrite: (p: string) => string }
        >
      }
    | undefined

  if (openRouterUrl) {
    try {
      const parsed = new URL(openRouterUrl)
      const targetOrigin = `${parsed.protocol}//${parsed.host}`
      const pathname = parsed.pathname || '/'
      server = {
        proxy: {
          [openRouterDevProxyPath]: {
            target: targetOrigin,
            changeOrigin: true,
            rewrite: () => pathname,
          },
        },
      }
    } catch {
      /* ignore invalid VITE_OPENROUTER_API_URL */
    }
  }

  return {
    plugins: [react(), tailwindcss(), cloudflare()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    ...(server ? { server } : {}),
  };
})