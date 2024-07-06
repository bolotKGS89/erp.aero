const express = require('express');
const router = express.Router();
const db = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authenticateToken = require('../middleware/authmiddleware'); // Correct path to authMiddleware

const secretKey = '12345'// secret key for access token
const refreshTokenSecret = '54321'; // secret key for refresh token

router.post('/', async (req, res) => {
    const { username, password } = req.body;

    const user = await db.User.findOne({ where: { username } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
  
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    // token creation
    const accessToken = jwt.sign({ id: user.id, username: user.username }, secretKey, { expiresIn: '10m' });
    const refreshToken = jwt.sign({ id: user.id, username: user.username }, refreshTokenSecret);

    user.refreshTokens = refreshToken;
    await user.save();
    res.json({ accessToken, refreshToken });
});

router.post('/new_token', authenticateToken, async (req, res) => {
    //retrieve access token from body
    const { refreshTokens } = req.body;
    if (!refreshTokens) return res.sendStatus(401);

    //compare with user access token
    const user = await db.User.findOne({ where: { refreshTokens } });
    if (!user) return res.sendStatus(403);

    jwt.verify(user.refreshTokens, refreshTokenSecret, (err, user) => {
        if (err) return res.sendStatus(403);

        // Invalidate the previous access token
        const previousAccessToken = req.headers['authorization']; // Retrieve previous access token
        if (previousAccessToken) {
            db.TokenBlackList.create({token: previousAccessToken})
        }

        const accessToken = jwt.sign({ id: user.id, username: user.username }, secretKey, { expiresIn: '10m' });
        res.json({ accessToken });
    });
});

module.exports = router;