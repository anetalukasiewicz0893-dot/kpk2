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
    const includes = "direct-parent,ultimate-parent";
    if (mode === "lei") {
      url = `https://api.gleif.org/api/v1/lei-records/${query}?include=${includes}`;
    } else if (mode === "name") {
      url = `https://api.gleif.org/api/v1/lei-records?filter[entity.legalName]=${encodeURIComponent(query as string)}&page[size]=10&include=${includes}`;
    } else {
      // Use full-text search for partial mode
      url = `https://api.gleif.org/api/v1/lei-records?filter[fulltext]=${encodeURIComponent(query as string)}&page[size]=10&include=${includes}`;
    }

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'LEI-Investigator-App/1.0',
          'Accept': 'application/vnd.api+json'
        }
      });
      if (response.status === 404) {
        return res.json({ data: [] });
      }
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`GLEIF API Error (${response.status}):`, errorText);
        let errorMessage = "GLEIF API Error";
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.errors?.[0]?.title || errorJson.error || errorMessage;
        } catch (e) {
          errorMessage = errorText || errorMessage;
        }
        return res.status(response.status).json({ error: errorMessage });
      }
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("LEI API Proxy Error:", error);
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
