import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// Import routes
import authRoutes from './routes/auth.routes.js';
import projectRoutes from './routes/project.routes.js';
import scheduleRoutes from './routes/schedule.routes.js';
import documentRoutes from './routes/document.routes.js';
import progressRoutes from './routes/progress.routes.js';
import matchRoutes from './routes/match.routes.js';
import timeAgentRoutes from './routes/timeAgent.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import auditRoutes from './routes/audit.routes.js';
import demoRoutes from './routes/demo.routes.js';

import { ScheduleActivity } from './models/ScheduleActivity.js';
import { AIServiceBridge } from './services/aiServiceBridge.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/progressbridge';

// Production CORS Configuration
const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(s => s.trim())
  : ['*'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    // Allow standard local development origins
    if (/^https?:\/\/localhost(:\d+)?$/.test(origin) || /^https?:\/\/127\.0\.0\.1(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true
}));

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Static uploads directory
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Production Health check: GET /health
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'ProgressBridge Backend'
  });
});

// Detailed API Health Check: GET /api/health
app.get('/api/health', async (req, res) => {
  let aiStatus = 'unreachable';
  try {
    const isAiUp = await AIServiceBridge.checkHealth();
    aiStatus = isAiUp ? 'connected' : 'fallback_internal_engine';
  } catch (e) {
    aiStatus = 'fallback_internal_engine';
  }

  res.json({
    status: 'ok',
    service: 'ProgressBridge Backend',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    ai_service: aiStatus,
    timestamp: new Date().toISOString()
  });
});

// Direct AI Matching API as specified in PS requirement
app.post('/api/ai/match', async (req, res) => {
  try {
    const { actualDescription, discipline } = req.body;
    if (!actualDescription) {
      return res.status(400).json({ error: 'actualDescription is required' });
    }

    const candidateActivities = await ScheduleActivity.find();
    const result = await AIServiceBridge.matchActivity(actualDescription, discipline, candidateActivities);

    res.json({
      suggestedActivityId: result.suggestedActivityId,
      activityName: result.activityName,
      semanticScore: result.semanticScore,
      keywordScore: result.keywordScore,
      disciplineScore: result.disciplineScore,
      finalConfidence: result.finalConfidence,
      reason: result.reason,
      status: result.status
    });
  } catch (err) {
    console.error('Error in /api/ai/match:', err);
    res.status(500).json({ error: err.message });
  }
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api', projectRoutes);
app.use('/api', scheduleRoutes);
app.use('/api', documentRoutes);
app.use('/api', progressRoutes);
app.use('/api', matchRoutes);
app.use('/api', timeAgentRoutes);
app.use('/api', analyticsRoutes);
app.use('/api', auditRoutes);
app.use('/api/demo', demoRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    error: err.message || 'Internal Server Error',
    friendlyMessage: 'The system encountered an unexpected issue, but state has been preserved.'
  });
});

// Connect to MongoDB and start server
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log(`Connected to MongoDB at ${MONGO_URI}`);
    app.listen(PORT, () => {
      console.log(`🚀 ProgressBridge AI Backend running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

export default app;
