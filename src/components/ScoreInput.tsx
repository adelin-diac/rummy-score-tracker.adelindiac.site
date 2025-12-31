import { useState } from "react";
import { Minus, Plus, Sparkles, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Player {
  id: string;
  name: string;
  color: string;
}

interface ScoreInputProps {
  players: Player[];
  onSubmitRound: (
    scores: Record<string, number>,
    aceHolder: string | null,
    winner: string | null
  ) => void;
}

export function ScoreInput({ players, onSubmitRound }: ScoreInputProps) {
  const [scores, setScores] = useState<Record<string, string>>({});
  const [aceHolder, setAceHolder] = useState<string | null>(null);
  const [winner, setWinner] = useState<string | null>(null);

  const handleScoreChange = (playerId: string, value: string) => {
    // Allow negative numbers and empty string
    if (value === "" || value === "-" || /^-?\d*$/.test(value)) {
      setScores((prev) => ({ ...prev, [playerId]: value }));
    }
  };

  const adjustScore = (playerId: string, delta: number) => {
    const current = parseInt(scores[playerId] || "0") || 0;
    setScores((prev) => ({ ...prev, [playerId]: String(current + delta) }));
  };

  const handleSubmit = () => {
    const numericScores: Record<string, number> = {};
    players.forEach((player) => {
      numericScores[player.id] = parseInt(scores[player.id] || "0") || 0;
    });
    onSubmitRound(numericScores, aceHolder, winner);
    setScores({});
    setAceHolder(null);
    setWinner(null);
  };

  const canSubmit = winner !== null;

  return (
    <div className="card-surface rounded-xl p-5">
      <h3 className="font-serif text-xl font-semibold mb-4 text-center">
        New Round
      </h3>

      <div className="space-y-4">
        {players.map((player) => (
          <div key={player.id} className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
              style={{ backgroundColor: player.color }}
            >
              {player.name.charAt(0).toUpperCase()}
            </div>

            <span className="font-medium min-w-[80px] truncate">
              {player.name}
            </span>

            <div className="flex items-center gap-1 flex-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={() => adjustScore(player.id, -10)}
              >
                <Minus className="w-4 h-4" />
              </Button>

              <Input
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={scores[player.id] || ""}
                onChange={(e) => handleScoreChange(player.id, e.target.value)}
                className="text-center h-9 bg-input border-border"
              />

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={() => adjustScore(player.id, 10)}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <button
              onClick={() =>
                setAceHolder(aceHolder === player.id ? null : player.id)
              }
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 shrink-0",
                aceHolder === player.id
                  ? "bg-primary text-primary-foreground gold-glow animate-ace-spin"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
              title="Toggle Ace (+50)"
            >
              <Sparkles className="w-5 h-5" />
            </button>

            <button
              onClick={() => setWinner(winner === player.id ? null : player.id)}
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 shrink-0",
                winner === player.id
                  ? "bg-success text-success-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
              title="Round Winner"
            >
              <Trophy className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>

      {(aceHolder || winner) && (
        <div className="mt-4 text-center text-sm space-y-1">
          {winner && (
            <div className="text-success">
              <Trophy className="w-4 h-4 inline mr-1" />
              {players.find((p) => p.id === winner)?.name} won this round
            </div>
          )}
          {aceHolder && (
            <div className="text-primary">
              <Sparkles className="w-4 h-4 inline mr-1" />
              {players.find((p) => p.id === aceHolder)?.name} gets +50 Ace bonus
            </div>
          )}
        </div>
      )}

      <Button
        className="w-full mt-6"
        onClick={handleSubmit}
        disabled={!canSubmit}
      >
        {!winner ? "Select a winner to continue" : "Add Round"}
      </Button>
    </div>
  );
}
