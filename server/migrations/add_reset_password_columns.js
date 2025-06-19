const pool = require("../db");
const fs = require("fs");
const path = require("path");

const migratePath = path.join(__dirname, "add_reset_password_columns.sql");
const sql = fs.readFileSync(migratePath, "utf8");

const migrate = async () => {
  try {
    await pool.query(sql);
    console.log("Migration successful: Added reset password columns");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    pool.end();
  }
};

migrate();
