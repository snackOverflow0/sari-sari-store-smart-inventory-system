import { Router } from "express";
import { createLog, listLogs } from "../controllers/inventoryController.js";

const router = Router();

router.get("/logs", listLogs);
router.post("/logs", createLog);

export default router;
