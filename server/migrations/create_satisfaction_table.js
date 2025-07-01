const pool = require("../db");

async function createSatisfactionTable() {
  try {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS employee_satisfaction (
        id SERIAL PRIMARY KEY,
        user_id UUID REFERENCES users(user_id),
        satisfaction_score INTEGER CHECK (satisfaction_score >= 0 AND satisfaction_score <= 100),
        comment TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (user_id)
      );
    `;

    await pool.query(createTableQuery);
    console.log("Employee satisfaction table created successfully");
  } catch (err) {
    console.error("Error creating satisfaction table:", err);
    throw err;
  }
}

createSatisfactionTable()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
