import express from "express";

import {
  addSupplierPurchase,
  deleteSupplierPurchase,
  getSupplierPurchaseSummary,
  getSupplierPurchases,
  updateSupplierPurchase,
} from "../controllers/supplierPurchaseController.js";

const router = express.Router();

router.get("/summary", getSupplierPurchaseSummary);
router.get("/", getSupplierPurchases);
router.post("/", addSupplierPurchase);
router.put("/:id", updateSupplierPurchase);
router.delete("/:id", deleteSupplierPurchase);

export default router;
