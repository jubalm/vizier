import React, { useRef, useState } from 'react'

interface LoginFormProps {
  onLoggedIn: (session: { sessionId: string; userId: string; expires_at: string }) => void
  switchToRegister: () => void
}

export function LoginForm({ onLoggedIn, switchToRegister }: LoginFormProps) {
  const formRef = useRef<HTMLFormElement>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const form = formRef.current
    if (!form) return
    const formData = new FormData(form)
    const username = formData.get('username') as string
    const password = formData.get('password') as string
    try {
      const res = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error || 'Login failed')
        setLoading(false)
        return
      }
      const data = await res.json()
      onLoggedIn(data)
    } catch (err) {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form ref={formRef} className="space-y-4 max-w-sm mx-auto" onSubmit={handleSubmit} autoComplete="off">
      <h2 className="text-xl font-bold">Login</h2>
      <input
        className="w-full p-2 border rounded"
        name="username"
        placeholder="Username"
        required
      />
      <input
        className="w-full p-2 border rounded"
        name="password"
        placeholder="Password"
        type="password"
        required
      />
      {error && <div className="text-red-500">{error}</div>}
      <button className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50" type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
      <div className="text-sm text-center">
        No account?{' '}
        <button type="button" className="underline" onClick={switchToRegister}>Register</button>
      </div>
    </form>
  )
}
