
import { motion } from 'framer-motion';
import { useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAlert, useConfirm } from '@/components/ui/notification';
import {
  Users,
  UserPlus,
  Search,
  Check,
  X,
  Ban,
  Trash2,
  MessageCircle,
  Shield,
  AlertTriangle,
  UserMinus
} from 'lucide-react';
import { useApi } from '@/hooks/use-api';
import { createClient } from '@/lib/supabase/client';

interface Connection {
  id: string;
  user_id: string;
  connected_user_id: string;
  connection_type: string;
  status: string;
  is_blocked: boolean;
  blocked_by: string | null;
  connected_at: string;
  created_at: string;
  connected_user: {
    id: string;
    display_name: string;
    avatar_url: string | null;
    account_type: string;
    city: string | null;
    state: string | null;
  };
}

export default function ConnectionsPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const navigate = useNavigate();
  const toast = useAlert();
  const confirm = useConfirm();
  const [activeTab, setActiveTab] = useState<'friends' | 'pending' | 'blocked'>('friends');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchUserId, setSearchUserId] = useState('');

  const { data: friends, loading: loadingFriends, refetch: refetchFriends } = useApi<{ connections: Connection[] }>('/api/connections?type=friends');
  const { data: pending, loading: loadingPending, refetch: refetchPending } = useApi<{ connections: Connection[] }>('/api/connections?type=pending');
  const { data: blocked, loading: loadingBlocked, refetch: refetchBlocked } = useApi<{ connections: Connection[] }>('/api/connections?type=blocked');

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate('/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);

  // Realtime subscription for connection updates
  useEffect(() => {
    if (!isSignedIn) return;

    const supabase = createClient();
    const channel = supabase
      .channel('user-connections-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_connections'
        },
        () => {
          refetchFriends();
          refetchPending();
          refetchBlocked();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isSignedIn, refetchFriends, refetchPending, refetchBlocked]);

  const sendConnectionRequest = async () => {
    if (!searchUserId.trim()) {
      toast.error('Please enter a user ID');
      return;
    }

    try {
      const response = await fetch('/api/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connected_user_id: searchUserId })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send request');
      }

      toast.success('Connection request sent!');
      setSearchUserId('');
      refetchFriends();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleAccept = async (connectionId: string) => {
    try {
      const response = await fetch(`/api/connections/${connectionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'accept' })
      });

      if (!response.ok) throw new Error('Failed to accept');

      toast.success('Connection accepted!');
      refetchPending();
      refetchFriends();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDecline = async (connectionId: string) => {
    try {
      const response = await fetch(`/api/connections/${connectionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'decline' })
      });

      if (!response.ok) throw new Error('Failed to decline');

      toast.success('Connection declined');
      refetchPending();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleBlock = async (connectionId: string, userName: string) => {
    const confirmed = await confirm(`Block ${userName}?`, 'They will not be able to contact you or see your profile.');
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/connections/${connectionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'block' })
      });

      if (!response.ok) throw new Error('Failed to block');

      toast.success('User blocked');
      refetchFriends();
      refetchBlocked();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleRemove = async (connectionId: string, userName: string) => {
    const confirmed = await confirm(`Remove ${userName}?`, 'This will remove them from your connections.');
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/connections/${connectionId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to remove');

      toast.success('Connection removed');
      refetchFriends();
      refetchBlocked();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (!isLoaded || !isSignedIn) {
    return null;
  }

  const currentConnections = activeTab === 'friends' ? friends?.connections || [] :
                            activeTab === 'pending' ? pending?.connections || [] :
                            blocked?.connections || [];

  const filteredConnections = currentConnections.filter(conn =>
    conn.connected_user.display_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-orbitron text-4xl font-bold neon-text mb-2">CONNECTIONS</h1>
          <p className="text-muted-foreground font-rajdhani text-lg">
            Manage your athlete network and connections
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-orange-500 mt-4 cyber-glow" />
        </motion.div>

        {/* Add Connection */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="cyber-card p-6 mb-8"
        >
          <h2 className="font-orbitron text-xl font-bold text-cyan-300 mb-4">Add New Connection</h2>
          <div className="flex gap-3">
            <Input
              placeholder="Enter user ID to connect"
              value={searchUserId}
              onChange={(e) => setSearchUserId(e.target.value)}
              className="cyber-border bg-card/30 font-rajdhani flex-1"
            />
            <Button
              onClick={sendConnectionRequest}
              className="bg-cyan-500 hover:bg-cyan-400 text-black font-rajdhani"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Send Request
            </Button>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex flex-wrap gap-4">
            {[
              { id: 'friends', label: `Friends (${friends?.connections.length || 0})`, icon: Users },
              { id: 'pending', label: `Pending (${pending?.connections.length || 0})`, icon: UserPlus },
              { id: 'blocked', label: `Blocked (${blocked?.connections.length || 0})`, icon: Ban }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`
                    flex items-center gap-2 px-6 py-3 rounded-lg font-rajdhani font-semibold transition-all
                    ${activeTab === tab.id
                      ? 'cyber-border cyber-glow bg-cyan-500/20 text-cyan-300'
                      : 'bg-card/30 text-muted-foreground hover:text-foreground hover:bg-card/50'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              placeholder="Search connections..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 cyber-border bg-card/30 font-rajdhani"
            />
          </div>
        </motion.div>

        {/* Connections List */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          {(loadingFriends || loadingPending || loadingBlocked) ? (
            <div className="cyber-card p-6 text-center">
              <div className="animate-spin w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-muted-foreground font-rajdhani">Loading connections...</p>
            </div>
          ) : filteredConnections.length === 0 ? (
            <div className="cyber-card p-6 text-center">
              <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-orbitron text-xl font-bold text-foreground mb-2">
                No {activeTab} connections
              </h3>
              <p className="text-muted-foreground font-rajdhani">
                {activeTab === 'friends' && 'Send connection requests to build your network'}
                {activeTab === 'pending' && 'No pending requests at the moment'}
                {activeTab === 'blocked' && 'No blocked users'}
              </p>
            </div>
          ) : (
            filteredConnections.map((conn) => (
              <div key={conn.id} className="cyber-card p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-orange-500/20 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="font-orbitron text-lg font-bold text-foreground">
                      {conn.connected_user.display_name}
                    </h3>
                    <p className="text-muted-foreground font-rajdhani text-sm">
                      {conn.connected_user.city || conn.connected_user.state ?
                        `${conn.connected_user.city || ''}${conn.connected_user.city && conn.connected_user.state ? ', ' : ''}${conn.connected_user.state || ''}` :
                        'Location not set'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  {activeTab === 'friends' && (
                    <>
                      <Button size="sm" variant="outline" className="cyber-border border-cyan-500 text-cyan-400">
                        <MessageCircle className="w-4 h-4 mr-1" />
                        Message
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="cyber-border border-orange-500 text-orange-400"
                        onClick={() => handleBlock(conn.id, conn.connected_user.display_name)}
                      >
                        <Ban className="w-4 h-4 mr-1" />
                        Block
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="cyber-border border-red-500 text-red-400"
                        onClick={() => handleRemove(conn.id, conn.connected_user.display_name)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                  {activeTab === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        className="bg-green-500 hover:bg-green-400 text-black"
                        onClick={() => handleAccept(conn.id)}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        className="bg-red-500 hover:bg-red-400 text-black"
                        onClick={() => handleDecline(conn.id)}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Decline
                      </Button>
                    </>
                  )}
                  {activeTab === 'blocked' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="cyber-border border-cyan-500 text-cyan-400"
                      onClick={() => handleRemove(conn.id, conn.connected_user.display_name)}
                    >
                      <UserMinus className="w-4 h-4 mr-1" />
                      Unblock
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
