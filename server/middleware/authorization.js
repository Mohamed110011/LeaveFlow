const jwt = require("jsonwebtoken");
require("dotenv").config();



module.exports = async (req, res, next) => {
    try {
      const jwtToken = req.header("token");
      if (!jwtToken) {
        return res.status(403).json("Not Authorized");
      }      const payload = jwt.verify(jwtToken, process.env.jwtSecret);
      req.user = payload.user;
      req.role = payload.role ? payload.role.trim().toLowerCase() : null;
      
      console.log("JWT payload:", JSON.stringify(payload));
      console.log("User from JWT payload:", req.user);
      console.log("Role from JWT payload (normalized):", req.role);
      
      if (!req.role) {
        console.log("Warning: No role found in token");
      }
  
      next();
    } catch (err) {
      console.error("Authorization error:", err.message);
      return res.status(403).json("Not Authorized");
    }
  };