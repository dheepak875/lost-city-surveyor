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
    <div className="min-h-screen bg-[#0a0e1a] w-full overflow-x-hidden font-sans text-[#00ff41]">
      <div className="container mx-auto px-4 py-8 lg:py-12 flex flex-col items-center justify-center min-h-screen">
        <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">

          {/* LEFT COLUMN: Educational & Game Info */}
          <div className="space-y-8 animate-in fade-in slide-in-from-left duration-700">
            <div>
              <h1 className="text-4xl md:text-6xl font-black mb-2 font-['Rajdhani'] tracking-tighter bg-gradient-to-r from-[#00ff41] to-emerald-600 bg-clip-text text-transparent">
                UNCHARTED RUINS
              </h1>
              <p className="text-xl md:text-2xl text-[rgba(0,255,65,0.8)] font-['Share_Tech_Mono']">
                ARCHAEOLOGICAL GRID RECONNAISSANCE
              </p>
            </div>

            <div className="bg-[rgba(0,255,65,0.05)] border-l-4 border-[#00ff41] p-6 rounded-r-lg">
              <h3 className="text-xl font-bold mb-3 font-['Rajdhani'] flex items-center gap-2">
                <span className="text-2xl">📡</span> THE SCIENCE OF DISCOVERY
              </h3>
              <p className="text-[rgba(0,255,65,0.7)] leading-relaxed mb-4">
                Real-world archaeology isn't just digging with shovels. Modern surveyors use
                <strong className="text-[#00ff41]"> LiDAR (Light Detection and Ranging)</strong> to strip away vegetation digitally and
                <strong className="text-[#00ff41]"> GPR (Ground Penetrating Radar)</strong> to "see" underground walls before breaking ground.
              </p>
              <p className="text-[rgba(0,255,65,0.7)] leading-relaxed">
                In this simulation, you take command of these authentic tools. Your mission is to locate lost ancient structures while carefully managing a research budget. Every scan costs money—precision is your most valuable asset.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#0f1623] p-5 rounded border border-[rgba(0,255,65,0.2)]">
                <div className="text-3xl mb-2">🛰️</div>
                <h4 className="font-bold font-['Rajdhani'] mb-1">SCAN</h4>
                <p className="text-sm text-[rgba(0,255,65,0.6)]">Use satellite multispectral imaging to find broad areas of interest.</p>
              </div>
              <div className="bg-[#0f1623] p-5 rounded border border-[rgba(0,255,65,0.2)]">
                <div className="text-3xl mb-2">🚁</div>
                <h4 className="font-bold font-['Rajdhani'] mb-1">LiDAR</h4>
                <p className="text-sm text-[rgba(0,255,65,0.6)]">Deploy drones to measure proximity to buried structures.</p>
              </div>
              <div className="bg-[#0f1623] p-5 rounded border border-[rgba(0,255,65,0.2)]">
                <div className="text-3xl mb-2">📡</div>
                <h4 className="font-bold font-['Rajdhani'] mb-1">GPR</h4>
                <p className="text-sm text-[rgba(0,255,65,0.6)]">Ping specific tiles to confirm walls beneath the soil.</p>
              </div>
              <div className="bg-[#0f1623] p-5 rounded border border-[rgba(0,255,65,0.2)]">
                <div className="text-3xl mb-2">⛏️</div>
                <h4 className="font-bold font-['Rajdhani'] mb-1">EXCAVATE</h4>
                <p className="text-sm text-[rgba(0,255,65,0.6)]">Dig to reveal the truth and claim your discovery.</p>
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="flex items-center justify-between border-b border-[rgba(0,255,65,0.2)] pb-2 mb-4">
                <h3 className="font-bold font-['Rajdhani'] text-lg">TOP AGENTS</h3>
                <button onClick={onViewLeaderboard} className="text-xs text-[rgba(0,255,65,0.6)] hover:text-[#00ff41]">VIEW ALL</button>
              </div>
              <div className="space-y-2">
                {leaderboardLoading ? (
                  <div className="text-xs text-[rgba(0,255,65,0.4)]">LOADING TRANSMISSION...</div>
                ) : leaderboard.length === 0 ? (
                  <div className="text-xs text-[rgba(0,255,65,0.4)]">NO RECORDS FOUND</div>
                ) : (
                  leaderboard.map((entry, i) => (
                    <div key={i} className="flex justify-between items-center text-sm font-['Share_Tech_Mono']">
                      <div className="flex items-center gap-3">
                        <span className="text-[rgba(0,255,65,0.4)]">#{i + 1}</span>
                        <span className="text-[#00ff41]">{entry.gamertag}</span>
                      </div>
                      <span className="text-[rgba(0,255,65,0.7)]">${entry.finalFunds.toLocaleString()}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Auth Box */}
          <div className="flex flex-col justify-center animate-in fade-in slide-in-from-right duration-700 delay-100">
            <div className="bg-[#0f1623] border border-[rgba(0,255,65,0.3)] rounded-xl p-8 shadow-[0_0_50px_rgba(0,255,65,0.15)] relative overflow-hidden">
              {/* Decorative corners */}
              <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-[#00ff41] rounded-tl-xl"></div>
              <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-[#00ff41] rounded-br-xl"></div>

              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold font-['Rajdhani'] mb-2">ACCESS TERMINAL</h2>
                <div className="h-1 w-24 bg-[#00ff41] mx-auto rounded-full opacity-50"></div>
              </div>

              <div className="flex gap-2 mb-8 bg-[rgba(0,255,65,0.05)] p-1 rounded-lg">
                <Button
                  data-testid="button-login-tab"
                  onClick={() => setMode("login")}
                  className={`flex-1 font-['Rajdhani'] font-bold tracking-wider ${mode === "login" ? 'bg-[#00ff41] text-black hover:bg-[#00dd35]' : 'bg-transparent text-[rgba(0,255,65,0.6)] hover:bg-[rgba(0,255,65,0.1)] hover:text-[#00ff41]'}`}
                >
                  LOGIN
                </Button>
                <Button
                  data-testid="button-register-tab"
                  onClick={() => setMode("register")}
                  className={`flex-1 font-['Rajdhani'] font-bold tracking-wider ${mode === "register" ? 'bg-[#00ff41] text-black hover:bg-[#00dd35]' : 'bg-transparent text-[rgba(0,255,65,0.6)] hover:bg-[rgba(0,255,65,0.1)] hover:text-[#00ff41]'}`}
                >
                  REGISTER
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="gamertag" className="font-['Share_Tech_Mono'] text-xs tracking-widest text-[rgba(0,255,65,0.7)]">
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
                    className="bg-[rgba(0,0,0,0.3)] border-[rgba(0,255,65,0.3)] text-[#00ff41] placeholder:text-[rgba(0,255,65,0.2)] h-12 font-['Share_Tech_Mono'] text-lg focus:border-[#00ff41] focus:ring-[#00ff41]"
                    placeholder={mode === "register" ? "Choose codename..." : "Enter codename..."}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="font-['Share_Tech_Mono'] text-xs tracking-widest text-[rgba(0,255,65,0.7)]">
                    SECURITY KEY
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-[rgba(0,0,0,0.3)] border-[rgba(0,255,65,0.3)] text-[#00ff41] placeholder:text-[rgba(0,255,65,0.2)] h-12 font-['Share_Tech_Mono'] text-lg focus:border-[#00ff41] focus:ring-[#00ff41]"
                    placeholder="••••••••"
                  />
                </div>

                {error && (
                  <div className="text-red-400 text-xs font-['Share_Tech_Mono'] bg-[rgba(255,0,0,0.1)] p-3 rounded border border-red-900/50 flex items-center gap-2">
                    <span>⚠️</span> {error}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#00ff41] text-black hover:bg-[#00dd35] font-['Rajdhani'] font-bold text-lg h-12 tracking-widest shadow-[0_0_20px_rgba(0,255,65,0.3)] hover:shadow-[0_0_30px_rgba(0,255,65,0.5)] transition-all duration-300"
                >
                  {loading ? "ESTABLISHING UPLINK..." : mode === "login" ? "INITIALIZE SESSION" : "REGISTER AGENT"}
                </Button>
              </form>

              <div className="mt-8 pt-6 border-t border-[rgba(0,255,65,0.2)]">
                <Button
                  variant="outline"
                  onClick={handleFreePlay}
                  className="w-full border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 hover:text-cyan-300 font-['Rajdhani'] font-bold tracking-wider"
                >
                  🎮 BYPASS SECURITY (TRIAL MODE)
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
