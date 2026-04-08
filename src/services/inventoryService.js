import { pool } from "../config/db.js";
import { insertInventoryLog, listInventoryLogs, updateProductStock } from "../models/inventoryModel.js";
import { getProductById } from "../models/productModel.js";

export async function getInventoryLogs(filters) {
  return listInventoryLogs(filters);
}

export async function recordInventoryMovement(payload, userId) {
  const productId = Number(payload.productId);
  const quantity = Number(payload.quantity);
  const logType = String(payload.logType || "").trim();
  const reason = String(payload.reason || "").trim();
  const notes = String(payload.notes || "").trim();

  if (!productId || quantity <= 0 || !logType || !reason) {
    throw new Error("Product, quantity, log type, and reason are required.");
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const product = await getProductById(productId, client);
    if (!product) throw new Error("Product not found.");

    const beforeStock = Number(product.stock);
    let afterStock = beforeStock;

    if (logType === "stock_in") afterStock += quantity;
    else if (logType === "stock_out") afterStock -= quantity;
    else if (logType === "adjustment") afterStock = quantity;
    else throw new Error("Invalid inventory log type.");

    if (afterStock < 0) throw new Error("Stock cannot be negative.");

    await updateProductStock(client, productId, afterStock);
    const log = await insertInventoryLog(client, {
      productId,
      saleItemId: null,
      userId,
      logType,
      quantity,
      beforeStock,
      afterStock,
      reason,
      notes
    });

    await client.query("COMMIT");
    return log;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
