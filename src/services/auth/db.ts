import { Database } from "bun:sqlite"
import { existsSync, mkdirSync } from "fs"
import { dirname } from "path"

const dbPath = "src/services/auth/auth.sqlite"

// Ensure the directory exists
const dir = dirname(dbPath)
if (!existsSync(dir)) {
  mkdirSync(dir, { recursive: true })
}

// Create the database file if it doesn't exist (Bun will create it on connect, but we can ensure the file exists)
if (!existsSync(dbPath)) {
  // Touch the file
  Bun.write(dbPath, "")
}

const db = new Database(dbPath)

// Function to initialize database schema
export function initializeDatabase(): void {
  db.run(`
    CREATE TABLE IF NOT EXISTS user (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      hashed_password TEXT NOT NULL
    );
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS session (
      id TEXT PRIMARY KEY,
      expires_at INTEGER NOT NULL,
      user_id TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES user(id)
    );
  `)
  console.log("Database tables checked/created successfully.")
}

// Initialize the database schema on startup
initializeDatabase()

export default db
