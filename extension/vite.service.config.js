import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      input: "./src/service-worker.js", // Your content script entry
      output: {
        format: "iife", // Immediately Invoked Function Expression
        entryFileNames: "service-worker.js", // Use name as output file name
      },
    },
    outDir: "dist/service",
  },
});
