import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "./",
  build: {
    // The pages branch publishes this directory to GitHub Pages.
    outDir: "docs",
    emptyOutDir: true,
  },
});
