// ChatList: Sidebar component for listing and selecting chats
import { useEffect, useState } from 'react'

interface ChatListProps {
  onSelect: (id: string) => void
  selectedId?: string
}

export function ChatList({ onSelect, selectedId }: ChatListProps) {
  const [chats, setChats] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    fetch('/api/chat', { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('Failed to load chats')
        return res.json()
      })
      .then(setChats)
      .catch(() => setError('Could not load chats'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="p-2">Loading chats...</div>
  if (error) return <div className="p-2 text-red-500">{error}</div>

  return (
    <div>
      {chats.length === 0 ? (
        <div className="p-2 text-muted-foreground">No chats yet.</div>
      ) : (
        <ul className="space-y-1">
          {chats.map(c => (
            <li key={c.id}>
              <button
                className={`w-full text-left px-2 py-1 rounded ${selectedId === c.id ? 'bg-primary text-loud-foreground' : 'hover:bg-muted-background'}`}
                onClick={() => onSelect(c.id)}
              >
                {c.topic || 'Untitled'} <span className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleString()}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
