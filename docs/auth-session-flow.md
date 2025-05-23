# Vizier Authentication & Session Flow

## Overview

Vizier now uses a modern authentication system for development and prototyping. Users register with a username, email, and password. Passwords are securely hashed (Argon2) and never stored in plaintext. Authenticated sessions are required for all protected API endpoints, including chat and chat management.

## Database Structure

- **auth.db**: Stores users and sessions
  - `users` table: id (UUID), username (unique), email (unique), password_hash (Argon2), created_at
  - `sessions` table: id (SHA-256 hex), user_id (FK), created_at, expires_at

## Registration

- Endpoint: `POST /api/auth/register`
- Request: `{ username, email, password }`
- Response: `{ id, username, email, created_at }`
- Notes: Username and email must be unique. Password is required and securely hashed.

## Login / Session Creation

- Endpoint: `POST /api/auth/session`
- Request: `{ username, password }`
- Response: `{ sessionId, userId, expires_at }`
- Notes: Creates a new session valid for 24 hours. Returns a session token (cookie).

## Session Usage

- All protected endpoints require the `sessionId` cookie with the session token.
- The backend validates the session token and checks expiry before processing requests.

## Session Validation Logic

- If the session is missing, invalid, or expired, the API returns 401 Unauthorized.
- If valid, the user ID is used to scope all further actions (e.g., chats, messages).
- Sessions are auto-extended if less than 12 hours remain.

## Example Flow

1. **Register**: User sends username, email, and password to `/api/auth/register`.
2. **Login**: User sends username and password to `/api/auth/session` and receives a session token (cookie).
3. **Authenticated Requests**: User includes the session cookie in all chat API calls.
4. **Session Expiry**: After 24h, the session expires and a new one must be created.

## Security Notes

- Passwords are hashed using Argon2 and never stored or logged in plaintext.
- Session tokens are random, hashed for storage, and set as HTTP-only cookies.
- In production, always use HTTPS and review session and password policies.
