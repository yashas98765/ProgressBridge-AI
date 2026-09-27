import express from 'express';
import { seedDatabase } from '../utils/seedData.js';

const router = express.Router();

router.post('/demo/reset', async (req, res) => {
  try {
    await seedDatabase();
    res.json({
      success: true,
      message: 'Demo environment successfully reset and initialized to baseline state!'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
