import { pool } from "../config/db.js";
import { getCustomerById, getLatestBalance, insertLedgerEntry, updateCustomerBalance } from "../models/customerModel.js";
import { insertInventoryLog, updateProductStock } from "../models/inventoryModel.js";
import { getProductById } from "../models/productModel.js";
import { insertSale, insertSaleItem, listRecentSales } from "../models/salesModel.js";

function roundMoney(value) {
  return Number(Number(value).toFixed(2));
}

export async function checkoutSale(payload, user) {
  const items = Array.isArray(payload.items) ? payload.items : [];
  const paymentType = String(payload.paymentType || "cash").trim();
  const customerId = payload.customerId ? Number(payload.customerId) : null;
  const amountPaid = roundMoney(payload.amountPaid || 0);
  const notes = String(payload.notes || "").trim();

  if (!items.length) {
    throw new Error("At least one item is required.");
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    let totalAmount = 0;
    let totalCost = 0;
    const preparedItems = [];

    for (const cartItem of items) {
      const productId = Number(cartItem.productId);
      const quantity = Number(cartItem.quantity);
      if (!productId || quantity <= 0) throw new Error("Each cart item must include a valid product and quantity.");

      const product = await getProductById(productId, client);
      if (!product) throw new Error(`Product ${productId} not found.`);
      if (product.stock < quantity) throw new Error(`${product.name} does not have enough stock.`);

      const lineTotal = roundMoney(product.selling_price * quantity);
      const lineProfit = roundMoney((product.selling_price - product.buying_price) * quantity);
      totalAmount += lineTotal;
      totalCost += roundMoney(product.buying_price * quantity);

      preparedItems.push({ product, quantity, lineTotal, lineProfit });
    }

    totalAmount = roundMoney(totalAmount);
    totalCost = roundMoney(totalCost);
    const totalProfit = roundMoney(totalAmount - totalCost);

    if (paymentType === "credit" && !customerId) throw new Error("Credit sale requires a customer.");
    if (paymentType === "cash" && amountPaid < totalAmount) throw new Error("Cash received must cover the total amount.");

    const changeAmount = paymentType === "cash" ? roundMoney(amountPaid - totalAmount) : 0;

    if (customerId) {
      const customer = await getCustomerById(customerId, client);
      if (!customer) throw new Error("Customer not found.");
    }

    const sale = await insertSale(client, {
      customerId,
      userId: user.id,
      paymentType,
      totalAmount,
      totalCost,
      totalProfit,
      amountPaid,
      changeAmount,
      notes
    });

    for (const entry of preparedItems) {
      const saleItem = await insertSaleItem(client, {
        saleId: sale.id,
        productId: entry.product.id,
        quantity: entry.quantity,
        unitBuyingPrice: entry.product.buying_price,
        unitSellingPrice: entry.product.selling_price,
        lineTotal: entry.lineTotal,
        lineProfit: entry.lineProfit
      });

      const beforeStock = Number(entry.product.stock);
      const afterStock = beforeStock - entry.quantity;
      await updateProductStock(client, entry.product.id, afterStock);
      await insertInventoryLog(client, {
        productId: entry.product.id,
        saleItemId: saleItem.id,
        userId: user.id,
        logType: "stock_out",
        quantity: entry.quantity,
        beforeStock,
        afterStock,
        reason: "POS checkout",
        notes
      });
    }

    if (paymentType === "credit") {
      const currentBalance = Number(await getLatestBalance(customerId, client));
      const balanceAfter = roundMoney(currentBalance + totalAmount);
      await insertLedgerEntry(client, {
        customerId,
        saleId: sale.id,
        userId: user.id,
        entryType: "credit",
        amount: totalAmount,
        balanceAfter,
        notes: notes || `Credit sale #${sale.id}`
      });
      await updateCustomerBalance(client, customerId, balanceAfter);
    }

    await client.query("COMMIT");

    return {
      saleId: sale.id,
      paymentType: sale.payment_type,
      totalAmount,
      totalProfit,
      amountPaid,
      changeAmount,
      receiptLines: preparedItems.map((entry) => ({
        product: entry.product.name,
        quantity: entry.quantity,
        unitPrice: Number(entry.product.selling_price),
        lineTotal: entry.lineTotal
      }))
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function getRecentSales(limit) {
  return listRecentSales(limit);
}
