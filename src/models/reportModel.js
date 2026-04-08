import { pool } from "../config/db.js";

export async function getDashboardRows() {
  const [salesResult, lowStockResult, topSellingResult, slowMovingResult, creditResult, recentResult] = await Promise.all([
    pool.query(
      `SELECT
         COALESCE(SUM(total_amount), 0) AS total_sales_today,
         COALESCE(SUM(total_profit), 0) AS total_profit_today,
         COUNT(*)::int AS total_transactions
       FROM sales
       WHERE created_at::date = CURRENT_DATE`
    ),
    pool.query(
      `SELECT id, name, stock, critical_level
       FROM products
       WHERE is_active = TRUE AND stock <= critical_level
       ORDER BY stock ASC, name ASC
       LIMIT 8`
    ),
    pool.query(
      `SELECT
         p.id,
         p.name,
         COALESCE(SUM(CASE WHEN s.id IS NOT NULL THEN si.quantity ELSE 0 END), 0)::int AS quantity_sold
       FROM products p
       LEFT JOIN sale_items si ON si.product_id = p.id
       LEFT JOIN sales s ON s.id = si.sale_id AND s.created_at::date = CURRENT_DATE
       WHERE p.is_active = TRUE
       GROUP BY p.id, p.name
       ORDER BY quantity_sold DESC, p.name ASC
       LIMIT 5`
    ),
    pool.query(
      `SELECT
         p.id,
         p.name,
         p.stock,
         COALESCE(SUM(CASE WHEN s.id IS NOT NULL THEN si.quantity ELSE 0 END), 0)::int AS quantity_sold_last_30_days
       FROM products p
       LEFT JOIN sale_items si ON si.product_id = p.id
       LEFT JOIN sales s ON s.id = si.sale_id AND s.created_at >= NOW() - INTERVAL '30 days'
       WHERE p.is_active = TRUE
       GROUP BY p.id, p.name, p.stock
       ORDER BY quantity_sold_last_30_days ASC, p.stock DESC
       LIMIT 5`
    ),
    pool.query("SELECT COALESCE(SUM(current_balance), 0) AS total_utang_balance FROM customers WHERE is_active = TRUE"),
    pool.query(
      `SELECT id, payment_type, total_amount, total_profit, created_at
       FROM sales
       ORDER BY created_at DESC
       LIMIT 8`
    )
  ]);

  return {
    salesToday: salesResult.rows[0],
    lowStock: lowStockResult.rows,
    topSelling: topSellingResult.rows,
    slowMoving: slowMovingResult.rows,
    credit: creditResult.rows[0],
    recentTransactions: recentResult.rows
  };
}

export async function getSalesSummary({ range = "daily", yearMonth, date }) {
  if (range === "monthly") {
    const result = await pool.query(
      `SELECT
         to_char(created_at, 'YYYY-MM-DD') AS label,
         COALESCE(SUM(total_amount), 0) AS total_sales,
         COALESCE(SUM(total_profit), 0) AS total_profit,
         COUNT(*)::int AS transactions
       FROM sales
       WHERE to_char(created_at, 'YYYY-MM') = $1
       GROUP BY label
       ORDER BY label ASC`,
      [yearMonth]
    );

    return result.rows;
  }

  const result = await pool.query(
    `SELECT
       to_char(created_at, 'HH24:00') AS label,
       COALESCE(SUM(total_amount), 0) AS total_sales,
       COALESCE(SUM(total_profit), 0) AS total_profit,
       COUNT(*)::int AS transactions
     FROM sales
     WHERE created_at::date = $1::date
     GROUP BY label
     ORDER BY label ASC`,
    [date]
  );

  return result.rows;
}

export async function getTopSellingProducts(limit = 10) {
  const result = await pool.query(
    `SELECT
       p.name,
       p.sku,
       COALESCE(SUM(si.quantity), 0)::int AS quantity_sold,
       COALESCE(SUM(si.line_total), 0) AS sales_amount
     FROM products p
     LEFT JOIN sale_items si ON si.product_id = p.id
     LEFT JOIN sales s ON s.id = si.sale_id
     WHERE p.is_active = TRUE
     GROUP BY p.id, p.name, p.sku
     ORDER BY quantity_sold DESC, sales_amount DESC
     LIMIT $1`,
    [limit]
  );

  return result.rows;
}

export async function getSlowMovingProducts(days = 30) {
  const result = await pool.query(
    `SELECT
       p.id,
       p.name,
       p.sku,
       p.stock,
       COALESCE(SUM(CASE WHEN s.id IS NOT NULL THEN si.quantity ELSE 0 END), 0)::int AS quantity_sold
     FROM products p
     LEFT JOIN sale_items si ON si.product_id = p.id
     LEFT JOIN sales s ON s.id = si.sale_id AND s.created_at >= NOW() - ($1::text || ' days')::interval
     WHERE p.is_active = TRUE
     GROUP BY p.id, p.name, p.sku, p.stock
     ORDER BY quantity_sold ASC, p.stock DESC, p.name ASC
     LIMIT 10`,
    [days]
  );

  return result.rows;
}
