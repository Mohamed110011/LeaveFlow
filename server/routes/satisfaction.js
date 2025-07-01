const router = require("express").Router();
const pool = require("../db");
const authorization = require("../middleware/authorization");

// Get user satisfaction score
router.get("/", authorization, async (req, res) => {
  try {
    console.log("User object:", req.user); // Debug log

    if (!req.user) {
      return res.status(401).json("User information missing from token");
    }

    // Vérifier d'abord si la table existe
    const tableExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'employee_satisfaction'
      );
    `);

    if (!tableExists.rows[0].exists) {
      // Si la table n'existe pas, on la crée
      await pool.query(`
        CREATE TABLE IF NOT EXISTS employee_satisfaction (
          id SERIAL PRIMARY KEY,
          user_id UUID REFERENCES users(user_id),
          satisfaction_score INTEGER CHECK (satisfaction_score >= 0 AND satisfaction_score <= 100),
          comment TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          UNIQUE (user_id)
        );
      `);
    }    const satisfaction = await pool.query(
      "SELECT satisfaction_score, comment FROM employee_satisfaction WHERE user_id = $1",
      [req.user]
    );

    // If no score exists yet, return default score of 80
    if (satisfaction.rows.length === 0) {
      // Insert default score
      await pool.query(
        "INSERT INTO employee_satisfaction (user_id, satisfaction_score) VALUES ($1, $2)",
        [req.user.id, 80]
      );
      return res.json({ satisfaction_score: 80 });
    }

    res.json(satisfaction.rows[0]);
  } catch (err) {
    console.error("Error in GET /satisfaction/:", err);
    res.status(500).json("Server error: " + err.message);
  }
});

// Update user satisfaction score
router.post("/", authorization, async (req, res) => {
  try {
    const { satisfaction_score, comment } = req.body;

    // Validate score
    if (satisfaction_score < 0 || satisfaction_score > 100) {
      return res.status(400).json("Score must be between 0 and 100");
    }

    // Vérifier si la table existe
    const tableExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'employee_satisfaction'
      );
    `);

    if (!tableExists.rows[0].exists) {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS employee_satisfaction (
          id SERIAL PRIMARY KEY,
          user_id UUID REFERENCES users(user_id),
          satisfaction_score INTEGER CHECK (satisfaction_score >= 0 AND satisfaction_score <= 100),
          comment TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          UNIQUE (user_id)
        );
      `);
    }    console.log("Attempting to update satisfaction for user:", req.user); // Debug log
    
    const result = await pool.query(
      `INSERT INTO employee_satisfaction (user_id, satisfaction_score, comment)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id) 
       DO UPDATE SET 
         satisfaction_score = $2,
         comment = $3,
         created_at = CURRENT_TIMESTAMP
       RETURNING satisfaction_score`,
      [req.user, satisfaction_score, comment]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error in POST /satisfaction/:", err);
    res.status(500).json("Server error: " + err.message);
  }
});

// Get all employee satisfaction scores (managers and HR only)
router.get("/all", authorization, async (req, res) => {
  try {
    console.log("Access /satisfaction/all - User:", req.user);
    console.log("Access /satisfaction/all - Role:", req.role);
    console.log("Token Headers:", req.headers.token);

    // Verify user role in database
    const userRole = await pool.query(
      "SELECT role FROM users WHERE user_id = $1",
      [req.user]
    );
    console.log("Database role:", userRole.rows[0]?.role);    // Check if user is manager or HR/RH
    console.log("Role comparison - Role from token:", JSON.stringify(req.role));
    const allowedRoles = ['manager', 'hr', 'rh'];
    const normalizedRole = req.role ? req.role.trim().toLowerCase() : '';
    
    if (!allowedRoles.includes(normalizedRole)) {
      console.log("Access denied - Required roles:", allowedRoles, "Got:", normalizedRole);
      return res.status(403).json("Access denied: Only managers and HR can view all satisfaction scores");
    }// Join satisfaction table with users table to get names and filter by active employees
    const allSatisfaction = await pool.query(`
      SELECT 
        es.user_id,
        u.user_name,
        es.satisfaction_score,
        es.comment,
        es.created_at,
        u.role as user_role
      FROM employee_satisfaction es
      JOIN users u ON es.user_id = u.user_id
      WHERE u.role = 'employee'
      ORDER BY es.satisfaction_score DESC, es.created_at DESC
    `);

    res.json(allSatisfaction.rows);
  } catch (err) {
    console.error("Error in GET /satisfaction/all:", err);
    res.status(500).json("Server error: " + err.message);
  }
});

module.exports = router;
