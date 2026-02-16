import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // GitHub Pages: リポジトリ名に合わせて変更
  // 例: base: '/waseda-keio-compare/'
  // Vercel/Cloudflare: '/' のままでOK
  base: '/waseda-keio-compare/',
})
