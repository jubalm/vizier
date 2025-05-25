import { serve } from "bun";
import index from "./index.html";
import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';

// Configure OpenAI provider with custom baseURL support
const openaiProvider = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'your-api-key',
  baseURL: process.env.OPENAI_BASE_URL, // Optional: for custom OpenAI-compatible endpoints
});

const server = serve({
  routes: {
    // Serve index.html for all unmatched routes.
    "/*": index,

    "/api/chat": {
      async POST(req) {
        try {
          const { messages } = await req.json();

                    const result = await streamText({
            model: openaiProvider(process.env.OPENAI_MODEL || 'gpt-3.5-turbo'),
            messages,
            maxTokens: 1000,
          });

          return result.toDataStreamResponse();
        } catch (error) {
          console.error('Chat API error:', error);
          return new Response('Internal Server Error', { status: 500 });
        }
      },
    },

    "/api/hello": {
      async GET(req) {
        return Response.json({
          message: "Hello, world!",
          method: "GET",
        });
      },
      async PUT(req) {
        return Response.json({
          message: "Hello, world!",
          method: "PUT",
        });
      },
    },

    "/api/hello/:name": async req => {
      const name = req.params.name;
      return Response.json({
        message: `Hello, ${name}!`,
      });
    },
  },

  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
