const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Import routes
const authRoutes = require('./routes/auth');
const crisesRoutes = require('./routes/crises');
const volunteersRoutes = require('./routes/volunteers');
const ideasRoutes = require('./routes/ideas');
const alertsRoutes = require('./routes/alerts');
const dashboardRoutes = require('./routes/dashboard');

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/crises', crisesRoutes);
app.use('/api/volunteers', volunteersRoutes);
app.use('/api/ideas', ideasRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'CrisisConnect API is running', timestamp: new Date().toISOString() });
});

// Serve React frontend (production build)
const clientBuildPath = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientBuildPath));

// All non-API routes serve the React app (SPA routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚨 CrisisConnect running on http://localhost:${PORT}`);
  console.log(`📊 API: http://localhost:${PORT}/api/health\n`);
});
