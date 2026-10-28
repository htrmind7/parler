import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { cardsPlugin } from './review/cards-plugin.ts'

// Local review tool only: never part of the published build (`npm run build` uses vite.config.ts)
export default defineConfig({
  root: 'review',
  base: '/',
  plugins: [react(), cardsPlugin()],
  server: { port: 5174, host: 'localhost' },
})
