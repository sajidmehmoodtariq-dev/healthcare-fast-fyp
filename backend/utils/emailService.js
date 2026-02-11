import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create reusable transporter
let transporter;

// Create transporter for production email
const createTransporter = () => {
  const emailService = process.env.EMAIL_SERVICE || 'gmail';
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    console.warn('⚠️  Email credentials not configured. Email service will not work.');
    console.warn('💡 Please set EMAIL_USER and EMAIL_PASS in your .env file');
    return null;
  }

  transporter = nodemailer.createTransport({
    service: emailService,
    auth: {
      user: emailUser,
      pass: emailPass, // Use App Password for Gmail with 2-step verification
    },
  });

  console.log('✅ Email service configured successfully');
  console.log(`📧 Using: ${emailUser}`);
  
  // Verify the connection
  transporter.verify((error, success) => {
    if (error) {
      console.error('❌ Email service verification failed:', error.message);
      console.warn('💡 If using Gmail with 2-step verification, make sure to use an App Password');
    } else {
      console.log('✅ Email service ready to send messages');
    }
  });

  return transporter;
};

// Initialize transporter
transporter = createTransporter();

// Store OTPs temporarily (in production, use Redis or database)
const otpStore = new Map();

// Generate 6-digit OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email
export const sendOTPEmail = async (email, otp) => {
  try {
    if (!transporter) {
      console.error('❌ Email service not configured');
      return { success: false, error: 'Email service not configured' };
    }

    const mailOptions = {
      from: `"Healthcare Assistant" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Healthcare App - Email Verification OTP',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
              }
              .container {
                max-width: 600px;
                margin: 20px auto;
                background-color: #ffffff;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
              }
              .header {
                background-color: #14b8a6;
                color: #ffffff;
                padding: 20px;
                text-align: center;
              }
              .content {
                padding: 30px;
                text-align: center;
              }
              .otp-box {
                background-color: #f0fdfa;
                border: 2px solid #14b8a6;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
                font-size: 32px;
                font-weight: bold;
                color: #0f766e;
                letter-spacing: 8px;
              }
              .footer {
                background-color: #f9fafb;
                padding: 20px;
                text-align: center;
                font-size: 12px;
                color: #6b7280;
              }
              .warning {
                color: #dc2626;
                font-size: 14px;
                margin-top: 15px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Email Verification</h1>
              </div>
              <div class="content">
                <h2>Welcome to Healthcare App!</h2>
                <p>Please use the following OTP to verify your email address:</p>
                <div class="otp-box">${otp}</div>
                <p>This OTP will expire in <strong>10 minutes</strong>.</p>
                <p class="warning">⚠️ Do not share this OTP with anyone!</p>
              </div>
              <div class="footer">
                <p>If you didn't request this OTP, please ignore this email.</p>
                <p>&copy; ${new Date().getFullYear()} Healthcare App. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ OTP Email sent successfully');
    console.log(`   To: ${email}`);
    console.log(`   Message ID: ${info.messageId}`);
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending OTP email:', error.message);
    if (error.code === 'EAUTH') {
      console.error('💡 Authentication failed. Please check your EMAIL_USER and EMAIL_PASS');
      console.error('💡 For Gmail with 2-step verification, use an App Password');
    }
    return { success: false, error: error.message };
  }
};

// Store OTP with expiration (10 minutes)
export const storeOTP = (email, otp) => {
  const expirationTime = Date.now() + 10 * 60 * 1000; // 10 minutes
  otpStore.set(email, { otp, expirationTime });
};

// Verify OTP
export const verifyOTP = (email, otp) => {
  const storedData = otpStore.get(email);
  
  if (!storedData) {
    return { valid: false, message: 'OTP not found or expired' };
  }

  if (Date.now() > storedData.expirationTime) {
    otpStore.delete(email);
    return { valid: false, message: 'OTP has expired' };
  }

  if (storedData.otp !== otp) {
    return { valid: false, message: 'Invalid OTP' };
  }

  // OTP is valid, remove it from store
  otpStore.delete(email);
  return { valid: true, message: 'OTP verified successfully' };
};

// Clean up expired OTPs periodically
setInterval(() => {
  const now = Date.now();
  for (const [email, data] of otpStore.entries()) {
    if (now > data.expirationTime) {
      otpStore.delete(email);
    }
  }
}, 5 * 60 * 1000); // Clean up every 5 minutes
