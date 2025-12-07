import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface LeaderboardEntry {
  gamertag: string;
  finalFunds: number;
  structuresFound: number;
  actionsUsed: number;
  completedAt: string;
}

interface LeaderboardScreenProps {
  onBack: () => void;
}

export default function LeaderboardScreen({ onBack }: LeaderboardScreenProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch("/api/leaderboard?limit=20");
      const data = await response.json();
      setLeaderboard(data);
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a] p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#00ff41] mb-2 font-['Rajdhani']">
            GLOBAL LEADERBOARD
          </h1>
          <p className="text-[rgba(0,255,65,0.6)] text-sm font-['Share_Tech_Mono']">
            TOP ARCHAEOLOGICAL SURVEYORS
          </p>
        </div>

        <div className="bg-[rgba(0,255,65,0.05)] border border-[rgba(0,255,65,0.3)] rounded-lg overflow-hidden shadow-[0_0_20px_rgba(0,255,65,0.1)]">
          {loading ? (
            <div className="p-8 text-center text-[rgba(0,255,65,0.6)]">
              LOADING DATA...
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="p-8 text-center text-[rgba(0,255,65,0.6)]">
              NO COMPLETED SURVEYS YET
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[rgba(0,255,65,0.1)]">
                  <tr className="text-[#00ff41] text-xs font-['Share_Tech_Mono']">
                    <th className="px-4 py-3 text-left">RANK</th>
                    <th className="px-4 py-3 text-left">AGENT</th>
                    <th className="px-4 py-3 text-right">FINAL FUNDS</th>
                    <th className="px-4 py-3 text-right">STRUCTURES</th>
                    <th className="px-4 py-3 text-right">ACTIONS</th>
                    <th className="px-4 py-3 text-right">COMPLETED</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((entry, index) => (
                    <tr
                      key={index}
                      data-testid={`row-leaderboard-${index}`}
                      className="border-t border-[rgba(0,255,65,0.1)] hover:bg-[rgba(0,255,65,0.05)] transition-colors"
                    >
                      <td className="px-4 py-3 text-[#00ff41] font-bold font-['Rajdhani']">
                        #{index + 1}
                      </td>
                      <td className="px-4 py-3 text-[#00ff41] font-['Share_Tech_Mono']" data-testid={`text-gamertag-${index}`}>
                        {entry.gamertag}
                      </td>
                      <td className={`px-4 py-3 text-right font-bold font-['Rajdhani'] ${
                        entry.finalFunds >= 0 ? "text-[#00ff41]" : "text-red-400"
                      }`} data-testid={`text-funds-${index}`}>
                        ${entry.finalFunds.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right text-[rgba(0,255,65,0.8)]" data-testid={`text-structures-${index}`}>
                        {entry.structuresFound}/5
                      </td>
                      <td className="px-4 py-3 text-right text-[rgba(0,255,65,0.8)]" data-testid={`text-actions-${index}`}>
                        {entry.actionsUsed}
                      </td>
                      <td className="px-4 py-3 text-right text-[rgba(0,255,65,0.6)] text-xs">
                        {new Date(entry.completedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
          <Button
            data-testid="button-back"
            onClick={onBack}
            className="bg-[#00ff41] text-black hover:bg-[#00dd35] font-['Rajdhani'] font-bold px-8"
          >
            BACK TO AUTHENTICATION
          </Button>
        </div>

        <div className="mt-8 text-center text-xs text-[rgba(0,255,65,0.4)] font-['Share_Tech_Mono'] space-y-1">
          <p>SCORING: HIGHEST REMAINING FUNDS • ALL STRUCTURES FOUND</p>
          <p>BUDGET CAN GO NEGATIVE FOR COMPETITIVE RANKING</p>
        </div>
      </div>
    </div>
  );
}
