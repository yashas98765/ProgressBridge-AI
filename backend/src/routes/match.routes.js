import express from 'express';
import { Match } from '../models/Match.js';
import { ProgressEvent } from '../models/ProgressEvent.js';
import { ScheduleActivity } from '../models/ScheduleActivity.js';
import { AuditLog } from '../models/AuditLog.js';
import { DelayRecord } from '../models/DelayRecord.js';
import { ProjectMemory } from '../models/ProjectMemory.js';
import { Project } from '../models/Project.js';
import { AIServiceBridge } from '../services/aiServiceBridge.js';

const router = express.Router();

function calculateDurationDays(start, end) {
  if (!start || !end) return 1;
  const d1 = new Date(start);
  const d2 = new Date(end);
  const diffTime = Math.abs(d2 - d1);
  return Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
}

router.get('/matches', async (req, res) => {
  try {
    const { status, review_status, discipline } = req.query;
    const filter = {};
    if (status && status !== 'ALL' && status !== 'undefined') filter.status = status;
    if (review_status && review_status !== 'ALL' && review_status !== 'undefined') filter.review_status = review_status;
    if (discipline && discipline !== 'ALL' && discipline !== 'undefined') filter.discipline = discipline;

    const matches = await Match.find(filter)
      .populate('event_id')
      .sort({ created_at: -1 });

    res.json({ success: true, count: matches.length, matches });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/matches/generate', async (req, res) => {
  try {
    const { actualDescription, discipline } = req.body;
    if (!actualDescription) {
      return res.status(400).json({ error: 'actualDescription is required' });
    }

    const scheduleActivities = await ScheduleActivity.find();
    const result = await AIServiceBridge.matchActivity(actualDescription, discipline, scheduleActivities);

    res.json({ success: true, match: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Module 7: Approve Match
router.put('/matches/:id/approve', async (req, res) => {
  try {
    const { user = 'Planner', comments } = req.body;
    const match = await Match.findById(req.params.id).populate('event_id');
    if (!match) return res.status(404).json({ error: 'Match not found' });

    match.review_status = 'APPROVED';
    match.reviewed_by = user;
    match.reviewed_at = new Date();
    if (comments) match.comments = comments;
    await match.save();

    // 1. Update ProgressEvent
    if (match.event_id) {
      const event = await ProgressEvent.findById(match.event_id._id);
      if (event) {
        event.match_status = 'APPROVED';
        await event.save();
      }
    }

    // 2. Update Schedule Activity (Module 9: Schedule Update)
    const scheduleAct = await ScheduleActivity.findOne({ activity_id: match.activity_id });
    if (scheduleAct) {
      const oldVal = `status: ${scheduleAct.status}, start: ${scheduleAct.actual_start || 'None'}, end: ${scheduleAct.actual_end || 'None'}`;
      
      const actStart = match.event_id?.actual_start ? match.event_id.actual_start.slice(0, 10) : scheduleAct.planned_start;
      const actEnd = match.event_id?.actual_end ? match.event_id.actual_end.slice(0, 10) : null;

      scheduleAct.actual_start = actStart;
      if (actEnd) {
        scheduleAct.actual_end = actEnd;
        scheduleAct.actual_duration = calculateDurationDays(actStart, actEnd);
        scheduleAct.progress_percentage = 100;
        
        // Calculate delay against planned_end
        const plannedEndDt = new Date(scheduleAct.planned_end);
        const actualEndDt = new Date(actEnd);
        const delayDays = Math.ceil((actualEndDt - plannedEndDt) / (1000 * 60 * 60 * 24));
        scheduleAct.delay_days = Math.max(0, delayDays);
        scheduleAct.variance = delayDays;

        if (delayDays > 0) {
          scheduleAct.status = 'DELAYED';
          // Auto-insert into DelayRecord
          await DelayRecord.create({
            activity_id: scheduleAct.activity_id,
            activity_name: scheduleAct.activity_name,
            discipline: scheduleAct.discipline,
            planned_duration: scheduleAct.planned_duration,
            actual_duration: scheduleAct.actual_duration,
            delay_days: delayDays,
            possible_cause: 'Material Delay',
            confidence: match.final_confidence || 0.86,
            recorded_at: new Date()
          });

          // Update Project Memory execution pattern (Module 12)
          await ProjectMemory.findOneAndUpdate(
            { activity_keyword: new RegExp(scheduleAct.discipline === 'Piping' ? 'Spool' : 'Installation', 'i') },
            { $inc: { historical_record_count: 1 }, updated_at: new Date() }
          );
        } else if (delayDays < 0) {
          scheduleAct.status = 'EARLY';
        } else {
          scheduleAct.status = 'ON_TIME';
        }
      } else {
        scheduleAct.status = 'IN_PROGRESS';
        scheduleAct.progress_percentage = Math.max(50, scheduleAct.progress_percentage || 50);
      }

      scheduleAct.last_updated_at = new Date();
      await scheduleAct.save();

      // 3. Create Audit Trail Entry (Module 13)
      await AuditLog.create({
        user,
        user_role: 'PLANNER',
        action: 'MATCH_APPROVED',
        activity_id: scheduleAct.activity_id,
        old_value: oldVal,
        new_value: `Approved linking to ${scheduleAct.activity_id} (${scheduleAct.activity_name}). Actual Start: ${scheduleAct.actual_start}, Status: ${scheduleAct.status}`,
        confidence: match.final_confidence,
        review_status: 'APPROVED',
        details: comments || `Planner approved match with confidence ${(match.final_confidence * 100).toFixed(0)}%. Schedule updated automatically.`
      });

      // Recalculate project progress
      const allL6 = await ScheduleActivity.find({ wbs_level: 'L6' });
      const avgProgress = Math.round(allL6.reduce((s, a) => s + (a.progress_percentage || 0), 0) / allL6.length);
      await Project.findOneAndUpdate(
        { projectId: 'PRJ-OIL-2026' },
        { overallProgress: avgProgress, variance: avgProgress - 72, updatedAt: new Date() }
      );
    }

    res.json({
      success: true,
      message: `Match approved and schedule activity ${match.activity_id} updated.`,
      match,
      scheduleActivity: scheduleAct
    });
  } catch (err) {
    console.error('Approve match error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Module 7: Reject Match
router.put('/matches/:id/reject', async (req, res) => {
  try {
    const { user = 'Planner', reason = 'Planner determined match was incorrect.' } = req.body;
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ error: 'Match not found' });

    match.review_status = 'REJECTED';
    match.reviewed_by = user;
    match.reviewed_at = new Date();
    match.comments = reason;
    await match.save();

    if (match.event_id) {
      await ProgressEvent.findByIdAndUpdate(match.event_id, { match_status: 'REJECTED' });
    }

    await AuditLog.create({
      user,
      user_role: 'PLANNER',
      action: 'MATCH_REJECTED',
      activity_id: match.activity_id,
      confidence: match.final_confidence,
      review_status: 'REJECTED',
      details: reason
    });

    res.json({ success: true, message: 'Match rejected.', match });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Module 7: Change Match
router.put('/matches/:id/change', async (req, res) => {
  try {
    const { newActivityId, user = 'Planner', comments } = req.body;
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ error: 'Match not found' });

    const targetActivity = await ScheduleActivity.findOne({ activity_id: newActivityId });
    if (!targetActivity) return res.status(404).json({ error: 'Selected schedule activity not found' });

    const oldActivityId = match.activity_id;
    match.activity_id = targetActivity.activity_id;
    match.planned_activity_name = targetActivity.activity_name;
    match.discipline = targetActivity.discipline;
    match.review_status = 'MODIFIED';
    match.reviewed_by = user;
    match.reviewed_at = new Date();
    match.comments = comments || `Reassigned from ${oldActivityId} to ${newActivityId}`;
    await match.save();

    await AuditLog.create({
      user,
      user_role: 'PLANNER',
      action: 'MATCH_MODIFIED',
      activity_id: targetActivity.activity_id,
      old_value: oldActivityId,
      new_value: targetActivity.activity_id,
      details: comments || `Planner manually redirected match to ${targetActivity.activity_id} (${targetActivity.activity_name}).`
    });

    res.json({ success: true, message: 'Match reassigned successfully.', match });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
