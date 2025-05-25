import React, { useState, useRef, useEffect } from "react"
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageCircle, Menu, User, Bot } from "lucide-react"
import "./index.css"

// Mock chat data
const mockChats = [
  {
    id: 1,
    name: "General",
    messages: [
      { id: 1, sender: "user", content: "Hello!" },
      { id: 2, sender: "assistant", content: "Hi! How can I help you today?" },
    ],
  },
  {
    id: 2,
    name: "Ideas",
    messages: [
      { id: 1, sender: "user", content: "Brainstorm app ideas." },
      { id: 2, sender: "assistant", content: "How about a chat UI?" },
    ],
  },
]

export function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [chats, setChats] = useState(mockChats)
  const [activeChatId, setActiveChatId] = useState(chats[0].id)
  const [input, setInput] = useState("")
  const chatWindowRef = useRef<HTMLDivElement>(null)

  const activeChat = chats.find((c) => c.id === activeChatId)

  useEffect(() => {
    // Auto-scroll to bottom on new message
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight
    }
  }, [activeChat?.messages])

  function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim()) return
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === activeChatId
          ? {
            ...chat,
            messages: [
              ...chat.messages,
              { id: Date.now(), sender: "user", content: input },
              // Optionally, add a mock assistant reply
              { id: Date.now() + 1, sender: "assistant", content: "(Assistant reply)" },
            ],
          }
          : chat
      )
    )
    setInput("")
  }

  return (
    <SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen}>
      {/* Wrap children in a fragment to ensure only one child is passed */}
      <>
        <div className="flex h-screen bg-background">
          {/* Sidebar */}
          <Sidebar className="border-r">
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>Chats</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {chats.map((chat) => (
                      <SidebarMenuItem key={chat.id}>
                        <SidebarMenuButton
                          asChild
                          className={
                            activeChatId === chat.id
                              ? "bg-accent text-accent-foreground"
                              : ""
                          }
                        >
                          <button
                            onClick={() => setActiveChatId(chat.id)}
                            className="flex items-center gap-2 w-full text-left px-2 py-1.5 rounded"
                          >
                            <MessageCircle className="w-4 h-4" />
                            <span className="truncate">{chat.name}</span>
                          </button>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center border-b px-4 h-16 bg-card/80">
              <SidebarTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="mr-2 md:hidden"
                  aria-label="Toggle sidebar"
                >
                  <Menu className="w-5 h-5" />
                </Button>
              </SidebarTrigger>
              <h2 className="text-lg font-semibold">{activeChat?.name}</h2>
            </div>

            {/* Chat Window */}
            <div
              ref={chatWindowRef}
              className="flex-1 overflow-y-auto px-4 py-6 space-y-4 bg-background"
            >
              {activeChat?.messages.map((msg) => (
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

            {/* Chat Input */}
            <form
              onSubmit={handleSend}
              className="flex items-center gap-2 border-t bg-card/80 px-4 py-3"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1"
                autoFocus
              />
              <Button type="submit" disabled={!input.trim()}>
                Send
              </Button>
            </form>
          </div>
        </div>
      </>
    </SidebarProvider>
  )
}

export default App
