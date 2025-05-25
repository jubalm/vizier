import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

interface User {
  id: string
  username: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  login: (username: string, password: string) => Promise<boolean>
  register: (username: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  checkSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Check session on mount
  useEffect(() => {
    checkSession()
    // eslint-disable-next-line
  }, [])

  async function checkSession() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/auth/session", { credentials: "include" })
      if (res.status === 200) {
        const data = await res.json()
        setUser(data.user)
      } else {
        setUser(null)
      }
    } catch (e) {
      setError("Failed to check session")
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  async function login(username: string, password: string) {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      })
      if (res.status === 200) {
        await checkSession()
        return true
      } else {
        const data = await res.json()
        setError(data.error || "Login failed")
        setUser(null)
        return false
      }
    } catch (e) {
      setError("Login failed")
      setUser(null)
      return false
    } finally {
      setLoading(false)
    }
  }

  async function register(username: string, password: string) {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      })
      if (res.status === 200) {
        await checkSession()
        return true
      } else {
        const data = await res.json()
        setError(data.error || "Registration failed")
        setUser(null)
        return false
      }
    } catch (e) {
      setError("Registration failed")
      setUser(null)
      return false
    } finally {
      setLoading(false)
    }
  }

  async function logout() {
    setLoading(true)
    setError(null)
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      })
      setUser(null)
    } catch (e) {
      setError("Logout failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, checkSession }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
