import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
  // 相対パスにしておくと GitHub Pages（/kinto-log/ 配下）でも Netlify でも動く
  base: "./",
});
