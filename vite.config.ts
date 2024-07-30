import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    watch: {
      usePolling: true,
    },
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        // rewrite: (path) => path.replace(/^\/api/, "api"),
      },
    },
  },
  resolve: {
    alias: {
      src: path.resolve(__dirname, "src"),
    },
  },
  build: {
    rollupOptions: {
      input: {
        app: "src/index.html",
      },
      output: {
        entryFileNames: `assets/bundle.js`,
        chunkFileNames: `assets/[name]-[hash].js`,
        assetFileNames: `assets/styles.css`,
      },
    },
  },
  base: "/static",
});
