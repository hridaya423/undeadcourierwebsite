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
  total_playtime_seconds?: number;
  username?: string;
  rank?: number;
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

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [filteredLeaderboard, setFilteredLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'waves_killed' | 'zombies_killed' | 'worlds_saved' | 'total_playtime_seconds'>('waves_killed');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const { data: statsData, error: leaderError } = await supabase
          .from('player_stats')
          .select('player_id, waves_killed, zombies_killed, worlds_saved, total_playtime_seconds')
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
          setFilteredLeaderboard(leaderboardWithUsernames);
        } else {
          setLeaderboard([]);
          setFilteredLeaderboard([]);
        }
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [sortBy]);
  
  // Filter leaderboard based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredLeaderboard(leaderboard);
    } else {
      const filtered = leaderboard.filter(entry => {
        const username = entry.username || entry.player_id.slice(0, 8) + '...' + entry.player_id.slice(-4);
        return username.toLowerCase().includes(searchQuery.toLowerCase());
      });
      setFilteredLeaderboard(filtered);
    }
  }, [searchQuery, leaderboard]);

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
          
          <div className="mt-6 md:mt-0 w-full md:w-auto">
            {/* Improved search input */}
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Search players..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-64 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-toxic-green pl-10"
              />
              <div className="absolute left-3 top-3.5 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            
            {/* Improved sort controls with proper styling */}
            <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-gray-900">
                <button 
                  onClick={() => setSortBy('waves_killed')}
                  className={`relative px-4 py-3 transition-all duration-200 ${sortBy === 'waves_killed' ? 'bg-toxic-green text-black font-bold' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-sm">🌊</span>
                    <span>Waves</span>
                  </div>
                  {sortBy === 'waves_killed' && (
                    <span className="absolute bottom-0 left-0 w-full h-1 bg-black opacity-20"></span>
                  )}
                </button>
                
                <button 
                  onClick={() => setSortBy('zombies_killed')}
                  className={`relative px-4 py-3 transition-all duration-200 ${sortBy === 'zombies_killed' ? 'bg-blood-red text-white font-bold' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-sm">🧟</span>
                    <span>Zombies</span>
                  </div>
                  {sortBy === 'zombies_killed' && (
                    <span className="absolute bottom-0 left-0 w-full h-1 bg-black opacity-20"></span>
                  )}
                </button>
                
                <button 
                  onClick={() => setSortBy('worlds_saved')}
                  className={`relative px-4 py-3 transition-all duration-200 ${sortBy === 'worlds_saved' ? 'bg-yellow-500 text-black font-bold' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-sm">🌍</span>
                    <span>Worlds</span>
                  </div>
                  {sortBy === 'worlds_saved' && (
                    <span className="absolute bottom-0 left-0 w-full h-1 bg-black opacity-20"></span>
                  )}
                </button>
                
                <button 
                  onClick={() => setSortBy('total_playtime_seconds')}
                  className={`relative px-4 py-3 transition-all duration-200 ${sortBy === 'total_playtime_seconds' ? 'bg-purple-500 text-white font-bold' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-sm">⏱️</span>
                    <span>Time</span>
                  </div>
                  {sortBy === 'total_playtime_seconds' && (
                    <span className="absolute bottom-0 left-0 w-full h-1 bg-black opacity-20"></span>
                  )}
                </button>
              </div>
              
              <div className="py-2 px-3 text-xs text-gray-400 bg-gray-850 border-t border-gray-900">
                Sort by: <span className="text-toxic-green font-medium capitalize">{sortBy.replace('_', ' ').replace('killed', 'survived')}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 p-4 rounded-lg border-2 border-gray-800 shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="py-3 px-4 text-left">Rank</th>
                  <th className="py-3 px-4 text-left">Player</th>
                  <th 
                    className="py-3 px-4 text-right cursor-pointer group"
                    onClick={() => setSortBy('waves_killed')}
                  >
                    <div className="flex items-center justify-end gap-2">
                      <span>Waves Survived</span>
                      <span className={`transition-opacity ${sortBy === 'waves_killed' ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`}>↓</span>
                    </div>
                  </th>
                  <th 
                    className="py-3 px-4 text-right cursor-pointer group"
                    onClick={() => setSortBy('zombies_killed')}
                  >
                    <div className="flex items-center justify-end gap-2">
                      <span>Zombies Killed</span>
                      <span className={`transition-opacity ${sortBy === 'zombies_killed' ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`}>↓</span>
                    </div>
                  </th>
                  <th 
                    className="py-3 px-4 text-right cursor-pointer group"
                    onClick={() => setSortBy('worlds_saved')}
                  >
                    <div className="flex items-center justify-end gap-2">
                      <span>Worlds Saved</span>
                      <span className={`transition-opacity ${sortBy === 'worlds_saved' ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`}>↓</span>
                    </div>
                  </th>
                  <th 
                    className="py-3 px-4 text-right cursor-pointer group"
                    onClick={() => setSortBy('total_playtime_seconds')}
                  >
                    <div className="flex items-center justify-end gap-2">
                      <span>Playtime</span>
                      <span className={`transition-opacity ${sortBy === 'total_playtime_seconds' ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`}>↓</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredLeaderboard.length > 0 ? (
                  filteredLeaderboard.map((entry) => (
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
                        <Link href={`/player?player_id=${entry.player_id}`} className="hover:text-toxic-green transition">
                          {entry.username || (
                            <span className="font-mono text-sm text-gray-300">
                              {entry.player_id.slice(0, 8)}...{entry.player_id.slice(-4)}
                            </span>
                          )}
                        </Link>
                      </td>
                      <td className="py-4 px-4 text-right font-bold text-toxic-green">
                        {entry.waves_killed}
                        {sortBy === 'waves_killed' && <span className="ml-1 text-xs">★</span>}
                      </td>
                      <td className="py-4 px-4 text-right font-bold text-blood-red">
                        {entry.zombies_killed}
                        {sortBy === 'zombies_killed' && <span className="ml-1 text-xs">★</span>}
                      </td>
                      <td className="py-4 px-4 text-right font-bold text-yellow-500">
                        {entry.worlds_saved}
                        {sortBy === 'worlds_saved' && <span className="ml-1 text-xs">★</span>}
                      </td>
                      <td className="py-4 px-4 text-right font-bold text-purple-400">
                        {entry.total_playtime_seconds ? formatPlaytime(entry.total_playtime_seconds) : "0 seconds"}
                        {sortBy === 'total_playtime_seconds' && <span className="ml-1 text-xs">★</span>}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-gray-400">
                      {searchQuery ? `No survivors found matching "${searchQuery}"` : "No survivors found"}
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