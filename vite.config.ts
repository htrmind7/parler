/// <reference types="vitest/config" />
import { readFileSync } from 'node:fs'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const { version } = JSON.parse(readFileSync('package.json', 'utf-8')) as {
  version: string
}

// GitHub Pages serves the site under /<repo-name>/ (use '/' with a custom domain)
export default defineConfig({
  base: '/parle/',
  plugins: [react()],
  define: { __APP_VERSION__: JSON.stringify(version) },
  test: {
    environment: 'node',
  },
})
