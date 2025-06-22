import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import ChannelList from './ChannelList';
import ChatContent from './ChatContent';
import ChatInput from './ChatInput';
import { useToast } from '@/hooks/use-toast';

/**
 * Main chat layout component that organizes the entire chat interface
 */
function ChatLayout({ className }) {
  const [activeChannel, setActiveChannel] = useState(1);
  const [messages, setMessages] = useState({});
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Get user data from localStorage
  useEffect(() => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
      
      // Set active channel from localStorage if available
      const savedActiveChannel = localStorage.getItem('activeChannelId');
      if (savedActiveChannel) {
        setActiveChannel(savedActiveChannel);
      }
    } catch (error) {
      console.error("Error parsing user data from localStorage:", error);
    }
  }, []);

  // Fetch messages when active channel changes
  useEffect(() => {
    if (activeChannel) {
      fetchChannelMessages(activeChannel);
    }
  }, [activeChannel]);

  const fetchChannelMessages = async (channelId) => {
    setIsLoading(true);
    
    try {
      // Using URLSearchParams to create query parameters
      const queryParams = new URLSearchParams({
        offset: 0,
        limit: 10
      });

      // GET request with query parameters in the URL
      const response = await fetch(`http://localhost:6869/api/v1/channels/${channelId}/messages?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
        // No body for GET request
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch messages: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Format messages for display
      const formattedMessages = data.msgs.map(msg => ({
        id: msg.id,
        text: msg.text_content,
        sender: `User ${msg.sender_id}`, // Ideally we would have user data to display actual names
        timestamp: new Date(msg.created_at).toLocaleTimeString(),
        raw: msg // Keep the raw data for reference if needed
      }));
      
      // Update messages state
      setMessages(prev => ({
        ...prev,
        [channelId]: formattedMessages
      }));
      
    } catch (error) {
      console.error('Error fetching channel messages:', error);
      toast({
        title: 'Error',
        description: 'Failed to load messages. Please try again.',
      });
      
      // Initialize empty array for this channel if there was an error
      setMessages(prev => ({
        ...prev,
        [channelId]: []
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (message) => {
    if (message.trim() === '') return;
    
    // Get active channel ID from localStorage
    const channelId = localStorage.getItem('activeChannelId') || activeChannel;
    
    // Only proceed if we have a user ID
    if (!user || !user.id) {
      toast({
        title: "Error",
        description: "User information not available. Please login again."
      });
      return;
    }
    
    // Prepare the message payload - changed media_metadata to null
    const messagePayload = {
      sender_id: user.id,
      parent_msg_id: null,
      content_type: "text",
      text_content: message,
      media_url: "",
      media_metadata: null
    };
    
    // Add message to UI immediately for responsive feel
    const tempMessage = {
      id: `temp-${Date.now()}`,
      text: message,
      sender: user.username || "You",
      timestamp: new Date().toLocaleTimeString(),
      isSending: true
    };
    
    setMessages(prev => ({
      ...prev,
      [channelId]: [
        ...(prev[channelId] || []),
        tempMessage
      ]
    }));
    
    // Send message to API
    try {
      const response = await fetch(`http://localhost:6869/api/v1/channels/${channelId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messagePayload)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.status}`);
      }
      
      // On success, refresh messages to show the sent message with its server ID
      await fetchChannelMessages(channelId);
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
      });
      
      // Remove the temporary message on error
      setMessages(prev => ({
        ...prev,
        [channelId]: prev[channelId].filter(msg => msg.id !== tempMessage.id)
      }));
    }
  };

  return (
    <div className={cn('flex h-full w-full bg-background rounded-lg overflow-hidden shadow-lg', className)}>
      {/* Left sidebar with channels */}
      <div className="w-1/4 min-w-[200px] bg-sky-400 p-4 flex flex-col">
        <ChannelList 
          activeChannel={activeChannel} 
          onSelectChannel={setActiveChannel} 
          user={user}
        />
      </div>
      
      {/* Right content area with fixed layout */}
      <div className="flex-1 flex flex-col h-full">
        {/* Chat messages area - will scroll with overflow */}
        <div className="flex-1 overflow-hidden">
          <ChatContent 
            messages={messages[activeChannel] || []} 
            channelName={activeChannel}
            isLoading={isLoading}
          />
        </div>
        
        {/* Chat input area - fixed at bottom */}
        <div className="flex-shrink-0">
          <ChatInput onSendMessage={handleSendMessage} />
        </div>
      </div>
    </div>
  );
}

export default ChatLayout;