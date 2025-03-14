/* eslint-disable @typescript-eslint/no-unused-vars */
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { playerId } = body;
    
    if (!playerId) {
      return NextResponse.json({ error: 'Player ID is required' }, { status: 400 });
    }
    
    const { data: playerData, error: playerError } = await supabase
      .from('player_stats')
      .select('player_id')
      .eq('player_id', playerId)
      .single();
    
    if (playerError) {
      const { error: insertError } = await supabase
        .from('player_stats')
        .insert([{ player_id: playerId }]);
        
      if (insertError) {
        throw insertError;
      }
    }
    
    const code = generateCode();
    
    await supabase
      .from('verification_codes')
      .update({ used: true })
      .eq('player_id', playerId)
      .eq('used', false);
    
    const { error: codeError } = await supabase
      .from('verification_codes')
      .insert([{
        player_id: playerId,
        code: code
      }]);
      
    if (codeError) {
      throw codeError;
    }
    
    return NextResponse.json({ code });
  } catch (error) {
    console.error('Error generating verification code:', error);
    return NextResponse.json({ error: 'Failed to generate verification code' }, { status: 500 });
  }
}