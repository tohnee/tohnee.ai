import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'animation': ['framer-motion'],
          'three': ['three', '@react-three/fiber', '@react-three/drei'],
          'ui-icons': ['lucide-react'],
        },
      },
    },
    cssMinify: 'lightningcss',
    minify: 'esbuild',
    sourcemap: false,
    target: 'es2020',
  },
  server: {
    open: false,
  },
})
