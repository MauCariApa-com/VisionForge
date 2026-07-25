import { defineConfig } from "vite";
import dyadComponentTagger from "@dyad-sh/react-vite-component-tagger";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      "/api/cloudflare": {
        target: "https://api.cloudflare.com/client/v4",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/cloudflare/, ""),
      },
    },
  },
  plugins: [
    dyadComponentTagger(),
    react(),
    {
      name: "env-check-dev-handler",
      configureServer(server) {
        server.middlewares.use("/api/env", (req, res) => {
          if (req.method !== "GET") {
            res.statusCode = 405;
            res.end(JSON.stringify({ error: "Method not allowed" }));
            return;
          }
          const url = new URL(req.url || "/", `http://${req.headers.host}`);
          const envName = url.searchParams.get("envName");
          if (!envName) {
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "Missing envName query parameter" }));
            return;
          }
          const value = process.env[envName];
          const isSet = typeof value === "string" && value.length > 0;
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ envName, isSet }));
        });
      },
    },
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));