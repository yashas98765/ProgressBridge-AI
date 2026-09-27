import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  file_type: { type: String, enum: ['TXT', 'CSV', 'XLSX', 'PDF'], required: true },
  file_size: { type: Number },
  upload_time: { type: Date, default: Date.now },
  discipline: { type: String, default: 'General' },
  processing_status: { 
    type: String, 
    enum: ['PENDING', 'PROCESSING', 'EXTRACTED', 'FAILED'], 
    default: 'EXTRACTED' 
  },
  records_extracted: { type: Number, default: 0 },
  extracted_preview: { type: String },
  file_path: { type: String }
});

export const Document = mongoose.model('Document', documentSchema);
