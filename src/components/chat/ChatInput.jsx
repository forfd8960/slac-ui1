import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';

/**
 * Component for chat input field and send button
 */
function ChatInput({ onSendMessage }) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="p-4 bg-sky-400 border-t border-sky-500">
      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <div className="flex-1">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="min-h-[60px] resize-none bg-white"
          />
        </div>
        <Button 
          type="submit" 
          size="icon"
          className="h-10 w-10 bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Send className="h-5 w-5" />
        </Button>
      </form>
      <div className="text-center mt-2 text-gray-800 font-medium">
        Chat Box
      </div>
    </div>
  );
}

export default ChatInput;