import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
      react(),
      tailwindcss()
  ],
  server: {
    mimeTypes: {
      'service-worker.js': 'text/javascript'
    }
  },
  define: {
    'import.meta.env.VITE_KEYCLOAK_CLIENT_ID': JSON.stringify(process.env.VITE_KEYCLOAK_CLIENT_ID || 'coffeebreak-client'),
    'import.meta.env.VITE_KEYCLOAK_REALM': JSON.stringify(process.env.VITE_KEYCLOAK_REALM || 'coffeebreak'),
    'import.meta.env.VITE_KEYCLOAK_URL': JSON.stringify(process.env.VITE_KEYCLOAK_URL || 'https://coffeebreak.sebastiaoteixeira.me/auth'),
    'import.meta.env.VITE_API_BASE_URL': JSON.stringify(process.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'),
    'import.meta.env.VITE_WS_BASE_URL': JSON.stringify(process.env.VITE_WS_BASE_URL || 'ws://localhost:8000/ws'),
  },
})
