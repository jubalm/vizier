import { Database } from "bun:sqlite"

// Initialize the database
const db = new Database("main.sqlite")

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
