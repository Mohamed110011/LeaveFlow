const jwt = require("jsonwebtoken");
require("dotenv").config();

function jwtGenerator(user_id, role) {
  // Normalize role to lowercase and trim
  const normalizedRole = role ? role.trim().toLowerCase() : null;
  
  if (!normalizedRole) {
    console.warn("Warning: No role provided for token generation");
  }
  
  const payload = {
    user: user_id,
    role: normalizedRole
  };

  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1hr" });
}

module.exports = jwtGenerator;