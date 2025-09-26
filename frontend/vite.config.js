import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
    tailwindcss()
  ],
  base: '/A.U.R.O.R.A/',
  server: {
    proxy: {
      '/api': 'https://aurora-production-7e57.up.railway.app',
    },
  },
})
