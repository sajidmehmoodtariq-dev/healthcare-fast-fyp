import express from 'express';
import { 
  getNotifications, 
  createNotification, 
  markAsRead, 
  markAllAsRead,
  deleteNotification 
} from '../controllers/notificationController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, getNotifications);
router.post('/', authenticateToken, createNotification);
router.patch('/:id/read', authenticateToken, markAsRead);
router.patch('/read-all', authenticateToken, markAllAsRead);
router.delete('/:id', authenticateToken, deleteNotification);

export default router;
