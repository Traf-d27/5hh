import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("\n=======================================================");
console.log("⚡ Starting ECHOTECH Smart Campus Sustainability Platform");
console.log("   Target: Presidency University, Bengaluru");
console.log("=======================================================");
console.log("🚀 Launching Backend API (Port 5001)...");
console.log("🚀 Launching Vite React Dashboard (Port 3000)...");
console.log("-------------------------------------------------------\n");

// 1. Spawn Backend API Server inside server/
const serverProcess = spawn("node", ["index.js"], {
  cwd: path.join(__dirname, "server"),
  stdio: "inherit",
  shell: true
});

// 2. Spawn Vite Frontend Dev Server inside client/
const clientProcess = spawn("npm", ["run", "dev"], {
  cwd: path.join(__dirname, "client"),
  stdio: "inherit",
  shell: true
});

// Handle termination signals
process.on("SIGINT", () => {
  serverProcess.kill();
  clientProcess.kill();
  process.exit();
});

process.on("SIGTERM", () => {
  serverProcess.kill();
  clientProcess.kill();
  process.exit();
});
