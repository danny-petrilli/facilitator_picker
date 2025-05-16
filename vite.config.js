import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: '/facilitator_picker/', // Must match your repository name exactly
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})
