import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { LoginForm } from '@/components/auth/LoginForm'
import { RegisterForm } from '@/components/auth/RegisterForm'
import Header from '@/components/layout/Header'

function HomePage() {
  const location = useLocation()
  const [isLogin, setIsLogin] = useState(
    location.state?.isLogin !== undefined ? location.state.isLogin : true
  )
  const navigate = useNavigate()

  // Update isLogin when location state changes
  useEffect(() => {
    if (location.state?.isLogin !== undefined) {
      setIsLogin(location.state.isLogin)
      // Clear the state to prevent it from persisting on refresh
      navigate('/', { replace: true, state: {} })
    }
  }, [location.state, navigate])

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      navigate('/dashboard')
    }
  }, [navigate])

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <Header />
      
      {/* Main content */}
      <div className="flex-grow flex justify-center items-center bg-background p-4">
        <div className="w-full max-w-md">
          {isLogin ? (
            <LoginForm onSwitchToRegister={() => setIsLogin(false)} />
          ) : (
            <RegisterForm onSwitchToLogin={() => setIsLogin(true)} />
          )}
        </div>
      </div>
    </div>
  )
}

export default HomePage