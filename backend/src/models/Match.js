import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema({
  event_id: { type: mongoose.Schema.Types.ObjectId, ref: 'ProgressEvent', required: true },
  activity_id: { type: String, required: true }, // e.g. L6-PIP-024
  actual_description: { type: String, required: true },
  planned_activity_name: { type: String, required: true },
  discipline: { type: String, default: 'General' },
  semantic_score: { type: Number, default: 0 },
  keyword_score: { type: Number, default: 0 },
  discipline_score: { type: Number, default: 0 },
  final_confidence: { type: Number, required: true },
  reason: { type: String },
  status: { 
    type: String, 
    enum: ['HIGH_CONFIDENCE', 'MEDIUM_CONFIDENCE', 'LOW_CONFIDENCE'], 
    required: true 
  },
  review_status: { 
    type: String, 
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'MODIFIED'], 
    default: 'PENDING' 
  },
  reviewed_by: { type: String },
  reviewed_at: { type: Date },
  comments: { type: String },
  created_at: { type: Date, default: Date.now }
});

export const Match = mongoose.model('Match', matchSchema);
