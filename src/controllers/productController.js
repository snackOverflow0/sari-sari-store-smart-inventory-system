import { createProduct, editProduct, getProducts, removeProduct } from "../services/productService.js";

export async function listAllProducts(req, res) {
  try {
    const products = await getProducts({
      search: String(req.query.search || "").trim(),
      stockStatus: String(req.query.stockStatus || "").trim()
    });
    return res.json(products);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function addProduct(req, res) {
  try {
    const product = await createProduct(req.body);
    return res.status(201).json(product);
  } catch (error) {
    const status = error.code === "23505" ? 409 : 400;
    return res.status(status).json({ message: error.message });
  }
}

export async function updateProductById(req, res) {
  try {
    const product = await editProduct(Number(req.params.productId), req.body);
    if (!product) return res.status(404).json({ message: "Product not found." });
    return res.json(product);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

export async function deleteProductById(req, res) {
  try {
    const product = await removeProduct(Number(req.params.productId));
    if (!product) return res.status(404).json({ message: "Product not found." });
    return res.json({ message: "Product archived successfully." });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
