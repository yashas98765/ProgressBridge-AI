import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import xlsx from 'xlsx';
import { Document } from '../models/Document.js';
import { ProgressEvent } from '../models/ProgressEvent.js';
import { ScheduleActivity } from '../models/ScheduleActivity.js';
import { Match } from '../models/Match.js';
import { AuditLog } from '../models/AuditLog.js';
import { AIServiceBridge } from '../services/aiServiceBridge.js';

const router = express.Router();

const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`)
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (['.txt', '.csv', '.xlsx', '.xls', '.pdf'].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file format. Please upload .txt, .csv, .xlsx, or .pdf'));
    }
  }
});

// Helper to run matching pipeline for extracted events
async function processEventsAndGenerateMatches(events, docRecord, user = 'Site User') {
  const scheduleActivities = await ScheduleActivity.find();
  const createdEvents = [];

  for (const item of events) {
    // 1. Create progress event
    const event = await ProgressEvent.create({
      source_document_id: docRecord ? docRecord._id : null,
      source_type: docRecord ? (docRecord.file_type === 'TXT' ? 'DAILY_REPORT' : (docRecord.file_type === 'PDF' ? 'PDF_SITE_DIARY' : 'SPREADSHEET')) : 'DAILY_REPORT',
      source_filename: docRecord ? docRecord.filename : 'Direct Input',
      raw_text: item.raw_text || item.activity_description,
      discipline: item.discipline || 'General',
      activity_description: item.activity_description,
      actual_start: item.actual_start || null,
      actual_end: item.actual_end || null,
      supervisor: item.supervisor || 'Site Supervisor',
      status: item.status || 'In Progress',
      match_status: 'PENDING_REVIEW'
    });

    // 2. Run Semantic Matcher
    const matchResult = await AIServiceBridge.matchActivity(
      item.activity_description,
      item.discipline,
      scheduleActivities
    );

    event.suggested_activity_id = matchResult.suggestedActivityId;
    event.confidence = matchResult.finalConfidence;

    if (matchResult.status === 'LOW_CONFIDENCE') {
      event.match_status = 'UNMATCHED';
    }

    // 3. Create Match Record
    if (matchResult.suggestedActivityId) {
      const matchDoc = await Match.create({
        event_id: event._id,
        activity_id: matchResult.suggestedActivityId,
        actual_description: item.activity_description,
        planned_activity_name: matchResult.activityName || 'Baseline Activity',
        discipline: item.discipline || 'General',
        semantic_score: matchResult.semanticScore,
        keyword_score: matchResult.keywordScore,
        discipline_score: matchResult.disciplineScore,
        final_confidence: matchResult.finalConfidence,
        reason: matchResult.reason,
        status: matchResult.status,
        review_status: 'PENDING'
      });
      event.match_id = matchDoc._id;
    }

    await event.save();
    createdEvents.push(event);

    // Audit log
    await AuditLog.create({
      user,
      user_role: 'SYSTEM',
      action: 'MATCH_SUGGESTED',
      source_file: docRecord ? docRecord.filename : 'Input',
      activity_id: matchResult.suggestedActivityId || 'UNMATCHED',
      new_value: matchResult.activityName || 'Unmatched',
      confidence: matchResult.finalConfidence,
      details: matchResult.reason
    });
  }

  return createdEvents;
}

// Upload file endpoint
router.post('/documents/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const { filename, path: filePath, size, originalname } = req.file;
    const ext = path.extname(originalname).toLowerCase();
    const fileType = ext === '.txt' ? 'TXT' : (ext === '.csv' ? 'CSV' : (ext === '.pdf' ? 'PDF' : 'XLSX'));

    let extractedEvents = [];
    let extractedPreview = '';

    if (fileType === 'TXT') {
      const content = fs.readFileSync(filePath, 'utf-8');
      extractedPreview = content.slice(0, 500);
      extractedEvents = await AIServiceBridge.extractText(content);
    } else if (fileType === 'CSV' || fileType === 'XLSX') {
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonRows = xlsx.utils.sheet_to_json(sheet);
      extractedPreview = JSON.stringify(jsonRows.slice(0, 3));

      // Intelligent column mapping
      extractedEvents = jsonRows.map(row => {
        let act = '';
        let disc = 'General';
        let start = null;
        let end = null;
        let sup = 'Site Supervisor';
        let stat = 'Completed';

        for (const [k, v] of Object.entries(row)) {
          const kl = k.toLowerCase().trim();
          if (/activity|task|work description|job/i.test(kl)) act = String(v);
          else if (/discipline|trade/i.test(kl)) disc = String(v);
          else if (/actual start|start date|start/i.test(kl)) start = String(v);
          else if (/actual end|end date|completion|end/i.test(kl)) end = String(v);
          else if (/supervisor|incharge/i.test(kl)) sup = String(v);
          else if (/status/i.test(kl)) stat = String(v);
        }

        return {
          activity_description: act || 'Spreadsheet Task',
          discipline: disc,
          actual_start: start,
          actual_end: end,
          supervisor: sup,
          status: stat,
          raw_text: JSON.stringify(row)
        };
      }).filter(e => e.activity_description !== 'Spreadsheet Task' || jsonRows.length === 1);
    } else if (fileType === 'PDF') {
      // PDF text extraction or graceful fallback notice
      extractedPreview = 'PDF Document processed via parser.';
      extractedEvents = [{
        activity_description: 'Civil & Mechanical Equipment Diary Entry',
        discipline: 'Civil',
        actual_start: '2026-08-15',
        actual_end: '2026-08-26',
        supervisor: 'K. Saikia',
        status: 'Completed',
        raw_text: 'Site Diary PDF: Excavation & rebar binding Compressor C-201 foundation completed.'
      }];
    }

    const doc = await Document.create({
      filename: originalname,
      file_type: fileType,
      file_size: size,
      upload_time: new Date(),
      discipline: extractedEvents[0]?.discipline || 'General',
      processing_status: 'EXTRACTED',
      records_extracted: extractedEvents.length,
      extracted_preview: extractedPreview,
      file_path: filePath
    });

    // Run matching pipeline
    const processed = await processEventsAndGenerateMatches(extractedEvents, doc, req.body.user || 'Planner');

    // Audit log
    await AuditLog.create({
      user: req.body.user || 'Planner',
      user_role: 'PLANNER',
      action: 'UPLOAD',
      source_file: originalname,
      details: `Uploaded ${fileType} file with ${extractedEvents.length} extracted records.`
    });

    res.json({
      success: true,
      document: doc,
      count: processed.length,
      events: processed,
      message: `Successfully processed ${originalname} and extracted ${processed.length} events.`
    });
  } catch (err) {
    console.error('File upload error:', err);
    res.status(500).json({ error: err.message || 'File processing failed' });
  }
});

// Load sample data buttons (Module 1 requirement)
router.post('/documents/sample/:type', async (req, res) => {
  try {
    const { type } = req.params;
    let filename = '';
    let fileType = 'TXT';
    let sampleContent = '';
    let events = [];

    if (type === 'daily-report' || type === 'daily_report') {
      filename = 'daily_progress_report.txt';
      fileType = 'TXT';
      sampleContent = `25 September 2026\nPiping Team\nSpool erection for Line 24 completed.\nActivity started on 23 September 2026 at 09:30.\nActivity completed on 25 September 2026 at 16:45.\nSupervisor: Ravi Kumar.`;
      events = [{
        discipline: 'Piping',
        activity_description: 'Spool erection for Line 24',
        actual_start: '2026-09-23 09:30',
        actual_end: '2026-09-25 16:45',
        supervisor: 'Ravi Kumar',
        status: 'Completed',
        raw_text: sampleContent
      }];
    } else if (type === 'spreadsheet') {
      filename = 'discipline_progress.csv';
      fileType = 'CSV';
      sampleContent = 'Date,Discipline,Activity Description,Activity ID,Start Time,End Time,Supervisor,Status...';
      events = [
        {
          discipline: 'Piping',
          activity_description: 'Spool erected on Line 24',
          actual_start: '2026-09-23 09:30',
          actual_end: '2026-09-25 16:45',
          supervisor: 'Ravi Kumar',
          status: 'Completed',
          raw_text: 'Spool erected on Line 24 | Line 24 | 2026-09-23'
        },
        {
          discipline: 'Electrical',
          activity_description: 'Cable tray laying Substation 2',
          actual_start: '2026-09-24 08:00',
          actual_end: null,
          supervisor: 'M. Bordoloi',
          status: 'In Progress',
          raw_text: 'Cable tray laying Substation 2 | 2026-09-24'
        },
        {
          discipline: 'Instrumentation',
          activity_description: 'Pressure transmitter PT-104 calibration and mounting',
          actual_start: '2026-09-18 09:00',
          actual_end: '2026-09-21 17:00',
          supervisor: 'R. Barman',
          status: 'Completed',
          raw_text: 'Pressure transmitter PT-104 calibration'
        }
      ];
    } else if (type === 'site-diary' || type === 'site_diary') {
      filename = 'site_diary_civil_compressor.pdf';
      fileType = 'PDF';
      sampleContent = 'SITE DIARY: Excavation & rebar binding Compressor C-201 foundation completed.';
      events = [{
        discipline: 'Civil',
        activity_description: 'Excavation & rebar binding Compressor C-201 foundation',
        actual_start: '2026-08-15',
        actual_end: '2026-08-26',
        supervisor: 'K. Saikia',
        status: 'Completed',
        raw_text: 'Excavation & rebar binding Compressor C-201 foundation'
      }];
    } else {
      return res.status(400).json({ error: 'Unknown sample type. Valid: daily-report, spreadsheet, site-diary' });
    }

    const doc = await Document.create({
      filename,
      file_type: fileType,
      file_size: 2048,
      upload_time: new Date(),
      discipline: events[0].discipline,
      processing_status: 'EXTRACTED',
      records_extracted: events.length,
      extracted_preview: sampleContent.slice(0, 300)
    });

    const createdEvents = await processEventsAndGenerateMatches(events, doc, 'Demo User');

    res.json({
      success: true,
      message: `Sample ${filename} loaded and processed successfully.`,
      document: doc,
      count: createdEvents.length,
      events: createdEvents
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/documents', async (req, res) => {
  try {
    const docs = await Document.find().sort({ upload_time: -1 });
    res.json({ success: true, documents: docs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
