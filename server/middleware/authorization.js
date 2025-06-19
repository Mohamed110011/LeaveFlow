const jwt = require("jsonwebtoken");
require("dotenv").config();



module.exports = async (req, res, next) => {
    try {
      const jwtToken = req.header("token");
      if (!jwtToken) {
        return res.status(403).json("Not Authorized");
      }
  
      const payload = jwt.verify(jwtToken, process.env.jwtSecret);
      req.user = payload.user;
      req.role = payload.role;
      console.log("JWT payload:", payload);
      console.log("User from JWT payload:", req.user);
  
      next();
    } catch (err) {
      console.error("Authorization error:", err.message);
      return res.status(403).json("Not Authorized");
    }
  };