import { checkoutSale, getRecentSales } from "../services/salesService.js";

export async function checkout(req, res) {
  try {
    const sale = await checkoutSale(req.body, req.user);
    return res.status(201).json(sale);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

export async function listSales(req, res) {
  try {
    const sales = await getRecentSales(req.query.limit);
    return res.json(sales);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
