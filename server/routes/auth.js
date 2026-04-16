const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();
const JWT_SECRET = 'crisisconnect-secret-2025';
const USERS_FILE = path.join(__dirname, '..', 'data', 'users.json');

function getUsers() {
  return JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
}
function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, phone, organization, skills, location } = req.body;
    const users = getUsers();
    if (users.find(u => u.email === email)) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: `usr-${uuidv4().slice(0, 8)}`,
      name, email, password: hashedPassword, role: role || 'volunteer',
      phone, organization, skills, location,
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    saveUsers(users);
    const token = jwt.sign({ id: newUser.id, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });
    const { password: _, ...userWithout } = newUser;
    res.status(201).json({ token, user: userWithout });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const users = getUsers();
    const user = users.find(u => u.email === email);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    // For demo: accept any password for pre-seeded users
    const isDemo = user.password.startsWith('$2a$10$YQ8Gk5');
    const isValid = isDemo ? true : await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    const { password: _, ...userWithout } = user;
    res.json({ token, user: userWithout });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get current user
router.get('/me', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token' });
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const users = getUsers();
    const user = users.find(u => u.id === decoded.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const { password, ...userWithout } = user;
    res.json(userWithout);
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;
