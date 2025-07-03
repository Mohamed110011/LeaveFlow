require('dotenv').config();
const express = require('express');
const cors = require('cors'); 
const app = express();

// Log environment variables (masking sensitive data)
console.log('Environment configuration:', {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT || 5001,
  HAS_JWT_SECRET: !!process.env.JWT_SECRET,
  HAS_RECAPTCHA_SECRET: !!process.env.RECAPTCHA_SECRET_KEY,
  HAS_RECAPTCHA_SITE_KEY: !!(process.env.RECAPTCHA_SITE_KEY || process.env.REACT_APP_RECAPTCHA_SITE_KEY),
  RECAPTCHA_SECRET_START: process.env.RECAPTCHA_SECRET_KEY ? process.env.RECAPTCHA_SECRET_KEY.substring(0, 6) + '...' : 'NOT_SET'
});

//middleware 
app.use(express.json()); //req.body
app.use(cors());

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Request body:', req.body);
  next();
});

//ROUTES//

//register and login routes
app.use("/auth", require("./routes/jwtAuth"));

//dashborde route
app.use("/dashboard", require("./routes/dashboard"));

//HR reports routes
app.use("/dashboard", require("./routes/dashboard-reports"));

//Satisfaction routes
app.use("/satisfaction", require("./routes/satisfaction"));

app.listen(5001, () => {
  console.log('Server is running on port 5001');
  console.log('Server configuration completed');
});