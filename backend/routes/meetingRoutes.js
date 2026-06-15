import express from 'express';
import {
  getMeetingRequests,
  verifyMeetingAccess,
} from '../controllers/meetingController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Both: list all meetings (approved appointments) for current user
router.get('/', authenticateToken, getMeetingRequests);

// Both: verify a meeting can be joined right now
router.get('/verify/:id', authenticateToken, verifyMeetingAccess);

export default router;
