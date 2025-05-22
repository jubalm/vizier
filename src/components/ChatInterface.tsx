import { useChat } from '@ai-sdk/react'
import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Button from "@/components/Button"
import { ChatInput } from '@/components/ChatInput'
import { ChatMessages } from '@/components/ChatMessages'
import { ChatSessionList } from './ChatSessionList'

export function ChatInterface() {
  const navigate = useNavigate()
  const { sessionId } = useParams<{ sessionId?: string }>()
  const [sessionsKey, setSessionsKey] = useState(0)
  const { messages, input, handleInputChange, status, stop, reload, setMessages, setInput } = useChat({ api: '/api/chat', })

  const isBusy = useMemo(() => status === 'submitted' || status === 'streaming', [status])

  // Custom submit handler to support abort and inject chat_session_id
  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isBusy || !sessionId) {
      stop()
      return
    }
    // Manually POST to /api/chat with chat_session_id
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        chat_session_id: sessionId,
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

  const handleCreateSession = async () => {
    const name = prompt('Enter a name for the new chat session:') || ''
    const res = await fetch('/api/chat/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name }),
    })
    if (res.ok) {
      const data = await res.json()
      navigate(`/chat/${data.chatSessionId}`)
      setSessionsKey(k => k + 1)
    } else {
      alert('Failed to create chat session')
    }
  }

  const handleSelectSession = (id: string) => {
    navigate(`/chat/${id}`)
  }

  return (
    <div className="h-full w-full py-4 grid grid-cols-[220px_1fr] gap-x-4">
      <aside className="border-r pr-2">
        <ChatSessionList
          key={sessionsKey}
          onSelect={handleSelectSession}
          selectedId={sessionId}
          onCreate={handleCreateSession}
        />
      </aside>
      <main className="grid grid-rows-[1fr_min-content] gap-y-2">
        {sessionId ? (
          <>
            <div className="grid contain-size">
              <ChatMessages messages={messages} />
            </div>
            <form className="flex gap-2 items-end bg-muted-background/70 rounded px-2 py-2" onSubmit={handleCustomSubmit}>
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
            <span className="text-lg font-semibold mb-2">Select a chat session to begin</span>
            <span className="text-sm">Or create a new session from the sidebar.</span>
            <button
              className="mt-4 px-4 py-2 rounded bg-primary text-loud-foreground font-semibold hover:bg-primary/80"
              onClick={handleCreateSession}
            >
              + New Chat Session
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
