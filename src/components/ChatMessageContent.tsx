import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Message } from 'ai' // Import Message type from 'ai'

// Removed local Message interface definition

interface ChatMessageContentProps {
  message: Message // Use imported Message type
}

export function ChatMessageContent({ message }: ChatMessageContentProps) {
  if (message.role === 'assistant') {
    // Ensure content is a string before passing to ReactMarkdown
    if (typeof message.content === 'string') {
      return <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
    }
    // Handle cases where assistant content might not be a simple string (e.g., structured data)
    // For now, we'll just render it as a stringified JSON or a placeholder
    return <pre>{JSON.stringify(message.content, null, 2)}</pre>
  } else if (message.role === 'user') {
    // User messages are typically plain text
    return <>{message.content}</>
  }

  // Fallback for other roles or unexpected content, though current setup primarily uses user/assistant
  return <>{typeof message.content === 'string' ? message.content : JSON.stringify(message.content)}</>
}
