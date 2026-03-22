import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Proxy for LEI
  app.get("/api/lei/search", async (req, res) => {
    const { query, mode } = req.query;
    if (!query) return res.status(400).json({ error: "Query is required" });

    let url = "";
    if (mode === "lei") {
      url = `https://api.gleif.org/api/v1/lei-records/${query}`;
    } else {
      // For both name and partial, we use the filter
      url = `https://api.gleif.org/api/v1/lei-records?filter[entity.legalName]=${encodeURIComponent(query as string)}`;
    }

    try {
      const response = await fetch(url);
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("LEI API Error:", error);
      res.status(500).json({ error: "Failed to fetch from GLEIF API" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
