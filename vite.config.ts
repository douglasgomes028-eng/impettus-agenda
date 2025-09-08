import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

// IMPORTANT: Set base to your GitHub repo name, e.g. '/impettus-agenda/'
const repoBase = process.env.VITE_GH_PAGES_BASE || '/YOUR-REPO-NAME/';

export default defineConfig({
  plugins: [react()],
  base: repoBase,
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') }
  }
})
