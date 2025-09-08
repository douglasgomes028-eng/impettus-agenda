import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

// GitHub Actions sets VITE_GH_PAGES_BASE automatically to "/<repo>/"
// For local dev, it falls back to "/"
const repoBase = process.env.VITE_GH_PAGES_BASE || '/';

export default defineConfig({
  plugins: [react()],
  base: repoBase,
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') }
  }
})
