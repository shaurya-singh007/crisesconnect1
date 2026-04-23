const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Create HTTP server and attach Socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:5000'],
    methods: ['GET', 'POST'],
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

// --- Socket.io Real-Time Logic ---
let connectedUsers = 0;
const missedAlerts = []; // Queue for offline delivery

io.on('connection', (socket) => {
  connectedUsers++;
  console.log(`⚡ Client connected [${socket.id}] — ${connectedUsers} online`);

  // Send connection count to all clients
  io.emit('users:count', connectedUsers);

  // Deliver any missed alerts from the last 10 minutes
  const tenMinAgo = Date.now() - 10 * 60 * 1000;
  const recent = missedAlerts.filter(a => new Date(a.createdAt).getTime() > tenMinAgo);
  if (recent.length > 0) {
    socket.emit('alerts:missed', recent);
  }

  // Admin can emit a manual test ping
  socket.on('alert:test', (data) => {
    socket.emit('alert:new', {
      id: 'test-' + Date.now(),
      title: '🔔 Test Notification',
      message: 'This is a test alert from the server.',
      severity: 'moderate',
      type: 'info',
      createdAt: new Date().toISOString(),
      isTest: true
    });
  });

  socket.on('disconnect', () => {
    connectedUsers--;
    console.log(`❌ Client disconnected [${socket.id}] — ${connectedUsers} online`);
    io.emit('users:count', connectedUsers);
  });
});

// Make io accessible to routes via app.locals
app.locals.io = io;
app.locals.missedAlerts = missedAlerts;

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
const chatRoutes = require('./routes/chat');

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/crises', crisesRoutes);
app.use('/api/volunteers', volunteersRoutes);
app.use('/api/ideas', ideasRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/chat', chatRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'CrisisConnect API is running',
    timestamp: new Date().toISOString(),
    connectedUsers,
    socketEnabled: true
  });
});

// Serve React frontend (production build)
const clientBuildPath = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientBuildPath));

// All non-API routes serve the React app (SPA routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});

// Start server (use `server.listen` instead of `app.listen` for Socket.io)
server.listen(PORT, () => {
  console.log(`\n🚨 CrisisConnect running on http://localhost:${PORT}`);
  console.log(`📊 API: http://localhost:${PORT}/api/health`);
  console.log(`⚡ WebSocket: Real-time alerts enabled\n`);
});
