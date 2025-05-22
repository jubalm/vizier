import { SqliteUserService } from './SqliteUserService'
import { SqliteChatService } from './SqliteChatService'

export const userService = new SqliteUserService()
export const chatService = new SqliteChatService()
