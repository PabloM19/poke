import path from 'node:path'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

function pwaAssets(): Plugin {
  const serviceWorkerTemplate = readFileSync(new URL('./src/pwa/service-worker.js', import.meta.url), 'utf8')
  const manifest = readFileSync(new URL('./src/pwa/manifest.webmanifest', import.meta.url), 'utf8')
  const icon = readFileSync(new URL('./src/assets/pokeapp-icon.svg', import.meta.url), 'utf8')

  return {
    name: 'pokeapp-pwa-assets',
    apply: 'build',
    generateBundle(_options, bundle) {
      const precacheUrls = ['/', ...Object.keys(bundle).sort().map((fileName) => `/${fileName}`)]
      const cacheVersion = createHash('sha256')
        .update(serviceWorkerTemplate)
        .update(precacheUrls.join('\n'))
        .digest('hex')
        .slice(0, 12)
      const serviceWorker = serviceWorkerTemplate
        .replace('__CACHE_VERSION__', `pokeapp-${cacheVersion}`)
        .replace('__PRECACHE_URLS__', JSON.stringify(precacheUrls))

      this.emitFile({ type: 'asset', fileName: 'sw.js', source: serviceWorker })
      this.emitFile({ type: 'asset', fileName: 'manifest.webmanifest', source: manifest })
      this.emitFile({ type: 'asset', fileName: 'pokeapp-icon.svg', source: icon })
      this.emitFile({ type: 'asset', fileName: '_redirects', source: '/* /index.html 200\n' })
      this.emitFile({
        type: 'asset',
        fileName: '_headers',
        source: '/sw.js\n  Cache-Control: no-cache, no-store, must-revalidate\n',
      })

    },
    closeBundle() {
      const indexUrl = new URL('./dist/index.html', import.meta.url)
      writeFileSync(new URL('./dist/404.html', import.meta.url), readFileSync(indexUrl))
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), pwaAssets()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
