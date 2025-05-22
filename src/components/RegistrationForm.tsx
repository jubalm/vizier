import React, { useRef, useState } from 'react'

interface RegistrationFormProps {
  onRegistered: (user: { username: string; email: string }) => void
  switchToLogin: () => void
}

export function RegistrationForm({ onRegistered, switchToLogin }: RegistrationFormProps) {
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
    const email = formData.get('email') as string
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error || 'Registration failed')
        setLoading(false)
        return
      }
      const data = await res.json()
      onRegistered(data)
    } catch (err) {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form ref={formRef} className="space-y-4 max-w-sm mx-auto" onSubmit={handleSubmit} autoComplete="off">
      <h2 className="text-xl font-bold">Register</h2>
      <input
        className="w-full p-2 border rounded"
        name="username"
        placeholder="Username"
        required
      />
      <input
        className="w-full p-2 border rounded"
        name="email"
        placeholder="Email"
        type="email"
        required
      />
      {error && <div className="text-red-500">{error}</div>}
      <button className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50" type="submit" disabled={loading}>
        {loading ? 'Registering...' : 'Register'}
      </button>
      <div className="text-sm text-center">
        Already have an account?{' '}
        <button type="button" className="underline" onClick={switchToLogin}>Login</button>
      </div>
    </form>
  )
}
