import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LeaderboardEntry {
  gamertag: string;
  finalFunds: number;
  structuresFound: number;
  actionsUsed: number;
  completedAt: string;
}

interface AuthScreenProps {
  onLogin: (user: { userId: string; gamertag: string } | null) => void;
  onViewLeaderboard: () => void;
}

const adjectives = ["Ancient", "Hidden", "Lost", "Golden", "Shadow", "Crystal", "Iron", "Storm", "Lunar", "Solar", "Frost", "Thunder", "Mystic", "Rogue", "Silent", "Swift", "Brave", "Dark", "Wild", "Noble"];
const nouns = ["Explorer", "Surveyor", "Digger", "Seeker", "Hunter", "Scout", "Finder", "Mapper", "Tracker", "Ranger", "Wanderer", "Pioneer", "Voyager", "Nomad", "Pathfinder", "Archaeologist", "Excavator", "Prospector", "Adventurer", "Scholar"];

function generateRandomGamertag(): string {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 999) + 1;
  return `${adj}${noun}${num}`;
}

export default function AuthScreen({ onLogin, onViewLeaderboard }: AuthScreenProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [gamertag, setGamertag] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch("/api/leaderboard?limit=10");
      const data = await response.json();
      if (Array.isArray(data)) {
        setLeaderboard(data);
      } else {
        setLeaderboard([]);
      }
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
    } finally {
      setLeaderboardLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = mode === "login" ? "/api/login" : "/api/register";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gamertag, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Authentication failed");
        setLoading(false);
        return;
      }

      onLogin(data);
    } catch (err) {
      setError("Connection failed. Please try again.");
      setLoading(false);
    }
  };

  const handleFreePlay = () => {
    onLogin(null);
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center p-4 overflow-auto">
      <div className="w-full max-w-5xl flex flex-col lg:flex-row gap-6">
        <div className="flex-1 space-y-6 min-w-0">
          <div className="text-center lg:text-left">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#00ff41] mb-2 font-['Rajdhani']">
              LOST CITY SURVEYOR
            </h1>
            <p className="text-[rgba(0,255,65,0.6)] text-xs sm:text-sm font-['Share_Tech_Mono']">
              ARCHAEOLOGICAL GRID RECONNAISSANCE
            </p>
          </div>

          <div className="bg-[rgba(0,255,65,0.05)] border border-[rgba(0,255,65,0.3)] rounded-lg p-6 shadow-[0_0_20px_rgba(0,255,65,0.1)]">
            <div className="flex gap-2 mb-6">
              <Button
                data-testid="button-login-tab"
                variant={mode === "login" ? "default" : "outline"}
                onClick={() => setMode("login")}
                className="flex-1 bg-[rgba(0,255,65,0.1)] hover:bg-[rgba(0,255,65,0.2)] border-[rgba(0,255,65,0.3)] text-[#00ff41]"
              >
                LOGIN
              </Button>
              <Button
                data-testid="button-register-tab"
                variant={mode === "register" ? "default" : "outline"}
                onClick={() => setMode("register")}
                className="flex-1 bg-[rgba(0,255,65,0.1)] hover:bg-[rgba(0,255,65,0.2)] border-[rgba(0,255,65,0.3)] text-[#00ff41]"
              >
                REGISTER
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label htmlFor="gamertag" className="text-[#00ff41] font-['Share_Tech_Mono']">
                    GAMERTAG
                  </Label>
                  {mode === "register" && (
                    <button
                      type="button"
                      data-testid="button-generate-gamertag"
                      onClick={() => setGamertag(generateRandomGamertag())}
                      className="text-xs text-cyan-400 hover:text-cyan-300 font-['Share_Tech_Mono'] flex items-center gap-1"
                    >
                      🎲 GENERATE
                    </button>
                  )}
                </div>
                <Input
                  id="gamertag"
                  data-testid="input-gamertag"
                  type="text"
                  value={gamertag}
                  onChange={(e) => setGamertag(e.target.value)}
                  required
                  className="bg-[rgba(0,0,0,0.3)] border-[rgba(0,255,65,0.3)] text-[#00ff41] placeholder:text-[rgba(0,255,65,0.3)]"
                  placeholder={mode === "register" ? "Click GENERATE or type your own" : "Enter agent codename"}
                />
              </div>

              <div>
                <Label htmlFor="password" className="text-[#00ff41] font-['Share_Tech_Mono']">
                  ACCESS CODE
                </Label>
                <Input
                  id="password"
                  data-testid="input-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-[rgba(0,0,0,0.3)] border-[rgba(0,255,65,0.3)] text-[#00ff41] placeholder:text-[rgba(0,255,65,0.3)]"
                  placeholder="Enter security code"
                />
              </div>

              {error && (
                <div data-testid="text-error" className="text-red-400 text-sm font-['Share_Tech_Mono'] bg-[rgba(255,0,0,0.1)] p-2 rounded border border-red-900">
                  {error}
                </div>
              )}

              <Button
                data-testid="button-submit"
                type="submit"
                disabled={loading}
                className="w-full bg-[#00ff41] text-black hover:bg-[#00dd35] font-['Rajdhani'] font-bold"
              >
                {loading ? "CONNECTING..." : mode === "login" ? "AUTHENTICATE" : "CREATE AGENT"}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-[rgba(0,255,65,0.2)]">
              <Button
                data-testid="button-free-play"
                variant="outline"
                onClick={handleFreePlay}
                className="w-full border-cyan-500 text-cyan-400 hover:bg-cyan-500/10 font-['Rajdhani'] font-bold mb-3"
              >
                🎮 FREE PLAY (No Registration)
              </Button>
              <p className="text-center text-xs text-[rgba(0,255,65,0.4)] font-['Share_Tech_Mono']">
                Scores won't be saved to leaderboard
              </p>
            </div>
          </div>

          <div className="text-center text-xs text-[rgba(0,255,65,0.4)] font-['Share_Tech_Mono']">
            <p>BUDGET TRACKING • COMPETITIVE SCORING</p>
            <p className="mt-1">NO PERSONAL DATA COLLECTION</p>
          </div>
        </div>

        <div className="w-full lg:flex-1 lg:max-w-sm">
          <div className="bg-[rgba(0,255,65,0.05)] border border-[rgba(0,255,65,0.3)] rounded-lg overflow-hidden shadow-[0_0_20px_rgba(0,255,65,0.1)]">
            <div className="bg-[rgba(0,255,65,0.1)] px-4 py-3 border-b border-[rgba(0,255,65,0.2)]">
              <h2 className="text-lg font-bold text-[#00ff41] font-['Rajdhani'] text-center">
                🏆 TOP SURVEYORS
              </h2>
            </div>

            {leaderboardLoading ? (
              <div className="p-8 text-center text-[rgba(0,255,65,0.6)] font-['Share_Tech_Mono'] text-sm">
                LOADING...
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-[rgba(0,255,65,0.6)] font-['Share_Tech_Mono'] text-sm mb-2">
                  NO SURVEYS COMPLETED
                </div>
                <div className="text-[rgba(0,255,65,0.4)] font-['Share_Tech_Mono'] text-xs">
                  Be the first to excavate all structures!
                </div>
              </div>
            ) : (
              <div className="divide-y divide-[rgba(0,255,65,0.1)]">
                {leaderboard.map((entry, index) => (
                  <div
                    key={index}
                    data-testid={`leaderboard-entry-${index}`}
                    className="px-4 py-3 flex items-center gap-3 hover:bg-[rgba(0,255,65,0.05)] transition-colors"
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold font-['Rajdhani'] text-sm ${index === 0 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50' :
                        index === 1 ? 'bg-gray-400/20 text-gray-300 border border-gray-400/50' :
                          index === 2 ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50' :
                            'bg-[rgba(0,255,65,0.1)] text-[rgba(0,255,65,0.6)] border border-[rgba(0,255,65,0.2)]'
                      }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[#00ff41] font-['Share_Tech_Mono'] text-sm truncate">
                        {entry.gamertag}
                      </div>
                      <div className="text-[rgba(0,255,65,0.5)] font-['Share_Tech_Mono'] text-xs">
                        {entry.structuresFound}/5 found • {entry.actionsUsed} actions
                      </div>
                    </div>
                    <div className={`font-bold font-['Rajdhani'] text-right ${entry.finalFunds >= 0 ? 'text-[#00ff41]' : 'text-red-400'
                      }`}>
                      ${entry.finalFunds.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="p-4 border-t border-[rgba(0,255,65,0.2)]">
              <Button
                data-testid="button-view-full-leaderboard"
                variant="ghost"
                onClick={onViewLeaderboard}
                className="w-full text-[rgba(0,255,65,0.7)] hover:text-[#00ff41] hover:bg-[rgba(0,255,65,0.1)] text-sm"
              >
                VIEW FULL LEADERBOARD →
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
