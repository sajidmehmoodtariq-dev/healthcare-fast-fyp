import express from 'express';
import {
  getPendingDoctors,
  getAllDoctors,
  approveDoctor,
  rejectDoctor,
  getDoctorDetails,
} from '../controllers/adminController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Admin routes - require authentication and admin role
router.get('/doctors/pending', authenticateToken, requireAdmin, getPendingDoctors);
router.get('/doctors', authenticateToken, requireAdmin, getAllDoctors);
router.get('/doctors/:doctorId', authenticateToken, requireAdmin, getDoctorDetails);
router.put('/doctors/:doctorId/approve', authenticateToken, requireAdmin, approveDoctor);
router.put('/doctors/:doctorId/reject', authenticateToken, requireAdmin, rejectDoctor);

export default router;
