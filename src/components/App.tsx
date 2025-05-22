import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { ChatInterface } from '@/components/ChatInterface'
import { LoginForm } from '@/components/LoginForm'
import { RegistrationForm } from '@/components/RegistrationForm'
import '../index.css'
import { useEffect, useState, createContext, useContext } from 'react'

// Auth context for global state
const AuthContext = createContext<{ authed: boolean, setAuthed: (v: boolean) => void }>({ authed: false, setAuthed: () => {} })

function useAuth() {
  return useContext(AuthContext)
}

// Check session on app load
async function checkSession() {
  try {
    const res = await fetch('/api/auth/session', { method: 'GET', credentials: 'include' })
    return res.ok
  } catch {
    return false
  }
}

const App = () => {
  const [authed, setAuthed] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkSession().then(ok => {
      setAuthed(ok)
      setLoading(false)
    })
  }, [])

  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>

  return (
    <AuthContext.Provider value={{ authed, setAuthed }}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/chat/:chatId" element={
            authed ? (
              <div className='h-screen bg-background text-foreground px-4'>
                <ChatInterface />
                <LogoutButton />
              </div>
            ) : (
              <Navigate to="/login" replace />
            )
          } />
          <Route path="/chat" element={
            authed ? (
              <div className='h-screen bg-background text-foreground px-4'>
                <ChatInterface />
                <LogoutButton />
              </div>
            ) : (
              <Navigate to="/login" replace />
            )
          } />
          <Route path="/*" element={<Navigate to="/chat" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  )
}

function LogoutButton() {
  const { setAuthed } = useAuth()
  const navigate = useNavigate()
  const logout = () => {
    document.cookie = 'sessionId=; Path=/; Max-Age=0;'
    setAuthed(false)
    navigate('/login')
  }
  return <button className="absolute top-2 right-2 px-3 py-1 bg-gray-700 text-white rounded" onClick={logout}>Logout</button>
}

function LoginPage() {
  const { setAuthed } = useAuth()
  const navigate = useNavigate()
  return (
    <LoginForm
      onLoggedIn={() => { setAuthed(true); navigate('/') }}
      switchToRegister={() => navigate('/register')}
    />
  )
}

function RegisterPage() {
  const navigate = useNavigate()
  return (
    <RegistrationForm
      onRegistered={() => navigate('/login')}
      switchToLogin={() => navigate('/login')}
    />
  )
}

export default App
