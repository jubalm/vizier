import { type RefObject } from "react"
import { User, Bot, AlertCircle, RefreshCw } from "lucide-react"
import type { Message } from "ai"
import { ChatMessageContent } from "./ChatMessageContent" // Import the new component

export function ChatWindow({
  messages,
  chatWindowRef,
  isLoading,
  error,
  onRetry
}: {
  messages: Message[],
  chatWindowRef: RefObject<HTMLDivElement>,
  isLoading?: boolean,
  error?: Error | null,
  onRetry?: () => void
}) {
  return (
    <div
      ref={chatWindowRef}
      className="flex-1 overflow-y-auto px-4 py-6 space-y-4 bg-background"
    >
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`max-w-2xl px-4 py-2 rounded-lg shadow-sm text-sm ${message.role === "user"
              ? "bg-primary text-primary-foreground"
              : "text-foreground"
              }`}
          >
            <span className="inline-flex items-start gap-1"> {/* Changed to items-start for better alignment with multiline content */}
              {message.role === "user" ? <User className="w-4 h-4 flex-shrink-0 mt-0.5" /> : <Bot className="w-4 h-4 flex-shrink-0 mt-0.5" />}
              <div className="whitespace-pre-line"> {/* Added a div wrapper for content to ensure pre-line applies correctly to markdown output */}
                <ChatMessageContent message={message} /> {/* Use the new component here */}
              </div>
            </span>
          </div>
        </div>
      ))}
      {isLoading && (
        <div className="flex justify-start">
          <div className="max-w-xs px-4 py-2 rounded-lg shadow text-sm bg-muted text-foreground">
            <span className="inline-flex items-center gap-1">
              <Bot className="w-4 h-4" />
              <span className="animate-pulse">Thinking...</span>
            </span>
          </div>
        </div>
      )}
      {error && (
        <div className="flex justify-start">
          <div className="max-w-md px-4 py-3 rounded-lg shadow text-sm bg-destructive/10 border border-destructive/20">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-destructive font-medium mb-1">An error occurred</p>
                <p className="text-destructive/80 text-xs mb-2">
                  {error.message || 'Failed to get response from AI. Please try again.'}
                </p>
                {onRetry && (
                  <button
                    onClick={onRetry}
                    className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-destructive text-destructive-foreground rounded hover:bg-destructive/90 transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Retry
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
