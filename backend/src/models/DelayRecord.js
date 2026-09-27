import mongoose from 'mongoose';

const delayRecordSchema = new mongoose.Schema({
  activity_id: { type: String, required: true },
  activity_name: { type: String, required: true },
  discipline: { type: String, required: true },
  planned_duration: { type: Number, required: true },
  actual_duration: { type: Number, required: true },
  delay_days: { type: Number, required: true },
  possible_cause: { 
    type: String, 
    enum: [
      'Material Delay', 
      'Manpower Shortage', 
      'Equipment Delay', 
      'Weather', 
      'Approval Delay', 
      'Design Change', 
      'Access Constraint'
    ], 
    default: 'Material Delay' 
  },
  confidence: { type: Number, default: 0.85 },
  recorded_at: { type: Date, default: Date.now },
  status: { type: String, enum: ['ACTIVE', 'MITIGATED'], default: 'ACTIVE' }
});

export const DelayRecord = mongoose.model('DelayRecord', delayRecordSchema);
