-- chat.db schema for chat memory
CREATE TABLE IF NOT EXISTS chats (
  id TEXT PRIMARY KEY, -- UUID
  user_id TEXT NOT NULL, -- FK to auth.db users
  topic TEXT, -- Optional, for UI (replaces 'name')
  created_at TEXT NOT NULL,
  last_active TEXT NOT NULL,
  has_messages INTEGER NOT NULL DEFAULT 0 -- 0 = no messages, 1 = has messages
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id TEXT PRIMARY KEY, -- UUID
  user_id TEXT NOT NULL, -- FK to auth.db users
  chat_id TEXT NOT NULL, -- FK to chats
  role TEXT NOT NULL, -- 'user', 'assistant', 'system'
  content TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY(chat_id) REFERENCES chats(id) ON DELETE CASCADE
);

-- Index for fast lookup by user/chat
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_chat ON chat_messages(user_id, chat_id, created_at);
