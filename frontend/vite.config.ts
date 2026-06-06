import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const apiProxy = {
  "/api": {
    target: "http://127.0.0.1:8080",
    changeOrigin: true
  }
};

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: true,
    host: "0.0.0.0",
    port: 3000,
    proxy: apiProxy
  },
  preview: {
    allowedHosts: true,
    proxy: apiProxy
  }
});
