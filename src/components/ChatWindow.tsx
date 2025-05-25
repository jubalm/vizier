import { type RefObject } from "react"
import { User, Bot } from "lucide-react"
import type { Message } from "ai"

export function ChatWindow({ messages, chatWindowRef, isLoading }: {
  messages: Message[],
  chatWindowRef: RefObject<HTMLDivElement>,
  isLoading?: boolean
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
            className={`max-w-xs px-4 py-2 rounded-lg shadow text-sm whitespace-pre-line ${message.role === "user"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-foreground"
              }`}
          >
            <span className="inline-flex items-center gap-1">
              {message.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              {message.content}
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
    </div>
  )
}
