import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/bun' // Changed from @hono/node-server to hono/bun
import { validateConfig, config } from "./config"
import "./lib/db" // Initialize database

import healthRoutes from "./routes/health" // Assuming this is Hono compatible or will be adapted
import chatRoutes from "./routes/chat"   // Assuming this is Hono compatible or will be adapted
import authApp from "./routes/auth"

// Validate environment configuration
validateConfig()

const app = new Hono()

// CORS middleware
app.use('*_SERVER_CONFIG_PLACEHOLDER_*', cors()) // Placeholder for path, will refine if needed

// API routes
app.route('/api/health', healthRoutes) // If healthRoutes is a Hono app
app.route('/api/chat', chatRoutes)     // If chatRoutes is a Hono app
app.route('/api/auth', authApp)

// Static assets serving - adjust path as necessary
app.use('/*', serveStatic({ root: './dist' })) // Serving from ./dist
app.get('/*', serveStatic({ path: './dist/index.html' })) // SPA fallback

console.log(`Server starting on port ${config.PORT}...`)

Bun.serve({
  fetch: app.fetch,
  port: config.PORT,
})

console.log(
  `🦊 Hono server is running at http://localhost:${config.PORT}`
)

export default app // Exporting the Hono app instance
