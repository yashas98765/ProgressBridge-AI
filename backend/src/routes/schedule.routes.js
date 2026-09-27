import express from 'express';
import { ScheduleActivity } from '../models/ScheduleActivity.js';
import { AuditLog } from '../models/AuditLog.js';
import { DelayRecord } from '../models/DelayRecord.js';
import { Project } from '../models/Project.js';

const router = express.Router();

function calculateDurationDays(start, end) {
  if (!start || !end) return null;
  const d1 = new Date(start);
  const d2 = new Date(end);
  const diffTime = Math.abs(d2 - d1);
  return Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
}

router.get('/schedule', async (req, res) => {
  try {
    const { discipline, wbs_level, status, search } = req.query;
    const filter = {};
    if (discipline && discipline !== 'ALL') filter.discipline = discipline;
    if (wbs_level && wbs_level !== 'ALL') filter.wbs_level = wbs_level;
    if (status && status !== 'ALL') filter.status = status;
    if (search) {
      filter.$or = [
        { activity_id: new RegExp(search, 'i') },
        { activity_name: new RegExp(search, 'i') },
        { unit_or_line: new RegExp(search, 'i') }
      ];
    }

    const activities = await ScheduleActivity.find(filter).sort({ activity_id: 1 });
    res.json({ success: true, count: activities.length, activities });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/schedule/:id', async (req, res) => {
  try {
    const act = await ScheduleActivity.findOne({ activity_id: req.params.id });
    if (!act) return res.status(404).json({ error: 'Activity not found' });
    res.json({ success: true, activity: act });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/schedule/:id', async (req, res) => {
  try {
    const { actual_start, actual_end, progress_percentage, status, comments, user = 'Planner' } = req.body;
    const act = await ScheduleActivity.findOne({ activity_id: req.params.id });
    if (!act) return res.status(404).json({ error: 'Activity not found' });

    const oldValue = `status: ${act.status}, start: ${act.actual_start || 'None'}, end: ${act.actual_end || 'None'}, progress: ${act.progress_percentage}%`;

    if (actual_start) act.actual_start = actual_start;
    if (actual_end) act.actual_end = actual_end;
    if (progress_percentage !== undefined) act.progress_percentage = Number(progress_percentage);

    // Compute actual duration and delay
    if (act.actual_start && act.actual_end) {
      act.actual_duration = calculateDurationDays(act.actual_start, act.actual_end);
      
      // Calculate delay relative to planned_end
      const plannedEndDt = new Date(act.planned_end);
      const actualEndDt = new Date(act.actual_end);
      const diffMs = actualEndDt - plannedEndDt;
      const delayDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      
      act.delay_days = Math.max(0, delayDays);
      act.variance = delayDays;

      if (delayDays > 0) {
        act.status = 'DELAYED';
        // Auto-record in DelayRecord if not already exists
        await DelayRecord.findOneAndUpdate(
          { activity_id: act.activity_id },
          {
            activity_id: act.activity_id,
            activity_name: act.activity_name,
            discipline: act.discipline,
            planned_duration: act.planned_duration,
            actual_duration: act.actual_duration,
            delay_days: act.delay_days,
            possible_cause: comments || 'Access Constraint',
            confidence: 0.88,
            recorded_at: new Date()
          },
          { upsert: true }
        );
      } else if (delayDays < 0) {
        act.status = 'EARLY';
      } else {
        act.status = 'ON_TIME';
      }
    } else if (act.actual_start && !act.actual_end) {
      act.status = 'IN_PROGRESS';
    }

    if (status) act.status = status;
    act.last_updated_at = new Date();
    await act.save();

    const newValue = `status: ${act.status}, start: ${act.actual_start}, end: ${act.actual_end || 'In Progress'}, progress: ${act.progress_percentage}%`;

    // Audit log
    await AuditLog.create({
      user,
      user_role: 'PLANNER',
      action: 'SCHEDULE_UPDATED',
      activity_id: act.activity_id,
      old_value: oldValue,
      new_value: newValue,
      details: comments || `Updated actual schedule metrics for ${act.activity_id} (${act.activity_name}). Delay days: ${act.delay_days}`
    });

    // Recalculate project overall progress
    const allL6 = await ScheduleActivity.find({ wbs_level: 'L6' });
    if (allL6.length > 0) {
      const avgProgress = Math.round(allL6.reduce((s, a) => s + (a.progress_percentage || 0), 0) / allL6.length);
      await Project.findOneAndUpdate(
        { projectId: 'PRJ-OIL-2026' },
        { overallProgress: avgProgress, variance: avgProgress - 72, updatedAt: new Date() }
      );
    }

    res.json({ success: true, activity: act, message: 'Schedule activity updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/schedule/import', async (req, res) => {
  try {
    const { activities } = req.body;
    if (!Array.isArray(activities) || activities.length === 0) {
      return res.status(400).json({ error: 'Expected an array of activities' });
    }

    let inserted = 0;
    for (const a of activities) {
      if (a.activity_id && a.activity_name) {
        await ScheduleActivity.findOneAndUpdate(
          { activity_id: a.activity_id },
          a,
          { upsert: true }
        );
        inserted++;
      }
    }

    await AuditLog.create({
      user: 'Planner',
      user_role: 'PLANNER',
      action: 'ACTIVITY_CREATED',
      details: `Bulk imported / updated ${inserted} schedule activities.`
    });

    res.json({ success: true, count: inserted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
