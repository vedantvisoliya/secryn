import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

/**
 * The backend's CORS allowlist contains only the deployed origin, so a browser
 * on localhost is rejected before the request is even read. In dev we proxy
 * instead: the browser talks to Vite (same origin, no CORS at all) and Vite
 * forwards server-to-server, where CORS does not apply.
 */
const API_TARGET =
  process.env.VITE_API_BASE_URL || 'https://api-key-lister.fastapicloud.dev'

const proxyEntry = {
  target: API_TARGET,
  changeOrigin: true,
  // Strip Origin so the backend sees a plain server-to-server call rather
  // than a cross-origin browser request it would reject.
  configure: (proxy) => {
    proxy.on('proxyReq', (proxyReq) => proxyReq.removeHeader('origin'))
  },
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': proxyEntry,
      '/health': proxyEntry,
    },
  },
  build: {
    rolldownOptions: {
      output: {
        // Split long-lived vendor code so a copy change does not bust the
        // React / animation / primitive caches.
        advancedChunks: {
          groups: [
            { name: 'react', test: /node_modules\/(react|react-dom|scheduler)\// },
            { name: 'motion', test: /node_modules\/(motion|framer-motion|motion-dom|motion-utils)\// },
            { name: 'radix', test: /node_modules\/(radix-ui|@radix-ui)\// },
            { name: 'firebase', test: /node_modules\/(@firebase|firebase)\// },
          ],
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
})
