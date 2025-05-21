-- chat.db schema for chat memory
CREATE TABLE IF NOT EXISTS chat_messages (
  id TEXT PRIMARY KEY, -- UUID
  user_id TEXT NOT NULL, -- FK to auth.db users
  session_id TEXT, -- optional, for multi-session support
  role TEXT NOT NULL, -- 'user', 'assistant', 'system'
  content TEXT NOT NULL,
  created_at TEXT NOT NULL
);

-- Index for fast lookup by user/session
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_session ON chat_messages(user_id, session_id, created_at);
