import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  user: { type: String, default: 'Planner' },
  user_role: { type: String, default: 'PLANNER' },
  action: { 
    type: String, 
    enum: [
      'UPLOAD', 
      'EXTRACTION', 
      'MATCH_SUGGESTED', 
      'MATCH_APPROVED', 
      'MATCH_REJECTED', 
      'MATCH_MODIFIED',
      'SCHEDULE_UPDATED', 
      'ACTIVITY_CREATED'
    ],
    required: true 
  },
  source_file: { type: String },
  activity_id: { type: String },
  old_value: { type: String },
  new_value: { type: String },
  confidence: { type: Number },
  review_status: { type: String },
  details: { type: String }
});

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
