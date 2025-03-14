"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_KEY!
);

interface LeaderboardEntry {
  player_id: string;
  waves_killed: number;
  zombies_killed: number;
  worlds_saved: number;
  username?: string;
  rank?: number;
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'waves_killed' | 'zombies_killed' | 'worlds_saved'>('waves_killed');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const { data: statsData, error: leaderError } = await supabase
          .from('player_stats')
          .select('player_id, waves_killed, zombies_killed, worlds_saved')
          .order(sortBy, { ascending: false })
          .limit(100);

        if (leaderError) throw leaderError;
        
        if (statsData && statsData.length > 0) {
          const playerIds = statsData.map(entry => entry.player_id);
          
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('player_id, username')
            .in('player_id', playerIds);
            
          const leaderboardWithUsernames = statsData.map((entry, index) => {
            const profile = profilesData?.find(p => p.player_id === entry.player_id);
            return {
              ...entry,
              username: profile?.username,
              rank: index + 1
            };
          });
          
          setLeaderboard(leaderboardWithUsernames);
        } else {
          setLeaderboard([]);
        }
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [sortBy]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="relative">
          <div className="loading-circle"></div>
          <div className="loading-zombie"></div>
        </div>
        <p className="text-toxic-green mt-8 animate-pulse loading-text">
          Loading survivors<span className="dot-1">.</span>
          <span className="dot-2">.</span>
          <span className="dot-3">.</span>
        </p>
      </div>
    );  
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <Link href="/" className="text-toxic-green hover:text-blood-red transition mb-4 inline-block">
              ← Back to Main
            </Link>
            <h1 className="text-4xl font-bold text-toxic-green">Global Leaderboard</h1>
            <p className="text-gray-400 mt-2">Top survivors in the zombie apocalypse</p>
          </div>
          
          <div className="mt-4 md:mt-0 flex gap-2 flex-wrap">
            <button 
              onClick={() => setSortBy('waves_killed')}
              className={`px-4 py-2 rounded ${sortBy === 'waves_killed' ? 'bg-toxic-green text-black' : 'bg-gray-800 text-gray-300'}`}
            >
              Waves Survived
            </button>
            <button 
              onClick={() => setSortBy('zombies_killed')}
              className={`px-4 py-2 rounded ${sortBy === 'zombies_killed' ? 'bg-toxic-green text-black' : 'bg-gray-800 text-gray-300'}`}
            >
              Zombies Killed
            </button>
            <button 
              onClick={() => setSortBy('worlds_saved')}
              className={`px-4 py-2 rounded ${sortBy === 'worlds_saved' ? 'bg-toxic-green text-black' : 'bg-gray-800 text-gray-300'}`}
            >
              Worlds Saved
            </button>
          </div>
        </div>

        <div className="bg-gray-900 p-4 rounded-lg border-2 border-gray-800">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="py-3 px-4 text-left">Rank</th>
                  <th className="py-3 px-4 text-left">Player</th>
                  <th className="py-3 px-4 text-right">Waves Survived</th>
                  <th className="py-3 px-4 text-right">Zombies Killed</th>
                  <th className="py-3 px-4 text-right">Worlds Saved</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.length > 0 ? (
                  leaderboard.map((entry) => (
                    <tr 
                      key={entry.player_id}
                      className="border-b border-gray-800 hover:bg-gray-800 transition"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          {entry.rank === 1 && <span className="text-xl">🏆</span>}
                          {entry.rank === 2 && <span className="text-xl">🥈</span>}
                          {entry.rank === 3 && <span className="text-xl">🥉</span>}
                          <span className={`font-bold ${entry.rank && entry.rank <= 3 ? 'text-toxic-green' : 'text-gray-400'}`}>
                            #{entry.rank}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Link href={`/profile?player_id=${entry.player_id}`} className="hover:text-toxic-green transition">
                          {entry.username || (
                            <span className="font-mono text-sm text-gray-300">
                              {entry.player_id.slice(0, 8)}...{entry.player_id.slice(-4)}
                            </span>
                          )}
                        </Link>
                      </td>
                      <td className="py-4 px-4 text-right font-bold text-toxic-green">
                        {entry.waves_killed}
                      </td>
                      <td className="py-4 px-4 text-right font-bold text-blood-red">
                        {entry.zombies_killed}
                      </td>
                      <td className="py-4 px-4 text-right font-bold text-yellow-500">
                        {entry.worlds_saved}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-gray-400">
                      No survivors found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <div className="p-4 bg-gray-900 rounded-lg inline-block">
            <p className="text-gray-400">
              Want to join the leaderboard? 
              <Link href="/download" className="text-toxic-green hover:text-blood-red transition ml-2">
                Download the game
              </Link>
              <span className="text-gray-400"> and start surviving!</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}