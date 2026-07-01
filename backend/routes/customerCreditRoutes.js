import express from "express";

import {
  addCustomerCredit,
  deleteCustomerCredit,
  getCustomerCredits,
  updateCustomerCredit,
} from "../controllers/customerCreditController.js";

const router = express.Router();

router.get("/", getCustomerCredits);
router.post("/", addCustomerCredit);
router.put("/:id", updateCustomerCredit);
router.delete("/:id", deleteCustomerCredit);

export default router;
