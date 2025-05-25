import { serve } from "bun"
import index from "./index.html"

// Import route handlers
import * as chatApi from './routes/chat'
import * as helloApi from './routes/hello'

const server = serve({
  routes: {
    // Serve index.html for all unmatched routes.
    "/*": index,

    "/api/chat": chatApi, // Use the imported chatApi module

    "/api/hello": {
      GET: helloApi.GET, // Assign specific handlers
      PUT: helloApi.PUT,
    },

    "/api/hello/:name": helloApi.fallback, // Assign fallback handler
  },

  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
})

console.log(`🚀 Server running at ${server.url}`)
