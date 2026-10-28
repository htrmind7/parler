/// <reference types="vitest/config" />
import { readFileSync } from 'node:fs'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

const { version } = JSON.parse(readFileSync('package.json', 'utf-8')) as {
  version: string
}

// GitHub Pages serves the site under /<repo-name>/ (use '/' with a custom domain)
const BASE = '/parler/'

export default defineConfig({
  base: BASE,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Parler',
        short_name: 'Parler',
        description: 'Học tiếng Pháp từng chút một',
        lang: 'vi',
        display: 'standalone',
        orientation: 'portrait',
        start_url: BASE,
        scope: BASE,
        theme_color: '#0f1419',
        background_color: '#0f1419',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // woff2 only: every browser able to install the app supports it
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        navigateFallback: `${BASE}index.html`,
      },
    }),
  ],
  define: { __APP_VERSION__: JSON.stringify(version) },
  test: {
    environment: 'node',
  },
})
