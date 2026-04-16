const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();
const DATA_FILE = path.join(__dirname, '..', 'data', 'crises.json');

function getData() { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8')); }
function saveData(d) { fs.writeFileSync(DATA_FILE, JSON.stringify(d, null, 2)); }

// GET all crises with optional filters
router.get('/', (req, res) => {
  let crises = getData();
  const { type, severity, status, search } = req.query;
  if (type) crises = crises.filter(c => c.type.toLowerCase() === type.toLowerCase());
  if (severity) crises = crises.filter(c => c.severity === severity);
  if (status) crises = crises.filter(c => c.status === status);
  if (search) crises = crises.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.location.toLowerCase().includes(search.toLowerCase())
  );
  res.json(crises);
});

// GET single crisis
router.get('/:id', (req, res) => {
  const crises = getData();
  const crisis = crises.find(c => c.id === req.params.id);
  if (!crisis) return res.status(404).json({ error: 'Crisis not found' });
  res.json(crisis);
});

// POST new crisis
router.post('/', (req, res) => {
  const crises = getData();
  const newCrisis = {
    id: `cr-${uuidv4().slice(0, 8)}`,
    ...req.body,
    status: 'active',
    verifiedCount: 0,
    disputeCount: 0,
    volunteersAssigned: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  crises.push(newCrisis);
  saveData(crises);
  res.status(201).json(newCrisis);
});

// PUT update crisis
router.put('/:id', (req, res) => {
  const crises = getData();
  const idx = crises.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Crisis not found' });
  crises[idx] = { ...crises[idx], ...req.body, updatedAt: new Date().toISOString() };
  saveData(crises);
  res.json(crises[idx]);
});

// POST verify crisis
router.post('/:id/verify', (req, res) => {
  const crises = getData();
  const crisis = crises.find(c => c.id === req.params.id);
  if (!crisis) return res.status(404).json({ error: 'Crisis not found' });
  crisis.verifiedCount = (crisis.verifiedCount || 0) + 1;
  crisis.updatedAt = new Date().toISOString();
  saveData(crises);
  res.json(crisis);
});

// POST dispute crisis
router.post('/:id/dispute', (req, res) => {
  const crises = getData();
  const crisis = crises.find(c => c.id === req.params.id);
  if (!crisis) return res.status(404).json({ error: 'Crisis not found' });
  crisis.disputeCount = (crisis.disputeCount || 0) + 1;
  crisis.updatedAt = new Date().toISOString();
  saveData(crises);
  res.json(crisis);
});

// DELETE (close) crisis
router.delete('/:id', (req, res) => {
  const crises = getData();
  const idx = crises.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Crisis not found' });
  crises[idx].status = 'closed';
  crises[idx].updatedAt = new Date().toISOString();
  saveData(crises);
  res.json({ message: 'Crisis closed', crisis: crises[idx] });
});

module.exports = router;
