import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_KEY!
);

export async function POST(request: Request) {
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };
    
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers });
    }
    
    try {
      const body = await request.json();
      console.log('Request body:', body);
      
      const { data: existingPlayer, error: queryError } = await supabase
        .from('player_stats')
        .select('waves_killed, zombies_killed, worlds_saved, total_playtime_seconds')
        .eq('player_id', body.playerId)
        .single();
      
      if (queryError && queryError.code !== 'PGRST116') {
        console.error('Error checking existing player:', queryError);
        return new Response(JSON.stringify({ error: queryError.message }), { 
          status: 500,
          headers
        });
      }
      
      const totalZombiesKilled = (existingPlayer?.zombies_killed || 0) + (body.zombiesKilled || 0);
      const wasUpdated = !existingPlayer || body.score > existingPlayer.waves_killed;
      
      // Update or use existing playtime data
      const existingPlaytime = existingPlayer?.total_playtime_seconds || 0;
      const totalPlaytime = body.totalPlaytime || existingPlaytime;
      
      // Upsert player stats including playtime
      const { data, error } = await supabase
        .from('player_stats')
        .upsert({ 
          player_id: body.playerId,
          waves_killed: wasUpdated ? body.score : existingPlayer.waves_killed,
          zombies_killed: totalZombiesKilled,
          worlds_saved: body.worldsSaved || (existingPlayer?.worlds_saved || 0),
          total_playtime_seconds: totalPlaytime,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'player_id'
        });
            
      console.log('Supabase response:', { data, error });
      
      if (error) {
        console.error('Supabase error:', error);
        return new Response(JSON.stringify({ error: error.message }), { 
          status: 500,
          headers
        });
      }

      // Insert match data including match duration
      const { error: matchError } = await supabase
        .from('player_matches')
        .insert({
          player_id: body.playerId,
          waves_survived: body.score,
          zombies_killed: body.zombiesKilled || 0,
          match_duration_seconds: body.matchDuration || 0,
          played_at: new Date().toISOString()
        });

      if (matchError) {
        console.error('Error recording match:', matchError);
      }
      
      return new Response(JSON.stringify({ success: true, updated: wasUpdated }), { status: 200, headers });
    } catch (error) {
      console.error('Unexpected error:', error);
      return new Response(JSON.stringify({ error: 'Failed to save score' }), { 
        status: 500,
        headers
      });
    }
}

export async function GET(request: Request) {
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };
    
    const { searchParams } = new URL(request.url);
    const playerId = searchParams.get('playerId');
    
    console.log(`GET /api/scores endpoint hit for playerId: ${playerId}`);

    if (!playerId) {
      return new Response(JSON.stringify({ error: 'Player ID is required' }), { 
        status: 400,
        headers
      });
    }

    try {
      // Updated query to include playtime data
      const { data: playerData, error: playerError } = await supabase
        .from('player_stats')
        .select('waves_killed, zombies_killed, worlds_saved, total_playtime_seconds, updated_at')
        .eq('player_id', playerId)
        .single();

      if (playerError) throw playerError;
      
      // Updated query to include match duration
      const { data: recentMatches, error: matchesError } = await supabase
        .from('player_matches')
        .select('waves_survived, zombies_killed, match_duration_seconds, played_at')
        .eq('player_id', playerId)
        .order('played_at', { ascending: false })
        .limit(3);
      
      if (matchesError) throw matchesError;

      // Format playtime for display (optional)
      const formattedPlaytime = formatPlaytime(playerData.total_playtime_seconds || 0);

      const responseData = {
        ...playerData,
        formatted_playtime: formattedPlaytime,
        recent_matches: recentMatches || []
      };

      return new Response(JSON.stringify(responseData), { status: 200, headers });
    } catch (error) {
      console.error('Error fetching score:', error);
      return new Response(JSON.stringify({ error: 'Score not found' }), { 
        status: 404,
        headers
      });
    }
}

// Helper function to format playtime nicely
function formatPlaytime(seconds: number): string {
  if (seconds < 60) {
    return `${seconds} seconds`;
  }
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  }
  
  return `${hours} hour${hours !== 1 ? 's' : ''} ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`;
}

export async function OPTIONS() {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });
}