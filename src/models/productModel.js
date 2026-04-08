import { pool } from "../config/db.js";

export async function listProducts(filters = {}) {
  const values = [];
  const conditions = ["is_active = TRUE"];

  if (filters.search) {
    values.push(`%${filters.search}%`);
    conditions.push(`(name ILIKE $${values.length} OR sku ILIKE $${values.length} OR category ILIKE $${values.length})`);
  }

  if (filters.stockStatus === "low") {
    conditions.push("stock <= critical_level");
  }

  if (filters.stockStatus === "healthy") {
    conditions.push("stock > critical_level");
  }

  const result = await pool.query(
    `SELECT
       id,
       name,
       sku,
       category,
       unit,
       buying_price,
       selling_price,
       stock,
       critical_level,
       CASE
         WHEN stock = 0 THEN 'out'
         WHEN stock <= critical_level THEN 'low'
         ELSE 'healthy'
       END AS stock_status,
       created_at,
       updated_at
     FROM products
     WHERE ${conditions.join(" AND ")}
     ORDER BY name ASC`,
    values
  );

  return result.rows;
}

export async function getProductById(productId, client = pool) {
  const result = await client.query("SELECT * FROM products WHERE id = $1 AND is_active = TRUE", [productId]);
  return result.rows[0] || null;
}

export async function insertProduct(product) {
  const result = await pool.query(
    `INSERT INTO products (name, sku, buying_price, selling_price, stock, critical_level, category, unit)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      product.name,
      product.sku,
      product.buyingPrice,
      product.sellingPrice,
      product.stock,
      product.criticalLevel,
      product.category,
      product.unit
    ]
  );

  return result.rows[0];
}

export async function updateProduct(productId, product) {
  const result = await pool.query(
    `UPDATE products
     SET name = $1,
         sku = $2,
         buying_price = $3,
         selling_price = $4,
         stock = $5,
         critical_level = $6,
         category = $7,
         unit = $8
     WHERE id = $9
     RETURNING *`,
    [
      product.name,
      product.sku,
      product.buyingPrice,
      product.sellingPrice,
      product.stock,
      product.criticalLevel,
      product.category,
      product.unit,
      productId
    ]
  );

  return result.rows[0] || null;
}

export async function softDeleteProduct(productId) {
  const result = await pool.query(
    "UPDATE products SET is_active = FALSE WHERE id = $1 RETURNING id",
    [productId]
  );
  return result.rows[0] || null;
}
