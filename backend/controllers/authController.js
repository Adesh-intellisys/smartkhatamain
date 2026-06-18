import db from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

/* ==========================
   REGISTER USER
========================== */

export const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      address,
      mobile,
      password,
      confirmPassword,
    } = req.body;

    // Validation

    if (
      !name ||
      !email ||
      !address ||
      !mobile ||
      !password ||
      !confirmPassword
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    // Check Existing Email

    const checkEmailQuery =
      "SELECT * FROM smartkhata_register_data WHERE email=?";

    db.query(
      checkEmailQuery,
      [email],
      async (err, result) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: "Database Error",
          });
        }

        if (result.length > 0) {
          return res.status(400).json({
            success: false,
            message: "Email already registered",
          });
        }

        // Hash Password

        const hashedPassword =
          await bcrypt.hash(password, 10);

        const insertQuery = `
          INSERT INTO smartkhata_register_data
          (name,email,address,mobile,password)
          VALUES (?,?,?,?,?)
        `;

        db.query(
          insertQuery,
          [
            name,
            email,
            address,
            mobile,
            hashedPassword,
          ],
          (err, data) => {
            if (err) {
              return res.status(500).json({
                success: false,
                message: "Registration Failed",
              });
            }

            return res.status(201).json({
              success: true,
              message: "Registration Successful",
            });
          }
        );
      }
    );
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ==========================
   LOGIN USER
========================== */

export const loginUser = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and Password are required",
    });
  }

  const query =
    "SELECT * FROM smartkhata_register_data WHERE email=?";

  db.query(query, [email], async (err, result) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Database Error",
      });
    }

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const user = result[0];

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid Password",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      "smartkhata_secret_key",
      {
        expiresIn: "1d",
      }
    );

    return res.status(200).json({
      success: true,
      message: "Login Successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  });
};