// Conversation messages API
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/clerk-react/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { getUserByClerkId } from '@/lib/auth/clerk-supabase';

// GET - Fetch messages in a conversation
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const resolvedParams = await params;
    const conversationId = resolvedParams.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getUserByClerkId(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const supabase = await createClient();
    const serviceClient = await createServiceClient();

    // Verify user is a participant using service client (bypass RLS)
    const { data: participant, error: participantError } = await serviceClient
      .from('conversation_participants')
      .select('*')
      .eq('conversation_id', conversationId)
      .eq('user_id', user.id)
      .maybeSingle();

    console.log('Messages GET - Participant check:', {
      conversationId,
      userId: user.id,
      participant,
      participantError
    });

    if (!participant) {
      // Check if this is a team conversation and user is team member/creator
      const { data: conversation } = await serviceClient
        .from('conversations')
        .select('team_id, created_by')
        .eq('id', conversationId)
        .maybeSingle();

      if (conversation?.team_id) {
        const { data: team } = await serviceClient
          .from('teams')
          .select('created_by')
          .eq('id', conversation.team_id)
          .maybeSingle();

        const isCreator = team && team.created_by === user.id;
        const { data: membership } = await serviceClient
          .from('team_members')
          .select('*')
          .eq('team_id', conversation.team_id)
          .eq('user_id', user.id)
          .eq('status', 'active')
          .maybeSingle();

        if (isCreator || membership) {
          // User is team member/creator, add them as participant
          await serviceClient.from('conversation_participants').insert({
            conversation_id: conversationId,
            user_id: user.id,
            role: isCreator ? 'admin' : 'member',
            joined_at: new Date().toISOString()
          });
          console.log('Auto-added user as conversation participant');
        } else {
          return NextResponse.json({ error: 'Not a participant in this conversation' }, { status: 403 });
        }
      } else {
        return NextResponse.json({ error: 'Not a participant in this conversation' }, { status: 403 });
      }
    }

    // Fetch messages using service client to bypass RLS
    const { data: messages, error: messagesError } = await serviceClient
      .from('messages')
      .select(`
        *,
        sender:sender_id(id, display_name, avatar_url)
      `)
      .eq('conversation_id', conversationId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true })
      .limit(100);

    console.log('Messages fetched:', { count: messages?.length || 0, conversationId });

    if (messagesError) {
      console.error('Error fetching messages:', messagesError);
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    }

    return NextResponse.json({ data: { messages: messages || [] } });
  } catch (error) {
    console.error('Error in messages GET:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST - Send a message to a conversation
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const resolvedParams = await params;
    const conversationId = resolvedParams.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getUserByClerkId(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await req.json();
    const { content } = body;

    if (!content || content.trim() === '') {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 });
    }

    const supabase = await createClient();
    const serviceClient = await createServiceClient();

    // Verify user is a participant in this conversation using service client
    const { data: participant } = await serviceClient
      .from('conversation_participants')
      .select('*')
      .eq('conversation_id', conversationId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (!participant) {
      return NextResponse.json({ error: 'Not a participant in this conversation' }, { status: 403 });
    }

    // Create message using service client to bypass RLS
    const { data: message, error: messageError } = await serviceClient
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content: content.trim(),
        message_type: 'text'
      })
      .select(`
        *,
        sender:sender_id(id, display_name, avatar_url)
      `)
      .single();

    if (messageError) {
      console.error('Error creating message:', messageError);
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }

    return NextResponse.json({ data: { message } });
  } catch (error) {
    console.error('Error in messages POST:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
