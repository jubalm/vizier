// src/db.ts
// Centralized database instances and helper/query functions for Vizier
import { Database } from 'bun:sqlite'

// Main business data DB
export const bizDb = new Database('./db/vizier.db')
// Auth DB
export const authDb = new Database('./db/auth.db')
// Chat memory DB
export const chatDb = new Database('./db/chat.db')
