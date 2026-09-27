import mongoose from 'mongoose';

const progressEventSchema = new mongoose.Schema({
  project_id: { type: String, default: 'PRJ-OIL-2026' },
  source_document_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
  source_type: { 
    type: String, 
    enum: ['DAILY_REPORT', 'SPREADSHEET', 'PDF_SITE_DIARY', 'TIME_AGENT', 'MANUAL'], 
    default: 'DAILY_REPORT' 
  },
  source_filename: { type: String },
  raw_text: { type: String },
  discipline: { type: String, default: 'General' },
  activity_description: { type: String, required: true },
  actual_start: { type: String },
  actual_end: { type: String },
  supervisor: { type: String, default: 'Site Supervisor' },
  status: { type: String, default: 'In Progress' },
  match_status: { 
    type: String, 
    enum: ['UNMATCHED', 'PENDING_REVIEW', 'APPROVED', 'REJECTED'], 
    default: 'PENDING_REVIEW' 
  },
  suggested_activity_id: { type: String },
  confidence: { type: Number, default: 0 },
  match_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Match' },
  created_at: { type: Date, default: Date.now }
});

export const ProgressEvent = mongoose.model('ProgressEvent', progressEventSchema);
