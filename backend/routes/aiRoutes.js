import express from 'express';
import { chatWithAI } from '../controllers/aiController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Chat with AI assistant (Patient only)
router.post('/chat', authenticateToken, chatWithAI);

export default router;
