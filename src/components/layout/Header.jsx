import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { 
  LogOut, 
  Settings, 
  User, 
  Bell,
  MessageSquare
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import UserProfile from '@/components/profile/UserProfile'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

function Header() {
  const [userData, setUserData] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        setUserData(JSON.parse(storedUser))
      }
    } catch (error) {
      console.error('Error retrieving user data:', error)
    }
  }, [])

  // This effect refreshes userData when localStorage changes 
  // (useful for when avatar gets updated in another component)
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
          setUserData(JSON.parse(storedUser))
        }
      } catch (error) {
        console.error('Error retrieving user data:', error)
      }
    }

    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('jwt')
    localStorage.removeItem('jwtToken')
    
    toast({
      title: "Logged out",
      description: "You have been successfully logged out"
    })
    
    navigate('/')
  }

  // Handle profile button click
  const handleProfileClick = () => {
    navigate('/dashboard')
  }

  // Handle chat button click
  const handleChatClick = () => {
    navigate('/chat')
  }

  // Handle login button click
  const handleLoginClick = () => {
    navigate('/', { state: { isLogin: true } })
  }

  // Handle sign up button click
  const handleSignUpClick = () => {
    navigate('/', { state: { isLogin: false } })
  }

  return (
    <header className="bg-card border-b shadow-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to={userData ? '/dashboard' : '/'} className="text-xl font-bold">
          Real Time App - Slac
        </Link>
        
        {userData ? (
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={handleChatClick} title="Chat">
              <MessageSquare className="h-5 w-5" />
            </Button>
            
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-1">
                  <UserProfile showName={false} size="sm" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <UserProfile className="px-2 py-2" />
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleProfileClick}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleChatClick}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  <span>Chat</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <div>
            <Button variant="ghost" className="mr-2" onClick={handleLoginClick}>
              Login
            </Button>
            <Button onClick={handleSignUpClick}>
              Sign Up
            </Button>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header