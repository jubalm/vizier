# Vizier Authentication & Session Flow

## Overview

Vizier uses a simple demo authentication system for development and prototyping. Users register with a username and email (no password required). Authenticated sessions are required for all protected API endpoints, including chat and chat management.

## Database Structure

- **auth.db**: Stores users and sessions
  - `users` table: id (UUID), username (unique), email (unique), created_at
  - `sessions` table: id (UUID), user_id (FK), created_at, expires_at

## Registration

- Endpoint: `POST /api/auth/register`
- Request: `{ username, email }`
- Response: `{ id, username, email, created_at }`
- Notes: Username and email must be unique. No password is required for demo purposes.

## Login / Session Creation

- Endpoint: `POST /api/auth/session`
- Request: `{ username }`
- Response: `{ sessionId, userId, expires_at }`
- Notes: Creates a new session valid for 24 hours. Returns a session token (UUID).

## Session Usage

- All protected endpoints require the `x-session-id` header with the session token.
- The backend validates the session token and checks expiry before processing requests.

## Session Validation Logic

- If the session is missing, invalid, or expired, the API returns 401 Unauthorized.
- If valid, the user ID is used to scope all further actions (e.g., chats, messages).

## Example Flow

1. **Register**: User sends username/email to `/api/auth/register`.
2. **Login**: User sends username to `/api/auth/session` and receives a session token.
3. **Authenticated Requests**: User includes `x-session-id` header in all chat API calls.
4. **Session Expiry**: After 24h, the session expires and a new one must be created.

## Security Notes

- This flow is for demo/prototyping only. No passwords or real authentication is implemented.
- In production, use secure password storage, session management, and HTTPS.
