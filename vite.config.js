import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    chunkSizeWarningLimit: 32768
  },
  server: {
    mimeTypes: {
      "service-worker.js": "text/javascript",
    },
  },
});
