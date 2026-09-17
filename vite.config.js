import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Dev: `vite` serves the UI on 8081 and proxies API/admin to `wrangler dev` on 8787.
// Prod: `vite build` outputs dist/, which wrangler serves via the assets binding.
export default defineConfig({
  plugins: [react()],
  server: {
    host: "127.0.0.1",
    port: 8081,
    proxy: {
      "/api": "http://127.0.0.1:8787",
      "/admin": "http://127.0.0.1:8787",
    },
  },
  build: {
    outDir: "dist",
  },
});
