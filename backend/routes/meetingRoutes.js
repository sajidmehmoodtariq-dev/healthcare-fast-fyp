import express from 'express';
import {
  getEligibleDoctors,
  createMeetingRequest,
  getMeetingRequests,
  respondToMeeting,
  verifyMeetingAccess,
} from '../controllers/meetingController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Patient: list doctors eligible for meeting requests
router.get('/eligible-doctors', authenticateToken, getEligibleDoctors);

// Both: list all meeting requests for current user
router.get('/', authenticateToken, getMeetingRequests);

// Patient: create a meeting request
router.post('/request', authenticateToken, createMeetingRequest);

// Doctor: accept or reject a meeting request
router.put('/:id/respond', authenticateToken, respondToMeeting);

// Both: verify a meeting can be joined right now
router.get('/verify/:id', authenticateToken, verifyMeetingAccess);

export default router;
