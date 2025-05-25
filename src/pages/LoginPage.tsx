import React, { useState } from "react"
import { useAuth } from "../components/AuthProvider"
import { useNavigate, Link } from "react-router-dom"

export default function LoginPage() {
  const { login, error, loading } = useAuth()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [formError, setFormError] = useState<string | null>(null)
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)
    const ok = await login(username, password)
    if (ok) {
      navigate("/chat")
    } else {
      setFormError(error || "Login failed")
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      <form className="flex flex-col gap-2 w-80 max-w-full" onSubmit={handleSubmit}>
        <input className="border rounded px-3 py-2" type="text" placeholder="Username" name="username" value={username} onChange={e => setUsername(e.target.value)} autoFocus />
        <input className="border rounded px-3 py-2" type="password" placeholder="Password" name="password" value={password} onChange={e => setPassword(e.target.value)} />
        <button className="bg-blue-600 text-white rounded px-3 py-2 mt-2" type="submit" disabled={loading}>{loading ? "Logging in..." : "Login"}</button>
        {formError && <div className="text-red-600 text-sm mt-1">{formError}</div>}
      </form>
      <div className="mt-4 text-sm">
        Don't have an account? <Link to="/register" className="text-blue-600 underline">Register</Link>
      </div>
    </div>
  )
}
