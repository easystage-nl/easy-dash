import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Standalone dashboard for easy-stage. The API (listings/runs) is served by the
// easy-scraper Cloudflare Worker. In dev we proxy to a local `wrangler dev`
// (port 8787) so the app can use same-origin relative paths. In prod, set
// VITE_API_BASE to the deployed worker origin (see src/lib/api.ts).
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    target: "es2022",
  },
  server: {
    port: 5173,
    proxy: {
      "/listings": "http://localhost:8787",
      "/runs": "http://localhost:8787",
      "/run": "http://localhost:8787",
    },
  },
});
