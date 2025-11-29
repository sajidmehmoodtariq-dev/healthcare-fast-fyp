import express from 'express';
import { signup, login, getProfile } from '../controllers/authController.js';
import { upload } from '../middleware/upload.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Signup route with file upload for doctors
router.post(
  '/signup',
  upload.fields([
    { name: 'cnicImage', maxCount: 1 },
    { name: 'degreeImage', maxCount: 1 },
  ]),
  signup
);

// Login route
router.post('/login', login);

// Get user profile (protected route)
router.get('/profile', authenticateToken, getProfile);

export default router;
