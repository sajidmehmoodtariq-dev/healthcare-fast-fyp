import express from 'express';
import {
  getApprovedDoctors,
  getDoctorBookedSlots,
  bookAppointment,
  uploadPaymentScreenshot,
  getPatientAppointments,
  getDoctorAppointments,
  getAllAppointments,
  updateAppointmentStatus,
  checkExpiredAppointments
} from '../controllers/appointmentController.js';
import { authenticateToken } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// Get all approved doctors (for patients)
router.get('/doctors', authenticateToken, getApprovedDoctors);

// Get booked time slots for a doctor on a specific date
router.get('/doctor/:doctorId/booked-slots', authenticateToken, getDoctorBookedSlots);

// Book an appointment (patients only)
router.post('/book', authenticateToken, bookAppointment);

// Upload payment screenshot
router.post('/upload-screenshot', authenticateToken, upload.single('screenshot'), uploadPaymentScreenshot);

// Get patient's appointments
router.get('/patient', authenticateToken, getPatientAppointments);

// Get doctor's appointments
router.get('/doctor', authenticateToken, getDoctorAppointments);

// Get all appointments (admin only)
router.get('/all', authenticateToken, getAllAppointments);

// Update appointment status (admin only)
router.put('/status', authenticateToken, updateAppointmentStatus);

// Check and expire old appointments
router.post('/check-expired', checkExpiredAppointments);

export default router;
