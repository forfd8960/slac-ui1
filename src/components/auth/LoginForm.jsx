import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, LockKeyhole, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'

export function LoginForm({ onSwitchToRegister }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!username || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      })
      return
    }
    
    setIsLoading(true)
    
    try {
      // Send request to the updated login endpoint
      const response = await fetch('http://localhost:6869/api/v1/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })
      
      if (!response.ok) {
        throw new Error('Login failed')
      }
      
      // Extract data from response
      const data = await response.json()
      const { user, token } = data
      
      if (!user) {
        throw new Error('Invalid user data received')
      }
      
      // Store JWT token in localStorage if available
      if (token) {
        localStorage.setItem('jwt', token)
        // Also store as jwtToken to be consistent with ChatPage check
        localStorage.setItem('jwtToken', token)
      }
      
      // Store user object directly in localStorage
      localStorage.setItem('user', JSON.stringify(user))
      // Also store as userData to be consistent with ChatPage check
      localStorage.setItem('userData', JSON.stringify({
        name: user.username,
        id: user.id,
        avatar: user.avatar_url,
        displayName: user.display_name
      }))
      
      toast({
        title: "Success",
        description: "You have successfully logged in",
      })
      
      // Navigate to chat page after login instead of dashboard
      navigate('/chat')
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Invalid username or password",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight">Welcome back</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in to your account to continue
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="relative">
              <LockKeyhole className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            <div className="flex items-center justify-end">
              <button
                type="button"
                className="text-sm text-primary hover:underline"
                onClick={() => toast({
                  title: "Password Reset",
                  description: "This feature would be implemented in a real app"
                })}
              >
                Forgot password?
              </button>
            </div>
          </div>
        </div>
        
        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? "Signing in..." : "Sign in"}
        </Button>
      </form>
      
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Don't have an account?{" "}
          <button 
            onClick={onSwitchToRegister}
            className="text-primary hover:underline"
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  )
}