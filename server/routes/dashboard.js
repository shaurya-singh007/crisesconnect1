const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

function readJSON(file) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', file), 'utf-8'));
}

// GET aggregated dashboard stats
router.get('/stats', (req, res) => {
  const crises = readJSON('crises.json');
  const volunteers = readJSON('volunteers.json');
  const ideas = readJSON('ideas.json');
  const alerts = readJSON('alerts.json');

  const activeCrises = crises.filter(c => c.status === 'active');
  const resolvedCrises = crises.filter(c => c.status === 'resolved' || c.status === 'closed');
  const deployedVolunteers = volunteers.filter(v => v.currentTask !== null);
  const availableVolunteers = volunteers.filter(v => v.available && !v.currentTask);

  const totalAffected = activeCrises.reduce((sum, c) => sum + (c.affectedPeople || 0), 0);
  const totalVolunteersNeeded = activeCrises.reduce((sum, c) => sum + (c.volunteersNeeded || 0), 0);
  const totalVolunteersAssigned = activeCrises.reduce((sum, c) => sum + (c.volunteersAssigned || 0), 0);

  const crisisByType = {};
  crises.forEach(c => { crisisByType[c.type] = (crisisByType[c.type] || 0) + 1; });

  const crisisBySeverity = { critical: 0, high: 0, moderate: 0, low: 0 };
  activeCrises.forEach(c => { crisisBySeverity[c.severity] = (crisisBySeverity[c.severity] || 0) + 1; });

  const ideaStats = {
    total: ideas.length,
    submitted: ideas.filter(i => i.status === 'submitted').length,
    underReview: ideas.filter(i => i.status === 'under_review').length,
    adopted: ideas.filter(i => i.status === 'adopted').length,
    implemented: ideas.filter(i => i.status === 'implemented').length,
  };

  res.json({
    overview: {
      activeCrises: activeCrises.length,
      resolvedCrises: resolvedCrises.length,
      totalVolunteers: volunteers.length,
      deployedVolunteers: deployedVolunteers.length,
      availableVolunteers: availableVolunteers.length,
      totalAffected,
      totalVolunteersNeeded,
      totalVolunteersAssigned,
      totalAlerts: alerts.length,
      criticalAlerts: alerts.filter(a => a.severity === 'critical').length,
    },
    crisisByType,
    crisisBySeverity,
    ideaStats,
    recentCrises: activeCrises.slice(0, 5),
    recentAlerts: alerts.slice(0, 5),
    timestamp: new Date().toISOString()
  });
});

// GET export data as JSON (can be converted to CSV on frontend)
router.get('/export', (req, res) => {
  const crises = readJSON('crises.json');
  const volunteers = readJSON('volunteers.json');
  res.json({
    crises: crises.map(c => ({
      id: c.id, title: c.title, type: c.type, severity: c.severity,
      status: c.status, location: c.location, affectedPeople: c.affectedPeople,
      volunteersNeeded: c.volunteersNeeded, volunteersAssigned: c.volunteersAssigned,
      createdAt: c.createdAt
    })),
    volunteers: volunteers.map(v => ({
      id: v.id, name: v.name, skills: v.skills.join(', '),
      location: v.location, available: v.available, tasksCompleted: v.tasksCompleted
    }))
  });
});

module.exports = router;
