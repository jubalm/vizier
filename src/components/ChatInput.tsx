import React from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function ChatInput({ 
  input, 
  handleInputChange, 
  handleSubmit, 
  isLoading, 
  error 
}: {
  input: string,
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
  handleSubmit: (e: React.FormEvent) => void,
  isLoading: boolean,
  error?: Error | null
}) {
  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 border-t bg-card/80 px-4 py-3"
    >
      <Input
        value={input}
        onChange={handleInputChange}
        placeholder="Type your message..."
        className="flex-1"
        autoFocus
        disabled={isLoading || !!error}
      />
      <Button type="submit" disabled={!input.trim() || isLoading || !!error}>
        {isLoading ? "Sending..." : "Send"}
      </Button>
    </form>
  )
}
