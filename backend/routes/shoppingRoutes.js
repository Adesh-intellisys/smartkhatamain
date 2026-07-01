import express from "express";

import {
  createOrder,
  getOrders,
  getShoppingProducts,
  updateOrderStatus,
  addProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/shoppingController.js";
const router = express.Router();


// =============================
// PRODUCT ROUTES
// =============================

// Get all products
router.get("/products", getShoppingProducts);

// Add new product
router.post("/products", addProduct);

// Update product
router.put("/products/:id", updateProduct);

// Delete product
router.delete("/products/:id", deleteProduct);


// =============================
// ORDER ROUTES
// =============================

// Get all orders
router.get("/orders", getOrders);

// Create order
router.post("/orders", createOrder);

// Update order status
router.patch("/orders/:id/status", updateOrderStatus);


export default router;