-- Create ai_chat_history table for persistent AI conversations
CREATE TABLE IF NOT EXISTS ai_chat_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id VARCHAR(100),
    sender_type VARCHAR(10) NOT NULL CHECK (sender_type IN ('user', 'ai')),
    message TEXT NOT NULL,
    disclaimer TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for fast user chat retrieval
CREATE INDEX IF NOT EXISTS idx_ai_chat_history_user_id ON ai_chat_history(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_history_session_id ON ai_chat_history(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_history_created_at ON ai_chat_history(created_at);

COMMENT ON TABLE ai_chat_history IS 'Stores patient AI chat history for continuity and summarization';
