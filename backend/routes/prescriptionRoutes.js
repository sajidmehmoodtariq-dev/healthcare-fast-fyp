import express from 'express';
import {
  createPrescription,
  getPrescriptions,
  getPrescriptionById,
  updatePrescription,
  deletePrescription
} from '../controllers/prescriptionController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Create a prescription (Doctor only)
router.post('/', authenticateToken, createPrescription);

// Get all prescriptions (filtered by role)
router.get('/', authenticateToken, getPrescriptions);

// Get a single prescription by ID
router.get('/:prescriptionId', authenticateToken, getPrescriptionById);

// Update a prescription (Doctor only)
router.put('/:prescriptionId', authenticateToken, updatePrescription);

// Delete a prescription (Doctor only)
router.delete('/:prescriptionId', authenticateToken, deletePrescription);

export default router;
