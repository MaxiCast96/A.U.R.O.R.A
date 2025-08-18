import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
    tailwindcss()
  ],
  base: '/A.U.R.O.R.A/', // debe coincidir con tu repo
  server: {
    proxy: {
      '/api': 'https://a-u-r-o-r-a.onrender.com',
    },
  },
})
