import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './testing/setup.ts',
    globals: true,
    include: ['testing/**/*.{test,spec}.ts', 'testing/**/*.{test,spec}.tsx'],
  },
  // get port from .env file or default to 7123
  server: {
    port: parseInt(process.env.VITE_PORT || '7123'),
  },
})
