import { createCustomer, getCustomerLedger, getCustomers, postLedgerPayment } from "../services/customerService.js";

export async function listAllCustomers(req, res) {
  try {
    const customers = await getCustomers(String(req.query.search || "").trim());
    return res.json(customers);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function addCustomer(req, res) {
  try {
    const customer = await createCustomer(req.body);
    return res.status(201).json(customer);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

export async function getLedger(req, res) {
  try {
    const ledger = await getCustomerLedger(Number(req.params.customerId));
    if (!ledger) return res.status(404).json({ message: "Customer not found." });
    return res.json(ledger);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function recordPayment(req, res) {
  try {
    const entry = await postLedgerPayment(
      Number(req.params.customerId),
      req.body.amount,
      String(req.body.notes || "").trim(),
      req.user.id
    );

    if (!entry) return res.status(404).json({ message: "Customer not found." });
    return res.status(201).json(entry);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}
