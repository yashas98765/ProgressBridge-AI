import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['SUPERVISOR', 'PLANNER', 'PROJECT_MANAGER', 'ADMIN'], 
    default: 'PLANNER' 
  },
  department: { type: String, default: 'General' },
  createdAt: { type: Date, default: Date.now }
});

export const User = mongoose.model('User', userSchema);
