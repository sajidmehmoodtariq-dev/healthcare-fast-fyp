import express from 'express';
import { chatWithAI, summarizeChat, getAIChatHistory, saveSessionSummary, getSessionSummary } from '../controllers/aiController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Chat with AI assistant (Patient only)
router.post('/chat', authenticateToken, chatWithAI);
router.post('/summary', authenticateToken, summarizeChat);
router.get('/history', authenticateToken, getAIChatHistory);
router.post('/session-summary', authenticateToken, saveSessionSummary);
router.get('/session-summary', authenticateToken, getSessionSummary);

export default router;
