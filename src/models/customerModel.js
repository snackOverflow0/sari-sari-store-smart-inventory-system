import { pool } from "../config/db.js";

export async function listCustomers(search = "") {
  const values = [];
  let whereClause = "WHERE is_active = TRUE";

  if (search) {
    values.push(`%${search}%`);
    whereClause += ` AND (full_name ILIKE $${values.length} OR COALESCE(phone, '') ILIKE $${values.length})`;
  }

  const result = await pool.query(
    `SELECT id, full_name, phone, address, notes, current_balance, created_at
     FROM customers
     ${whereClause}
     ORDER BY current_balance DESC, full_name ASC`,
    values
  );

  return result.rows;
}

export async function insertCustomer(customer) {
  const result = await pool.query(
    `INSERT INTO customers (full_name, phone, address, notes)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [customer.fullName, customer.phone, customer.address, customer.notes]
  );

  return result.rows[0];
}

export async function getCustomerById(customerId, client = pool) {
  const result = await client.query("SELECT * FROM customers WHERE id = $1 AND is_active = TRUE", [customerId]);
  return result.rows[0] || null;
}

export async function updateCustomerBalance(client, customerId, balance) {
  const result = await client.query(
    "UPDATE customers SET current_balance = $1 WHERE id = $2 RETURNING *",
    [balance, customerId]
  );
  return result.rows[0];
}

export async function listLedgerByCustomer(customerId) {
  const result = await pool.query(
    `SELECT id, entry_type, amount, balance_after, notes, created_at, sale_id
     FROM ledger
     WHERE customer_id = $1
     ORDER BY created_at ASC, id ASC`,
    [customerId]
  );

  return result.rows;
}

export async function getLatestBalance(customerId, client = pool) {
  const result = await client.query(
    `SELECT balance_after
     FROM ledger
     WHERE customer_id = $1
     ORDER BY created_at DESC, id DESC
     LIMIT 1`,
    [customerId]
  );

  return result.rows[0]?.balance_after || 0;
}

export async function insertLedgerEntry(client, entry) {
  const result = await client.query(
    `INSERT INTO ledger (customer_id, sale_id, user_id, entry_type, amount, balance_after, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      entry.customerId,
      entry.saleId,
      entry.userId,
      entry.entryType,
      entry.amount,
      entry.balanceAfter,
      entry.notes
    ]
  );

  return result.rows[0];
}
