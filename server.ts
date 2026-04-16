import express from "express";
import cors from "cors";
import path from "path";
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Initialize Gemini
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

  // Middleware to check access code
  const checkAccess = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    const expectedCode = process.env.ACCESS_CODE || "Sakura2024";
    
    if (authHeader === expectedCode) {
      next();
    } else {
      res.status(401).json({ error: "Unauthorized: Invalid access code" });
    }
  };

  // API Route for Gemini
  app.post("/api/gemini", checkAccess, async (req, res) => {
    const { model, contents, config } = req.body;
    
    try {
      const response = await ai.models.generateContent({ 
        model, 
        contents, 
        config 
      });
      
      // Handle Audio Modality if present
      if (config?.responseModalities?.includes("AUDIO") || config?.responseModalities?.includes(Modality.AUDIO)) {
        res.json({ 
          text: response.text,
          audioData: response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data 
        });
      } else {
        res.json({ text: response.text });
      }
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ error: error.message });
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
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
