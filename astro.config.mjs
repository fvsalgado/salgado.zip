// @ts-check
import { defineConfig } from 'astro/config'

export default defineConfig({
  site: 'https://salgado.zip',
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory', inlineStylesheets: 'never' },
  // A CSP é `script-src 'self'` sem 'unsafe-inline': um script inlinado pelo
  // bundler morre em produção sem erro visível. Zero inlining, sempre.
  vite: { build: { assetsInlineLimit: 0 } },
  prefetch: false,
  devToolbar: { enabled: false },
  compressHTML: true,
})
