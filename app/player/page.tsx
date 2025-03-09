"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import Image from "next/image";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_KEY!
);

interface PlayerStats {
  player_id: string;
  waves_killed: number;
  zombies_killed: number;
  worlds_saved: number;
  updated_at: string;
}

interface MatchData {
  id: string;
  waves_survived: number;
  zombies_killed: number;
  worlds_saved: number;
  played_at: string;
}

interface LeaderboardEntry {
  player_id: string;
  waves_killed: number;
  username?: string;
}

interface ProfileData {
  username: string;
}

export default function PlayerPage() {
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
  const [playerProfile, setPlayerProfile] = useState<ProfileData | null>(null);
  const [recentMatches, setRecentMatches] = useState<MatchData[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const playerId = urlParams.get('player_id');

        if (!playerId) {
          throw new Error("No player ID provided");
        }

        const { data: playerData, error: playerError } = await supabase
          .from('player_stats')
          .select('*')
          .eq('player_id', playerId)
          .single();

        if (playerError) throw playerError;
        setPlayerStats(playerData);

        const { data: profileData } = await supabase
          .from('profiles')
          .select('username')
          .eq('player_id', playerId)
          .single();
          
        if (profileData) {
          setPlayerProfile(profileData);
        }

        const { data: matchesData, error: matchesError } = await supabase
          .from('player_matches')
          .select('*')
          .eq('player_id', playerId)
          .order('played_at', { ascending: false })
          .limit(3);

        if (matchesError) throw matchesError;
        setRecentMatches(matchesData || []);

        const { data: statsData, error: leaderError } = await supabase
          .from('player_stats')
          .select('player_id, waves_killed')
          .order('waves_killed', { ascending: false })
          .limit(10);

        if (leaderError) throw leaderError;
        
        if (statsData && statsData.length > 0) {
          const playerIds = statsData.map(entry => entry.player_id);
          
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('player_id, username')
            .in('player_id', playerIds);
            
          const leaderboardWithUsernames = statsData.map(entry => {
            const profile = profilesData?.find(p => p.player_id === entry.player_id);
            return {
              ...entry,
              username: profile?.username
            };
          });
          
          setLeaderboard(leaderboardWithUsernames);
        } else {
          setLeaderboard(statsData || []);
        }

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-toxic-green border-t-transparent"></div>
      </div>
    );  
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        <Link href="/" className="text-toxic-green hover:text-blood-red transition mb-8 inline-block">
          ← Back to Main
        </Link>

        {playerStats ? (
          <>
            <div className="flex items-center gap-6 mb-12">
              <div className="relative">
                <Image
                  src="/blood.png"
                  alt="Player Icon"
                  width={100}
                  height={100}
                  className="rounded-full border-4 border-blood-red"
                />
                <div className="absolute -bottom-2 -right-2 bg-toxic-green text-black px-3 py-1 rounded-full text-sm font-bold">
                  #{leaderboard.findIndex(entry => entry.player_id === playerStats.player_id) + 1}
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-toxic-green mb-2">
                  {playerProfile?.username || "Unnamed Survivor"}
                </h1>
                <p className="text-gray-400">
                  Last updated: {new Date(playerStats.updated_at).toLocaleDateString()}
                </p>
                <p className="text-xs text-gray-500 mt-1 font-mono">
                  ID: {playerStats.player_id.slice(0, 8)}...{playerStats.player_id.slice(-4)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
              <StatCard 
                title="Waves Survived" 
                value={playerStats.waves_killed}
                icon="🌊"
              />
              <StatCard
                title="Zombies Killed"
                value={playerStats.zombies_killed}
                icon="🧟"
              />
              <StatCard
                title="Global Rank"
                value={`#${leaderboard.findIndex(entry => entry.player_id === playerStats.player_id) + 1}`}
                icon="🏆"
              />
            </div>

            {recentMatches.length > 0 && (
              <div className="bg-gray-900 p-6 rounded-lg mb-12">
                <h2 className="text-2xl text-toxic-green mb-6 font-bold">Recent Matches</h2>
                <div className="space-y-3">
                  {recentMatches.map((match, index) => (
                    <div 
                      key={index}
                      className="p-4 rounded-lg bg-gray-800"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-sm text-gray-400">
                            {new Date(match.played_at).toLocaleDateString()} at {new Date(match.played_at).toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="flex gap-4">
                          <span className="text-toxic-green font-bold">
                            {match.waves_survived} Waves
                          </span>
                          <span className="text-blood-red font-bold">
                            {match.zombies_killed} Zombies
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-gray-900 p-6 rounded-lg mb-12">
              <h2 className="text-2xl text-toxic-green mb-6 font-bold">Global Leaderboard</h2>
              <div className="space-y-3">
                {leaderboard.map((entry, index) => (
                  <div 
                    key={entry.player_id}
                    className={`p-4 rounded-lg ${entry.player_id === playerStats.player_id 
                      ? 'bg-toxic-green/20 border-2 border-toxic-green'
                      : 'bg-gray-800'}`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <span className="text-gray-400">#{index + 1}</span>
                        <div>
                          {entry.username ? (
                            <span className="text-toxic-green font-bold">{entry.username}</span>
                          ) : (
                            <span className="font-mono text-sm text-gray-300">
                              {entry.player_id.slice(0, 8)}...{entry.player_id.slice(-4)}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-toxic-green font-bold">
                        {entry.waves_killed} Waves
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-2xl text-blood-red mb-4">Player Not Found</h2>
            <p className="text-gray-400">The specified player could not be found in our records</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string; value: string | number; icon: string }) {
  return (
    <div className="bg-gray-900 p-6 rounded-lg border-2 border-gray-800 hover:border-toxic-green transition">
      <div className="flex items-center gap-4">
        <span className="text-3xl">{icon}</span>
        <div>
          <h3 className="text-gray-400 text-sm mb-1">{title}</h3>
          <p className="text-2xl font-bold text-toxic-green">{value}</p>
        </div>
      </div>
    </div>
  );
}