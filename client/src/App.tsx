import React, { useState, useEffect, useRef } from "react";
import "@/style.css";
import { initGame } from "@/game/main";
import AuthScreen from "@/components/AuthScreen";
import LeaderboardScreen from "@/components/LeaderboardScreen";
import CompletionOverlay from "@/components/CompletionOverlay";
import ToolSelector from "@/components/ToolSelector";

interface GameData {
  finalFunds: number;
  structuresFound: number;
  actionsUsed: number;
}

const toolNames: Record<string, string> = {
  scan: "Multispectral Imaging",
  lidar: "LiDAR Drone",
  drill: "Ground Penetrating Radar",
  excavate: "Archaeological Excavation",
  terraquest: "TerraQuest Explorer",
};

const toolIcons: Record<string, string> = {
  scan: "🛰️",
  lidar: "/game-icons/lidar-drone.png",
  drill: "📡",
  excavate: "⛏️",
  terraquest: "/game-icons/terraquest.png",
};

function App() {
  const gameRef = useRef<any>(null);
  const initializedRef = useRef(false);
  const [user, setUser] = useState<{ userId: string; gamertag: string } | null>(null);
  const [isFreePlay, setIsFreePlay] = useState(false);
  const [screen, setScreen] = useState<"auth" | "game" | "leaderboard">("auth");
  const [completionData, setCompletionData] = useState<GameData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toolSelectorOpen, setToolSelectorOpen] = useState(false);
  const [currentTool, setCurrentTool] = useState("scan");
  const containerRef = useRef<HTMLDivElement>(null);

  const [gameId, setGameId] = useState(0); // Added gameId state

  useEffect(() => {
    const userForGame = user || { userId: "guest", gamertag: "GUEST" }; // Define userForGame here
    if (screen === "game" && containerRef.current && !initializedRef.current) {
      initializedRef.current = true;
      setTimeout(() => {
        gameRef.current = initGame(userForGame, (scoreData: GameData) => {
          setCompletionData(scoreData);
        });
      }, 100);
    }

    return () => {
      if (gameRef.current && gameRef.current.input) {
        gameRef.current.input.destroy();
      }
    };
  }, [screen, user, gameId]); // Added gameId dependency

  const handleSelectTool = (toolId: string) => {
    setCurrentTool(toolId);
    if (gameRef.current) {
      gameRef.current.setTool(toolId);
    }
  };

  const submitScore = async () => {
    if (!completionData) return;

    // Free play mode - just go to leaderboard without submitting
    if (isFreePlay || !user) {
      setCompletionData(null);
      setScreen("leaderboard");
      return;
    }

    setIsSubmitting(true);
    try {
      await fetch("/api/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.userId,
          ...completionData,
        }),
      });
      setCompletionData(null);
      setScreen("leaderboard");
    } catch (error) {
      console.error("Failed to submit score:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePlayAgain = () => {
    setCompletionData(null);
    initializedRef.current = false;
    setCurrentTool("scan");

    if (gameRef.current && gameRef.current.input) {
      gameRef.current.input.destroy();
    }
    gameRef.current = null;

    const fundsEl = document.getElementById('funds-display');
    const logEl = document.getElementById('message-log');
    const targetList = document.getElementById('target-list');

    if (fundsEl) fundsEl.innerText = '$5,000';
    if (logEl) logEl.innerHTML = '';
    if (targetList) targetList.innerHTML = '';

    setTimeout(() => {
      initializedRef.current = true;
      const userForGame = user || { userId: "guest", gamertag: "GUEST" };
      gameRef.current = initGame(userForGame, (scoreData: GameData) => {
        setCompletionData(scoreData);
      });
    }, 100);
  };

  const handleLogin = (userData: { userId: string; gamertag: string } | null) => {
    if (userData === null) {
      setIsFreePlay(true);
      setUser(null);
    } else {
      setIsFreePlay(false);
      setUser(userData);
    }
    setScreen("game");
  };

  const handleViewLeaderboard = () => {
    setScreen("leaderboard");
  };

  const handleBackToGame = () => {
    initializedRef.current = false;
    if (gameRef.current && gameRef.current.input) {
      gameRef.current.input.destroy();
    }
    gameRef.current = null;
    setCompletionData(null);
    setCurrentTool("scan");
    setScreen("game");
  };

  const handleBackToAuth = () => {
    initializedRef.current = false;
    if (gameRef.current && gameRef.current.input) {
      gameRef.current.input.destroy();
    }
    gameRef.current = null;
    setCompletionData(null);
    setCurrentTool("scan");
    setUser(null);
    setIsFreePlay(false);
    setScreen("auth");
  };

  const handleRestart = () => {
    initializedRef.current = false;
    if (gameRef.current && gameRef.current.input) {
      gameRef.current.input.destroy();
    }
    gameRef.current = null;
    setCompletionData(null);
    setCurrentTool("scan");

    const fundsEl = document.getElementById('funds-display');
    const logEl = document.getElementById('message-log');
    const targetList = document.getElementById('target-list');

    if (fundsEl) fundsEl.innerText = '$5,000';
    if (logEl) logEl.innerHTML = '';
    if (targetList) targetList.innerHTML = '';

    setGameId(prev => prev + 1); // Increment gameId to force re-initialization
  };

  if (screen === "auth") {
    return <AuthScreen onLogin={handleLogin} onViewLeaderboard={handleViewLeaderboard} />;
  }

  if (screen === "leaderboard") {
    return <LeaderboardScreen onBack={handleBackToAuth} />;
  }

  const displayName = isFreePlay ? "GUEST" : user?.gamertag || "UNKNOWN";

  return (
    <div id="app-container">
      {completionData && (
        <CompletionOverlay
          finalFunds={completionData.finalFunds}
          structuresFound={completionData.structuresFound}
          actionsUsed={completionData.actionsUsed}
          onViewLeaderboard={submitScore}
          onPlayAgain={handlePlayAgain}
          isSubmitting={isSubmitting}
          isFreePlay={isFreePlay}
        />
      )}

      <ToolSelector
        isOpen={toolSelectorOpen}
        currentTool={currentTool}
        onSelectTool={handleSelectTool}
        onClose={() => setToolSelectorOpen(false)}
        structuresFound={gameRef.current?.getStructuresFoundCount?.() || 0}
        terraquestUsed={gameRef.current?.isTerraQuestUsed?.() || false}
      />

      <div id="canvas-container">
        <canvas id="game-canvas"></canvas>
      </div>

      <div id="hud-container">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl">UNCHARTED RUINS</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRestart}
              className="p-2 text-red-500 hover:bg-red-500/10 rounded-full transition-colors"
              aria-label="Abort Mission"
            >
              ⚠ ABORT
            </button>
            <div className="text-xs text-[rgba(0,255,65,0.7)]">
              {isFreePlay && <span className="text-cyan-400">[FREE PLAY] </span>}
              AGENT: {displayName}
            </div>
          </div>
        </div>

        <div className="stat-panel">
          <div className="stat-row">
            <span>FUNDS</span>
            <span id="funds-display" className="stat-value">$5,000</span>
          </div>
          <div className="stat-row">
            <span>STATUS</span>
            <span className="stat-value" style={{ color: "#00ff41" }}>ONLINE</span>
          </div>

          <div className="mt-4 pt-4 border-t border-[rgba(0,255,65,0.2)]">
            <div className="text-xs mb-2 text-[rgba(0,255,65,0.8)]">TARGET STRUCTURES</div>
            <div id="target-list" className="target-list">
            </div>
          </div>

          <div className="legend-section mt-4 pt-4 border-t border-[rgba(0,255,65,0.2)]">
            <div className="text-xs mb-1 text-[rgba(0,255,65,0.8)]">🛰️ SCAN DENSITY</div>
            <div className="h-2 w-full rounded-sm bg-gradient-to-r from-[rgba(30,50,70,0.8)] via-[rgba(0,255,255,0.5)] to-[rgba(255,0,255,0.8)]"></div>
            <div className="flex justify-between text-[10px] text-[rgba(0,255,65,0.5)] mt-1 font-mono">
              <span>EMPTY</span>
              <span>TRACE</span>
              <span>DENSE</span>
            </div>
          </div>

          <div className="legend-section mt-3">
            <div className="text-xs mb-1 text-[rgba(255,165,0,0.9)]">🚁 LiDAR PROXIMITY</div>
            <div className="h-2 w-full rounded-sm bg-gradient-to-r from-[rgba(30,60,90,0.8)] via-[rgba(255,165,0,0.6)] to-[rgba(255,50,50,0.9)]"></div>
            <div className="flex justify-between text-[10px] text-[rgba(255,165,0,0.6)] mt-1 font-mono">
              <span>FAR</span>
              <span>NEARBY</span>
              <span>CLOSE</span>
            </div>
          </div>
        </div>

        <button
          className="tool-selector-btn"
          onClick={() => setToolSelectorOpen(true)}
          data-testid="button-open-tools"
        >
          <div className="tool-selector-btn-content">
            <span className="tool-selector-btn-icon">
              {toolIcons[currentTool].startsWith('/')
                ? <img src={toolIcons[currentTool]} alt="" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
                : toolIcons[currentTool]}
            </span>
            <div className="tool-selector-btn-info">
              <span className="tool-selector-btn-label">EQUIPPED TOOL</span>
              <span className="tool-selector-btn-name">{toolNames[currentTool]}</span>
            </div>
          </div>
          <span className="tool-selector-btn-change">CHANGE ▼</span>
        </button>

        <div id="message-log" className="message-log" data-testid="message-log">
        </div>
      </div>
    </div>
  );
}

export default App;
