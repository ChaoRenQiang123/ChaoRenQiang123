import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Initialize Gemini (Lazy initialization)
let genAI: GoogleGenAI | null = null;

function getGenAI() {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      throw new Error("GEMINI_API_KEY is missing. Please check your .env file.");
    }
    genAI = new GoogleGenAI(apiKey);
  }
  return genAI;
}

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    envLoaded: !!process.env.GEMINI_API_KEY,
    keyLength: process.env.GEMINI_API_KEY?.length || 0
  });
});

// Gemini Proxy Route
app.post("/api/gemini", async (req, res) => {
  try {
    const { model, contents, config } = req.body;
    
    console.log("--- New Request ---");
    const apiKey = process.env.GEMINI_API_KEY;
    console.log("Environment Variable Check:");
    console.log("- GEMINI_API_KEY exists:", !!apiKey);
    console.log("- GEMINI_API_KEY length:", apiKey?.length || 0);

    if (!apiKey || apiKey.length < 10) {
      return res.status(500).json({ 
        error: "API Key 缺失", 
        details: "服务器未读取到 .env 文件中的 GEMINI_API_KEY。请确保文件名为 .env 且编码为 UTF-8。" 
      });
    }

    const ai = getGenAI();
    const response = await ai.models.generateContent({
      model: model || "gemini-1.5-flash",
      contents: contents,
      config: config
    });

    console.log("Gemini API call successful");
    res.json(response);
  } catch (error: any) {
    console.error("--- Gemini Proxy Error ---");
    console.error("Message:", error.message);
    res.status(500).json({ 
      error: "调用 Gemini API 失败", 
      details: error.message 
    });
  }
});

// Vite middleware for development
if (process.env.NODE_ENV !== "production") {
  const { createServer: createViteServer } = await import("vite");
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
