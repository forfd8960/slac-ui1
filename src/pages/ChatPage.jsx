import React from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatLayout from '@/components/chat/ChatLayout';
import { useToast } from '@/hooks/use-toast';

function ChatPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const userData = JSON.parse(localStorage.getItem('userData'));
  const jwtToken = localStorage.getItem('jwtToken');

  useEffect(() => {
    // If user is not authenticated, redirect to home page
    if (!jwtToken) {
      toast({
        title: "Authentication Required",
        description: "Please log in to access the chat",
        variant: "destructive",
      });
      navigate('/');
    }
  }, [navigate, toast, jwtToken]);

  if (!userData) {
    return null; // Don't render anything while redirecting
  }

  const username = userData.name || "User";

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Real-Time Chat</h1>
        
        <div className="h-[calc(100vh-180px)]">
          <ChatLayout username={username} />
        </div>
      </div>
    </div>
  );
}

export default ChatPage;