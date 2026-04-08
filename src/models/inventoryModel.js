import { pool } from "../config/db.js";

export async function insertInventoryLog(client, log) {
  const result = await client.query(
    `INSERT INTO inventory_logs
      (product_id, sale_item_id, user_id, log_type, quantity, before_stock, after_stock, reason, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [
      log.productId,
      log.saleItemId,
      log.userId,
      log.logType,
      log.quantity,
      log.beforeStock,
      log.afterStock,
      log.reason,
      log.notes
    ]
  );

  return result.rows[0];
}

export async function listInventoryLogs(filters = {}) {
  const values = [];
  const conditions = [];

  if (filters.productId) {
    values.push(filters.productId);
    conditions.push(`l.product_id = $${values.length}`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const result = await pool.query(
    `SELECT
       l.id,
       l.log_type,
       l.quantity,
       l.before_stock,
       l.after_stock,
       l.reason,
       l.notes,
       l.created_at,
       p.name AS product_name,
       p.sku
     FROM inventory_logs l
     JOIN products p ON p.id = l.product_id
     ${whereClause}
     ORDER BY l.created_at DESC
     LIMIT 100`,
    values
  );

  return result.rows;
}

export async function updateProductStock(client, productId, newStock) {
  const result = await client.query(
    "UPDATE products SET stock = $1 WHERE id = $2 RETURNING *",
    [newStock, productId]
  );
  return result.rows[0];
}
