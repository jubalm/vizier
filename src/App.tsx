import React, { useState, useRef, useEffect } from "react"
import {
  SidebarProvider,
  Sidebar,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Menu } from "lucide-react"
import "./index.css"
import { ChatList } from "@/components/ChatList"
import { ChatWindow } from "@/components/ChatWindow"
import { ChatInput } from "@/components/ChatInput"
import { UserMenu } from "@/components/UserMenu"

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
      <div className="flex h-screen w-screen bg-background">
        <Sidebar className="border-r">
          <ChatList
            chats={chats.map(({ id, name }) => ({ id, name }))}
            activeChatId={activeChatId}
            setActiveChatId={setActiveChatId}
          />
          <UserMenu />
        </Sidebar>
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col h-full min-w-0">
          {/* Header */}
          <div className="flex items-center border-b px-4 h-16 bg-card/80">
            <SidebarTrigger>
              <Menu className="w-5 h-5" />
            </SidebarTrigger>
            <h2 className="text-lg font-semibold">{activeChat?.name}</h2>
          </div>
          {/* Chat Window */}
          <ChatWindow messages={activeChat?.messages ?? []} chatWindowRef={chatWindowRef} />
          {/* Chat Input */}
          <ChatInput input={input} setInput={setInput} handleSend={handleSend} />
        </div>
      </div>
    </SidebarProvider >
  )
}

export default App
