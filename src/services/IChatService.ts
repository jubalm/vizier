// Interface for chat service operations (create, fetch, update, delete chats and messages)
export interface IChatService {
  getChatById(id: string, user_id: string): { id: string, topic: string | null, created_at: string, last_active: string, has_messages: number } | null // Get a chat by its ID and user
  getChatMessages(chatId: string): { role: string, content: string }[] // Get all messages for a chat
  insertChatMessage(
    id: string,
    user_id: string,
    chatId: string,
    role: string,
    content: string,
    created_at: string
  ): void // Insert a message into a chat and update has_messages
  updateChatLastActive(chatId: string, last_active: string): void // Update last active timestamp for a chat
  createChat(chatId: string, userId: string, topic: string | null, now: string): void // Create a new chat
  getChatsForUser(userId: string): { id: string, topic: string | null, created_at: string, last_active: string, has_messages: number }[] // Get all chats for a user
  deleteChat(chatId: string, userId: string): void // Delete a chat
}
