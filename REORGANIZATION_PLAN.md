# Project Reorganization Plan

<!--
REORGANIZATION CHECKLIST

- [ ] Move all auth-related files to `src/services/auth/`
    - [ ] `lib/db.ts` → `services/auth/db.ts`
    - [ ] `lib/auth.ts` → `services/auth/logic.ts`
    - [ ] `middleware/sessionAuth.ts` → `services/auth/middleware.ts`
    - [ ] `routes/auth.ts` → `services/auth/routes.ts`
    - [ ] `routes/auth.integration.test.ts` → `services/auth/tests/integration.test.ts`
- [ ] Move all chat/memory-related files to `src/services/chat/`
    - [ ] Create `db.ts`, `model.ts`, `logic.ts`, `routes.ts`, and `tests/` as needed
- [ ] Move shared utilities (e.g., `lib/errors.ts`) to `src/utils/`
- [ ] Update all imports throughout the codebase to reflect new file locations
- [ ] Create and initialize `memory.sqlite` for chat history
- [ ] Implement new chat history/memory features in `services/chat/`

-->

## 1. Directory Structure

```
src/
  services/
    auth/
      db.ts              # Auth/session/user DB (main.sqlite)
      model.ts           # User/session types/interfaces
      logic.ts           # createUser, verifyPassword, etc.
      routes.ts          # Hono routes for /api/auth/*
      middleware.ts      # sessionAuth, etc.
      tests/
        integration.test.ts
    chat/
      db.ts              # Chat/memory DB (memory.sqlite)
      model.ts           # Chat session/message types
      logic.ts           # Chat session/message logic
      routes.ts          # Hono routes for /api/chat/*
      tests/
        integration.test.ts
  components/
    AuthProvider.tsx
    UserMenu.tsx
    ChatWindow.tsx
    ...etc
  pages/
    LoginPage.tsx
    RegisterPage.tsx
    ChatPage.tsx
  hooks/
    use-mobile.ts
  utils/
    errors.ts
    ...etc
  config.ts
  index.tsx
```

---

## 2. File Moves & Renames

- Move all auth-related files from `src/lib/`, `src/routes/`, and `src/middleware/` into `src/services/auth/`:
  - `lib/db.ts` → `services/auth/db.ts`
  - `lib/auth.ts` → `services/auth/logic.ts`
  - `middleware/sessionAuth.ts` → `services/auth/middleware.ts`
  - `routes/auth.ts` → `services/auth/routes.ts`
  - `routes/auth.integration.test.ts` → `services/auth/tests/integration.test.ts`
- Move all chat/memory-related files into `src/services/chat/` (create new files as needed for chat DB, logic, etc.).
- Keep UI components, pages, and hooks in their current folders.
- Move shared utilities (e.g., `lib/errors.ts`) to `src/utils/`.

---

## 3. Database Organization

- `main.sqlite` (used by `services/auth/db.ts`): user, session tables.
- `memory.sqlite` (to be created, used by `services/chat/db.ts`): chat_session, chat_message tables.

---

## 4. Imports & References

- Update all imports throughout the codebase to reflect the new file locations.
- Example:
  ```ts
  import { createUser } from '@/services/auth/logic'
  import { sessionAuth } from '@/services/auth/middleware'
  import { getErrorMessage } from '@/utils/errors'
  ```

---

## 5. Next Steps

- Review this plan and suggest any changes.
- Once approved, proceed with moving/renaming files and updating imports.
- After reorganization, implement new chat history/memory features in `services/chat/`.

---
