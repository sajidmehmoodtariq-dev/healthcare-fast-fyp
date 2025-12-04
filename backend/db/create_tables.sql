-- Create users table in Supabase
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('patient', 'doctor', 'admin')),
  phone_number VARCHAR(20),
  age INTEGER,
  gender VARCHAR(20),
  cnic VARCHAR(20),
  
  -- Doctor-specific fields
  cnic_image_url TEXT,
  degree_image_url TEXT,
  clinic_address TEXT,
  specialization VARCHAR(255),
  experience INTEGER,
  license_number VARCHAR(100),
  consultation_fee INTEGER,
  
  -- Approval status for doctors (pending, approved, rejected)
  approval_status VARCHAR(20) DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  approved_by INTEGER REFERENCES users(id),
  approved_at TIMESTAMP,
  rejection_reason TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Create index on role for filtering
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
