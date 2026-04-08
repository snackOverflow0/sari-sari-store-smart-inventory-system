import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import apiRoutes from "./routes/index.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendPath = path.resolve(__dirname, "../../frontend");
const pageMap = new Map([
  ["/", "login.html"],
  ["/dashboard", "dashboard.html"],
  ["/products", "products.html"],
  ["/pos", "pos.html"],
  ["/utang", "utang.html"],
  ["/inventory", "inventory.html"],
  ["/reports", "reports.html"]
]);

app.use(cors());
app.use(express.json());
app.use(express.static(frontendPath));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", app: "sari-sari-smart-inventory" });
});

app.use("/api", apiRoutes);

for (const [route, fileName] of pageMap.entries()) {
  app.get(route, (req, res) => {
    res.sendFile(path.join(frontendPath, fileName));
  });
}

app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "login.html"));
});

export default app;
