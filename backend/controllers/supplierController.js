import db from "../config/db.js";

const sendError = (res, message, err, status = 500) => {
  if (err) {
    console.log(message, err);
  }

  return res.status(status).json({
    success: false,
    message,
  });
};

const validateRequired = (fields) =>
  Object.entries(fields).find(([, value]) => value === undefined || value === null || value === "");

const validateAmount = (amount) => Number.isFinite(Number(amount)) && Number(amount) > 0;
const validateId = (id) => Number.isInteger(Number(id)) && Number(id) > 0;

const normalizeDate = (value) => {
  const raw = String(value || "").trim();
  const isoMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (!isoMatch) return null;

  const [, year, month, day] = isoMatch;
  const date = new Date(`${year}-${month}-${day}T00:00:00.000Z`);

  if (
    Number.isNaN(date.getTime()) ||
    date.getUTCFullYear() !== Number(year) ||
    date.getUTCMonth() + 1 !== Number(month) ||
    date.getUTCDate() !== Number(day)
  ) {
    return null;
  }

  return `${year}-${month}-${day}`;
};

db.query(`
  CREATE TABLE IF NOT EXISTS suppliers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    supplier_name VARCHAR(120) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    bill_no VARCHAR(80) NOT NULL,
    purchase_date DATE NOT NULL,
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

export const getSuppliers = (req, res) => {
  const sql = `
    SELECT
      id,
      supplier_name,
      amount,
      bill_no,
      DATE_FORMAT(purchase_date, '%Y-%m-%d') AS purchase_date,
      note,
      created_at
    FROM suppliers
    ORDER BY id DESC
  `;

  db.query(sql, (err, result) => {
    if (err) {
      return sendError(res, "Supplier Fetch Failed", err);
    }

    res.status(200).json(result);
  });
};

export const addSupplier = (req, res) => {
  const {
    supplier_name,
    amount,
    bill_no,
    purchase_date,
    note,
  } = req.body;
  const missing = validateRequired({ supplier_name, amount, bill_no, purchase_date });
  const normalizedPurchaseDate = normalizeDate(purchase_date);

  if (missing) {
    return sendError(res, `${missing[0]} is required`, null, 400);
  }

  if (!validateAmount(amount)) {
    return sendError(res, "amount must be greater than 0", null, 400);
  }

  if (!normalizedPurchaseDate) {
    return sendError(res, "purchase_date must be a valid date", null, 400);
  }

  const sql = `
    INSERT INTO suppliers
    (supplier_name, amount, bill_no, purchase_date, note)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [String(supplier_name).trim(), amount, String(bill_no).trim(), normalizedPurchaseDate, String(note || "").trim()],
    (err, result) => {
      if (err) {
        return sendError(res, "Supplier Save Failed", err);
      }

      res.status(201).json({
        success: true,
        message: "Supplier Added",
        id: result.insertId,
      });
    }
  );
};

export const updateSupplier = (req, res) => {
  const { id } = req.params;
  const { supplier_name, amount, bill_no, purchase_date, note } = req.body;
  const missing = validateRequired({ supplier_name, amount, bill_no, purchase_date });
  const normalizedPurchaseDate = normalizeDate(purchase_date);

  if (!validateId(id)) {
    return sendError(res, "Invalid supplier id", null, 400);
  }

  if (missing) {
    return sendError(res, `${missing[0]} is required`, null, 400);
  }

  if (!validateAmount(amount)) {
    return sendError(res, "amount must be greater than 0", null, 400);
  }

  if (!normalizedPurchaseDate) {
    return sendError(res, "purchase_date must be a valid date", null, 400);
  }

  const sql = `
    UPDATE suppliers
    SET supplier_name = ?, amount = ?, bill_no = ?, purchase_date = ?, note = ?
    WHERE id = ?
  `;

  db.query(
    sql,
    [String(supplier_name).trim(), amount, String(bill_no).trim(), normalizedPurchaseDate, String(note || "").trim(), id],
    (err, result) => {
      if (err) {
        return sendError(res, "Supplier Update Failed", err);
      }

      if (result.affectedRows === 0) {
        return sendError(res, "Supplier not found", null, 404);
      }

      res.status(200).json({
        success: true,
        message: "Supplier Updated",
      });
    }
  );
};

export const deleteSupplier = (req, res) => {
  if (!validateId(req.params.id)) {
    return sendError(res, "Invalid supplier id", null, 400);
  }

  db.query("DELETE FROM suppliers WHERE id = ?", [req.params.id], (err, result) => {
    if (err) {
      return sendError(res, "Supplier Delete Failed", err);
    }

    if (result.affectedRows === 0) {
      return sendError(res, "Supplier not found", null, 404);
    }

    res.status(200).json({
      success: true,
      message: "Supplier Deleted",
    });
  });
};
