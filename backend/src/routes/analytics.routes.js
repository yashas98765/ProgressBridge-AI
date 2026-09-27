import express from 'express';
import { DelayRecord } from '../models/DelayRecord.js';
import { ProjectMemory } from '../models/ProjectMemory.js';
import { ScheduleActivity } from '../models/ScheduleActivity.js';

const router = express.Router();

router.get('/analytics/delays', async (req, res) => {
  try {
    const { discipline, cause } = req.query;
    const filter = {};
    if (discipline && discipline !== 'ALL') filter.discipline = discipline;
    if (cause && cause !== 'ALL') filter.possible_cause = cause;

    const delayRecords = await DelayRecord.find(filter).sort({ delay_days: -1 });

    const totalDelayed = delayRecords.length;
    const totalDelayDays = delayRecords.reduce((s, d) => s + (d.delay_days || 0), 0);
    const avgDelayDays = totalDelayed > 0 ? (totalDelayDays / totalDelayed).toFixed(1) : 0;

    // Causes breakdown
    const causeCount = {};
    delayRecords.forEach(d => {
      causeCount[d.possible_cause] = (causeCount[d.possible_cause] || 0) + 1;
    });

    const causesData = Object.entries(causeCount).map(([name, value]) => ({
      name,
      value
    }));

    // Delays by discipline
    const discMap = {};
    delayRecords.forEach(d => {
      discMap[d.discipline] = (discMap[d.discipline] || 0) + d.delay_days;
    });

    const disciplineDelayData = Object.entries(discMap).map(([discipline, days]) => ({
      discipline,
      days
    }));

    // Top 5 delayed activities
    const topDelayed = delayRecords.slice(0, 5);

    res.json({
      success: true,
      summary: {
        totalDelayed,
        totalDelayDays,
        avgDelayDays,
        primaryCause: causesData.sort((a, b) => b.value - a.value)[0]?.name || 'Material Delay'
      },
      causesData,
      disciplineDelayData,
      records: delayRecords,
      topDelayed
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/project-memory', async (req, res) => {
  try {
    const { q, discipline } = req.query;
    const filter = {};
    if (discipline && discipline !== 'ALL') filter.discipline = discipline;
    if (q) {
      filter.$or = [
        { activity_keyword: new RegExp(q, 'i') },
        { recurring_bottleneck: new RegExp(q, 'i') },
        { most_common_delay_cause: new RegExp(q, 'i') }
      ];
    }

    const records = await ProjectMemory.find(filter).sort({ historical_record_count: -1 });
    
    // Overall stats
    const totalHistoricalEvents = records.reduce((s, r) => s + r.historical_record_count, 0);
    const avgDelayAcrossAll = records.length > 0 
      ? (records.reduce((s, r) => s + r.average_delay, 0) / records.length).toFixed(1)
      : '0.9';

    res.json({
      success: true,
      count: records.length,
      totalHistoricalEvents,
      avgDelayAcrossAll,
      records
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
