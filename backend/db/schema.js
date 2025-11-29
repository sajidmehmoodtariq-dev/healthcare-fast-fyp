import { pgTable, text, serial, timestamp, varchar, integer } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).notNull(), // 'patient', 'doctor', 'admin'
  phoneNumber: varchar('phone_number', { length: 20 }),
  age: integer('age'),
  gender: varchar('gender', { length: 20 }),
  
  // Common field for both doctors and patients
  cnic: varchar('cnic', { length: 20 }),
  
  // Doctor-specific fields
  cnicImageUrl: text('cnic_image_url'),
  degreeImageUrl: text('degree_image_url'),
  clinicAddress: text('clinic_address'),
  specialization: varchar('specialization', { length: 255 }),
  experience: integer('experience'), // years of experience
  licenseNumber: varchar('license_number', { length: 100 }),
  
  // Approval status for doctors
  approvalStatus: varchar('approval_status', { length: 20 }).default('pending'),
  approvedBy: integer('approved_by'),
  approvedAt: timestamp('approved_at'),
  rejectionReason: text('rejection_reason'),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
