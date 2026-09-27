import express from 'express';
import { AuditLog } from '../models/AuditLog.js';

const router = express.Router();

router.get('/audit', async (req, res) => {
  try {
    const { action, user, activity_id, search } = req.query;
    const filter = {};
    if (action && action !== 'ALL' && action !== 'undefined') filter.action = action;
    if (user && user !== 'ALL' && user !== 'undefined') filter.user = new RegExp(user, 'i');
    if (activity_id && activity_id !== 'undefined') filter.activity_id = new RegExp(activity_id, 'i');
    if (search && search !== 'undefined' && search.trim() !== '') {
      filter.$or = [
        { details: new RegExp(search, 'i') },
        { activity_id: new RegExp(search, 'i') },
        { source_file: new RegExp(search, 'i') }
      ];
    }

    const logs = await AuditLog.find(filter).sort({ timestamp: -1 });
    res.json({ success: true, count: logs.length, logs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
