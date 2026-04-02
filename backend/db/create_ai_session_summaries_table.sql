-- Create ai_session_summaries table to store completed session summaries
CREATE TABLE IF NOT EXISTS ai_session_summaries (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id VARCHAR(100) NOT NULL,
    summary TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for fast retrieval
CREATE INDEX IF NOT EXISTS idx_ai_session_summaries_user_id ON ai_session_summaries(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_session_summaries_session_id ON ai_session_summaries(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_session_summaries_user_created ON ai_session_summaries(user_id, created_at DESC);

COMMENT ON TABLE ai_session_summaries IS 'Stores AI chat session summaries for context in future sessions';
