
import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAlert } from '@/components/ui/notification';
import { MessageCircle, Send, Users } from 'lucide-react';
import { useApi } from '@/hooks/use-api';
import { createClient } from '@/lib/supabase/client';

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  sender: {
    id: string;
    display_name: string;
    avatar_url: string | null;
  };
}

export function TeamChat({ teamId }: { teamId: string }) {
  const { userId: clerkUserId } = useAuth();
  const toast = useAlert();
  const [messageText, setMessageText] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);

  // Get team conversation
  const { data: chatData, loading: loadingChat } = useApi<{ conversation: { id: string } }>(
    `/api/teams/${teamId}/chat`
  );

  // Get messages
  const { data: messagesData, loading: loadingMessages, refetch: refetchMessages } = useApi<{ messages: Message[] }>(
    conversationId ? `/api/conversations/${conversationId}/messages` : null,
    { dependencies: [conversationId] }
  );

  useEffect(() => {
    console.log('TeamChat data:', { chatData, loadingChat });
    if (chatData?.conversation) {
      setConversationId(chatData.conversation.id);
    }
  }, [chatData, loadingChat]);

  // Realtime subscription for messages
  useEffect(() => {
    if (!conversationId) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`team-chat:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        () => {
          refetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, refetchMessages]);

  const sendMessage = async () => {
    if (!messageText.trim() || !conversationId) return;

    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: messageText })
      });

      if (!response.ok) throw new Error('Failed to send message');

      setMessageText('');
      refetchMessages();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const messages = messagesData?.messages || [];

  useEffect(() => {
    console.log('TeamChat messages:', { messagesData, messages, conversationId });
  }, [messagesData, messages, conversationId]);

  return (
    <div className="cyber-card p-6">
      <div className="flex items-center gap-3 mb-6">
        <MessageCircle className="w-6 h-6 text-cyan-400" />
        <h2 className="font-orbitron text-2xl font-bold text-foreground">Team Chat</h2>
      </div>

      {/* Messages */}
      <div className="bg-card/30 rounded-lg p-4 h-96 overflow-y-auto mb-4 space-y-3">
        {loadingChat || loadingMessages ? (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-muted-foreground font-rajdhani">Loading chat...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground font-rajdhani">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwnMessage = msg.sender_id === clerkUserId;
            return (
              <div key={msg.id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%]`}>
                  {!isOwnMessage && (
                    <p className="text-xs text-cyan-400 font-rajdhani mb-1">{msg.sender.display_name}</p>
                  )}
                  <div
                    className={`p-3 rounded-lg ${
                      isOwnMessage
                        ? 'bg-cyan-500/20 border border-cyan-500/50'
                        : 'bg-orange-500/10 border border-orange-500/30'
                    }`}
                  >
                    <p className="text-foreground font-rajdhani text-sm">{msg.content}</p>
                    <p className="text-xs text-muted-foreground font-rajdhani mt-1">
                      {new Date(msg.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <Input
          placeholder="Type a message..."
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          className="cyber-border bg-card/30 font-rajdhani flex-1"
        />
        <Button
          onClick={sendMessage}
          disabled={!messageText.trim()}
          className="bg-cyan-500 hover:bg-cyan-400 text-black"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
