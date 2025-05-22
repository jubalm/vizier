import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { ChatInterface } from '@/components/ChatInterface'
import { LoginForm } from '@/components/LoginForm'
import { RegistrationForm } from '@/components/RegistrationForm'
import '../index.css'

function LoginPage() {
  const navigate = useNavigate()
  return (
    <LoginForm
      onLoggedIn={() => navigate('/')}
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

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/*" element={
          <div className='h-screen bg-background text-foreground px-4'>
            <ChatInterface />
          </div>
        } />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
