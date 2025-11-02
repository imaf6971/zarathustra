import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import webfontDownload from "vite-plugin-webfont-dl";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), webfontDownload()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
