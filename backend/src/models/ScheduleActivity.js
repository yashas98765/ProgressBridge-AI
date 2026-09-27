import mongoose from 'mongoose';

const scheduleActivitySchema = new mongoose.Schema({
  activity_id: { type: String, required: true, unique: true }, // e.g. L6-PIP-024
  project_id: { type: String, default: 'PRJ-OIL-2026' },
  parent_id: { type: String }, // e.g. L5-PIP-012 or L4-PIP-001
  wbs_level: { type: String, enum: ['L1', 'L2', 'L3', 'L4', 'L5', 'L6'], default: 'L6' },
  discipline: { 
    type: String, 
    enum: ['Civil', 'Piping', 'Electrical', 'Instrumentation', 'Mechanical', 'Static Equipment', 'Rotating Equipment', 'HSE', 'Structural'],
    required: true 
  },
  activity_code: { type: String },
  activity_name: { type: String, required: true },
  planned_start: { type: String, required: true }, // YYYY-MM-DD
  planned_end: { type: String, required: true },
  planned_duration: { type: Number, required: true }, // in days
  actual_start: { type: String },
  actual_end: { type: String },
  actual_duration: { type: Number },
  variance: { type: Number, default: 0 },
  delay_days: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'DELAYED', 'ON_TIME', 'EARLY'], 
    default: 'NOT_STARTED' 
  },
  progress_percentage: { type: Number, default: 0 },
  unit_or_line: { type: String },
  linked_event_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ProgressEvent' }],
  last_updated_at: { type: Date, default: Date.now }
});

export const ScheduleActivity = mongoose.model('ScheduleActivity', scheduleActivitySchema);
