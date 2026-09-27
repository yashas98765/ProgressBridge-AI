import mongoose from 'mongoose';

const projectMemorySchema = new mongoose.Schema({
  activity_keyword: { type: String, required: true },
  discipline: { type: String, required: true },
  average_actual_duration: { type: Number, required: true },
  planned_duration: { type: Number, required: true },
  average_delay: { type: Number, required: true },
  most_common_delay_cause: { type: String, required: true },
  historical_record_count: { type: Number, required: true, default: 1 },
  productivity_rating: { type: String, default: 'Normal' },
  recurring_bottleneck: { type: String },
  recommended_mitigation: { type: String },
  updated_at: { type: Date, default: Date.now }
});

export const ProjectMemory = mongoose.model('ProjectMemory', projectMemorySchema);
