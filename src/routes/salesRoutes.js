import { Router } from "express";
import { checkout, listSales } from "../controllers/salesController.js";

const router = Router();

router.get("/", listSales);
router.post("/checkout", checkout);

export default router;
