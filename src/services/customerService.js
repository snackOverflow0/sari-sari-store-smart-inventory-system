import { pool } from "../config/db.js";
import {
  getCustomerById,
  getLatestBalance,
  insertCustomer,
  insertLedgerEntry,
  listCustomers,
  listLedgerByCustomer,
  updateCustomerBalance
} from "../models/customerModel.js";

function roundMoney(value) {
  return Number(Number(value).toFixed(2));
}

export async function getCustomers(search) {
  return listCustomers(search);
}

export async function createCustomer(payload) {
  if (!String(payload.fullName || "").trim()) {
    throw new Error("Customer name is required.");
  }

  return insertCustomer({
    fullName: String(payload.fullName || "").trim(),
    phone: String(payload.phone || "").trim(),
    address: String(payload.address || "").trim(),
    notes: String(payload.notes || "").trim()
  });
}

export async function getCustomerLedger(customerId) {
  const customer = await getCustomerById(customerId);
  if (!customer) return null;

  const ledger = await listLedgerByCustomer(customerId);
  return { customer, ledger };
}

export async function postLedgerPayment(customerId, amount, notes, userId) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const customer = await getCustomerById(customerId, client);
    if (!customer) return null;

    const currentBalance = Number(await getLatestBalance(customerId, client));
    const paymentAmount = roundMoney(amount);

    if (paymentAmount <= 0) throw new Error("Payment must be greater than zero.");
    if (paymentAmount > currentBalance) throw new Error("Payment cannot exceed the current utang balance.");

    const balanceAfter = roundMoney(currentBalance - paymentAmount);
    const ledger = await insertLedgerEntry(client, {
      customerId,
      saleId: null,
      userId,
      entryType: "payment",
      amount: paymentAmount,
      balanceAfter,
      notes: notes || "Utang payment"
    });

    await updateCustomerBalance(client, customerId, balanceAfter);
    await client.query("COMMIT");
    return ledger;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
