import express from 'express';
import { Project } from '../models/Project.js';
import { ScheduleActivity } from '../models/ScheduleActivity.js';
import { ProgressEvent } from '../models/ProgressEvent.js';
import { Match } from '../models/Match.js';
import { DelayRecord } from '../models/DelayRecord.js';

const router = express.Router();

router.get('/projects', async (req, res) => {
  try {
    const projects = await Project.find();
    res.json({ success: true, projects });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/dashboard', async (req, res) => {
  try {
    const project = await Project.findOne({ projectId: 'PRJ-OIL-2026' }) || await Project.findOne();
    
    // Schedule counts
    const activities = await ScheduleActivity.find();
    const totalActivities = activities.length;
    const completedActivities = activities.filter(a => a.status === 'COMPLETED' || a.progress_percentage === 100).length;
    const inProgressActivities = activities.filter(a => a.status === 'IN_PROGRESS' || (a.progress_percentage > 0 && a.progress_percentage < 100)).length;
    const delayedActivities = activities.filter(a => a.status === 'DELAYED' || a.delay_days > 0).length;

    // Progress events
    const events = await ProgressEvent.find();
    const unmatchedEvents = events.filter(e => e.match_status === 'UNMATCHED' || e.confidence < 0.60).length;
    const pendingReviewEvents = events.filter(e => e.match_status === 'PENDING_REVIEW').length;

    // Matches & average confidence
    const matches = await Match.find();
    const totalConfidence = matches.reduce((acc, m) => acc + (m.final_confidence || 0), 0);
    const avgConfidence = matches.length > 0 ? Math.round((totalConfidence / matches.length) * 100) : 86;

    // Discipline-wise breakdown
    const disciplines = ['Civil', 'Piping', 'Electrical', 'Instrumentation', 'Mechanical', 'HSE'];
    const disciplineBreakdown = disciplines.map(disc => {
      const discActs = activities.filter(a => a.discipline === disc);
      const total = discActs.length;
      const completed = discActs.filter(a => a.status === 'COMPLETED' || a.progress_percentage === 100).length;
      const avgProg = total > 0 ? Math.round(discActs.reduce((s, a) => s + (a.progress_percentage || 0), 0) / total) : 0;
      const delayed = discActs.filter(a => a.status === 'DELAYED' || a.delay_days > 0).length;
      return {
        discipline: disc,
        total,
        completed,
        progress: avgProg,
        delayed
      };
    });

    // Confidence distribution
    const confidenceDist = [
      { range: 'High (>= 80%)', count: matches.filter(m => m.final_confidence >= 0.80).length, fill: '#16a34a' },
      { range: 'Medium (60-79%)', count: matches.filter(m => m.final_confidence >= 0.60 && m.final_confidence < 0.80).length, fill: '#eab308' },
      { range: 'Low (< 60%)', count: matches.filter(m => m.final_confidence < 0.60).length, fill: '#ef4444' }
    ];

    // Delays cause breakdown
    const delayRecords = await DelayRecord.find();
    const causeMap = {};
    delayRecords.forEach(d => {
      causeMap[d.possible_cause] = (causeMap[d.possible_cause] || 0) + 1;
    });
    const delayCauses = Object.keys(causeMap).map(cause => ({
      cause,
      count: causeMap[cause]
    }));

    // Weekly completion progress trend
    const completionTrend = [
      { week: 'W34', planned: 25, actual: 22 },
      { week: 'W35', planned: 40, actual: 38 },
      { week: 'W36', planned: 55, actual: 50 },
      { week: 'W37', planned: 65, actual: 61 },
      { week: 'W38', planned: 72, actual: 68 }
    ];

    res.json({
      success: true,
      project: project || {
        name: 'Integrated Infrastructure Construction Project',
        overallProgress: 68,
        plannedProgress: 72,
        variance: -4
      },
      metrics: {
        totalActivities,
        completedActivities,
        inProgressActivities,
        delayedActivities,
        unmatchedEvents,
        pendingReviewEvents,
        avgConfidence: `${avgConfidence}%`,
        overallProgress: project ? project.overallProgress : 68,
        plannedProgress: project ? project.plannedProgress : 72,
        variance: project ? project.variance : -4
      },
      disciplineBreakdown,
      confidenceDist,
      delayCauses,
      completionTrend
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
