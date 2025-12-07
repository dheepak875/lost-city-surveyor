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
      const response = await fetch("/api/leaderboard?limit=5");
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
    <div className="h-screen w-full bg-[#0a0e1a] flex items-center justify-center p-4 font-sans text-[#00ff41] overflow-hidden">
      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 items-center h-full max-h-[800px]">

        {/* LEFT COLUMN: Educational & Game Info */}
        <div className="space-y-4 lg:space-y-6 flex flex-col justify-center h-full">
          <div>
            <h1 className="text-3xl lg:text-5xl font-black mb-1 font-['Rajdhani'] tracking-tighter bg-gradient-to-r from-[#00ff41] to-emerald-600 bg-clip-text text-transparent">
              UNCHARTED RUINS
            </h1>
            <p className="text-lg lg:text-xl text-[rgba(0,255,65,0.8)] font-['Share_Tech_Mono']">
              ARCHAEOLOGICAL GRID RECONNAISSANCE
            </p>
          </div>

          <div className="bg-[rgba(0,255,65,0.05)] border-l-2 border-[#00ff41] p-4 rounded-r-lg">
            <h3 className="text-lg font-bold mb-2 font-['Rajdhani'] flex items-center gap-2">
              <span className="text-xl">📡</span> THE SCIENCE
            </h3>
            <p className="text-[rgba(0,255,65,0.7)] text-sm leading-snug mb-2">
              Real archaeology uses <strong className="text-[#00ff41]">LiDAR</strong> to strip away vegetation digitally and <strong className="text-[#00ff41]">GPR</strong> to "see" underground walls.
            </p>
            <p className="text-[rgba(0,255,65,0.7)] text-sm leading-snug">
              Locate lost structures, manage your budget, and discover the truth.
            </p>
          </div>

          {/* Compact Tool Grid */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-[#0f1623] p-2 rounded border border-[rgba(0,255,65,0.2)] flex items-center gap-3">
              <div className="text-2xl">🛰️</div>
              <div>
                <h4 className="font-bold font-['Rajdhani'] text-sm">SCAN</h4>
                <p className="text-[10px] text-[rgba(0,255,65,0.6)] leading-none">Multispectral Imaging</p>
              </div>
            </div>
            <div className="bg-[#0f1623] p-2 rounded border border-[rgba(0,255,65,0.2)] flex items-center gap-3">
              <div className="text-2xl">🚁</div>
              <div>
                <h4 className="font-bold font-['Rajdhani'] text-sm">LiDAR</h4>
                <p className="text-[10px] text-[rgba(0,255,65,0.6)] leading-none">Proximity Drones</p>
              </div>
            </div>
            <div className="bg-[#0f1623] p-2 rounded border border-[rgba(0,255,65,0.2)] flex items-center gap-3">
              <div className="text-2xl">📡</div>
              <div>
                <h4 className="font-bold font-['Rajdhani'] text-sm">GPR</h4>
                <p className="text-[10px] text-[rgba(0,255,65,0.6)] leading-none">Ground Radar</p>
              </div>
            </div>
            <div className="bg-[#0f1623] p-2 rounded border border-[rgba(0,255,65,0.2)] flex items-center gap-3">
              <div className="text-2xl">⛏️</div>
              <div>
                <h4 className="font-bold font-['Rajdhani'] text-sm">EXCAVATE</h4>
                <p className="text-[10px] text-[rgba(0,255,65,0.6)] leading-none">Reveal Artifacts</p>
              </div>
            </div>
          </div>

          {/* Compact Leaderboard Preview - Hidden on small mobile to save space */}
          <div className="hidden sm:block flex-1 min-h-0 bg-[rgba(0,255,65,0.02)] rounded p-3 border border-[rgba(0,255,65,0.1)]">
            <div className="flex items-center justify-between border-b border-[rgba(0,255,65,0.2)] pb-1 mb-2">
              <h3 className="font-bold font-['Rajdhani'] text-sm">TOP AGENTS</h3>
              <button onClick={onViewLeaderboard} className="text-[10px] text-[rgba(0,255,65,0.6)] hover:text-[#00ff41]">VIEW ALL</button>
            </div>
            <div className="space-y-1">
              {leaderboardLoading ? (
                <div className="text-[10px] text-[rgba(0,255,65,0.4)]">LOADING...</div>
              ) : leaderboard.length === 0 ? (
                <div className="text-[10px] text-[rgba(0,255,65,0.4)]">NO RECORDS</div>
              ) : (
                leaderboard.slice(0, 3).map((entry, i) => (
                  <div key={i} className="flex justify-between items-center text-xs font-['Share_Tech_Mono']">
                    <div className="flex items-center gap-2">
                      <span className="text-[rgba(0,255,65,0.4)]">#{i + 1}</span>
                      <span className="text-[#00ff41] truncate max-w-[100px]">{entry.gamertag}</span>
                    </div>
                    <span className="text-[rgba(0,255,65,0.7)]">${entry.finalFunds.toLocaleString()}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Auth Box */}
        <div className="flex flex-col justify-center h-full">
          <div className="bg-[#0f1623] border border-[rgba(0,255,65,0.3)] rounded-xl p-6 lg:p-8 shadow-[0_0_50px_rgba(0,255,65,0.15)] relative w-full max-w-md mx-auto">
            {/* Decorative corners */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#00ff41] rounded-tl-xl"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#00ff41] rounded-br-xl"></div>

            <div className="text-center mb-6">
              <h2 className="text-xl font-bold font-['Rajdhani'] mb-1">ACCESS TERMINAL</h2>
              <div className="h-1 w-16 bg-[#00ff41] mx-auto rounded-full opacity-50"></div>
            </div>

            <div className="flex gap-2 mb-6 bg-[rgba(0,255,65,0.05)] p-1 rounded-lg">
              <Button
                data-testid="button-login-tab"
                onClick={() => setMode("login")}
                className={`flex-1 h-8 text-sm font-['Rajdhani'] font-bold tracking-wider ${mode === "login" ? 'bg-[#00ff41] text-black hover:bg-[#00dd35]' : 'bg-transparent text-[rgba(0,255,65,0.6)] hover:bg-[rgba(0,255,65,0.1)] hover:text-[#00ff41]'}`}
              >
                LOGIN
              </Button>
              <Button
                data-testid="button-register-tab"
                onClick={() => setMode("register")}
                className={`flex-1 h-8 text-sm font-['Rajdhani'] font-bold tracking-wider ${mode === "register" ? 'bg-[#00ff41] text-black hover:bg-[#00dd35]' : 'bg-transparent text-[rgba(0,255,65,0.6)] hover:bg-[rgba(0,255,65,0.1)] hover:text-[#00ff41]'}`}
              >
                REGISTER
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <Label htmlFor="gamertag" className="font-['Share_Tech_Mono'] text-[10px] tracking-widest text-[rgba(0,255,65,0.7)]">
                    AGENT IDENTITY
                  </Label>
                  {mode === "register" && (
                    <button
                      type="button"
                      onClick={() => setGamertag(generateRandomGamertag())}
                      className="text-[10px] text-cyan-400 hover:text-cyan-300 font-['Share_Tech_Mono'] flex items-center gap-1 uppercase tracking-wider"
                    >
                      🎲 Generate
                    </button>
                  )}
                </div>
                <Input
                  id="gamertag"
                  type="text"
                  value={gamertag}
                  onChange={(e) => setGamertag(e.target.value)}
                  required
                  className="bg-[rgba(0,0,0,0.3)] border-[rgba(0,255,65,0.3)] text-[#00ff41] placeholder:text-[rgba(0,255,65,0.2)] h-10 font-['Share_Tech_Mono'] text-sm focus:border-[#00ff41] focus:ring-[#00ff41]"
                  placeholder={mode === "register" ? "Choose codename..." : "Enter codename..."}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="password" className="font-['Share_Tech_Mono'] text-[10px] tracking-widest text-[rgba(0,255,65,0.7)]">
                  SECURITY KEY
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-[rgba(0,0,0,0.3)] border-[rgba(0,255,65,0.3)] text-[#00ff41] placeholder:text-[rgba(0,255,65,0.2)] h-10 font-['Share_Tech_Mono'] text-sm focus:border-[#00ff41] focus:ring-[#00ff41]"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <div className="text-red-400 text-xs font-['Share_Tech_Mono'] bg-[rgba(255,0,0,0.1)] p-2 rounded border border-red-900/50 flex items-center gap-2">
                  <span>⚠️</span> {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#00ff41] text-black hover:bg-[#00dd35] font-['Rajdhani'] font-bold text-base h-10 tracking-widest shadow-[0_0_20px_rgba(0,255,65,0.3)] hover:shadow-[0_0_30px_rgba(0,255,65,0.5)] transition-all duration-300"
              >
                {loading ? "ESTABLISHING UPLINK..." : mode === "login" ? "INITIALIZE SESSION" : "REGISTER AGENT"}
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t border-[rgba(0,255,65,0.2)]">
              <Button
                variant="outline"
                onClick={handleFreePlay}
                className="w-full h-8 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 hover:text-cyan-300 font-['Rajdhani'] font-bold tracking-wider text-xs"
              >
                🎮 BYPASS SECURITY (TRIAL MODE)
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
