# Chat Refactor Checklist (May 2025)

This checklist tracks the planned improvements to chat creation, message flow, and schema for a streamlined, user-friendly chat experience.

## 1. UX & Flow Changes

- [x] Remove manual chat naming and the "New Chat" button from the UI.
- [x] At `/` (root), show the chat interface with a friendly prompt (e.g., "How can I help you today?") if no chat is active.
- [x] When the user sends their first message at `/`, POST to `/api/chat` with a required `topic` field (replaces `name`).
- [x] Backend creates the chat and returns `chatId` and metadata (including a `has_messages` flag).
- [x] Frontend redirects to `/chat/:chatId` after chat creation.
- [x] Subsequent messages POST to `/api/chat/message` as usual.
- [x] If the UI detects an active chat with no messages (using `has_messages`), prompt the user to send the first message (using the topic as context).

## 2. Backend/API Changes

- [x] Update `/api/chat` endpoint:
  - Require `topic` field on creation.
  - Create chat with `has_messages = 0` (false).
  - Return `chatId`, `topic`, and `has_messages` in response.
- [x] Add `has_messages` (boolean, default 0) to `chat_sessions` table.
- [x] When the first message is added to a chat, set `has_messages = 1` (true).
- [x] Update chat list and chat detail APIs to include `has_messages`.
- [ ] Remove or deprecate the old `name` field in favor of `topic`.

## 3. Database Migration

- [x] Add `has_messages` column to `chat_sessions` table (default 0).
- [x] Rename `name` column to `topic` (or drop and add new column if preferred).
- [x] Update all queries and service methods to use `topic`.

## 4. Frontend Refactor

- [x] Remove chat name prompt and "New Chat" button.
- [x] At root, allow user to immediately type and send a message (which creates a chat).
- [x] After chat creation, redirect to `/chat/:chatId` and load chat as normal.
- [x] If a chat is active but has no messages, prompt for the first message using the topic.
- [x] Update chat list/sidebar to use `topic` as the label/preview.

## 5. Optional/Polish

- [ ] Allow editing the chat topic after creation (optional).
- [ ] Add UI feedback for chat creation or first message errors.
- [ ] Update tests and documentation to reflect new flow and schema.

## Hono Cookie Utility Refactor

- [x] Investigate and, if beneficial, use Hono's cookie utilities for setting cookies in middleware and auth routes.
- [x] Refactor `requireAuth` middleware to use `getCookie`/`setCookie` from Hono.
- [x] Refactor `/api/auth/session` to use `setCookie` from Hono.
- [x] Verify all tests pass after refactor.

---

**Refer to this checklist as you implement the chat creation and message flow refactor.**
