
import { motion } from 'framer-motion';
import { useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAlert } from '@/components/ui/notification';
import {
  MessageCircle,
  Search,
  Plus,
  Users,
  Send,
  Paperclip,
  MoreVertical,
  User
} from 'lucide-react';
import { useApi } from '@/hooks/use-api';

interface Conversation {
  id: string;
  type: string;
  title: string;
  description?: string;
  team_id?: string;
  last_message_at: string;
  message_count: number;
  participants: Array<{
    user_id: string;
    user: {
      id: string;
      display_name: string;
      avatar_url: string | null;
    };
  }>;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: string;
  created_at: string;
  sender: {
    id: string;
    display_name: string;
    avatar_url: string | null;
  };
}

export default function MessagesPage() {
  const { isLoaded, isSignedIn, userId: clerkUserId } = useAuth();
  const navigate = useNavigate();
  const toast = useAlert();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: conversationsData, loading: loadingConversations, refetch: refetchConversations } =
    useApi<{ conversations: Conversation[] }>('/api/conversations');

  const { data: messagesData, loading: loadingMessages, refetch: refetchMessages } =
    useApi<{ messages: Message[] }>(selectedConversation ? `/api/conversations/${selectedConversation}/messages` : null);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate('/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);

  // Auto-refresh messages when conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      const interval = setInterval(() => {
        refetchMessages();
      }, 3000); // Refresh every 3 seconds

      return () => clearInterval(interval);
    }
  }, [selectedConversation, refetchMessages]);

  const sendMessage = async () => {
    if (!messageText.trim() || !selectedConversation) return;

    try {
      const response = await fetch(`/api/conversations/${selectedConversation}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: messageText })
      });

      if (!response.ok) throw new Error('Failed to send message');

      setMessageText('');
      refetchMessages();
      refetchConversations();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (!isLoaded || !isSignedIn) return null;

  const conversations = conversationsData?.conversations || [];
  const messages = messagesData?.messages || [];
  const currentConversation = conversations.find(c => c.id === selectedConversation);

  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto h-[calc(100vh-200px)]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="font-orbitron text-4xl font-bold neon-text mb-2">MESSAGES</h1>
          <p className="text-muted-foreground font-rajdhani text-lg">
            Connect with your network
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-orange-500 mt-4 cyber-glow" />
        </motion.div>

        <div className="grid grid-cols-12 gap-6 h-full">
          {/* Conversations List */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="col-span-4 cyber-card p-4 flex flex-col"
          >
            <div className="mb-4">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 cyber-border bg-card/30 font-rajdhani"
                />
              </div>
              <Button className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-rajdhani">
                <Plus className="w-4 h-4 mr-2" />
                New Message
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2">
              {loadingConversations ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full mx-auto mb-4" />
                  <p className="text-muted-foreground font-rajdhani text-sm">Loading...</p>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground font-rajdhani text-sm">No conversations yet</p>
                </div>
              ) : (
                filteredConversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv.id)}
                    className={`w-full p-3 rounded-lg text-left transition-all ${
                      selectedConversation === conv.id
                        ? 'bg-cyan-500/20 border border-cyan-500/50'
                        : 'bg-card/30 hover:bg-card/50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-cyan-500/20 to-orange-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                        {conv.type === 'team' ? (
                          <Users className="w-5 h-5 text-cyan-400" />
                        ) : (
                          <User className="w-5 h-5 text-orange-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-rajdhani font-semibold text-foreground truncate">
                          {conv.title}
                        </h3>
                        <p className="text-xs text-muted-foreground font-rajdhani">
                          {conv.message_count} messages
                        </p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </motion.div>

          {/* Messages Area */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="col-span-8 cyber-card p-0 flex flex-col"
          >
            {selectedConversation && currentConversation ? (
              <>
                {/* Header */}
                <div className="p-4 border-b border-cyan-500/20 flex items-center justify-between">
                  <div>
                    <h2 className="font-orbitron text-xl font-bold text-foreground">
                      {currentConversation.title}
                    </h2>
                    <p className="text-sm text-muted-foreground font-rajdhani">
                      {currentConversation.participants?.length || 0} participants
                    </p>
                  </div>
                  <Button size="sm" variant="outline" className="cyber-border">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {loadingMessages ? (
                    <div className="text-center py-8">
                      <div className="animate-spin w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full mx-auto mb-4" />
                      <p className="text-muted-foreground font-rajdhani">Loading messages...</p>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground font-rajdhani">No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isOwnMessage = msg.sender_id === clerkUserId;
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[70%] ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                            {!isOwnMessage && (
                              <p className="text-xs text-cyan-400 font-rajdhani mb-1">
                                {msg.sender.display_name}
                              </p>
                            )}
                            <div
                              className={`p-3 rounded-lg ${
                                isOwnMessage
                                  ? 'bg-cyan-500/20 border border-cyan-500/50'
                                  : 'bg-card/50 border border-orange-500/30'
                              }`}
                            >
                              <p className="text-foreground font-rajdhani">{msg.content}</p>
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
                <div className="p-4 border-t border-cyan-500/20">
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="cyber-border">
                      <Paperclip className="w-4 h-4" />
                    </Button>
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
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="w-20 h-20 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-orbitron text-xl font-bold text-foreground mb-2">
                    Select a conversation
                  </h3>
                  <p className="text-muted-foreground font-rajdhani">
                    Choose a conversation from the left to start messaging
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
