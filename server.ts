import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { z } from "zod";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Schemas ---
const LeiSearchSchema = z.object({
  query: z.string().min(1),
  mode: z.enum(["lei", "name", "partial"]).optional().default("partial"),
});

// --- Server ---
async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  /**
   * @route GET /api/search/lei/:lei_code
   * @desc Look up a specific entity by its 20-character LEI code.
   */
  app.get("/api/search/lei/:lei_code", async (req, res) => {
    const { lei_code } = req.params;
    if (!lei_code || lei_code.length !== 20) {
      return res.status(400).json({ error: "Valid 20-character LEI code is required" });
    }

    const url = `https://api.gleif.org/api/v1/lei-records/${encodeURIComponent(lei_code)}`;
    
    try {
      const response = await fetch(url, { headers: { 'Accept': 'application/vnd.api+json' } });
      if (response.status === 404) return res.status(404).json({ error: "LEI not found" });
      if (!response.ok) throw new Error(`GLEIF API returned ${response.status}`);
      
      const data = await response.json();
      res.json(data.data);
    } catch (error) {
      console.error("LEI API Error:", error);
      res.status(500).json({ error: "Failed to fetch from GLEIF API" });
    }
  });

  /**
   * @route GET /api/search/name/:name
   * @desc Search for entities by their legal name.
   */
  app.get("/api/search/name/:name", async (req, res) => {
    const { name } = req.params;
    if (!name) return res.status(400).json({ error: "Name is required" });

    const url = `https://api.gleif.org/api/v1/lei-records?filter[entity.legalName]=${encodeURIComponent(name)}&page[size]=100`;
    
    try {
      const response = await fetch(url, { headers: { 'Accept': 'application/vnd.api+json' } });
      if (!response.ok) throw new Error(`GLEIF API returned ${response.status}`);
      
      const data = await response.json();
      res.json(data.data || []);
    } catch (error) {
      console.error("Name Search API Error:", error);
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
