const jwt = require('jsonwebtoken');
const db = require('../models');

const secretKey = '12345'// secret key for access token
// Middleware to authenticate 
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader;
    if (token == null) return res.sendStatus(401);
  
    // Check if the token is in the blacklist
    const blacklistedToken = await db.TokenBlackList.findOne({ where: { token } });
    if (blacklistedToken) {
      return res.sendStatus(403); // If the token is blacklisted, return Forbidden
    }
  
    jwt.verify(token, secretKey, (err, user) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  };


module.exports = authenticateToken;