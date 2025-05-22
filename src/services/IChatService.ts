export interface IChatService {
  getChatSessionById(id: string, user_id: string): { id: string } | null
  getChatMessages(chat_session_id: string): { role: string, content: string }[]
  insertChatMessage(
    id: string,
    user_id: string,
    chat_session_id: string,
    role: string,
    content: string,
    created_at: string
  ): void
  updateChatSessionLastActive(chat_session_id: string, last_active: string): void
  createChatSession(chatSessionId: string, userId: string, name: string | null, now: string): void
  getChatSessionsForUser(userId: string): { id: string, name: string | null, created_at: string, last_active: string }[]
  deleteChatSession(chatSessionId: string, userId: string): void
}
