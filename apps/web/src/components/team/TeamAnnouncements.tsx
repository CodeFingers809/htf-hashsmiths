
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAlert } from '@/components/ui/notification';
import { Megaphone, AlertCircle, Clock } from 'lucide-react';
import { useApi } from '@/hooks/use-api';
import { createClient } from '@/lib/supabase/client';

interface Announcement {
  id: string;
  sender_id: string;
  content: string;
  priority: string;
  created_at: string;
  sender: {
    id: string;
    display_name: string;
    avatar_url: string | null;
  };
}

interface TeamAnnouncementsProps {
  teamId: string;
  isCaptain: boolean;
}

export function TeamAnnouncements({ teamId, isCaptain }: TeamAnnouncementsProps) {
  const toast = useAlert();
  const [announcementText, setAnnouncementText] = useState('');
  const [priority, setPriority] = useState<'normal' | 'high'>('normal');
  const [posting, setPosting] = useState(false);

  const { data, loading, refetch } = useApi<{
    announcements: Announcement[];
    conversation_id: string;
  }>(`/api/teams/${teamId}/announcements`);

  const announcementsData = data;

  // Debug logging
  useEffect(() => {
    console.log('TeamAnnouncements data:', { announcementsData, loading });
  }, [announcementsData, loading]);

  // Realtime subscription for new announcements
  useEffect(() => {
    if (!announcementsData?.conversation_id) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`announcements:${announcementsData.conversation_id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${announcementsData.conversation_id}`
        },
        () => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [announcementsData?.conversation_id, refetch]);

  const postAnnouncement = async () => {
    if (!announcementText.trim()) {
      toast.error('Please enter an announcement');
      return;
    }

    setPosting(true);
    try {
      const response = await fetch(`/api/teams/${teamId}/announcements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: announcementText, priority })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to post announcement');
      }

      toast.success('Announcement posted successfully!');
      setAnnouncementText('');
      setPriority('normal');
      refetch();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setPosting(false);
    }
  };

  const announcements = announcementsData?.announcements || [];

  return (
    <div className="cyber-card p-6">
      <div className="flex items-center gap-3 mb-6">
        <Megaphone className="w-6 h-6 text-orange-400" />
        <h2 className="font-orbitron text-2xl font-bold text-foreground">Team Announcements</h2>
      </div>

      {/* Post Announcement (Captain Only) */}
      {isCaptain && (
        <div className="bg-orange-500/5 border border-orange-500/20 rounded-lg p-4 mb-6">
          <h3 className="font-rajdhani font-semibold text-orange-400 mb-3">Post New Announcement</h3>
          <textarea
            value={announcementText}
            onChange={(e) => setAnnouncementText(e.target.value)}
            placeholder="Type your announcement here..."
            className="w-full px-3 py-2 cyber-border bg-card/30 font-rajdhani text-foreground min-h-[100px] mb-3 rounded-lg"
          />
          <div className="flex items-center justify-between">
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as 'normal' | 'high')}
              className="px-3 py-2 cyber-border bg-card/30 font-rajdhani text-foreground rounded-lg"
            >
              <option value="normal">Normal Priority</option>
              <option value="high">High Priority</option>
            </select>
            <Button
              onClick={postAnnouncement}
              disabled={!announcementText.trim() || posting}
              className="bg-orange-500 hover:bg-orange-400 text-black font-rajdhani"
            >
              <Megaphone className="w-4 h-4 mr-2" />
              {posting ? 'Posting...' : 'Post Announcement'}
            </Button>
          </div>
        </div>
      )}

      {/* Announcements List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-2 border-orange-400 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-muted-foreground font-rajdhani">Loading announcements...</p>
          </div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-8">
            <Megaphone className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground font-rajdhani">No announcements yet</p>
            {isCaptain && (
              <p className="text-sm text-muted-foreground font-rajdhani mt-2">
                Be the first to post an announcement to your team!
              </p>
            )}
          </div>
        ) : (
          announcements.map((announcement) => (
            <div
              key={announcement.id}
              className={`cyber-card p-4 border ${
                announcement.priority === 'high'
                  ? 'border-red-500/50 bg-red-500/5'
                  : 'border-orange-500/30 bg-orange-500/5'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-500/20 to-cyan-500/20 rounded-full flex items-center justify-center">
                    <Megaphone className="w-4 h-4 text-orange-400" />
                  </div>
                  <div>
                    <p className="font-rajdhani font-semibold text-foreground">
                      {announcement.sender.display_name}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-rajdhani">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(announcement.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                {announcement.priority === 'high' && (
                  <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs font-rajdhani rounded flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    High Priority
                  </span>
                )}
              </div>
              <p className="text-foreground font-rajdhani ml-10">{announcement.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
