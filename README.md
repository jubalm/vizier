# Vizier Chat UI

A modern chat interface built with React, TypeScript, and Vercel AI SDK.

## Features

- 🤖 **AI-Powered Chat**: Integrates with OpenAI and OpenAI-compatible APIs
- 🎨 **Modern UI**: Built with shadcn/ui components and Tailwind CSS
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile
- 🔄 **Real-time Streaming**: Supports streaming responses from AI models
- 🌙 **Dark Mode**: Default dark theme for comfortable viewing
- 📁 **Multiple Chats**: Sidebar with chat history and session management
- 🛡️ **Error Handling**: Comprehensive error handling with user-friendly messages and retry functionality

## Project Structure & Organization

This project is organized by service/domain for maintainability and scalability.

### Directory Structure

```
src/
  services/
    auth/
      db.ts              # Auth/session/user DB (auth.sqlite)
      model.ts           # User/session types/interfaces
      logic.ts           # createUser, verifyPassword, etc.
      routes.ts          # Hono routes for /api/auth/*
      middleware.ts      # sessionAuth, etc.
      tests/
        integration.test.ts
    chat/
      db.ts              # Chat/memory DB (memory.sqlite)
      model.ts           # Chat session/message types
      logic.ts           # Chat session/message logic
      routes.ts          # Hono routes for /api/chat/*
      tests/
        integration.test.ts
  components/
    AuthProvider.tsx
    UserMenu.tsx
    ChatWindow.tsx
    ...etc
  pages/
    LoginPage.tsx
    RegisterPage.tsx
    ChatPage.tsx
  hooks/
    use-mobile.ts
  utils/
    errors.ts
    ...etc
  config.ts
  index.tsx
```

- **Auth Service:** Handles user registration, login, session management, and authentication middleware.
- **Chat Service:** Handles chat session/message storage, chat logic, and chat API routes.
- **Shared Utilities:** Common helpers and error handling in `src/utils/`.
- **UI Components:** All React components in `src/components/`.

### Database Organization

- `auth.sqlite` (used by `services/auth/db.ts`): user, session tables.
- `memory.sqlite` (to be created, used by `services/chat/db.ts`): chat_session, chat_message tables.

### Development & Migration Notes

- All service logic and API routes are colocated by domain for easier scaling and maintenance.
- To reset the local auth database, delete `src/services/auth/auth.sqlite` and restart the server.
- Local SQLite files are ignored by git and safe to delete/recreate.

### Next Steps

- Implement chat history/memory features in `services/chat/`.
- Add more integration tests and improve error handling.
- See `REORGANIZATION_PLAN.md` for migration details and checklist.

---

## Setup

### 1. Install Dependencies

```bash
bun install
```

### 2. Environment Configuration

Copy the example environment file and configure your API keys:

```bash
cp .env.example .env
```

Edit `.env` with your OpenAI API key:

```env
OPENAI_API_KEY=your-openai-api-key-here
OPENAI_MODEL=gpt-3.5-turbo
```

#### Custom OpenAI-Compatible Endpoints

The app supports custom base URLs for OpenAI-compatible APIs:

```env
# For local models (e.g., Ollama)
OPENAI_BASE_URL=http://localhost:11434/v1

# For Azure OpenAI
OPENAI_BASE_URL=https://your-resource.openai.azure.com

# For other OpenAI-compatible services
OPENAI_BASE_URL=https://api.your-service.com/v1
```

### 3. Start Development Server

```bash
bun dev
```

### 4. Open in Browser

Visit [http://localhost:3000](http://localhost:3000) in your browser to see the app in action.

## Production Deployment

### 1. Build for Production

```bash
bun build
```

## Error Handling

The application includes comprehensive error handling to provide a smooth user experience:

### Backend Error Handling

- **Configuration Validation**: Validates API keys and configuration before processing requests
- **Custom Error Messages**: Provides specific, user-friendly error messages for different scenarios
- **Request Validation**: Ensures proper request format and message structure
- **Stream Error Integration**: Integrates error handling with AI SDK streaming responses

### Frontend Error Handling

- **Visual Error Display**: Shows clear error messages in the chat interface
- **Retry Functionality**: Users can easily retry failed requests with a single click
- **Input State Management**: Disables input during error states to prevent confusion
- **Non-blocking UI**: Chat interface remains responsive even during errors

### Common Error Scenarios

- **Missing API Key**: Clear message about configuration requirements
- **Rate Limiting**: Helpful guidance when API limits are exceeded
- **Network Issues**: Retry options for temporary connectivity problems
- **Invalid Requests**: Specific feedback about request format issues

### 2. Start Production Server

```bash
bun start
```

## Troubleshooting

- If you encounter issues, ensure your dependencies are up-to-date and compatible.
- Check the browser console and server logs for error messages.
- For environment variable issues, ensure your `.env` file is correctly configured.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
