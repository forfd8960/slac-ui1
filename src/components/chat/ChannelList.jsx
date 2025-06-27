import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { LogOut, Plus } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

/**
 * Component for displaying channel list in the sidebar
 */
function ChannelList({ activeChannel, onSelectChannel, user }) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [channels, setChannels] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelDescription, setNewChannelDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fetch user channels when component mounts or user changes
  useEffect(() => {
    fetchUserChannels();
  }, [user]);

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

  const handleProfileClick = () => {
    navigate('/dashboard'); // Navigate to the profile/dashboard page
  };
  
  const handleChannelSelect = (channelId) => {
    // Set the active channel ID in localStorage
    localStorage.setItem('activeChannelId', channelId);
    // Call the parent component's onSelectChannel function
    onSelectChannel(channelId);
  };

  const handleCreateChannel = async () => {
    if (!newChannelName.trim()) {
      toast({
        title: "Error",
        description: "Channel name is required."
      });
      return;
    }

    if (!user || !user.id) {
      toast({
        title: "Error",
        description: "User information not available. Please login again."
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`http://localhost:6869/api/v1/channels`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ch_name: newChannelName,
          ch_desc: newChannelDescription,
          is_private: false,
          creator_id: user.id
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to create channel: ${response.status}`);
      }

      const data = await response.json();
      
      // Add the newly created channel to the list
      setChannels(prevChannels => [...prevChannels, data.channel]);
      
      // Close the dialog and reset form
      setIsCreateDialogOpen(false);
      setNewChannelName('');
      setNewChannelDescription('');
      
      toast({
        title: "Success",
        description: "Channel created successfully!"
      });

      // Optionally select the newly created channel
      handleChannelSelect(data.channel.id);
    } catch (error) {
      console.error('Error creating channel:', error);
      toast({
        title: 'Error',
        description: 'Failed to create channel. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLeaveChannel = async (channelId) => {
    if (!user || !user.id) {
      toast({
        title: "Error",
        description: "User information not available. Please login again."
      });
      return;
    }

    try {
      const response = await fetch(`http://localhost:6869/api/v1/channels/${channelId}/leave`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to leave channel: ${response.status}`);
      }

      // Remove the channel from the list
      setChannels(prevChannels => prevChannels.filter(channel => channel.id !== channelId));
      
      // If the active channel is the one we just left, select another channel if available
      if (activeChannel === channelId) {
        const nextChannel = channels.find(channel => channel.id !== channelId);
        if (nextChannel) {
          handleChannelSelect(nextChannel.id);
        } else {
          // Clear active channel if no other channels are available
          localStorage.removeItem('activeChannelId');
          onSelectChannel(null);
        }
      }
      
      toast({
        title: "Success",
        description: "You have left the channel."
      });
    } catch (error) {
      console.error('Error leaving channel:', error);
      toast({
        title: 'Error',
        description: 'Failed to leave channel. Please try again.'
      });
    }
  };

  // Get avatar from user prop if available
  const avatarUrl = user?.avatar_url || "";
  const displayName = user?.display_name || user?.username || "User";
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Channels</h2>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsCreateDialogOpen(true)}
            className="rounded-full hover:bg-sky-600 hover:text-white"
            title="Create a new channel"
          >
            <Plus />
            <span className="sr-only">Add channel</span>
          </Button>
        </div>
        {isLoading ? (
          <div className="py-4 text-center text-gray-500">Loading channels...</div>
        ) : (
          <ul className="space-y-2">
            {channels.length > 0 ? (
              channels.map((channel) => (
                <li key={channel.id}>
                  <ContextMenu>
                    <ContextMenuTrigger asChild>
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
                    </ContextMenuTrigger>
                    <ContextMenuContent className="w-48">
                      <ContextMenuItem 
                        className="flex items-center gap-2 text-red-500 focus:text-red-500 cursor-pointer" 
                        onClick={() => handleLeaveChannel(channel.id)}
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Leave channel</span>
                      </ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>
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

      {/* Create Channel Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Channel</DialogTitle>
            <DialogDescription>
              Enter the details for your new channel. Click create when you're done.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="channelName" className="text-right font-medium">
                Name
              </label>
              <Input
                id="channelName"
                value={newChannelName}
                onChange={(e) => setNewChannelName(e.target.value)}
                placeholder="e.g., project-announcements"
                className="col-span-3"
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="channelDescription" className="text-right font-medium">
                Description
              </label>
              <Textarea
                id="channelDescription"
                value={newChannelDescription}
                onChange={(e) => setNewChannelDescription(e.target.value)}
                placeholder="What is this channel about?"
                className="col-span-3"
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateChannel} 
              disabled={isSubmitting || !newChannelName.trim()}
            >
              {isSubmitting ? 'Creating...' : 'Create Channel'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ChannelList;