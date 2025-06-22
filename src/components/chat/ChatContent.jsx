import React, { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2 } from "lucide-react";

/**
 * Component for displaying chat messages
 */
function ChatContent({ messages, channelName, isLoading }) {
  const scrollAreaRef = useRef(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTo({
          top: scrollContainer.scrollHeight,
          behavior: 'smooth'
        });
      }
    }
  }, [messages]);

  return (
    <div className="h-full bg-sky-400">
      <div className="h-full flex flex-col">
        <h2 className="text-xl font-bold p-4 text-center text-gray-800">
          {channelName ? `Channel: ${channelName}` : 'Select a channel to start chatting'}
        </h2>
        
        <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
          {isLoading ? (
            <div className="h-full flex items-center justify-center text-gray-600">
              <Loader2 className="h-8 w-8 animate-spin mr-2" />
              <p>Loading messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-600">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'p-3 rounded-lg max-w-[80%]',
                    message.isSending ? 'bg-gray-100 text-gray-600' : 'bg-white text-gray-800'
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">{message.sender}</span>
                    <span className="text-xs text-gray-500">{message.timestamp}</span>
                    {message.isSending && <span className="text-xs italic text-gray-500">(Sending...)</span>}
                  </div>
                  <p>{message.text}</p>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}

export default ChatContent;