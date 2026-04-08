import { pool } from "../config/db.js";

export async function findActiveOwner() {
  const result = await pool.query(
    `SELECT id, full_name, pin_salt, pin_hash, role
     FROM users
     WHERE is_active = TRUE
     ORDER BY id ASC
     LIMIT 1`
  );

  return result.rows[0] || null;
}

export async function updateLastLogin(userId) {
  await pool.query("UPDATE users SET last_login_at = NOW() WHERE id = $1", [userId]);
}
