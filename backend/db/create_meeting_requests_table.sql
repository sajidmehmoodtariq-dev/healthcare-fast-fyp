-- Create meeting_requests table
-- Patients request video meetings with doctors they have an approved appointment with.
-- Doctor accepts or rejects. Meeting room opens only within ±15 min of scheduled time.
CREATE TABLE IF NOT EXISTS meeting_requests (
    id SERIAL PRIMARY KEY,
    appointment_id INTEGER NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    patient_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    doctor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    rejection_reason TEXT,
    room_name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_meeting_requests_patient ON meeting_requests(patient_id);
CREATE INDEX idx_meeting_requests_doctor ON meeting_requests(doctor_id);
CREATE INDEX idx_meeting_requests_status ON meeting_requests(status);
