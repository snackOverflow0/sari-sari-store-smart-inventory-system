import { Router } from "express";
import { getSlowMoving, getSummary, getTopSelling } from "../controllers/reportController.js";

const router = Router();

router.get("/summary", getSummary);
router.get("/top-products", getTopSelling);
router.get("/slow-moving", getSlowMoving);

export default router;
