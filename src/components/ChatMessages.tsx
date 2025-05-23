import { useEffect, useRef, useState } from 'react'
import { type UIMessage } from "@ai-sdk/ui-utils"
import { markdownToHtml } from '@/lib/uiUtils'

type ChatMessagesProp = {
  messages: UIMessage[]
}

export const ChatMessages = ({ messages }: ChatMessagesProp) => {
  const prevMessagesLength = useRef(messages.length)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // If a new message was added, scroll to bottom
    if (containerRef.current && messages.length > prevMessagesLength.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'smooth' })
    }
    prevMessagesLength.current = messages.length
  }, [messages])

  return (
    <div
      ref={containerRef}
      className='overflow-auto h-full min-h-0 flex flex-col-reverse place-content-end gap-y-1'
    >
      {messages.slice().reverse().map((msg) => {
        switch (msg.role) {
          case 'user':
            return <UserMessage key={msg.id} content={msg.content} />
          case 'assistant':
            return <AssistantMessage key={msg.id} content={msg.content} />
          case 'system':
            if (msg.id === 'document-context') {
              return (
                <div key={msg.id} className="text-[oklch(from_var(--color-foreground)_calc(l_-_0.2)_c_h)] italic text-sm flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v4" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /><path d="M2 15h10" /><path d="m9 18 3-3-3-3" /></svg>
                  Added document context
                </div>
              )
            }
            return <div key={msg.id} className="text-muted-foreground text-sm">{msg.content}</div>
          case 'data':
            return <div key={msg.id} className="text-muted-foreground text-sm">{msg.content}</div>
          default:
            return null
        }
      })}
    </div>
  )
}

function UserMessage({ content }: { content: string }) {
  return (
    <div className="bg-white/5 text-gray-300 rounded-lg px-3 py-2 place-self-end max-w-[80%] text-sm">
      {content}
    </div>
  )
}

function AssistantMessage({ content }: { content: string }) {
  const [html, setHtml] = useState<string>("")
  useEffect(() => {
    let cancelled = false
    async function convertAndSetHtml() {
      const result = await markdownToHtml(content)
      if (!cancelled) setHtml(result)
    }
    convertAndSetHtml()
    return () => { cancelled = true }
  }, [content])
  return (
    <div
      className="text-foreground py-2 max-w-[90%] prose prose-sm"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
