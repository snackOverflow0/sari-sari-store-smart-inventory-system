import { getInventoryLogs, recordInventoryMovement } from "../services/inventoryService.js";

export async function listLogs(req, res) {
  try {
    const logs = await getInventoryLogs({
      productId: req.query.productId ? Number(req.query.productId) : null
    });

    return res.json(logs);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function createLog(req, res) {
  try {
    const log = await recordInventoryMovement(req.body, req.user.id);
    return res.status(201).json(log);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}
