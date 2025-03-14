import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { randomUUID } from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function PUT(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const playerSessionCookie = (await cookieStore).get('player_session');
    
    if (!playerSessionCookie) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const session = JSON.parse(playerSessionCookie.value);
    if (!session.player_id) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }
    
    const body = await request.json();
    const { username } = body;
    
    if (!username || username.length < 3 || username.length > 20) {
      return NextResponse.json({ error: 'Username must be between 3 and 20 characters' }, { status: 400 });
    }
    
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('player_id')
      .eq('username', username)
      .not('player_id', 'eq', session.player_id)
      .single();
    
    if (existingUser) {
      return NextResponse.json({ error: 'Username already taken' }, { status: 400 });
    }
    
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id, player_id')
      .eq('player_id', session.player_id)
      .single();
    
    if (existingProfile) {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ username, updated_at: new Date() })
        .eq('player_id', session.player_id);
      
      if (updateError) throw updateError;
    } else {
      const randomEmail = `player_${randomUUID()}@game.local`;
      const randomPassword = randomUUID();
      
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: randomEmail,
        password: randomPassword,
        email_confirm: true
      });
      
      if (authError) {
        console.error('Auth user creation error:', authError);
        return NextResponse.json({ 
          error: 'Failed to create user account'
        }, { status: 500 });
      }
      
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          player_id: session.player_id,
          username: username
        });
      
      if (insertError) {
        console.error('Profile creation error:', insertError);
        return NextResponse.json({ 
          error: 'Failed to create profile'
        }, { status: 500 });
      }
    }
    
    return NextResponse.json({ success: true, username });
  } catch (error) {
    console.error('Error updating username:', error);
    return NextResponse.json({ error: 'Failed to update username' }, { status: 500 });
  }
}