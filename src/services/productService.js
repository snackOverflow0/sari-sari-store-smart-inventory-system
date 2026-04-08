import {
  getProductById,
  insertProduct,
  listProducts as queryProducts,
  softDeleteProduct,
  updateProduct
} from "../models/productModel.js";

function normalizeProductPayload(payload) {
  return {
    name: String(payload.name || "").trim(),
    sku: String(payload.sku || "").trim().toUpperCase(),
    buyingPrice: Number(payload.buyingPrice || 0),
    sellingPrice: Number(payload.sellingPrice || 0),
    stock: Number(payload.stock || 0),
    criticalLevel: Number(payload.criticalLevel || 0),
    category: String(payload.category || "General").trim(),
    unit: String(payload.unit || "pc").trim()
  };
}

function validateProduct(product) {
  if (!product.name || !product.sku) {
    throw new Error("Product name and SKU are required.");
  }

  if ([product.buyingPrice, product.sellingPrice, product.stock, product.criticalLevel].some((value) => value < 0)) {
    throw new Error("Prices, stock, and critical level cannot be negative.");
  }
}

export async function getProducts(filters) {
  return queryProducts(filters);
}

export async function createProduct(payload) {
  const product = normalizeProductPayload(payload);
  validateProduct(product);
  return insertProduct(product);
}

export async function editProduct(productId, payload) {
  const current = await getProductById(productId);
  if (!current) return null;

  const product = normalizeProductPayload({
    ...current,
    ...payload,
    buyingPrice: payload.buyingPrice ?? current.buying_price,
    sellingPrice: payload.sellingPrice ?? current.selling_price,
    stock: payload.stock ?? current.stock,
    criticalLevel: payload.criticalLevel ?? current.critical_level
  });

  validateProduct(product);
  return updateProduct(productId, product);
}

export async function removeProduct(productId) {
  return softDeleteProduct(productId);
}
