import { IChatService } from './IChatService'
import { chatDb } from '../db'

export class SqliteChatService implements IChatService {
  getChatSessionById(id: string, user_id: string) {
    return chatDb.query<{ id: string }, { $id: string, $user_id: string }>(
      'SELECT id FROM chat_sessions WHERE id = $id AND user_id = $user_id'
    ).get({ $id: id, $user_id: user_id })
  }

  getChatMessages(chat_session_id: string) {
    return chatDb.query<{ role: string, content: string }, { $chat_session_id: string }>(
      'SELECT role, content FROM chat_messages WHERE chat_session_id = $chat_session_id ORDER BY created_at ASC'
    ).all({ $chat_session_id: chat_session_id })
  }

  insertChatMessage(
    id: string,
    user_id: string,
    chat_session_id: string,
    role: string,
    content: string,
    created_at: string
  ) {
    chatDb.query(
      'INSERT INTO chat_messages (id, user_id, chat_session_id, role, content, created_at) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(id, user_id, chat_session_id, role, content, created_at)
  }

  updateChatSessionLastActive(chat_session_id: string, last_active: string) {
    chatDb.query(
      'UPDATE chat_sessions SET last_active = ? WHERE id = ?'
    ).run(last_active, chat_session_id)
  }

  createChatSession(chatSessionId: string, userId: string, name: string | null, now: string) {
    chatDb.query(
      'INSERT INTO chat_sessions (id, user_id, name, created_at, last_active) VALUES (?, ?, ?, ?, ?)'
    ).run(chatSessionId, userId, name, now, now)
  }

  getChatSessionsForUser(userId: string) {
    return chatDb.query<{ id: string, name: string | null, created_at: string, last_active: string }, { $user_id: string }>(
      'SELECT id, name, created_at, last_active FROM chat_sessions WHERE user_id = $user_id ORDER BY last_active DESC'
    ).all({ $user_id: userId })
  }

  deleteChatSession(chatSessionId: string, userId: string) {
    chatDb.query(
      'DELETE FROM chat_sessions WHERE id = ? AND user_id = ?'
    ).run(chatSessionId, userId)
  }
}
