const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();
const DATA_FILE = path.join(__dirname, '..', 'data', 'alerts.json');

function getData() { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8')); }
function saveData(d) { fs.writeFileSync(DATA_FILE, JSON.stringify(d, null, 2)); }

// GET all alerts
router.get('/', (req, res) => {
  let alerts = getData();
  const { severity, type } = req.query;
  if (severity) alerts = alerts.filter(a => a.severity === severity);
  if (type) alerts = alerts.filter(a => a.type === type);
  alerts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(alerts);
});

// POST new alert
router.post('/', (req, res) => {
  const alerts = getData();
  const newAlert = {
    id: `alert-${uuidv4().slice(0, 8)}`,
    ...req.body,
    createdAt: new Date().toISOString()
  };
  alerts.push(newAlert);
  saveData(alerts);
  res.status(201).json(newAlert);
});

// POST SOS
router.post('/sos', (req, res) => {
  const alerts = getData();
  const sos = {
    id: `sos-${uuidv4().slice(0, 8)}`,
    title: '🆘 SOS EMERGENCY',
    message: req.body.message || 'Emergency help needed at this location!',
    severity: 'critical',
    type: 'sos',
    lat: req.body.lat,
    lng: req.body.lng,
    phone: req.body.phone,
    issuedBy: req.body.name || 'Anonymous',
    issuedByRole: 'citizen',
    createdAt: new Date().toISOString()
  };
  alerts.push(sos);
  saveData(alerts);
  res.status(201).json({ message: 'SOS sent! Help is on the way.', alert: sos });
});

module.exports = router;
