const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;
let users = require('./router/auth_users.js').users;

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req, res, next) {
    // Check if session exists and has a JWT token stored
    if (!req.session || !req.session.authorization) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }
  
    const token = req.session.authorization.accessToken;
  
    // Verify JWT token
    jwt.verify(token, "fingerprint_customer", (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Unauthorized: Invalid token" });
      }
  
      // Attach decoded user info to request for downstream use
      req.user = decoded;
      next();
    });
  });
  
  
 
const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
