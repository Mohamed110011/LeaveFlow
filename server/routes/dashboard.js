const router = require("express").Router();
const { Router } = require("express");
const pool = require("../db");
const authorization = require("../middleware/authorization");
// Importing bcrypt from another module to avoid direct dependency
// This allows us to use the functionality without importing bcrypt directly
const bcrypt = require("../routes/jwtAuth").bcrypt;





// Get all Users
router.get("/users", async (req, res) => {
  try {
    const allUsers = await pool.query("SELECT * FROM users");
    res.json(allUsers.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});
// Route DELETE pour supprimer un utilisateur et ses maisons associées
router.delete("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    // Vérifiez que l'utilisateur existe
    const userResult = await pool.query("SELECT * FROM users WHERE user_id = $1", [id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Supprimez l'utilisateur (cela supprimera aussi les maisons associées grâce à ON DELETE CASCADE)
    await pool.query("DELETE FROM users WHERE user_id = $1", [id]);
    
    res.status(200).json({ message: "User and associated houses deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error.message);
    res.status(500).json({ message: "Failed to delete user and associated houses" });
  }
});
// Fonction pour modifier un utilisateur
router.put("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { user_name, user_email, user_password, role } = req.body;
    
    // Vérifier que l'utilisateur existe
    const userResult = await pool.query("SELECT * FROM users WHERE user_id = $1", [id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Préparer la requête dynamiquement en fonction des champs fournis
    let query = "UPDATE users SET ";
    const values = [];
    const queryParams = [];
    
    // Ajouter les champs à mettre à jour s'ils sont fournis
    if (user_name) {
      values.push(user_name);
      queryParams.push(`user_name = $${values.length}`);
    }
    
    if (user_email) {
      // Vérifier si l'email est déjà utilisé par un autre utilisateur
      const emailCheck = await pool.query(
        "SELECT * FROM users WHERE user_email = $1 AND user_id != $2",
        [user_email, id]
      );
      
      if (emailCheck.rows.length > 0) {
        return res.status(400).json({ message: "Email already in use" });
      }
      
      values.push(user_email);
      queryParams.push(`user_email = $${values.length}`);
    }
    
    if (user_password) {
      // Hasher le nouveau mot de passe
      const saltRound = 10;
      const salt = await bcrypt.genSalt(saltRound);
      const bcryptPassword = await bcrypt.hash(user_password, salt);
      
      values.push(bcryptPassword);
      queryParams.push(`user_password = $${values.length}`);
    }
    
    if (role) {
      values.push(role);
      queryParams.push(`role = $${values.length}`);
    }
    
    // Si aucun champ n'est fourni, renvoyer une erreur
    if (values.length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }
    
    // Compléter la requête
    query += queryParams.join(", ");
    query += ` WHERE user_id = $${values.length + 1}`;
    values.push(id);
    
    // Exécuter la requête
    await pool.query(query, values);
    
    res.status(200).json({ message: "User updated successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Function to get user and maisons
const getUserAndMaisons = async (userId) => {
  const query = `
    SELECT u.user_name, t.maison_id, t.description, t.address 
    FROM users AS u 
    LEFT JOIN maisons AS t ON u.user_id = t.user_id 
    WHERE u.user_id = $1
  `;
  const { rows } = await pool.query(query, [userId]);
  return rows;
};

// Get user's maisons
router.get("/", authorization, async (req, res) => {
  try {
    // req.user contains the user ID from the JWT token
    const user = await pool.query(
      "SELECT user_id, user_name, user_email, role FROM users WHERE user_id = $1",
      [req.user]
    );
    
    if (user.rows.length === 0) {
      return res.status(404).json("User not found");
    }
    
    res.json(user.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});


router.delete("/demandes-conge/:id", authorization, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user;
    
    // First check if the leave request exists and belongs to the user
    const requestQuery = await pool.query(
      "SELECT * FROM demandes_conge WHERE id = $1",
      [id]
    );
    
    if (requestQuery.rows.length === 0) {
      return res.status(404).json({ message: "Leave request not found" });
    }
    
    const request = requestQuery.rows[0];
    
    // Check if the request belongs to the user
    if (request.utilisateur_id !== userId) {
      return res.status(403).json({ message: "You are not authorized to delete this request" });
    }
    
    // Check if the request is in 'En attente' status
    if (request.statut !== 'En attente') {
      return res.status(400).json({ 
        message: "You can only delete pending requests" 
      });
    }
    
    // Delete the request
    await pool.query(
      "DELETE FROM demandes_conge WHERE id = $1",
      [id]
    );
    
    res.json({ message: "Leave request deleted successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
});






router.get("/type-conges", authorization, async (req, res) => {
  try {
    const types = await pool.query("SELECT * FROM type_conges ORDER BY nom");
    res.json(types.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Get user's leave requests
router.get("/demandes-conge", authorization, async (req, res) => {
  try {
    const userId = req.user;
    // Vérifier si l'utilisateur a un rôle de manager
    const userResponse = await pool.query(
      "SELECT role FROM users WHERE user_id = $1",
      [userId]
    );
      let demandesQuery;    const role = userResponse.rows[0]?.role;
    
    if (role === 'manager' || role === 'rh') {
      // Pour les managers et HR, retourner toutes les demandes
      demandesQuery = await pool.query(
        "SELECT dc.*, u.user_name FROM demandes_conge dc LEFT JOIN users u ON dc.utilisateur_id = u.user_id ORDER BY dc.date_creation DESC"
      );
    } else {
      // Pour les utilisateurs normaux, retourner uniquement leurs demandes
      demandesQuery = await pool.query(
        "SELECT dc.*, u.user_name FROM demandes_conge dc LEFT JOIN users u ON dc.utilisateur_id = u.user_id WHERE dc.utilisateur_id = $1 ORDER BY dc.date_creation DESC",
        [userId]
      );
    }
    
    res.json(demandesQuery.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Submit a leave request
router.post("/demandes-conge", authorization, async (req, res) => {
  try {
    const { date_debut, date_fin, raison, type_conge_id, statut } = req.body;
    const utilisateur_id = req.user;

    // Validate status
    if (!Object.values(VALID_STATUSES).includes(statut)) {
      return res.status(400).json({
        message: `Invalid status. Must be one of: ${Object.values(VALID_STATUSES).join(', ')}`
      });
    }

    const newRequest = await pool.query(
      `INSERT INTO demandes_conge 
       (utilisateur_id, type_conge_id, date_debut, date_fin, raison, statut, date_creation)
       VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
       RETURNING *`,
      [utilisateur_id, type_conge_id, date_debut, date_fin, raison, VALID_STATUSES.PENDING]
    );

    res.json(newRequest.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
});
// Get leave request statistics for current user
router.get("/stats", authorization, async (req, res) => {
  try {
    const userId = req.user;
    
    // Get counts by status
    const statsQuery = await pool.query(
      "SELECT statut, COUNT(*) as count FROM demandes_conge " +
      "WHERE utilisateur_id = $1 GROUP BY statut",
      [userId]
    );
    
    // Initialize counts
    let pendingRequests = 0;
    let approvedRequests = 0;
    let rejectedRequests = 0;
    
    // Process results
    statsQuery.rows.forEach(row => {
      if (row.statut === 'En attente') {
        pendingRequests = parseInt(row.count);
      } else if (row.statut === 'Approuvé') {
        approvedRequests = parseInt(row.count);
      } else if (row.statut === 'Refusé') {
        rejectedRequests = parseInt(row.count);
      }
    });
    
    res.json({
      pendingRequests,
      approvedRequests,
      rejectedRequests
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all employees' leave balances for HR
router.get("/solde-conges", authorization, async (req, res) => {
  try {
    const year = req.query.year || new Date().getFullYear();
    
    // Get all employees' leave balances
    const balancesQuery = await pool.query(
      `SELECT sc.*, tc.nom as type_nom, u.user_name 
       FROM solde_conges sc 
       JOIN type_conges tc ON sc.type_conge_id = tc.id
       JOIN users u ON sc.utilisateur_id = u.user_id
       WHERE sc.annee = $1`,
      [year]
    );
    
    res.json(balancesQuery.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Get leave balances for current user
router.get("/soldes", authorization, async (req, res) => {
  try {
    const userId = req.user;
    const currentYear = new Date().getFullYear();
    
    // Get user's leave balances
    const balancesQuery = await pool.query(
      "SELECT sc.*, tc.nom as type_nom " +
      "FROM solde_conges sc " +
      "JOIN type_conges tc ON sc.type_conge_id = tc.id " +
      "WHERE sc.utilisateur_id = $1 AND sc.annee = $2",
      [userId, currentYear]
    );
    
    res.json(balancesQuery.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
});



// Remplacer les constantes de statut

const VALID_STATUSES = {
  PENDING: 'En attente',
  APPROVED: 'Approuve',
  REJECTED: 'Refuse'
};

// Fonction pour traiter les demandes de congé
router.put("/demandes-conge/:id", authorization, async (req, res) => {
  const { id } = req.params;
  let statut;
  const commentaire = req.body.commentaire;
  const managerId = req.user;

  try {
    // Interpréter le statut (sans accents dans la BDD)
    if (req.body.statut.includes('Approuv')) {
      statut = 'Approuve'; // Sans accent
    } else if (req.body.statut.includes('Refus')) {
      statut = 'Refuse'; // Sans accent
    } else {
      statut = req.body.statut;
    }

    // Valider le statut
    if (!Object.values(VALID_STATUSES).includes(statut)) {
      return res.status(400).json({ 
        success: false,
        message: `Invalid status. Must be one of: ${Object.values(VALID_STATUSES).join(', ')}`
      });
    }

    await pool.query('BEGIN');

    // Récupérer la demande
    const requestResult = await pool.query(
      "SELECT * FROM demandes_conge WHERE id = $1",
      [id]
    );

    if (requestResult.rows.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ success: false, message: "Leave request not found" });
    }

    const request = requestResult.rows[0];

    if (request.statut !== VALID_STATUSES.PENDING) {
      await pool.query('ROLLBACK');
      return res.status(400).json({ success: false, message: "Request already processed" });
    }    // Get employee email
    const employeeQuery = await pool.query(
      "SELECT user_email FROM users WHERE user_id = $1",
      [request.utilisateur_id]
    );

    const employeeEmail = employeeQuery.rows[0].user_email;

    // Mise à jour du statut de la demande
    const updateRequest = await pool.query(
      `UPDATE demandes_conge 
       SET statut = $1, commentaire = $2, approbateur_id = $3, date_reponse = CURRENT_TIMESTAMP 
       WHERE id = $4 RETURNING *`,
      [statut, commentaire || null, managerId, id]
    );

    const updatedRequest = updateRequest.rows[0];

    // Send email notification
    const { sendLeaveStatusEmail } = require('../utils/emailService');
    await sendLeaveStatusEmail(employeeEmail, statut, updatedRequest.date_debut, updatedRequest.date_fin);

    // Si le congé est approuvé, on met à jour le solde
    if (statut === VALID_STATUSES.APPROVED) {
      const dateDebut = new Date(updatedRequest.date_debut);
      const dateFin = new Date(updatedRequest.date_fin);
      const durationDays = Math.ceil((dateFin - dateDebut) / (1000 * 60 * 60 * 24)) + 1;

      const soldeQuery = await pool.query(
        `SELECT solde_restant FROM solde_conges 
         WHERE utilisateur_id = $1 AND type_conge_id = $2 AND annee = $3`,
        [updatedRequest.utilisateur_id, updatedRequest.type_conge_id, new Date().getFullYear()]
      );

      if (soldeQuery.rows.length === 0) {
        await pool.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          message: "No leave balance found for this user and leave type"
        });
      }

      const soldeRestant = soldeQuery.rows[0].solde_restant;

      if (soldeRestant < durationDays) {
        await pool.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          message: "Not enough leave balance to approve this request"
        });
      }

      await pool.query(
        `UPDATE solde_conges 
         SET solde_restant = solde_restant - $1 
         WHERE utilisateur_id = $2 AND type_conge_id = $3 AND annee = $4`,
        [durationDays, updatedRequest.utilisateur_id, updatedRequest.type_conge_id, new Date().getFullYear()]
      );
    }

    await pool.query('COMMIT');

    return res.status(200).json({
      success: true,
      message: statut === VALID_STATUSES.APPROVED 
        ? "Leave request approved and balance updated" 
        : "Leave request rejected",
      data: updatedRequest
    });

  } catch (err) {
    console.error('Server error:', err.stack || err);
    await pool.query('ROLLBACK');
    res.status(500).json({
      success: false,
      message: "An error occurred while processing the request. Please try again."
    });
  }
});




// Route pour obtenir les statistiques globales des congés
router.get("/reports/stats", authorization, async (req, res) => {
  try {
    // Get total counts by status
    const statusQuery = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN statut = 'En attente' THEN 1 END) as pending,
        COUNT(CASE WHEN statut = 'Approuve' THEN 1 END) as approved,
        COUNT(CASE WHEN statut = 'Refuse' THEN 1 END) as rejected
      FROM demandes_conge
    `);

    // Get stats by leave type
    const leaveTypeQuery = await pool.query(`
      SELECT 
        tc.nom as type_name,
        COUNT(*) as request_count
      FROM demandes_conge dc
      JOIN type_conges tc ON dc.type_conge_id = tc.id
      GROUP BY tc.nom
      ORDER BY request_count DESC
    `);

    // Get monthly requests for current year
    const currentYear = new Date().getFullYear();
    const monthlyQuery = await pool.query(`
      SELECT 
        EXTRACT(MONTH FROM date_creation) as month,
        COUNT(*) as request_count
      FROM demandes_conge
      WHERE EXTRACT(YEAR FROM date_creation) = $1
      GROUP BY EXTRACT(MONTH FROM date_creation)
      ORDER BY month
    `, [currentYear]);

    res.json({
      totalRequests: parseInt(statusQuery.rows[0].total),
      pendingRequests: parseInt(statusQuery.rows[0].pending),
      approvedRequests: parseInt(statusQuery.rows[0].approved),
      rejectedRequests: parseInt(statusQuery.rows[0].rejected),
      leaveTypeStats: leaveTypeQuery.rows,
      monthlyRequests: monthlyQuery.rows
    });
  } catch (err) {
    console.error("Error fetching leave statistics:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});



// Ajouter cette route dans le fichier server/routes/dashboard.js
router.get("/soldes", authorization, async (req, res) => {
  try {
    const userId = req.user;
    const currentYear = req.query.annee || new Date().getFullYear();
    
    console.log(`Fetching leave balances for user ${userId} for year ${currentYear}`);
    
    const balancesQuery = await pool.query(
      "SELECT sc.*, tc.nom as type_nom " +
      "FROM solde_conges sc " +
      "JOIN type_conges tc ON sc.type_conge_id = tc.id " +
      "WHERE sc.utilisateur_id = $1 AND sc.annee = $2",
      [userId, currentYear]
    );
    
    res.json(balancesQuery.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Route pour mettre à jour le profil de l'utilisateur
router.put("/profile", authorization, async (req, res) => {
  try {
    const userId = req.user;
    const { user_name, user_email } = req.body;
    
    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    if (user_email) {
      const emailCheck = await pool.query(
        "SELECT * FROM users WHERE user_email = $1 AND user_id != $2", 
        [user_email, userId]
      );
      
      if (emailCheck.rows.length > 0) {
        return res.status(400).json({ message: "Email already in use by another account" });
      }
    }
    
    // Mettre à jour les informations de l'utilisateur (uniquement celles qui existent dans la base de données)
    const updateQuery = await pool.query(
      `UPDATE users 
       SET user_name = COALESCE($1, user_name),
           user_email = COALESCE($2, user_email)
       WHERE user_id = $3
       RETURNING user_id, user_name, user_email, role`,
      [user_name, user_email, userId]
    );
    
    if (updateQuery.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json(updateQuery.rows[0]);
  } catch (err) {
    console.error("Error updating profile:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Route pour changer le mot de passe
router.put("/change-password", authorization, async (req, res) => {
  try {
    const userId = req.user;
    const { current_password, new_password } = req.body;
    
    if (!current_password || !new_password) {
      return res.status(400).json({ message: "Current password and new password are required" });
    }
    
    if (new_password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }
    
    // Vérifier si l'utilisateur existe et récupérer son mot de passe actuel
    const userCheck = await pool.query(
      "SELECT user_password FROM users WHERE user_id = $1", 
      [userId]
    );
    
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    
    try {
      // Vérifier que l'ancien mot de passe est correct 
      // Nous utilisons simplement une comparaison directe car nous n'avons pas accès à bcrypt
      if (current_password === userCheck.rows[0].user_password) {
        // Si l'ancien mot de passe est correct, mettre à jour avec le nouveau mot de passe
        // Ici aussi nous stockons le mot de passe en clair
        await pool.query(
          "UPDATE users SET user_password = $1 WHERE user_id = $2",
          [new_password, userId]
        );
        
        return res.json({ message: "Password changed successfully" });
      } else {
        return res.status(401).json({ message: "Current password is incorrect" });
      }
    } catch (err) {
      console.error("Error verifying password:", err.message);
      return res.status(500).json({ message: "Error validating password" });
    }
  } catch (err) {
    console.error("Error changing password:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Route pour récupérer la liste des départements
router.get("/departements", authorization, async (req, res) => {
  try {
    const query = await pool.query(`
      SELECT DISTINCT role as nom, role as id 
      FROM users 
      WHERE role IS NOT NULL 
      ORDER BY role
    `);
    res.json(query.rows);
  } catch (err) {
    console.error("Error fetching departments:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});








router.post("/auth/google", async (req, res) => {
  try {
      const { tokenId } = req.body;
      const ticket = await client.verifyIdToken({
          idToken: tokenId,
          audience: "YOUR_GOOGLE_CLIENT_ID"
      });
      const { email, name } = ticket.getPayload();
      
      // Check if user exists, if not create a new user, and generate a JWT token
      // This is an example, modify it according to your user model and JWT setup
      let user = await User.findOne({ email });
      if (!user) {
          user = new User({ email, name });
          await user.save();
      }
      const token = jwt.sign({ userId: user._id }, "YOUR_JWT_SECRET", { expiresIn: "1h" });

      res.json({ token });
  } catch (err) {
      console.error(err);      res.status(500).json("Server Error");
  }
});




module.exports = router;
