import { Hono } from 'hono'
import { serve } from 'bun'
import index from "./index.html"
import authRoutes from './routes/auth'
import chatRoutes from './routes/chat'

const port = process.env.PORT || 3000
const app = new Hono()

// Mount modular routes
app.route('/api/auth', authRoutes)
app.route('/api/chat', chatRoutes)

// Only start the server if this file is run directly (not during tests)
if (import.meta.main) {
  serve({
    fetch: app.fetch,
    routes: { "/*": index },
    port
  })
  console.log(`Vizier API running on http://localhost:${port}`)
}

export { app }
