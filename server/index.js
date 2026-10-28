import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { router as apiRouter } from "./routes/api.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// API Routes
app.use("/api", apiRouter);

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "ECHOTECH Presidency University Sustainability API",
    version: "1.0.0",
    timestamp: new Date().toISOString()
  });
});

// Serve compiled static React build if available
const clientDist = path.join(__dirname, "../client/dist");
app.use(express.static(clientDist));

// Fallback to index.html for client-side routing
app.get("*", (req, res) => {
  res.sendFile(path.join(clientDist, "index.html"));
});

app.listen(PORT, () => {
  console.log(`\n===============================================================`);
  console.log(`⚡ ECHOTECH: Presidency University Campus Sustainability Engine`);
  console.log(`===============================================================`);
  console.log(`🌐 Live Dashboard:  http://localhost:${PORT}`);
  console.log(`⚙️  API Endpoint:   http://localhost:${PORT}/api/overview`);
  console.log(`===============================================================\n`);
});
