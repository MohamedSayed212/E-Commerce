import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      // If hot-reload doesn't pick up changes on some systems/editors,
      // polling makes Vite reliably detect file edits (slightly more CPU).
      usePolling: true,
      interval: 100,
    },
  },
})
