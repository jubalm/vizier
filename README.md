# Vizier Compliance Management System (Conceptual)

Vizier is a conceptual platform designed to help organizations manage and ensure the compliance of their employees with various internal and external requirements. This project is a prototype and reference implementation for:

- Storing and analyzing employee compliance data (certificates, requirements, documents)
- Integrating with external policy and regulatory documents (e.g., S3, cloud storage)
- Providing an AI-powered chat agent to assist HR agents in compliance workflows

## Key Features

- **Simulated Database:** Includes a schema and mock data for employees, certificates, requirements, and compliance documents
- **Policy Mapping:** Example conceptual policies and their mapping to database requirements
- **AI Chat Agent:** Uses Vercel AI SDK to power a chat endpoint for HR workflows
- **Modern Stack:** Built with Bun, TypeScript, and SQLite for rapid prototyping

## Project Structure

- `docs/` — Project brief, schema, mock data, policy mapping, and brand identity
- `src/` — API server, React client, and UI components
- `db/` — SQLite schema, seed data, and database file

## Usage

1. **Install dependencies:**
   ```sh
   bun install
   ```
2. **Seed the database:**
   ```sh
   sh db/db-reset.sh
   ```
3. **Run the dev server:**
   ```sh
   bun run dev
   ```
4. **Access the app:**
   - API: [http://localhost:3000](http://localhost:3000)
   - Chat endpoint: POST to `/api/chat/message` with `{ chatId, messages: [...] }`

## Authentication Flow (Username + Password)

- Users register with a username, email, and password. Passwords are hashed using Argon2 and never stored in plaintext.
- Login requires both username and password. On success, a session cookie is set.
- All protected endpoints require a valid session cookie. Sessions expire after 24 hours (auto-extended if active).
- Password hashing and session utilities are modularized in `src/lib/passwordHash.ts` and `src/lib/sessionUtil.ts`.

## About This Project

- **Conceptual Only:** This is a demonstration and prototyping project. "Company X" is a hypothetical client, and all data is sample/mock.
- **Brand:** Vizier is used as a trusted, illustrative brand for compliance and HR automation.

## License

MIT (for demonstration purposes)

# src

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.2.13. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
