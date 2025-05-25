import React from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function ChatInput({ input, setInput, handleSend }: {
  input: string,
  setInput: (val: string) => void,
  handleSend: (e: React.FormEvent) => void
}) {
  return (
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
  )
}
