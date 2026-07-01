import express from "express";

import {
  addAdvancePayment,
  addAttendance,
  addSalaryPayment,
  addStaff,
  deleteStaff,
  getStaff,
  getStaffById,
  getStaffHistory,
  getStaffSummary,
  updateStaff,
} from "../controllers/staffController.js";

const router = express.Router();

router.get("/summary", getStaffSummary);
router.get("/", getStaff);
router.get("/:id", getStaffById);
router.post("/", addStaff);
router.put("/:id", updateStaff);
router.delete("/:id", deleteStaff);
router.get("/:id/history", getStaffHistory);
router.post("/:id/attendance", addAttendance);
router.post("/:id/salary-payments", addSalaryPayment);
router.post("/:id/advances", addAdvancePayment);

export default router;
