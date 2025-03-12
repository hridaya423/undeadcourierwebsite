/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_KEY!
);

export default function ProfilePage() {
  const [username, setUsername] = useState("");
  const [playerData, setPlayerData] = useState<any>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const playerSession = getCookie('player_session');
        
        if (!playerSession) {
          console.log("No player_session cookie found, redirecting to verify");
          router.push("/verify");
          return;
        }
        
        let session;
        try {
          session = JSON.parse(playerSession);
        } catch (e) {
          console.error("Error parsing player_session cookie:", e);
          router.push("/verify");
          return;
        }

        if (!session || !session.player_id) {
          console.log("Invalid session or missing player_id, redirecting to verify");
          router.push("/verify");
          return;
        }


        const { data: playerStats, error: playerError } = await supabase
          .from("player_stats")
          .select("*")
          .eq("player_id", session.player_id)
          .single();

        if (playerError) {
          console.error("Error fetching player stats:", playerError);
          throw playerError;
        }
        const { data: profile } = await supabase
          .from("profiles")
          .select("username")
          .eq("player_id", session.player_id)
          .single();

        if (profile && profile.username) {
          setUsername(profile.username);
        }

        setPlayerData({ ...playerStats, player_id: session.player_id });
      } catch (error) {
        console.error("Error checking session:", error);
        router.push("/verify");
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, [router]);

  function getCookie(name: string) {
    const cookieArr = document.cookie.split(";");
    
    for (let i = 0; i < cookieArr.length; i++) {
      const cookiePair = cookieArr[i].split("=");
      const cookieName = cookiePair[0].trim();
      
      if (cookieName === name) {
        return decodeURIComponent(cookiePair[1]);
      }
    }
    
    return null;
  }

  const handleSaveUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      if (!username || username.length < 3 || username.length > 20) {
        throw new Error("Username must be between 3 and 20 characters");
      }

      const response = await fetch("/api/username", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update username");
      }

      setSuccess("Username updated successfully!");
    } catch (error: any) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-toxic-green border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="text-toxic-green hover:text-blood-red transition mb-8 inline-block">
          ← Back to Main
        </Link>

        <div className="bg-gray-900 p-8 rounded-lg mb-8">
          <h1 className="text-2xl font-bold text-toxic-green mb-6">
            Your Profile
          </h1>

          <div className="mb-8">
            <h2 className="text-xl text-gray-300 mb-4">Player ID</h2>
            <div className="p-4 bg-gray-800 rounded-lg font-mono text-sm break-all">
              {playerData?.player_id}
            </div>
            <p className="text-gray-400 text-sm mt-2">
              This is your unique player identifier linked to your game device
            </p>
          </div>

          <form onSubmit={handleSaveUsername}>
            <h2 className="text-xl text-gray-300 mb-4">Username</h2>
            <div className="mb-6">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Set your username"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-toxic-green"
                minLength={3}
                maxLength={20}
                required
              />
              <p className="text-gray-400 text-sm mt-2">
                Choose a username between 3-20 characters
              </p>
            </div>

            {error && (
              <div className="mb-6 p-3 bg-blood-red/20 border border-blood-red rounded-lg text-blood-red">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-6 p-3 bg-toxic-green/20 border border-toxic-green rounded-lg text-toxic-green">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="bg-toxic-green text-black font-bold py-3 px-6 rounded-lg hover:bg-toxic-green/80 transition disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Username"}
            </button>
          </form>
        </div>

        {playerData && (
          <div className="bg-gray-900 p-8 rounded-lg">
            <h2 className="text-xl font-bold text-toxic-green mb-6">
              Your Game Statistics
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard 
                title="Waves Survived" 
                value={playerData.waves_killed || 0}
                icon="🌊"
              />
              <StatCard
                title="Zombies Killed"
                value={playerData.zombies_killed || 0}
                icon="🧟"
              />
              <StatCard
                title="Worlds Saved"
                value={playerData.worlds_saved || 0}
                icon="🌍"
              />
            </div>

            <div className="mt-6">
              <Link 
                href={`/player?player_id=${playerData.player_id}`}
                className="text-toxic-green hover:underline"
              >
                View your public profile page →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string; value: string | number; icon: string }) {
  return (
    <div className="bg-gray-800 p-6 rounded-lg border-2 border-gray-700 hover:border-toxic-green transition">
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
