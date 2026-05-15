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
  try {
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
  } catch (e) {
    // If file is corrupted or missing, return defaults
    const defaults = getDefaultUsers();
    saveUsers(defaults);
    return defaults;
  }
}

function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

function getDefaultUsers() {
  return [
    { id: 'usr-001', name: 'Admin CrisisConnect', email: 'admin@crisisconnect.org', password: 'demo', role: 'admin', phone: '+91-9876543210', location: 'New Delhi, India', createdAt: '2025-01-01T00:00:00Z' },
    { id: 'usr-002', name: 'Priya Sharma', email: 'priya@ngo.org', password: 'demo', role: 'ngo', phone: '+91-9876543211', organization: 'Relief India Trust', location: 'Mumbai, India', createdAt: '2025-01-15T00:00:00Z' },
    { id: 'usr-003', name: 'Rahul Verma', email: 'volunteer@example.com', password: 'demo', role: 'volunteer', phone: '+91-9876543212', skills: ['Medical', 'First Aid', 'Logistics'], location: 'Bangalore, India', createdAt: '2025-02-01T00:00:00Z' },
    { id: 'usr-004', name: 'Ananya Gupta', email: 'ngo@relief.org', password: 'demo', role: 'government', phone: '+91-9876543213', department: 'NDMA', location: 'New Delhi, India', createdAt: '2025-02-15T00:00:00Z' }
  ];
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
    if (!user) return res.status(401).json({ error: 'Invalid credentials — user not found' });

    // Demo users have plain text password 'demo' or any password works
    let isValid = false;
    if (user.password === 'demo') {
      // Demo account — accept any password
      isValid = true;
    } else if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
      // Hashed password — compare properly
      isValid = await bcrypt.compare(password, user.password);
    } else {
      // Plain text comparison (fallback)
      isValid = (password === user.password);
    }

    if (!isValid) return res.status(401).json({ error: 'Invalid credentials — wrong password' });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    const { password: _, ...userWithout } = user;
    res.json({ token, user: userWithout });
  } catch (err) {
    console.error('Login error:', err);
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
