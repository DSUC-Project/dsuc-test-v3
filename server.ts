import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import passport from "passport";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

import { mockDb } from "./backend/mockDb.js"; // Note: extension inside server

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    process.env.APP_URL, // Injected by AI Studio
  ].filter((origin): origin is string => typeof origin === "string");

  app.use(
    cors({
      origin: allowedOrigins,
      credentials: true,
    })
  );

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));
  app.use(cookieParser());
  app.use(passport.initialize());

  // Mount backend API routes using a generic import or setup.
  // Because the backend index sets up routes using relative imports, it might be tricky to import directly if not compiled.
  // Wait, tsx resolves imports transparently.
  const backendAppResponse: any = await import("./backend/index.js");
  const backendApp = backendAppResponse.default || backendAppResponse.app || backendAppResponse;
  
  // Since backendApp is an express instance containing all the routes already
  // We can just forward /api calls to it
  app.use(backendApp);

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

  app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
