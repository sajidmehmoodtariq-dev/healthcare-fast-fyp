import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import prescriptionRoutes from './routes/prescriptionRoutes.js';
import axios from 'axios';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Check expired appointments every 6 hours
const checkExpiredAppointments = async () => {
  try {
    await axios.post(`http://localhost:${PORT}/api/appointments/check-expired`);
    console.log('✓ Checked for expired appointments');
  } catch (error) {
    console.error('Error checking expired appointments:', error.message);
  }
};

// Run check on startup
setTimeout(() => {
  checkExpiredAppointments();
}, 10000); // Wait 10 seconds after startup

// Schedule periodic checks (every 6 hours)
setInterval(checkExpiredAppointments, 6 * 60 * 60 * 1000);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root route
app.get('/', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Healthcare API is running',
    endpoints: {
      auth: '/api/auth',
      admin: '/api/admin',
      appointments: '/api/appointments',
      chat: '/api/chat',
      prescriptions: '/api/prescriptions',
      health: '/health'
    }
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/prescriptions', prescriptionRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Healthcare API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!', details: err.message });
});

// Export for Vercel
export default app;

// Only listen when not in serverless environment
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}
