import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create reusable transporter
let transporter;

// Create transporter using Ethereal test email (works without Gmail setup)
const createTransporter = async () => {
  // Use Ethereal test email service for development
  // This creates a fake SMTP service that captures emails
  const testAccount = await nodemailer.createTestAccount();
  
  transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
  
  console.log('📧 Email service ready - Using Ethereal test account');
  console.log('💡 OTP emails will be logged in console with preview links');
};

// Initialize transporter
await createTransporter();

// Store OTPs temporarily (in production, use Redis or database)
const otpStore = new Map();

// Generate 6-digit OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email
export const sendOTPEmail = async (email, otp) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
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
    
    // Log preview URL for test emails
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log('\n📧 ============================================');
      console.log('   OTP Email Sent Successfully!');
      console.log('   To:', email);
      console.log('   OTP Code:', otp);
      console.log('   Preview URL:', previewUrl);
      console.log('============================================\n');
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error sending OTP email:', error);
    console.error('Full error details:', error.response || error.message);
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
