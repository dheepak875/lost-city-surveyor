import React from "react";
import { Button } from "@/components/ui/button";

interface CompletionOverlayProps {
  finalFunds: number;
  structuresFound: number;
  actionsUsed: number;
  onViewLeaderboard: () => void;
  onPlayAgain: () => void;
  isSubmitting: boolean;
  isFreePlay?: boolean;
}

export default function CompletionOverlay({
  finalFunds,
  structuresFound,
  actionsUsed,
  onViewLeaderboard,
  onPlayAgain,
  isSubmitting,
  isFreePlay = false,
}: CompletionOverlayProps) {
  const isSuccess = finalFunds > 0;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div
        data-testid="overlay-completion"
        className={`max-w-md w-full p-8 rounded-lg border-2 ${
          isSuccess
            ? "bg-[rgba(0,255,65,0.1)] border-[#00ff41] shadow-[0_0_40px_rgba(0,255,65,0.3)]"
            : "bg-[rgba(255,50,50,0.1)] border-red-500 shadow-[0_0_40px_rgba(255,50,50,0.3)]"
        }`}
      >
        <div className="text-center mb-8">
          <div
            data-testid="text-mission-status"
            className={`text-4xl font-bold mb-2 font-['Rajdhani'] ${
              isSuccess ? "text-[#00ff41]" : "text-red-400"
            }`}
          >
            {isSuccess ? "MISSION SUCCESSFUL" : "MISSION FAILURE"}
          </div>
          <div className="text-sm text-[rgba(255,255,255,0.6)] font-['Share_Tech_Mono']">
            {isSuccess
              ? "All structures excavated within budget"
              : "Budget depleted - structures excavated"}
          </div>
          {isFreePlay && (
            <div className="mt-2 text-sm text-cyan-400 font-['Share_Tech_Mono']">
              FREE PLAY MODE - Score not recorded
            </div>
          )}
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex justify-between items-center py-2 border-b border-[rgba(255,255,255,0.1)]">
            <span className="text-[rgba(255,255,255,0.7)] font-['Share_Tech_Mono']">FINAL FUNDS</span>
            <span
              data-testid="text-final-funds"
              className={`text-2xl font-bold font-['Rajdhani'] ${
                finalFunds >= 0 ? "text-[#00ff41]" : "text-red-400"
              }`}
            >
              ${finalFunds.toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between items-center py-2 border-b border-[rgba(255,255,255,0.1)]">
            <span className="text-[rgba(255,255,255,0.7)] font-['Share_Tech_Mono']">STRUCTURES FOUND</span>
            <span
              data-testid="text-structures-found"
              className="text-2xl font-bold font-['Rajdhani'] text-[#00ff41]"
            >
              {structuresFound}/5
            </span>
          </div>

          <div className="flex justify-between items-center py-2 border-b border-[rgba(255,255,255,0.1)]">
            <span className="text-[rgba(255,255,255,0.7)] font-['Share_Tech_Mono']">ACTIONS USED</span>
            <span
              data-testid="text-actions-used"
              className="text-2xl font-bold font-['Rajdhani'] text-cyan-400"
            >
              {actionsUsed}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            data-testid="button-view-leaderboard"
            onClick={onViewLeaderboard}
            disabled={isSubmitting}
            className={`w-full font-['Rajdhani'] font-bold text-lg py-6 ${
              isSuccess
                ? "bg-[#00ff41] text-black hover:bg-[#00dd35]"
                : "bg-red-500 text-white hover:bg-red-600"
            }`}
          >
            {isSubmitting ? "SUBMITTING SCORE..." : isFreePlay ? "VIEW LEADERBOARD" : "SUBMIT & VIEW LEADERBOARD"}
          </Button>

          <Button
            data-testid="button-play-again"
            onClick={onPlayAgain}
            disabled={isSubmitting}
            variant="outline"
            className="w-full font-['Rajdhani'] font-bold text-lg py-6 border-[rgba(255,255,255,0.3)] text-[rgba(255,255,255,0.8)] hover:bg-[rgba(255,255,255,0.1)]"
          >
            PLAY AGAIN
          </Button>
        </div>

        <div className="mt-6 text-center text-xs text-[rgba(255,255,255,0.4)] font-['Share_Tech_Mono']">
          {isFreePlay
            ? "Register to save your scores to the leaderboard"
            : isSuccess
              ? "Your score has been recorded on the leaderboard"
              : "Better luck next time, agent"}
        </div>
      </div>
    </div>
  );
}
