const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();
const DATA_FILE = path.join(__dirname, '..', 'data', 'volunteers.json');
const CRISES_FILE = path.join(__dirname, '..', 'data', 'crises.json');

function getData() { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8')); }
function saveData(d) { fs.writeFileSync(DATA_FILE, JSON.stringify(d, null, 2)); }
function getCrises() { return JSON.parse(fs.readFileSync(CRISES_FILE, 'utf-8')); }

// GET all volunteers
router.get('/', (req, res) => {
  let vols = getData();
  const { skill, available } = req.query;
  if (skill) vols = vols.filter(v => v.skills.some(s => s.toLowerCase().includes(skill.toLowerCase())));
  if (available !== undefined) vols = vols.filter(v => v.available === (available === 'true'));
  res.json(vols);
});

// POST register volunteer
router.post('/', (req, res) => {
  const vols = getData();
  const newVol = {
    id: `vol-${uuidv4().slice(0, 8)}`,
    ...req.body,
    available: true,
    tasksCompleted: 0,
    currentTask: null,
    createdAt: new Date().toISOString()
  };
  vols.push(newVol);
  saveData(vols);
  res.status(201).json(newVol);
});

// POST skill matching
router.post('/match', (req, res) => {
  const { crisisId } = req.body;
  const vols = getData();
  const crises = getCrises();
  const crisis = crises.find(c => c.id === crisisId);
  if (!crisis) return res.status(404).json({ error: 'Crisis not found' });

  const needsSkillMap = {
    'Rescue Boats': ['Navigation', 'Boating', 'Swimming'],
    'Food Packets': ['Cooking', 'Food Distribution', 'Logistics'],
    'Drinking Water': ['Logistics', 'Driving'],
    'Medical Aid': ['Medical', 'First Aid', 'Nursing'],
    'Search & Rescue Teams': ['Rescue', 'First Aid', 'Swimming'],
    'Heavy Machinery': ['Engineering', 'Heavy Machinery', 'Construction'],
    'Medical Teams': ['Medical', 'Nursing', 'Surgery'],
    'Temporary Shelters': ['Construction', 'Engineering', 'Logistics'],
    'Evacuation Transport': ['Driving', 'Logistics', 'Navigation'],
    'Emergency Shelters': ['Construction', 'Logistics'],
    'Communication Equipment': ['Tech', 'Communication'],
    'Firefighting Equipment': ['Firefighting', 'Rescue'],
    'Gas Masks': ['Medical', 'First Aid'],
    'Hazmat Teams': ['Medical', 'Tech'],
    'Blankets': ['Logistics', 'Warehousing'],
    'Ambulances': ['Driving', 'Medical'],
    'Fumigation Teams': ['Medical', 'Tech'],
    'Water Tankers': ['Driving', 'Logistics'],
    'Cooling Centers': ['Medical', 'Logistics'],
    'Peace Volunteers': ['Counseling', 'Social Work', 'Translation']
  };

  const requiredSkills = new Set();
  (crisis.needs || []).forEach(need => {
    (needsSkillMap[need] || []).forEach(s => requiredSkills.add(s));
  });

  const matched = vols
    .filter(v => v.available && !v.currentTask)
    .map(v => {
      const matchScore = v.skills.filter(s => requiredSkills.has(s)).length;
      return { ...v, matchScore };
    })
    .filter(v => v.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore);

  res.json({ crisis: crisis.title, requiredSkills: [...requiredSkills], matches: matched });
});

// PUT check-in
router.put('/:id/checkin', (req, res) => {
  const vols = getData();
  const vol = vols.find(v => v.id === req.params.id);
  if (!vol) return res.status(404).json({ error: 'Volunteer not found' });
  vol.currentTask = req.body.crisisId;
  vol.available = false;
  saveData(vols);
  res.json(vol);
});

// PUT check-out
router.put('/:id/checkout', (req, res) => {
  const vols = getData();
  const vol = vols.find(v => v.id === req.params.id);
  if (!vol) return res.status(404).json({ error: 'Volunteer not found' });
  vol.currentTask = null;
  vol.available = true;
  vol.tasksCompleted = (vol.tasksCompleted || 0) + 1;
  saveData(vols);
  res.json(vol);
});

module.exports = router;
