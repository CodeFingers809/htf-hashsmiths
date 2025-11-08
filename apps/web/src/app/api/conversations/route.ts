// Conversations API - Direct messaging and group chats
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/clerk-react/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { getUserByClerkId } from '@/lib/auth/clerk-supabase';

// GET - Fetch user's conversations
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getUserByClerkId(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type'); // direct, team, group
    const supabase = await createServiceClient();

    // Get conversations where user is a participant
    const query = supabase
      .from('conversation_participants')
      .select(`
        conversation_id,
        conversations:conversation_id(
          *,
          team:team_id(id, name),
          creator:created_by(id, display_name, avatar_url)
        )
      `)
      .eq('user_id', user.id)
      .order('last_activity_at', { ascending: false });

    const { data: participantData, error: participantError } = await query;

    if (participantError) {
      console.error('Error fetching conversations:', participantError);
      return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
    }

    // Extract conversations and filter by type if specified
    let conversations = participantData
      ?.map((p: any) => p.conversations)
      .filter((c: any) => c && c.is_active);

    if (type) {
      conversations = conversations?.filter((c: any) => c.type === type);
    }

    // Get participant details for each conversation
    for (const conv of conversations || []) {
      const { data: participants } = await supabase
        .from('conversation_participants')
        .select(`
          user_id,
          user:user_id(id, display_name, avatar_url)
        `)
        .eq('conversation_id', conv.id);

      conv.participants = participants;
    }

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error('Error in conversations GET:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST - Create new conversation
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getUserByClerkId(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await req.json();
    const { type, participant_ids, team_id, title, description } = body;

    if (!type || !['direct', 'team', 'group'].includes(type)) {
      return NextResponse.json({ error: 'Invalid conversation type' }, { status: 400 });
    }

    if (type === 'direct' && (!participant_ids || participant_ids.length !== 1)) {
      return NextResponse.json({ error: 'Direct messages require exactly one other participant' }, { status: 400 });
    }

    const supabase = await createServiceClient();

    // For direct messages, check if conversation already exists
    if (type === 'direct') {
      const otherUserId = participant_ids[0];

      // Check for existing direct conversation
      const { data: existingParticipants } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .in('user_id', [user.id, otherUserId]);

      if (existingParticipants && existingParticipants.length > 0) {
        // Group by conversation_id and find one with exactly 2 participants (both users)
        const conversationCounts = existingParticipants.reduce((acc: any, p: any) => {
          acc[p.conversation_id] = (acc[p.conversation_id] || 0) + 1;
          return acc;
        }, {});

        const existingConvId = Object.keys(conversationCounts).find(id => conversationCounts[id] === 2);

        if (existingConvId) {
          const { data: existingConv } = await supabase
            .from('conversations')
            .select('*')
            .eq('id', existingConvId)
            .eq('type', 'direct')
            .single();

          if (existingConv) {
            return NextResponse.json({
              conversation: existingConv,
              message: 'Using existing conversation'
            });
          }
        }
      }
    }

    // Create new conversation
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .insert({
        type,
        title: title || (type === 'direct' ? 'Direct Message' : 'Group Chat'),
        description,
        team_id: team_id || null,
        created_by: user.id,
        is_active: true,
        participant_count: (participant_ids?.length || 0) + 1
      })
      .select()
      .single();

    if (convError) {
      console.error('Error creating conversation:', convError);
      return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 });
    }

    // Add participants
    const participantsToAdd = [user.id, ...(participant_ids || [])];
    const { error: participantError } = await supabase
      .from('conversation_participants')
      .insert(
        participantsToAdd.map(userId => ({
          conversation_id: conversation.id,
          user_id: userId,
          role: userId === user.id ? 'admin' : 'member',
          joined_at: new Date().toISOString()
        }))
      );

    if (participantError) {
      console.error('Error adding participants:', participantError);
      // Rollback conversation creation
      await supabase.from('conversations').delete().eq('id', conversation.id);
      return NextResponse.json({ error: 'Failed to add participants' }, { status: 500 });
    }

    // Send notifications to participants (except creator)
    if (participant_ids && participant_ids.length > 0) {
      await supabase.from('notifications').insert(
        participant_ids.map((participantId: string) => ({
          user_id: participantId,
          type: 'new_conversation',
          title: 'New Message',
          message: `${user.display_name || 'Someone'} started a conversation with you`,
          data: { conversation_id: conversation.id },
          action_url: `/messages/${conversation.id}`,
          related_entity_type: 'conversation',
          related_entity_id: conversation.id
        }))
      );
    }

    return NextResponse.json({ conversation, message: 'Conversation created successfully' });
  } catch (error) {
    console.error('Error in conversations POST:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
