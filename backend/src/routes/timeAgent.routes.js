import express from 'express';
import { ScheduleActivity } from '../models/ScheduleActivity.js';
import { ProgressEvent } from '../models/ProgressEvent.js';
import { Match } from '../models/Match.js';
import { AuditLog } from '../models/AuditLog.js';
import { AIServiceBridge } from '../services/aiServiceBridge.js';

const router = express.Router();

router.post('/time-agent', async (req, res) => {
  try {
    const { message, referenceDate, supervisor = 'Ravi Kumar', action, pendingData } = req.body;

    // Handle user confirmation of a previously detected event
    if (action === 'confirm' && pendingData) {
      const { extracted, suggestion } = pendingData;
      
      const event = await ProgressEvent.create({
        source_type: 'TIME_AGENT',
        raw_text: `Time Agent Transcript: "${extracted.rawMessage || message}"`,
        discipline: extracted.discipline || 'General',
        activity_description: extracted.activity,
        actual_start: extracted.actionType === 'START' ? extracted.timestamp : null,
        actual_end: extracted.actionType === 'END' ? extracted.timestamp : null,
        supervisor,
        status: extracted.actionType === 'END' ? 'Completed' : 'In Progress',
        match_status: suggestion?.suggestedActivityId ? 'PENDING_REVIEW' : 'UNMATCHED',
        suggested_activity_id: suggestion?.suggestedActivityId || null,
        confidence: suggestion?.finalConfidence || 0
      });

      if (suggestion?.suggestedActivityId) {
        const match = await Match.create({
          event_id: event._id,
          activity_id: suggestion.suggestedActivityId,
          actual_description: extracted.activity,
          planned_activity_name: suggestion.activityName || 'Baseline Activity',
          discipline: extracted.discipline,
          semantic_score: suggestion.semanticScore || 0.85,
          keyword_score: suggestion.keywordScore || 0.80,
          discipline_score: suggestion.disciplineScore || 1.0,
          final_confidence: suggestion.finalConfidence || 0.88,
          reason: suggestion.reason || 'Auto-detected via Time Agent conversational interface',
          status: suggestion.status || 'HIGH_CONFIDENCE',
          review_status: 'PENDING'
        });
        event.match_id = match._id;
        await event.save();
      }

      await AuditLog.create({
        user: supervisor,
        user_role: 'SUPERVISOR',
        action: 'EXTRACTION',
        source_file: 'Time Agent Chat',
        activity_id: suggestion?.suggestedActivityId || 'UNMATCHED',
        details: `Supervisor confirmed site activity entry via Time Agent: "${extracted.activity}" (${extracted.discipline}).`
      });

      return res.json({
        success: true,
        message: 'Activity update confirmed and logged into the execution ledger!',
        event
      });
    }

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    const scheduleActivities = await ScheduleActivity.find();
    const result = await AIServiceBridge.timeAgentChat(message, referenceDate, scheduleActivities);

    res.json({
      success: true,
      ...result
    });
  } catch (err) {
    console.error('Time agent error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
