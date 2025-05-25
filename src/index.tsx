import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { validateConfig, config } from "./config"
import "./lib/db" // Initialize database
import indexHtml from '@/index.html'
import * as routes from '@/routes/index'
import { serve } from 'bun'

// Validate environment configuration
validateConfig()

const app = new Hono()

// CORS middleware
app.use('/api/*', cors()) // Apply CORS to all /api routes

// API routes
app.route('/api/health', routes.healthRoutes)
app.route('/api/chat', routes.chatRoutes)
app.route('/api/auth', routes.authRoutes)

console.log(`Server starting on port ${config.PORT}...`)

const server = serve({
  port: config.PORT,
  routes: {
    '/*': indexHtml,
    '/api/*': {
      GET: app.fetch,
      POST: app.fetch,
      PUT: app.fetch
    }
  },
  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,
    // Echo console logs from the browser to the server
    console: true,
  },
})

console.log(`🚀 Server running at ${server.url}`)
