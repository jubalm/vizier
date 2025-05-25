import { type RefObject } from "react"
import { User, Bot } from "lucide-react"

export function ChatWindow({ messages, chatWindowRef }: {
  messages: Array<{ id: number, sender: string, content: string }>,
  chatWindowRef: RefObject<HTMLDivElement>
}) {
  return (
    <div
      ref={chatWindowRef}
      className="flex-1 overflow-y-auto px-4 py-6 space-y-4 bg-background"
    >
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`max-w-xs px-4 py-2 rounded-lg shadow text-sm whitespace-pre-line ${msg.sender === "user"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-foreground"
              }`}
          >
            <span className="inline-flex items-center gap-1">
              {msg.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              {msg.content}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
