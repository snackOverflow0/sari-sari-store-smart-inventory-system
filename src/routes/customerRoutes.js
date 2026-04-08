import { Router } from "express";
import {
  addCustomer,
  getLedger,
  listAllCustomers,
  recordPayment
} from "../controllers/customerController.js";

const router = Router();

router.get("/", listAllCustomers);
router.post("/", addCustomer);
router.get("/:customerId/ledger", getLedger);
router.post("/:customerId/payments", recordPayment);

export default router;
