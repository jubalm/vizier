import React, { useState, useRef, useEffect } from "react"
import { useChat } from "ai/react"
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

// Mock chat data for sidebar (we'll keep this for multiple chat sessions)
const mockChats = [
  {
    id: 1,
    name: "General",
  },
  {
    id: 2,
    name: "Ideas",
  },
]

export function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [chats] = useState(mockChats)
  const [activeChatId, setActiveChatId] = useState(chats[0].id)
  const chatWindowRef = useRef<HTMLDivElement>(null)

  // Use the useChat hook for AI-powered chat
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    reload
  } = useChat({
    api: '/api/chat',
    onError: (error) => {
      console.error('Chat error:', error)
    },
  })

  const activeChat = chats.find((c) => c.id === activeChatId)

  useEffect(() => {
    // Auto-scroll to bottom on new message
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight
    }
  }, [messages])

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
          <ChatWindow
            messages={messages}
            chatWindowRef={chatWindowRef}
            isLoading={isLoading}
            error={error}
            onRetry={reload}
          />
          {/* Chat Input */}
          <ChatInput
            input={input}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
            error={error}
          />
        </div>
      </div>
    </SidebarProvider >
  )
}

export default App
