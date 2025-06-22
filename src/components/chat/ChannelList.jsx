import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';

/**
 * Component for displaying channel list in the sidebar
 */
function ChannelList({ activeChannel, onSelectChannel, user }) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [channels, setChannels] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Fetch user channels when component mounts or user changes
  useEffect(() => {
    const fetchUserChannels = async () => {
      if (!user || !user.id) {
        return;
      }
      
      setIsLoading(true);
      try {
        const response = await fetch(`http://localhost:6869/api/v1/users/${user.id}/channels`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch channels: ${response.status}`);
        }
        
        const data = await response.json();
        // Updated to set channels from data.channels instead of directly using data
        setChannels(data.channels);
      } catch (error) {
        console.error('Error fetching channels:', error);
        toast({
          title: 'Error',
          description: 'Failed to load channels. Please try again later.',
        });
        // Fallback to default channels if API fails
        setChannels([
          { id: 'Channel1', ch_name: '#Channel1' },
          { id: 'Channel2', ch_name: '#Channel2' },
          { id: 'Channel3', ch_name: '#Channel3' },
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserChannels();
  }, [user, toast]);

  const handleProfileClick = () => {
    navigate('/dashboard'); // Navigate to the profile/dashboard page
  };
  
  const handleChannelSelect = (channelId) => {
    // Set the active channel ID in localStorage
    localStorage.setItem('activeChannelId', channelId);
    // Call the parent component's onSelectChannel function
    onSelectChannel(channelId);
  };

  // Get avatar from user prop if available
  const avatarUrl = user?.avatar_url || "";
  const displayName = user?.display_name || user?.username || "User";
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">Channels</h2>
        {isLoading ? (
          <div className="py-4 text-center text-gray-500">Loading channels...</div>
        ) : (
          <ul className="space-y-2">
            {channels.length > 0 ? (
              channels.map((channel) => (
                <li key={channel.id}>
                  <button
                    onClick={() => handleChannelSelect(channel.id)}
                    className={cn(
                      'w-full text-left p-3 rounded-md font-medium transition-colors',
                      activeChannel === channel.id
                        ? 'bg-yellow-300 text-gray-900'
                        : 'bg-yellow-200 text-gray-800 hover:bg-yellow-300'
                    )}
                  >
                    {channel.ch_name || `#${channel.id}`}
                  </button>
                </li>
              ))
            ) : (
              <div className="py-2 text-center text-gray-500">No channels found</div>
            )}
          </ul>
        )}
      </div>
      
      {/* User profile at bottom - clickable to navigate to profile page */}
      <div className="mt-auto pt-4 border-t border-sky-500">
        <div 
          className="flex items-center gap-3 p-2 rounded-md hover:bg-sky-500/20 cursor-pointer transition-colors"
          onClick={handleProfileClick}
          title="Go to profile"
        >
          <Avatar className="h-10 w-10">
            <AvatarImage src={avatarUrl} alt={displayName} />
            <AvatarFallback className="bg-sky-500 text-white">
              {displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium text-gray-800">{displayName}</span>
        </div>
      </div>
    </div>
  );
}

export default ChannelList;