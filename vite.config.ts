import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    // Optimizaciones para producción
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false, // Deshabilitar sourcemaps en producción para reducir tamaño
    rollupOptions: {
      output: {
        // Separar chunks para mejor caching
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router'],
          'query-vendor': ['@tanstack/react-query'],
          'ui-vendor': ['@mui/material', '@mui/icons-material', 'material-react-table'],
        },
      },
    },
    // Aumentar límite de advertencia de tamaño de chunk
    chunkSizeWarningLimit: 1000,
  },
  // Optimizaciones de servidor de desarrollo
  server: {
    host: true,
    port: 5173,
    strictPort: false,
  },
  // Previsualización optimizada
  preview: {
    port: 4173,
    strictPort: false,
  },
})
