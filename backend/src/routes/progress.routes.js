import express from 'express';
import { ProgressEvent } from '../models/ProgressEvent.js';
import { AIServiceBridge } from '../services/aiServiceBridge.js';
import { AuditLog } from '../models/AuditLog.js';

const router = express.Router();

router.post('/progress/extract', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Text is required' });

    const events = await AIServiceBridge.extractText(text);
    res.json({ success: true, count: events.length, events });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/progress/events', async (req, res) => {
  try {
    const { discipline, match_status, source_type } = req.query;
    const filter = {};
    if (discipline && discipline !== 'ALL' && discipline !== 'undefined') filter.discipline = discipline;
    if (match_status && match_status !== 'ALL' && match_status !== 'undefined') filter.match_status = match_status;
    if (source_type && source_type !== 'ALL' && source_type !== 'undefined') filter.source_type = source_type;

    const events = await ProgressEvent.find(filter)
      .populate('source_document_id')
      .populate('match_id')
      .sort({ created_at: -1 });

    res.json({ success: true, count: events.length, events });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/progress/events', async (req, res) => {
  try {
    const { activity_description, discipline, actual_start, actual_end, supervisor, status } = req.body;
    if (!activity_description) return res.status(400).json({ error: 'Activity description is required' });

    const event = await ProgressEvent.create({
      source_type: 'MANUAL',
      discipline: discipline || 'General',
      activity_description,
      actual_start,
      actual_end,
      supervisor: supervisor || 'Site Supervisor',
      status: status || 'In Progress',
      match_status: 'PENDING_REVIEW'
    });

    await AuditLog.create({
      user: supervisor || 'Site User',
      user_role: 'SUPERVISOR',
      action: 'EXTRACTION',
      details: `Manually created progress event: "${activity_description}"`
    });

    res.json({ success: true, event });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
