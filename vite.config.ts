import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    // NUNCA expongas secretos de backend en el cliente.
    // Solo variables VITE_FIREBASE_* (públicas por diseño) llegan al bundle.
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      rollupOptions: {
        output: {
          // Separar las librerías pesadas en chunks propios para que el bundle
          // principal sea pequeño y cachee mejor entre despliegues. Firebase y
          // Recharts eran los responsables del chunk de >1.5MB.
          manualChunks: {
            firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
            charts: ['recharts'],
            vendor: ['react', 'react-dom', 'react-router-dom', 'motion', 'lucide-react'],
          },
        },
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
