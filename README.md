# bun-react-tailwind-shadcn-template

To install dependencies:

```bash
bun install
```

To start a development server:

```bash
bun dev
```

To run for production:

```bash
bun start
```

This project was created using `bun init` in bun v1.2.13. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

# Vizier Chat UI

A modern chat interface built with React, TypeScript, and Vercel AI SDK.

## Features

- 🤖 **AI-Powered Chat**: Integrates with OpenAI and OpenAI-compatible APIs
- 🎨 **Modern UI**: Built with shadcn/ui components and Tailwind CSS
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile
- 🔄 **Real-time Streaming**: Supports streaming responses from AI models
- 🌙 **Dark Mode**: Default dark theme for comfortable viewing
- 📁 **Multiple Chats**: Sidebar with chat history and session management

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
