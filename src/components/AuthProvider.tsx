import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface AuthContextType {
  isAuthenticated: boolean
  setIsAuthenticated: (v: boolean) => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({ isAuthenticated: false, setIsAuthenticated: () => {}, loading: true })

export function useAuth() {
  return useContext(AuthContext)
}

async function checkSession() {
  try {
    const res = await fetch('/api/auth/session', { method: 'GET', credentials: 'include' })
    return res.ok
  } catch {
    return false
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkSession().then(ok => {
      setIsAuthenticated(ok)
      setLoading(false)
    })
  }, [])

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
