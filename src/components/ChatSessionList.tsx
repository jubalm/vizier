import { useEffect, useState } from 'react'

interface ChatSessionListProps {
  onSelect: (id: string) => void
  selectedId?: string
  onCreate: () => void
}

export function ChatSessionList({ onSelect, selectedId, onCreate }: ChatSessionListProps) {
  const [sessions, setSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    fetch('/api/chat/session', { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('Failed to load sessions')
        return res.json()
      })
      .then(setSessions)
      .catch(() => setError('Could not load chat sessions'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="p-2">Loading sessions...</div>
  if (error) return <div className="p-2 text-red-500">{error}</div>

  return (
    <div>
      <button
        className="w-full mb-2 py-1 px-2 rounded bg-primary text-loud-foreground font-semibold hover:bg-primary/80"
        onClick={onCreate}
      >
        + New Chat Session
      </button>
      {sessions.length === 0 ? (
        <div className="p-2 text-muted-foreground">No chat sessions yet.</div>
      ) : (
        <ul className="space-y-1">
          {sessions.map(s => (
            <li key={s.id}>
              <button
                className={`w-full text-left px-2 py-1 rounded ${selectedId === s.id ? 'bg-primary text-loud-foreground' : 'hover:bg-muted-background'}`}
                onClick={() => onSelect(s.id)}
              >
                {s.name || 'Untitled'} <span className="text-xs text-muted-foreground">{new Date(s.created_at).toLocaleString()}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
