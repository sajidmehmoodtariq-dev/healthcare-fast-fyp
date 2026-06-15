ALTER TABLE appointments
ADD COLUMN stripe_session_id TEXT,
ADD COLUMN payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed'));
