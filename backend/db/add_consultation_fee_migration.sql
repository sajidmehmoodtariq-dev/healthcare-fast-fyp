-- Migration script to add consultation_fee column to users table
-- Run this in your Supabase SQL Editor

-- Add consultation_fee column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS consultation_fee INTEGER;

-- Add comment to the column for documentation
COMMENT ON COLUMN users.consultation_fee IS 'Consultation fee in PKR for doctors';

