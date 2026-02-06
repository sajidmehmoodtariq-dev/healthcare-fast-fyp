import express from 'express';
import { 
  getMedicalHistory, 
  addMedicalHistory, 
  updateMedicalHistory,
  deleteMedicalHistory 
} from '../controllers/medicalHistoryController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, getMedicalHistory);
router.post('/', authenticateToken, addMedicalHistory);
router.put('/:id', authenticateToken, updateMedicalHistory);
router.delete('/:id', authenticateToken, deleteMedicalHistory);

export default router;
