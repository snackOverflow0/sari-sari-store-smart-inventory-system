import { Router } from "express";
import {
  addProduct,
  deleteProductById,
  listAllProducts,
  updateProductById
} from "../controllers/productController.js";

const router = Router();

router.get("/", listAllProducts);
router.post("/", addProduct);
router.put("/:productId", updateProductById);
router.delete("/:productId", deleteProductById);

export default router;
