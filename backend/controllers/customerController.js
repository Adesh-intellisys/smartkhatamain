import db from "../config/db.js";

const query = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.query(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

const ensureCustomerProductSchema = (async () => {
  await query(`
    CREATE TABLE IF NOT EXISTS customer_product_entries (
      id INT AUTO_INCREMENT PRIMARY KEY,
      customer_id INT NOT NULL,
      customer_name VARCHAR(160) NOT NULL,
      mobile VARCHAR(30),
      entry_date DATETIME NOT NULL,
      product_name VARCHAR(160) NOT NULL,
      price DECIMAL(12, 2) NOT NULL DEFAULT 0,
      quantity INT NOT NULL DEFAULT 1,
      paid_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
      pending_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
      total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
      status VARCHAR(30) NOT NULL DEFAULT 'Pending',
      note TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
})();

export const addCustomer = (req, res) => {

    const {
        name,
        mobile,
        email,
        aadharNumber,
        address
    } = req.body;

    const sql = `
        INSERT INTO customers
        (
            customer_name,
            mobile,
            email,
            aadhar_number,
            address
        )
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            name,
            mobile,
            email,
            aadharNumber,
            address
        ],
        (err, result) => {

            if (err) {
                console.log(err);

                return res.status(500).json({
                    success: false,
                    message: "Customer Save Failed"
                });
            }

            res.status(201).json({
                success: true,
                message: "Customer Added Successfully"
            });

        }
    );
};

export const updateCustomer = (req, res) => {
    const { id } = req.params;
    const {
        name,
        mobile,
        email,
        aadharNumber,
        address
    } = req.body;

    const sql = `
        UPDATE customers
        SET customer_name = ?, mobile = ?, email = ?, aadhar_number = ?, address = ?
        WHERE id = ?
    `;

    db.query(
        sql,
        [
            name,
            mobile,
            email,
            aadharNumber,
            address,
            id
        ],
        (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    success: false,
                    message: "Customer Update Failed"
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Customer Not Found"
                });
            }

            res.status(200).json({
                success: true,
                message: "Customer Updated Successfully"
            });
        }
    );
};

export const getCustomers = (req, res) => {

    const sql =
        "SELECT * FROM customers ORDER BY id DESC";

    db.query(sql, (err, result) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: "Failed To Fetch Customers"
            });
        }

        res.status(200).json(result);

    });

};

export const deleteCustomer = (req, res) => {

    const { id } = req.params;

    const sql =
        "DELETE FROM customers WHERE id=?";

    db.query(sql, [id], (err) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: "Delete Failed"
            });
        }

        res.status(200).json({
            success: true,
            message: "Customer Deleted Successfully"
        });

    });

};

export const getCustomerTransactions = (req, res) => {

    const { id } = req.params;

    const sql = `
        SELECT
            p.id,
            p.customer_id,
            p.customer_name,
            'Payment' AS product_name,
            p.amount,
            p.amount AS paid_amount,
            0 AS pending_amount,
            'completed' AS status,
            p.payment_date AS created_at
        FROM payments p
        WHERE p.customer_id = ?
        ORDER BY p.payment_date DESC
    `;

    db.query(sql, [id], (err, result) => {

        if (err) {

            if (err.code === "ER_NO_SUCH_TABLE") {
                return res.status(200).json([]);
            }

            return res.status(500).json({
                success: false,
                message: "Failed To Fetch Transactions"
            });
        }

        const transactions = (result || []).map(item => ({
            id: item.id,
            customer_id: item.customer_id,
            customer_name: item.customer_name,
            product_name: item.product_name,
            amount: parseFloat(item.amount || 0),
            paid_amount: parseFloat(item.paid_amount || 0),
            pending_amount: parseFloat(item.pending_amount || 0),
            status: item.status,
            created_at: item.created_at
        }));

        res.status(200).json(transactions);

    });

};

export const addCustomerProductEntry = async (req, res) => {
    try {
        await ensureCustomerProductSchema;

        const { id } = req.params;
        const {
            date,
            product_name,
            quantity,
            price,
            paid_amount,
            note,
        } = req.body;

        const parsedQuantity = Number(quantity || 0);
        const parsedPrice = Number(price || 0);
        const parsedPaid = Number(paid_amount || 0);

        if (!date || !product_name || parsedQuantity <= 0 || parsedPrice <= 0 || parsedPaid < 0) {
            return res.status(400).json({
                success: false,
                message: "Date, product name, quantity, price and paid amount are required",
            });
        }

        const entryDate = new Date(date);
        if (Number.isNaN(entryDate.getTime())) {
            return res.status(400).json({ success: false, message: "Invalid date format" });
        }

        const normalizedDate = entryDate.toISOString().slice(0, 19).replace("T", " ");
        const totalAmount = Number((parsedPrice * parsedQuantity).toFixed(2));
        const pendingAmount = Number((totalAmount - parsedPaid).toFixed(2));

        if (pendingAmount < 0) {
            return res.status(400).json({
                success: false,
                message: "Paid amount cannot exceed total amount",
            });
        }

        const customerRows = await query(
            "SELECT id, customer_name, mobile FROM customers WHERE id = ?",
            [id]
        );

        if (!customerRows || customerRows.length === 0) {
            return res.status(404).json({ success: false, message: "Customer not found" });
        }

        const customer = customerRows[0];
        const status = pendingAmount === 0 ? "Collected" : "Placed";

        const insertResult = await query(
            `
            INSERT INTO customer_product_entries
            (customer_id, customer_name, mobile, entry_date, product_name, price, quantity, paid_amount, pending_amount, total_amount, status, note)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
            [
                customer.id,
                customer.customer_name,
                customer.mobile || "",
                normalizedDate,
                product_name.trim(),
                parsedPrice,
                parsedQuantity,
                parsedPaid,
                pendingAmount,
                totalAmount,
                status,
                note || "",
            ]
        );

        if (pendingAmount > 0) {
            await query(
                "UPDATE customers SET current_balance = COALESCE(current_balance, 0) + ? WHERE id = ?",
                [pendingAmount, customer.id]
            );
        }

        res.status(201).json({
            success: true,
            message: "Customer product entry saved successfully",
            id: insertResult.insertId,
            total_amount: totalAmount,
            pending_amount: pendingAmount,
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "Failed to save product entry" });
    }
};

export const updateCustomerProductEntry = async (req, res) => {
    try {
        await ensureCustomerProductSchema;

        const { id, entryId } = req.params;
        const { date, product_name, quantity, price, paid_amount, note } = req.body;

        const parsedQuantity = Number(quantity || 0);
        const parsedPrice = Number(price || 0);
        const parsedPaid = Number(paid_amount || 0);

        if (!date || !product_name || parsedQuantity <= 0 || parsedPrice <= 0 || parsedPaid < 0) {
            return res.status(400).json({
                success: false,
                message: "Date, product name, quantity, price and paid amount are required",
            });
        }

        const entryDate = new Date(date);
        if (Number.isNaN(entryDate.getTime())) {
            return res.status(400).json({ success: false, message: "Invalid date format" });
        }

        const normalizedDate = entryDate.toISOString().slice(0, 19).replace("T", " ");
        const totalAmount = Number((parsedPrice * parsedQuantity).toFixed(2));
        const pendingAmount = Number((totalAmount - parsedPaid).toFixed(2));

        if (pendingAmount < 0) {
            return res.status(400).json({
                success: false,
                message: "Paid amount cannot exceed total amount",
            });
        }

        const existingRows = await query(
            "SELECT pending_amount FROM customer_product_entries WHERE id = ? AND customer_id = ?",
            [entryId, id]
        );

        if (!existingRows || existingRows.length === 0) {
            return res.status(404).json({ success: false, message: "Product entry not found" });
        }

        const previousPending = Number(existingRows[0].pending_amount || 0);
        const status = pendingAmount === 0 ? "Collected" : "Placed";

        await query(
            `
            UPDATE customer_product_entries
            SET entry_date = ?,
                product_name = ?,
                price = ?,
                quantity = ?,
                paid_amount = ?,
                pending_amount = ?,
                total_amount = ?,
                status = ?,
                note = ?
            WHERE id = ? AND customer_id = ?
        `,
            [
                normalizedDate,
                product_name.trim(),
                parsedPrice,
                parsedQuantity,
                parsedPaid,
                pendingAmount,
                totalAmount,
                status,
                note || "",
                entryId,
                id,
            ]
        );

        const pendingDifference = Number((pendingAmount - previousPending).toFixed(2));
        if (pendingDifference !== 0) {
            await query(
                "UPDATE customers SET current_balance = GREATEST(COALESCE(current_balance, 0) + ?, 0) WHERE id = ?",
                [pendingDifference, id]
            );
        }

        res.status(200).json({
            success: true,
            message: "Product entry updated successfully",
            total_amount: totalAmount,
            pending_amount: pendingAmount,
            pending_difference: pendingDifference,
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "Failed to update product entry" });
    }
};

export const deleteCustomerProductEntry = async (req, res) => {
    try {
        await ensureCustomerProductSchema;

        const { id, entryId } = req.params;
        const rows = await query(
            "SELECT pending_amount FROM customer_product_entries WHERE id = ? AND customer_id = ?",
            [entryId, id]
        );

        if (!rows || rows.length === 0) {
            return res.status(404).json({ success: false, message: "Product entry not found" });
        }

        const pendingAmount = Number(rows[0].pending_amount || 0);
        await query("DELETE FROM customer_product_entries WHERE id = ? AND customer_id = ?", [entryId, id]);

        if (pendingAmount > 0) {
            await query(
                "UPDATE customers SET current_balance = GREATEST(COALESCE(current_balance, 0) - ?, 0) WHERE id = ?",
                [pendingAmount, id]
            );
        }

        res.status(200).json({
            success: true,
            message: "Product entry deleted successfully",
            pending_difference: -pendingAmount,
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "Failed to delete product entry" });
    }
};

export const getCustomerHistory = async (req, res) => {
    try {
        await ensureCustomerProductSchema;

        const { id } = req.params;

        const customerSql = "SELECT customer_name, mobile, opening_balance, current_balance FROM customers WHERE id = ?";
        const customers = await query(customerSql, [id]);

        if (!customers || customers.length === 0) {
            return res.status(404).json({ success: false, message: "Customer not found" });
        }

        const customer = customers[0];

        const paymentSql = `
            SELECT
                id,
                payment_date AS date,
                'Payment' AS product_name,
                amount AS price,
                1 AS quantity,
                amount AS paid_amount,
                0 AS pending_amount,
                'completed' AS status,
                'payment' AS type
            FROM payments
            WHERE customer_id = ?
        `;

        const productEntrySql = `
            SELECT
                id,
                entry_date AS date,
                product_name,
                price,
                quantity,
                paid_amount,
                pending_amount,
                total_amount,
                note,
                status,
                'product_entry' AS type
            FROM customer_product_entries
            WHERE customer_id = ?
        `;

        const orderSql = `
            SELECT
                oi.id AS id,
                so.pickup_time AS date,
                oi.product_name,
                oi.price,
                oi.quantity,
                oi.line_total AS amount,
                0 AS paid_amount,
                CASE WHEN so.status = 'Collected' THEN 0 ELSE oi.line_total END AS pending_amount,
                so.status,
                'order' AS type
            FROM shopping_orders so
            JOIN shopping_order_items oi ON oi.order_id = so.id
            WHERE (so.customer_name = ? AND so.mobile = ?)
               OR so.customer_name = ?
               OR so.mobile = ?
        `;

        const [payments, productEntries, orders] = await Promise.all([
            query(paymentSql, [id]),
            query(productEntrySql, [id]),
            query(orderSql, [customer.customer_name, customer.mobile, customer.customer_name, customer.mobile]),
        ]);

        const history = [
            ...(payments || []).map((item) => ({
                id: item.id,
                date: item.date,
                product_name: item.product_name,
                price: parseFloat(item.price || 0),
                quantity: Number(item.quantity || 1),
                paid_amount: parseFloat(item.paid_amount || 0),
                pending_amount: parseFloat(item.pending_amount || 0),
                status: item.status,
                type: item.type,
            })),
            ...(productEntries || []).map((item) => ({
                id: item.id,
                date: item.date,
                product_name: item.product_name,
                price: parseFloat(item.price || 0),
                quantity: Number(item.quantity || 0),
                paid_amount: parseFloat(item.paid_amount || 0),
                pending_amount: parseFloat(item.pending_amount || 0),
                total_amount: parseFloat(item.total_amount || 0),
                note: item.note || "",
                status: item.status,
                type: item.type,
            })),
            ...(orders || []).map((item) => ({
                id: item.id,
                date: item.date,
                product_name: item.product_name,
                price: parseFloat(item.price || 0),
                quantity: Number(item.quantity || 0),
                paid_amount: parseFloat(item.paid_amount || 0),
                pending_amount: parseFloat(item.pending_amount || 0),
                status: item.status,
                type: item.type,
            })),
        ];

        history.sort((a, b) => new Date(b.date) - new Date(a.date));

        res.status(200).json(history);
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "Failed to load customer history" });
    }
};
