import { Router } from "express";
import authRoutes from "./authRoutes.js";
import dashboardRoutes from "./dashboardRoutes.js";
import productRoutes from "./productRoutes.js";
import salesRoutes from "./salesRoutes.js";
import customerRoutes from "./customerRoutes.js";
import inventoryRoutes from "./inventoryRoutes.js";
import reportRoutes from "./reportRoutes.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/dashboard", requireAuth, dashboardRoutes);
router.use("/products", requireAuth, productRoutes);
router.use("/sales", requireAuth, salesRoutes);
router.use("/customers", requireAuth, customerRoutes);
router.use("/inventory", requireAuth, inventoryRoutes);
router.use("/reports", requireAuth, reportRoutes);

export default router;
