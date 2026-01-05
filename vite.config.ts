import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.jpeg", "robots.txt"],
      manifest: {
        name: "SocioBuddy - Help Teens Overcome Social Anxiety & Make Friends",
        short_name: "SocioBuddy",
        description: "SocioBuddy connects teenagers studying in school, helping them overcome social anxiety and build meaningful friendships.",
        theme_color: "#FF6B6B",
        background_color: "#0F0F23",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "/pwa-192x192.jpeg",
            sizes: "192x192",
            type: "image/jpeg",
          },
          {
            src: "/pwa-512x512.jpeg",
            sizes: "512x512",
            type: "image/jpeg",
          },
          {
            src: "/pwa-512x512.jpeg",
            sizes: "512x512",
            type: "image/jpeg",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2,jpeg}"],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
