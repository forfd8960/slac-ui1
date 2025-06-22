import { useState, useEffect, useRef } from 'react'
import { User, Upload, X } from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

/**
 * UserProfile component displays user information with avatar
 * @param {Object} props - Component props
 * @param {string} props.className - Optional additional CSS classes
 * @param {string} props.size - Size variant ('sm', 'md', 'lg')
 * @param {boolean} props.showName - Whether to display the user's name
 * @param {Object} props.userData - User data object (optional)
 * @param {string} props.avatarUrl - Custom avatar URL (optional)
 * @param {boolean} props.allowUpload - Allow avatar upload (default: false)
 * @param {Function} props.onAvatarChange - Callback when avatar changes (optional)
 */
function UserProfile({
  className,
  size = 'md',
  showName = true,
  userData,
  avatarUrl: propsAvatarUrl,
  allowUpload = false,
  onAvatarChange,
}) {
  const [user, setUser] = useState(null)
  const [avatarUrl, setAvatarUrl] = useState(propsAvatarUrl)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef(null)
  const { toast } = useToast()

  // Size classes for avatar
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-16 w-16',
  }

  // Size classes for upload button
  const uploadSizeClasses = {
    sm: 'text-xs',
    md: 'text-xs',
    lg: 'text-sm',
  }

  useEffect(() => {
    // If userData is provided directly, use it
    if (userData) {
      setUser(userData)
      
      // If user has an avatar URL, use it
      if (userData.avatar_url && !avatarUrl) {
        setAvatarUrl(userData.avatar_url)
      }
      return
    }
    
    // Otherwise retrieve from localStorage
    try {
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser)
        setUser(parsedUser)
        
        // If user has an avatar URL, use it
        if (parsedUser.avatar_url && !avatarUrl) {
          setAvatarUrl(parsedUser.avatar_url)
        }
      }
    } catch (error) {
      console.error('Error retrieving user data:', error)
    }
  }, [userData, avatarUrl])

  // Update avatar URL when prop changes
  useEffect(() => {
    if (propsAvatarUrl) {
      setAvatarUrl(propsAvatarUrl)
    }
  }, [propsAvatarUrl])

  if (!user) {
    return null
  }

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (user.display_name) {
      return user.display_name.substring(0, 2).toUpperCase()
    }
    
    if (user.username) {
      const nameParts = user.username.split('_')
      if (nameParts.length >= 2) {
        return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
      }
      return user.username[0].toUpperCase()
    }
    
    return 'U'
  }

  // Get user display name
  const getDisplayName = () => {
    if (user.display_name) {
      return user.display_name
    }
    
    if (user.username) {
      return user.username
    }
    
    return 'User'
  }

  // Handle file selection for avatar upload
  const handleFileChange = (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive"
      })
      return
    }

    // Check file size (max 2MB)
    const maxSize = 2 * 1024 * 1024 // 2MB
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 2MB",
        variant: "destructive"
      })
      return
    }

    setIsUploading(true)

    // Create a URL for the file
    const fileUrl = URL.createObjectURL(file)
    setAvatarUrl(fileUrl)

    // In a real application, you would upload the file to a server here
    // For this example, we'll simulate a server call with a timeout
    setTimeout(() => {
      // Update local storage with the new avatar URL
      try {
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser)
          parsedUser.avatar_url = fileUrl
          localStorage.setItem('user', JSON.stringify(parsedUser))
          
          // Notify parent component if callback provided
          if (onAvatarChange) {
            onAvatarChange(fileUrl, parsedUser)
          }

          toast({
            title: "Avatar updated",
            description: "Your profile picture has been updated successfully"
          })
        }
      } catch (error) {
        console.error('Error updating user data:', error)
        toast({
          title: "Update failed",
          description: "There was an error updating your profile picture",
          variant: "destructive"
        })
      }

      setIsUploading(false)
    }, 1000)
  }

  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current.click()
  }

  // Remove avatar
  const removeAvatar = () => {
    setAvatarUrl(null)
    
    // Update local storage
    try {
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser)
        delete parsedUser.avatar_url
        localStorage.setItem('user', JSON.stringify(parsedUser))
        
        // Notify parent component if callback provided
        if (onAvatarChange) {
          onAvatarChange(null, parsedUser)
        }

        toast({
          title: "Avatar removed",
          description: "Your profile picture has been removed"
        })
      }
    } catch (error) {
      console.error('Error updating user data:', error)
    }
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="relative">
        <Avatar className={sizeClasses[size]}>
          {avatarUrl && (
            <AvatarImage src={avatarUrl} alt={getDisplayName()} />
          )}
          <AvatarFallback className="bg-primary/10">
            {getUserInitials()}
          </AvatarFallback>
        </Avatar>
        
        {allowUpload && (
          <div className={cn(
            "flex items-center justify-center gap-1 mt-1",
            uploadSizeClasses[size]
          )}>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*"
              className="hidden"
            />

            <Button 
              type="button" 
              size="sm" 
              variant="outline" 
              className="h-6 px-2 text-xs"
              onClick={triggerFileInput}
              disabled={isUploading}
            >
              <Upload className="h-3 w-3 mr-1" />
              {size === 'lg' ? 'Upload' : ''}
            </Button>

            {avatarUrl && (
              <Button 
                type="button" 
                size="sm" 
                variant="outline" 
                className="h-6 px-1 text-xs"
                onClick={removeAvatar}
                disabled={isUploading}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        )}
      </div>
      
      {showName && user && (
        <div className="flex flex-col">
          <span className="text-sm font-medium">{getDisplayName()}</span>
        </div>
      )}
    </div>
  )
}

// Add default export statement
export default UserProfile