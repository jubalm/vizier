import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { ChatInterface } from '@/components/ChatInterface'
import { LoginForm } from '@/components/LoginForm'
import { RegistrationForm } from '@/components/RegistrationForm'
import '../index.css'
import { AuthProvider, useAuth } from './AuthProvider'

// Protected route for chat, handles auth and loading state
function ProtectedChatRoute() {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>
  return isAuthenticated ? (
    <div className='h-screen bg-background text-foreground px-4'>
      <ChatInterface />
      <LogoutButton />
    </div>
  ) : (
    <Navigate to="/login" replace />
  )
}

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/chat/:chatId" element={<ProtectedChatRoute />} />
          <Route path="/chat" element={<ProtectedChatRoute />} />
          <Route path="/*" element={<Navigate to="/chat" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

function LogoutButton() {
  const { setIsAuthenticated } = useAuth()
  const navigate = useNavigate()
  const logout = () => {
    document.cookie = 'sessionId=; Path=/; Max-Age=0;'
    setIsAuthenticated(false)
    navigate('/login')
  }
  return <button className="absolute top-2 right-2 px-3 py-1 bg-gray-700 text-white rounded" onClick={logout}>Logout</button>
}

function LoginPage() {
  const { setIsAuthenticated } = useAuth()
  const navigate = useNavigate()
  return (
    <LoginForm
      onLoggedIn={() => { setIsAuthenticated(true); navigate('/') }}
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
