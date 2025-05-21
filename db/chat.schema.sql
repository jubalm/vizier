-- chat.db schema for chat memory
CREATE TABLE IF NOT EXISTS chat_sessions (
  id TEXT PRIMARY KEY, -- UUID
  user_id TEXT NOT NULL, -- FK to auth.db users
  name TEXT, -- Optional, for UI
  created_at TEXT NOT NULL,
  last_active TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id TEXT PRIMARY KEY, -- UUID
  user_id TEXT NOT NULL, -- FK to auth.db users
  chat_session_id TEXT NOT NULL, -- FK to chat_sessions
  role TEXT NOT NULL, -- 'user', 'assistant', 'system'
  content TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY(chat_session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE
);

-- Index for fast lookup by user/session
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_session ON chat_messages(user_id, chat_session_id, created_at);
