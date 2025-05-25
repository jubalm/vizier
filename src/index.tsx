import { serve } from "bun";
import index from "./index.html";

// Import route handlers
import * as chatApi from './routes/chat';
import * as healthApi from './routes/health'; // Added healthApi import

const server = serve({
  routes: {
    // Serve index.html for all unmatched routes.
    "/*": index,

    "/api/chat": chatApi, // Use the imported chatApi module
    "/api/health": healthApi, // Added healthApi route
  },

  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
})

console.log(`🚀 Server running at ${server.url}`)
