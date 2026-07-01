import express from "express";

import {
    addCustomer,
    getCustomers,
    deleteCustomer,
    updateCustomer,
    getCustomerTransactions,
    getCustomerHistory,
    addCustomerProductEntry,
    updateCustomerProductEntry,
    deleteCustomerProductEntry,
} from "../controllers/customerController.js";

const router = express.Router();

router.post("/add", addCustomer);

router.get("/", getCustomers);

router.get("/:id/transactions", getCustomerTransactions);

router.get("/:id/history", getCustomerHistory);

router.post("/:id/product-entry", addCustomerProductEntry);

router.put("/:id/product-entry/:entryId", updateCustomerProductEntry);

router.delete("/:id/product-entry/:entryId", deleteCustomerProductEntry);

router.put("/:id", updateCustomer);

router.delete("/:id", deleteCustomer);

export default router;
