const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const db = require('./models');
const authenticateToken = require('./middleware/authmiddleware')
const fileController = require('./controller/fileController'); // Import file routes
const signinController = require('./controller/signinController'); // Import file routes

const app = express();
app.use(bodyParser.json());

// CORS
app.use(cors({
    origin: '*', // access from any domain
    credentials: true // credentials support
  }));


app.use('/file', fileController); // Use file routes

app.use('/signin', signinController) // Use signin routes

app.get('/logout', async (req, res) => {
    const accessToken = req.headers['authorization'];
    const { refreshTokens } = req.body;


    const jwtUser = jwt.verify(accessToken, config.secretKey);

    // Blacklist the access token
    await db.TokenBlackList.create({ token: accessToken, deviceId: jwtUser.deviceId });
  
    // Remove the refresh token from the user's list
    const user = await db.User.findOne({ where: { refreshTokens } });
    if (user) {
      user.refreshTokens = null;
      await user.save();
    }
    res.send('Successfully logged out')
});

app.post('/signup', async (req, res) => { 
    const { id, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
  
    try {
      const user = await db.User.create({ username: id, password: hashedPassword });
      res.status(201).json({ message: 'User created successfully', userId: user.id });
    } catch (error) {
      res.status(500).json({ message: 'User creation failed', error: error.message });
    }
})

app.get('/info', authenticateToken, async (req, res) => {
    try {
      const id = req.user.id; // Get the user ID from the authenticated token
      const user = await db.User.findOne({ where: { id } });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.status(201).json({ message: 'User found', user: user });
    } catch (error) {
      res.status(500).json({ message: 'Error retrieving user', error: error.message });
    }  
})



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server launched on post ${PORT}`);
});