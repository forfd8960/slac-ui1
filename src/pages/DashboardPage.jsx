import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '@/hooks/use-toast'
import UserProfile from '@/components/profile/UserProfile'
import Header from '@/components/layout/Header'

function DashboardPage() {
  const [userData, setUserData] = useState(null)
  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    // Check if user is logged in by verifying JWT token exists
    const token = localStorage.getItem('jwt')
    const storedUser = localStorage.getItem('user')
    
    if (!token || !storedUser) {
      toast({
        title: "Authentication Error",
        description: "Please login to access the dashboard",
        variant: "destructive"
      })
      navigate('/')
      return
    }
    
    try {
      setUserData(JSON.parse(storedUser))
    } catch (error) {
      // If parsing fails, redirect to login
      localStorage.removeItem('user')
      localStorage.removeItem('jwt')
      navigate('/')
    }
  }, [navigate, toast])

  // Handle avatar change
  const handleAvatarChange = (newAvatarUrl, updatedUser) => {
    setUserData(updatedUser)
    // In a real application, you would make an API call to update the user profile
  }

  if (!userData) {
    return null // Will redirect in the useEffect
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Using the Header component that includes UserProfile */}
      <Header />

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        <div className="bg-card border rounded-lg p-6 shadow-sm">
          {/* Using the UserProfile component in the dashboard */}
          <div className="mb-6">
            <h2 className="text-xl font-medium mb-4">Welcome to Your Dashboard</h2>
            <div className="bg-primary/5 p-6 rounded-lg">
              <h3 className="text-lg font-medium mb-3">Your Profile</h3>
              <UserProfile 
                userData={userData}
                size="lg"
                className="mb-2"
                allowUpload={true}
                onAvatarChange={handleAvatarChange}
              />
              <p className="text-muted-foreground mt-4">
                You can now upload and change your profile picture by clicking the upload button.
                Your avatar will be saved with your user profile.
              </p>
            </div>
          </div>

          <div className="border-t pt-6 mt-6">
            <h3 className="text-lg font-medium mb-4">Your Dashboard</h3>
            <p className="text-muted-foreground mb-4">
              This is a simple dashboard example. In a real application, you would see your 
              personalized content and analytics here.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { title: "Projects", count: 0, color: "bg-blue-100 text-blue-700" },
                { title: "Tasks", count: 0, color: "bg-green-100 text-green-700" },
                { title: "Messages", count: 0, color: "bg-purple-100 text-purple-700" }
              ].map((item, i) => (
                <div key={i} className="bg-card border rounded-md p-4">
                  <div className={`inline-flex items-center justify-center rounded-md p-2 ${item.color}`}>
                    <span className="font-medium">{item.count}</span>
                  </div>
                  <h4 className="mt-2 font-medium">{item.title}</h4>
                  <p className="text-sm text-muted-foreground">No active {item.title.toLowerCase()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default DashboardPage