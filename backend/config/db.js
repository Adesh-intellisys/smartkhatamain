import mysql from "mysql2";

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Password@123", // your MySQL password
  database: "adesh",
});

db.connect((err) => {
  if (err) {
    console.error("Database Connection Failed:", err);
  } else {
    console.log("✅ MySQL Connected Successfully");
  }
});

export default db;