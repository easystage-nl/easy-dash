import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Standalone dashboard for easy-stage. The API (listings/runs) is served by the
// easy-scraper Cloudflare Worker. The dev server proxies API paths to it; the
// proxy runs server-side (Node), so it bypasses browser CORS and can target the
// live API directly. Defaults to prod — set DEV_API to http://localhost:8787 to
// develop against a local `wrangler dev` instead.
const DEV_API = process.env.DEV_API ?? "https://api.easystage.nl";

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
      // Proxy all API paths to the worker. Regex (key starts with ^) so new
      // endpoints don't need adding one by one.
      "^/(listings|runs|run|stats|facets)\\b": { target: DEV_API, changeOrigin: true },
    },
  },
});
