/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// GitHub Pages serves the site under /<repo-name>/ (use '/' with a custom domain)
export default defineConfig({
  base: '/parle/',
  plugins: [react()],
  test: {
    environment: 'node',
  },
})
