// @ts-check
import { defineConfig } from 'astro/config'

export default defineConfig({
  site: 'https://salgado.zip',
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory', inlineStylesheets: 'never' },
  prefetch: false,
  devToolbar: { enabled: false },
  compressHTML: true,
})
