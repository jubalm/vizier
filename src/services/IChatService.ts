export interface IChatService {
  getChatById(id: string, user_id: string): { id: string } | null
  getChatMessages(chatId: string): { role: string, content: string }[]
  insertChatMessage(
    id: string,
    user_id: string,
    chatId: string,
    role: string,
    content: string,
    created_at: string
  ): void
  updateChatLastActive(chatId: string, last_active: string): void
  createChat(chatId: string, userId: string, name: string | null, now: string): void
  getChatsForUser(userId: string): { id: string, name: string | null, created_at: string, last_active: string }[]
  deleteChat(chatId: string, userId: string): void
}
