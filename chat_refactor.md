# Chat Refactor Checklist (May 2025)

This checklist tracks the planned improvements to chat creation, message flow, and schema for a streamlined, user-friendly chat experience.

## 1. UX & Flow Changes

- [ ] Remove manual chat naming and the "New Chat" button from the UI.
- [ ] At `/` (root), show the chat interface with a friendly prompt (e.g., "How can I help you today?") if no chat is active.
- [ ] When the user sends their first message at `/`, POST to `/api/chat` with a required `topic` field (replaces `name`).
- [ ] Backend creates the chat and returns `chatId` and metadata (including a `has_messages` flag).
- [ ] Frontend redirects to `/chat/:chatId` after chat creation.
- [ ] Subsequent messages POST to `/api/chat/message` as usual.
- [ ] If the UI detects an active chat with no messages (using `has_messages`), prompt the user to send the first message (using the topic as context).

## 2. Backend/API Changes

- [ ] Update `/api/chat` endpoint:
  - Require `topic` field on creation.
  - Create chat with `has_messages = 0` (false).
  - Return `chatId`, `topic`, and `has_messages` in response.
- [ ] Add `has_messages` (boolean, default 0) to `chat_sessions` table.
- [ ] When the first message is added to a chat, set `has_messages = 1` (true).
- [ ] Update chat list and chat detail APIs to include `has_messages`.
- [ ] Remove or deprecate the old `name` field in favor of `topic`.

## 3. Database Migration

- [ ] Add `has_messages` column to `chat_sessions` table (default 0).
- [ ] Rename `name` column to `topic` (or drop and add new column if preferred).
- [ ] Update all queries and service methods to use `topic`.

## 4. Frontend Refactor

- [ ] Remove chat name prompt and "New Chat" button.
- [ ] At root, allow user to immediately type and send a message (which creates a chat).
- [ ] After chat creation, redirect to `/chat/:chatId` and load chat as normal.
- [ ] If a chat is active but has no messages, prompt for the first message using the topic.
- [ ] Update chat list/sidebar to use `topic` as the label/preview.

## 5. Optional/Polish

- [ ] Allow editing the chat topic after creation (optional).
- [ ] Add UI feedback for chat creation or first message errors.
- [ ] Update tests and documentation to reflect new flow and schema.

---

**Refer to this checklist as you implement the chat creation and message flow refactor.**
