# Authentication Migration: Username + Password

## Overview

This checklist tracks the migration from username/email-only authentication to username + password authentication, following best security practices (password hashing, secure storage, and verification).

---

## 1. Database Schema

- [x] Add `password_hash` column to `users` table (nullable for migration, then required)
- [x] Update schema in `/db/auth.schema.sql`
- [x] Update migration scripts and/or `db-reset.sh`
- [x] Document schema change in `/docs/` and `README.md`

## 2. Backend

- [x] Update registration endpoint to accept password, hash it with `@phc/argon2` (cryptographic password hashing), and store in DB
- [x] Update login endpoint to verify password against stored hash using `@phc/argon2`
- [x] Update `IUserService` and `SqliteUserService` for password logic (hashing, verification with `@phc/argon2`)
- [x] Update session creation to require password authentication
- [x] Update error handling for auth failures
- [x] Add/Update tests for registration, login, and password edge cases

## 3. Frontend

- [x] Update registration and login forms to include password fields
- [x] Update Auth context/provider logic for new flow
- [x] Update error handling and UI feedback for password errors
- [x] Update tests for new forms and flows

## 4. Tests

- [x] Update backend tests for registration/login with password
- [x] Update frontend tests for new forms and flows
- [x] Add tests for password edge cases (min length, complexity, etc.)

## 5. Documentation

- [x] Update `README.md` for new authentication flow
- [x] Update `/docs/` for API and schema changes
- [x] Add migration notes for existing users (if any)

## 6. Security

- [x] Use a strong password hashing algorithm (`@phc/argon2`)
- [x] Never store plaintext passwords
- [x] Ensure password is never logged or sent in error messages
- [x] Set minimum password requirements (length, complexity)
- [x] Review session logic for continued security

## 7. (Optional) Migration for Existing Users

- [ ] Plan for migrating existing users (e.g., require password set on next login)
- [ ] Add migration script or logic if needed

---

## Progress Tracking

- [x] All code changes complete
- [x] All tests passing (manual, see Bun test runner note)
- [x] Manual verification of registration/login/logout
- [ ] Code review
- [ ] Deploy to staging/production

---

## References

- [x] Lucia Auth password best practices
- [x] Hono + Bun security docs
- [x] OWASP Password Storage Cheat Sheet
