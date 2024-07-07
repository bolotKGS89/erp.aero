const jwt = require('jsonwebtoken');
const db = require('../models');
const config = require('../config/config.json')['development']

// Middleware to authenticate 
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader;
    if (token == null) return res.sendStatus(401);

    const user = jwt.verify(token, config.secretKey);

    // Check if the token is in the blacklist
    const blacklistedToken = await db.TokenBlackList.findOne({ where: { 
      token: token,
      deviceId: user.deviceId
    } });
    if (blacklistedToken) {
      return res.sendStatus(403); // If the token is blacklisted, return Forbidden
    }

    jwt.verify(token, config.secretKey, (err, user) => {
      if (err) return res.sendStatus(403);
      
      req.user = user;
      next();
    });
  };


module.exports = authenticateToken;