const router = require("express").Router();
const pool = require("../db");
const bcrypt = require("bcrypt");
const jwtGenerator = require("../utils/jwtGenerator");
const validInfo = require("../middleware/validInfo");
const authorization = require("../middleware/authorization");
const { client } = require("../config/google");
const crypto = require('crypto');
const { sendResetPasswordEmail } = require('../utils/emailResetPassword');
const { verifyRecaptcha } = require('../utils/recaptcha');

// Export bcrypt for use in other modules
router.bcrypt = bcrypt;

//register route

router.post("/register", validInfo, async (req, res) => {
  try {
    const { name, email, password, role, captchaToken } = req.body;

    // Verify reCAPTCHA token
    const recaptchaVerified = await verifyRecaptcha(captchaToken);
    if (!recaptchaVerified) {
      return res.status(401).json("Invalid reCAPTCHA. Please try again.");
    }

    // Check if user exists
    const user = await pool.query("SELECT * FROM users WHERE user_email = $1", [email]);

    if (user.rows.length > 0) {
      return res.status(401).json("User already exists!");
    }

    // Hash the password
    const saltRound = 10;
    const salt = await bcrypt.genSalt(saltRound);
    const bcryptPassword = await bcrypt.hash(password, salt);

    // Insert new user
    const newUser = await pool.query(
      "INSERT INTO users (user_name, user_email, user_password, role) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, email, bcryptPassword, role || "user"]
    );

    const userId = newUser.rows[0].user_id;
    const currentYear = new Date().getFullYear();

    // Get all available leave types
    const leaveTypes = await pool.query("SELECT id, duree_max FROM type_conges");

    // Initialize leave balances for each type
    for (const type of leaveTypes.rows) {
      await pool.query(
        `INSERT INTO solde_conges (utilisateur_id, type_conge_id, annee, solde_initial, solde_restant)
         VALUES ($1, $2, $3, $4, $4)`,
        [userId, type.id, currentYear, type.duree_max]
      );
    }

    // Génération du token
    const token = jwtGenerator(userId, newUser.rows[0].role);

    // Réponse JSON avec token + info utilisateur
    res.json({ 
      token, 
      name: newUser.rows[0].user_name,
      role: newUser.rows[0].role 
    });

  } catch (err) {
    console.error("Error during registration:", err.message);
    res.status(500).send("Server error");
  }
});
//login route
router.post("/login", validInfo, async (req, res) => {
  try {
    // Log the incoming request details
    console.log('Login request received:', {
      hasEmail: !!req.body.email,
      hasPassword: !!req.body.password,
      hasCaptcha: !!req.body.captchaToken
    });

    const { email, password, captchaToken } = req.body;

    // Validate captcha first
    if (!captchaToken) {
      console.log('No captcha token provided');
      return res.status(400).json("Captcha validation required");
    }

    try {
      const isValidCaptcha = await verifyRecaptcha(captchaToken);
      console.log('Captcha validation result:', isValidCaptcha);
      
      if (!isValidCaptcha) {
        console.log('Captcha validation failed');
        return res.status(400).json("Captcha validation failed");
      }
    } catch (captchaError) {
      console.error('Error validating captcha:', captchaError);
      return res.status(400).json("Error validating captcha");
    }

    // Check user credentials
    const user = await pool.query("SELECT * FROM users WHERE user_email = $1", [email]);

    if (user.rows.length === 0) {
      return res.status(401).json("Password or Email is incorrect");
    }

    // Validate password
    const validPassword = await bcrypt.compare(password, user.rows[0].user_password);

    if (!validPassword) {
      return res.status(401).json("Password or Email is incorrect");
    }    // Generate token
    const user_id = user.rows[0].user_id;
    const role = user.rows[0].role;
    const name = user.rows[0].user_name;
    const token = jwtGenerator(user_id, role);

    res.json({ token, role, name });
    console.log('Login successful for user:', email);

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json("Server Error");
  }
});

// Register route with Google
router.post("/google", async (req, res) => {
  try {
    const { email, name, google_id } = req.body;

    // Check if user exists
    const user = await pool.query("SELECT * FROM users WHERE user_email = $1 OR google_id = $2", 
      [email, google_id]
    );    if (user.rows.length > 0) {
      // User exists, update google_id if not set
      if (!user.rows[0].google_id) {
        await pool.query(
          "UPDATE users SET google_id = $1 WHERE user_id = $2",
          [google_id, user.rows[0].user_id]
        );
      }
      const token = jwtGenerator(user.rows[0].user_id, user.rows[0].role);
      console.log('Generated token with role:', user.rows[0].role); // Debug log
      return res.json({ 
        token, 
        name: user.rows[0].user_name,
        role: user.rows[0].role 
      });
    }

    // If user doesn't exist, create new user
    const newUser = await pool.query(
      "INSERT INTO users (user_name, user_email, google_id, role) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, email, google_id, "employee"]
    );

    // Initialize leave balances for the new user
    const userId = newUser.rows[0].user_id;
    const currentYear = new Date().getFullYear();

    // Get all leave types
    const leaveTypes = await pool.query("SELECT id, duree_max FROM type_conges");

    // Initialize leave balances for each type
    for (const type of leaveTypes.rows) {
      await pool.query(
        "INSERT INTO solde_conges (utilisateur_id, type_conge_id, annee, solde_initial, solde_restant) VALUES ($1, $2, $3, $4, $4)",
        [userId, type.id, currentYear, type.duree_max]
      );
    }

    const token = jwtGenerator(userId, newUser.rows[0].role);
    res.json({ 
      token, 
      name: newUser.rows[0].user_name,
      role: newUser.rows[0].role 
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Forgot Password Route
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user exists
    const user = await pool.query("SELECT * FROM users WHERE user_email = $1", [email]);
    
    if (user.rows.length === 0) {
      // For security reasons, don't tell the client that the email doesn't exist
      // Instead, return a generic success message
      return res.json({ message: "Si cette adresse email existe dans notre système, un email de réinitialisation a été envoyé." });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date();
    tokenExpiry.setHours(tokenExpiry.getHours() + 1); // Token valid for 1 hour

    // Save token and expiry to database
    await pool.query(
      "UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE user_id = $3",
      [resetToken, tokenExpiry, user.rows[0].user_id]
    );

    // Send email with reset link
    await sendResetPasswordEmail(email, resetToken);

    res.json({ message: "Si cette adresse email existe dans notre système, un email de réinitialisation a été envoyé." });
  } catch (err) {
    console.error("Error in forgot-password route:", err.message);
    res.status(500).json({ message: "Une erreur est survenue lors de la demande de réinitialisation" });
  }
});

// Reset Password Route
router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword, captchaToken } = req.body;

    // Temporarily skip captcha validation for testing
    // Validate captcha if provided
    // if (captchaToken) {
    //   const isValidCaptcha = await verifyRecaptcha(captchaToken);
    //   if (!isValidCaptcha) {
    //     return res.status(400).json({ message: "Captcha validation failed" });
    //   }
    // }

    // Validate token
    const user = await pool.query(
      "SELECT * FROM users WHERE reset_token = $1 AND reset_token_expiry > NOW()",
      [token]
    );

    if (user.rows.length === 0) {
      return res.status(400).json({ message: "Le lien de réinitialisation est invalide ou a expiré" });
    }

    // Hash new password
    const saltRound = 10;
    const salt = await bcrypt.genSalt(saltRound);
    const bcryptPassword = await bcrypt.hash(newPassword, salt);

    // Update password and clear reset token
    await pool.query(
      "UPDATE users SET user_password = $1, reset_token = NULL, reset_token_expiry = NULL WHERE user_id = $2",
      [bcryptPassword, user.rows[0].user_id]
    );

    res.json({ message: "Votre mot de passe a été réinitialisé avec succès" });
  } catch (err) {
    console.error("Error in reset-password route:", err.message);
    res.status(500).json({ message: "Une erreur est survenue lors de la réinitialisation du mot de passe" });
  }
});

// Validate Reset Token Route
router.post("/validate-token", async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Token requis" });
    }

    // Check if token exists and is not expired
    const user = await pool.query(
      "SELECT * FROM users WHERE reset_token = $1 AND reset_token_expiry > NOW()",
      [token]
    );

    if (user.rows.length === 0) {
      return res.status(400).json({ message: "Le lien de réinitialisation est invalide ou a expiré" });
    }

    res.json({ message: "Token valide" });
  } catch (err) {
    console.error("Error in validate-token route:", err.message);
    res.status(500).json({ message: "Une erreur est survenue lors de la validation du token" });
  }
});

module.exports = router;