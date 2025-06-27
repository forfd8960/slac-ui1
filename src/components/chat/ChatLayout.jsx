import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import ChannelList from './ChannelList';
import ChatContent from './ChatContent';
import ChatInput from './ChatInput';
import { useToast } from '@/hooks/use-toast';

/**
 * Main chat layout component that organizes the entire chat interface
 */
function ChatLayout({ className }) {
  const [activeChannel, setActiveChannel] = useState('Channel1');
  const [messages, setMessages] = useState({});
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const websocketRef = useRef(null);

  // Get user data from localStorage
  useEffect(() => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        
        // Initialize WebSocket connection when user data is available
        initWebSocket(parsedUser.id);
      }
      
      // Set active channel from localStorage if available
      const savedActiveChannel = localStorage.getItem('activeChannelId');
      if (savedActiveChannel) {
        setActiveChannel(savedActiveChannel);
      }
    } catch (error) {
      console.error("Error parsing user data from localStorage:", error);
    }
    
    // Cleanup WebSocket on unmount
    return () => {
      if (websocketRef.current) {
        websocketRef.current.close();
      }
    };
  }, []);

  // Initialize WebSocket connection
  const initWebSocket = (userId) => {
    if (!userId) return;
    
    try {
      const ws = new WebSocket(`http://localhost:6869/${userId}/websocket`);
      
      ws.onopen = () => {
        console.log('WebSocket connection established');
      };
      
      ws.onmessage = (event) => {
        try {
          // Parse the JSON data from the WebSocket
          const messageData = JSON.parse(event.data);
          const channelId = localStorage.getItem('activeChannelId') || activeChannel;
          
          // Extract sender information from the message
          const sender = messageData.sender || {};
          const senderId = sender.id || 'unknown';
          const senderName = sender.display_name || `User ${senderId}`;
          const senderAvatar = sender.avatar_url || '';
          
          // Create a new message object from the WebSocket data
          const newMessage = {
            id: `ws-${Date.now()}`,
            text: messageData.text_content || '',
            sender: senderName,
            senderId: senderId,
            senderAvatar: senderAvatar,
            timestamp: new Date().toLocaleTimeString(),
            contentType: messageData.content_type || 'text',
            mediaUrl: messageData.media_url || '',
            mediaMetadata: messageData.media_metadata || null,
            parentMsgId: messageData.parent_msg_id || null
          };
          
          // Add the message to the current channel's message list
          setMessages(prev => ({
            ...prev,
            [channelId]: [
              ...(prev[channelId] || []),
              newMessage
            ]
          }));
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
          console.log('Raw message:', event.data);
        }
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        toast({
          title: 'WebSocket Error',
          description: 'Connection to chat server failed. Some messages may not be received.',
        });
      };
      
      ws.onclose = () => {
        console.log('WebSocket connection closed');
      };
      
      websocketRef.current = ws;
    } catch (error) {
      console.error('Error initializing WebSocket:', error);
      toast({
        title: 'Connection Error',
        description: 'Failed to connect to chat server. Please refresh the page.',
      });
    }
  };

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
        contentType: msg.content_type || 'text',
        mediaUrl: msg.media_url || '',
        mediaMetadata: msg.media_metadata || null,
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
      contentType: "text",
      mediaUrl: "",
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
      
      // Send message to WebSocket
      if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
        // Send the WebSocket message with the required format
        const wsMessagePayload = {
          channel_id: channelId,
          msgs: [
            {
              sender_id: user.id,
              parent_msg_id: null,
              content_type: "text",
              text_content: message,
              media_url: "",
              media_metadata: null
            }
          ]
        };
        websocketRef.current.send(JSON.stringify(wsMessagePayload));
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