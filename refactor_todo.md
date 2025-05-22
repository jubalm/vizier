# Refactor TODO: Rename 'chat session' to 'chat'

Goal: Replace all references to 'chat session', 'chatSession', 'chat_session', etc. with the more general and idiomatic 'chat', 'chatId', 'chats', etc. throughout the codebase (backend, frontend, DB, and tests).

## Backend (API, DB, Services)

- [x] Rename all API endpoints:
  - `/api/chat/session` → `/api/chat` (for create/list/delete)
  - `chat_session_id` (in params/body/query) → `chatId`
  - `chatSessionId` (in code/response) → `chatId`
  - `chatSessions` → `chats`
- [x] Update all service and interface method names:
  - `getChatSessionById` → `getChatById`
  - `getChatSessionsForUser` → `getChatsForUser`
  - `createChatSession` → `createChat`
  - `deleteChatSession` → `deleteChat`
  - `updateChatSessionLastActive` → `updateChatLastActive`
  - `chat_session_id` (DB fields/params) → `chat_id`
- [x] Update DB schema and queries (if possible):
  - Table: `chat_sessions` → `chats`
  - Field: `chat_session_id` → `chat_id`
  - Update all SQL queries and migration/seed scripts accordingly

## Frontend (React, UI, API calls)

- [x] Rename all props, state, and variables:
  - `chatSessionId` → `chatId`
  - `chatSessions` → `chats`
  - `ChatSessionList` → `ChatList`
  - `handleCreateSession` → `handleCreateChat`
  - `handleSelectSession` → `handleSelectChat`
  - Update all usages in `ChatInterface`, `ChatSessionList`, etc.
- [x] Update all API calls to use new endpoint/param names
- [x] Update all UI text to say "chat" instead of "session"

## Tests

- [x] Update all test descriptions and variable names:
  - `chatSessionId` → `chatId`
  - `chatSessions` → `chats`
  - API calls to `/api/chat/session` → `/api/chat`

## Docs

- [ ] Update documentation and comments to use "chat" instead of "chat session"

## Notes

- This refactor will touch many files and may require DB migration if you want to rename tables/fields.
- Consider doing the backend API/service rename first, then frontend, then tests/docs.
- If you want to keep DB schema stable for now, you can alias old field names in SQL and migrate later.
- Search for all of: `session`, `chatSession`, `chat_session`, `chatSessions`, `chat_session_id`, etc.

---

**Track progress here as you refactor.**
