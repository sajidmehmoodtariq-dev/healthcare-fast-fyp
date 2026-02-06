-- Create medical_history table
CREATE TABLE IF NOT EXISTS medical_history (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    condition VARCHAR(255) NOT NULL,
    diagnosed_year INTEGER,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_medical_history_patient ON medical_history(patient_id);
CREATE INDEX idx_medical_history_active ON medical_history(is_active);

-- Add comment
COMMENT ON TABLE medical_history IS 'Stores patient medical history including chronic conditions, past diagnoses, and health records';
