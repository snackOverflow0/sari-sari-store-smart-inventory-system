import { pool } from "../config/db.js";

export async function insertSale(client, sale) {
  const result = await client.query(
    `INSERT INTO sales
      (customer_id, user_id, payment_type, total_amount, total_cost, total_profit, amount_paid, change_amount, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [
      sale.customerId,
      sale.userId,
      sale.paymentType,
      sale.totalAmount,
      sale.totalCost,
      sale.totalProfit,
      sale.amountPaid,
      sale.changeAmount,
      sale.notes
    ]
  );

  return result.rows[0];
}

export async function insertSaleItem(client, item) {
  const result = await client.query(
    `INSERT INTO sale_items
      (sale_id, product_id, quantity, unit_buying_price, unit_selling_price, line_total, line_profit)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      item.saleId,
      item.productId,
      item.quantity,
      item.unitBuyingPrice,
      item.unitSellingPrice,
      item.lineTotal,
      item.lineProfit
    ]
  );

  return result.rows[0];
}

export async function listRecentSales(limit = 15) {
  const result = await pool.query(
    `SELECT
       s.id,
       s.payment_type,
       s.total_amount,
       s.total_profit,
       s.amount_paid,
       s.created_at,
       c.full_name AS customer_name
     FROM sales s
     LEFT JOIN customers c ON c.id = s.customer_id
     ORDER BY s.created_at DESC
     LIMIT $1`,
    [Number(limit) || 15]
  );

  return result.rows;
}
