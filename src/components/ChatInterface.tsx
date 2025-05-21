import { useChat } from '@ai-sdk/react'
import { useMemo } from 'react'
import Button from "@/components/Button"
import { ChatInput } from '@/components/ChatInput'
import { ChatMessages } from '@/components/ChatMessages'

export function ChatInterface() {
  const { messages, input, handleInputChange, handleSubmit, status, stop } = useChat({ api: '/api/chat', })

  const isBusy = useMemo(() => status === 'submitted' || status === 'streaming', [status])

  // Custom submit handler to support abort and inject document context
  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isBusy) {
      stop()
      return
    }

    handleSubmit(e)
  }

  return (
    <div className="h-full w-full py-4 grid grid-rows-[1fr_min-content] gap-y-2">
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
    </div>
  )
}
