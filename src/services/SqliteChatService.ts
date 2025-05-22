import { IChatService } from './IChatService'
import { chatDb } from '../db'

export class SqliteChatService implements IChatService {
  // Get a chat by its ID and user
  getChatById(id: string, user_id: string) {
    return chatDb.query<{ id: string }, { $id: string, $user_id: string }>(
      'SELECT id FROM chat_sessions WHERE id = $id AND user_id = $user_id'
    ).get({ $id: id, $user_id: user_id })
  }

  // Get all messages for a chat
  getChatMessages(chatId: string) {
    return chatDb.query<{ role: string, content: string }, { $chatId: string }>(
      'SELECT role, content FROM chat_messages WHERE chat_session_id = $chatId ORDER BY created_at ASC'
    ).all({ $chatId: chatId })
  }

  // Insert a message into a chat
  insertChatMessage(
    id: string,
    user_id: string,
    chatId: string,
    role: string,
    content: string,
    created_at: string
  ) {
    chatDb.query(
      'INSERT INTO chat_messages (id, user_id, chat_session_id, role, content, created_at) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(id, user_id, chatId, role, content, created_at)
  }

  // Update the last active timestamp for a chat
  updateChatLastActive(chatId: string, last_active: string) {
    chatDb.query(
      'UPDATE chat_sessions SET last_active = ? WHERE id = ?'
    ).run(last_active, chatId)
  }

  // Create a new chat
  createChat(chatId: string, userId: string, name: string | null, now: string) {
    chatDb.query(
      'INSERT INTO chat_sessions (id, user_id, name, created_at, last_active) VALUES (?, ?, ?, ?, ?)'
    ).run(chatId, userId, name, now, now)
  }

  // Get all chats for a user
  getChatsForUser(userId: string) {
    return chatDb.query<{ id: string, name: string | null, created_at: string, last_active: string }, { $user_id: string }>(
      'SELECT id, name, created_at, last_active FROM chat_sessions WHERE user_id = $user_id ORDER BY last_active DESC'
    ).all({ $user_id: userId })
  }

  // Delete a chat
  deleteChat(chatId: string, userId: string) {
    chatDb.query(
      'DELETE FROM chat_sessions WHERE id = ? AND user_id = ?'
    ).run(chatId, userId)
  }
}
