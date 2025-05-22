import { useChat } from '@ai-sdk/react'
import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Button from "@/components/Button"
import { ChatInput } from '@/components/ChatInput'
import { ChatMessages } from '@/components/ChatMessages'
import { ChatList } from './ChatSessionList'

export function ChatInterface() {
  const navigate = useNavigate()
  const { chatId } = useParams<{ chatId?: string }>()
  const [chatsKey, setChatsKey] = useState(0)
  const { messages, input, handleInputChange, status, stop, reload, setMessages, setInput } = useChat({ api: '/api/chat/message', })

  const isBusy = useMemo(() => status === 'submitted' || status === 'streaming', [status])

  // Custom submit handler to support new chat creation at root
  const sendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isBusy) {
      stop()
      return
    }
    if (!chatId) {
      // At root: create chat with first message as topic
      const topic = input.trim() || 'New Chat'
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ topic }),
      })
      if (res.ok) {
        const data = await res.json()
        navigate(`/chat/${data.chatId}`)
        setInput('')
        setChatsKey(k => k + 1)
      } else {
        alert('Failed to create chat')
      }
      return
    }
    // Existing chat: send message as usual
    const res = await fetch('/api/chat/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        chatId,
        messages: [
          ...messages,
          { role: 'user', content: input }
        ]
      })
    })
    if (res.ok) {
      setInput('')
      reload()
    } else {
      alert('Failed to send message')
    }
  }

  const handleSelectChat = (id: string) => {
    navigate(`/chat/${id}`)
  }

  return (
    <div className="h-full w-full py-4 grid grid-cols-[220px_1fr] gap-x-4">
      <aside className="border-r pr-2">
        <ChatList
          key={chatsKey}
          onSelect={handleSelectChat}
          selectedId={chatId}
        />
      </aside>
      <main className="grid grid-rows-[1fr_min-content] gap-y-2">
        {chatId ? (
          <>
            <div className="grid contain-size">
              <ChatMessages messages={messages} />
            </div>
            <form className="flex gap-2 items-end bg-muted-background/70 rounded px-2 py-2" onSubmit={sendChatMessage}>
              <ChatInput
                value={input}
                onChange={handleInputChange}
                isBusy={isBusy}
                maxLines={6}
              />
              <Button type="submit" isBusy={isBusy} className="bg-transparent shadow-none border-none p-0 h-8 w-8 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3.714 3.048a.498.498 0 0 0-.683.627l2.843 7.627a2 2 0 0 1 0 1.396l-2.842 7.627a.498.498 0 0 0 .682.627l18-8.5a.5.5 0 0 0 0-.904z" /><path d="M6 12h16" /></svg>
              </Button>
            </form>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <span className="text-lg font-semibold mb-2">How can I help you today?</span>
            <span className="text-sm">Type your message below to start a new chat.</span>
            <form className="flex gap-2 items-end bg-muted-background/70 rounded px-2 py-2 mt-4" onSubmit={sendChatMessage}>
              <ChatInput
                value={input}
                onChange={handleInputChange}
                isBusy={isBusy}
                maxLines={6}
              />
              <Button type="submit" isBusy={isBusy} className="bg-transparent shadow-none border-none p-0 h-8 w-8 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3.714 3.048a.498.498 0 0 0-.683.627l2.843 7.627a2 2 0 0 1 0 1.396l-2.842 7.627a.498.498 0 0 0 .682.627l18-8.5a.5.5 0 0 0 0-.904z" /><path d="M6 12h16" /></svg>
              </Button>
            </form>
          </div>
        )}
      </main>
    </div>
  )
}
