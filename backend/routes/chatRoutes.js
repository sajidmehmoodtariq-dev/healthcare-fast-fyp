import express from 'express';
import {
  getConversations,
  getMessages,
  sendMessage,
  getUnreadCount
} from '../controllers/chatController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all conversations for current user
router.get('/conversations', authenticateToken, getConversations);

// Get messages between current user and another user
router.get('/messages/:otherUserId', authenticateToken, getMessages);

// Send a message
router.post('/send', authenticateToken, sendMessage);

// Get unread message count
router.get('/unread-count', authenticateToken, getUnreadCount);

export default router;
