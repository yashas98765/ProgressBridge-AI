import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  projectId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String },
  code: { type: String },
  client: { type: String, default: 'Infrastructure Division' },
  location: { type: String, default: 'Duliajan, Assam' },
  startDate: { type: String, default: '2026-08-01' },
  plannedEndDate: { type: String, default: '2026-12-31' },
  status: { type: String, default: 'ACTIVE' },
  disciplines: [{ type: String }],
  overallProgress: { type: Number, default: 68 },
  plannedProgress: { type: Number, default: 72 },
  variance: { type: Number, default: -4 },
  updatedAt: { type: Date, default: Date.now }
});

export const Project = mongoose.model('Project', projectSchema);
