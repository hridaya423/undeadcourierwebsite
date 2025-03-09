// app/api/verify/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code } = body;
    
    if (!code) {
      return NextResponse.json({ error: 'Verification code is required' }, { status: 400 });
    }
    
    // Check if code exists and is valid
    const { data: codeData, error: codeError } = await supabase
      .from('verification_codes')
      .select('player_id, expires_at, used')
      .eq('code', code)
      .eq('used', false)
      .single();
    
    if (codeError || !codeData) {
      return NextResponse.json({ error: 'Invalid or expired verification code' }, { status: 400 });
    }
    
    // Check if code is expired (if expires_at is present)
    if (codeData.expires_at && new Date(codeData.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Verification code has expired' }, { status: 400 });
    }
    
    // Mark code as used
    await supabase
      .from('verification_codes')
      .update({ used: true })
      .eq('code', code);
    
    // Create a session token
    const sessionToken = randomUUID();
    
    // Set session in a cookie
    const response = NextResponse.json({ 
      success: true, 
      player_id: codeData.player_id 
    });
    
    // Set cookie - make sure it's not HttpOnly for client access
    response.cookies.set({
      name: 'player_session',
      value: JSON.stringify({
        token: sessionToken,
        player_id: codeData.player_id
      }),
      httpOnly: false, // Changed to false so client JS can read it
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    });
    
    return response;
  } catch (error) {
    console.error('Error verifying code:', error);
    return NextResponse.json({ error: 'Failed to verify code' }, { status: 500 });
  }
}