-- Migration script to add blood_group column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS blood_group VARCHAR(5);

-- Add useful comment for maintainability
COMMENT ON COLUMN users.blood_group IS 'Patient blood group (A+, A-, B+, B-, AB+, AB-, O+, O-)';
