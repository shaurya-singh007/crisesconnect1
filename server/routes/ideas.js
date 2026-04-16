const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();
const DATA_FILE = path.join(__dirname, '..', 'data', 'ideas.json');

function getData() { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8')); }
function saveData(d) { fs.writeFileSync(DATA_FILE, JSON.stringify(d, null, 2)); }

// GET all ideas
router.get('/', (req, res) => {
  let ideas = getData();
  const { status, tag, sort } = req.query;
  if (status) ideas = ideas.filter(i => i.status === status);
  if (tag) ideas = ideas.filter(i => i.tags.some(t => t.toLowerCase().includes(tag.toLowerCase())));
  if (sort === 'top') ideas.sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));
  else if (sort === 'new') ideas.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  else ideas.sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));
  res.json(ideas);
});

// POST new idea
router.post('/', (req, res) => {
  const ideas = getData();
  const newIdea = {
    id: `idea-${uuidv4().slice(0, 8)}`,
    ...req.body,
    status: 'submitted',
    upvotes: 0,
    downvotes: 0,
    comments: [],
    createdAt: new Date().toISOString()
  };
  ideas.push(newIdea);
  saveData(ideas);
  res.status(201).json(newIdea);
});

// POST vote on idea
router.post('/:id/vote', (req, res) => {
  const ideas = getData();
  const idea = ideas.find(i => i.id === req.params.id);
  if (!idea) return res.status(404).json({ error: 'Idea not found' });
  if (req.body.type === 'up') idea.upvotes++;
  else idea.downvotes++;
  saveData(ideas);
  res.json(idea);
});

// POST comment on idea
router.post('/:id/comments', (req, res) => {
  const ideas = getData();
  const idea = ideas.find(i => i.id === req.params.id);
  if (!idea) return res.status(404).json({ error: 'Idea not found' });
  idea.comments.push({
    user: req.body.user || 'Anonymous',
    text: req.body.text,
    date: new Date().toISOString()
  });
  saveData(ideas);
  res.json(idea);
});

// PUT update idea status
router.put('/:id/status', (req, res) => {
  const ideas = getData();
  const idea = ideas.find(i => i.id === req.params.id);
  if (!idea) return res.status(404).json({ error: 'Idea not found' });
  idea.status = req.body.status;
  saveData(ideas);
  res.json(idea);
});

module.exports = router;
