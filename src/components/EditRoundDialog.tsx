import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Sparkles, Plus, Minus, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface Player {
  id: string;
  name: string;
  color: string;
}

interface Round {
  id: number;
  scores: Record<string, number>;
  aceHolder: string | null;
  winner: string | null;
}

interface EditRoundDialogProps {
  round: Round | null;
  players: Player[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (
    roundId: number,
    scores: Record<string, number>,
    aceHolder: string | null,
    winner: string | null
  ) => void;
  onDelete: (roundId: number) => void;
}

export function EditRoundDialog({
  round,
  players,
  open,
  onOpenChange,
  onSave,
  onDelete,
}: EditRoundDialogProps) {
  const [scores, setScores] = useState<Record<string, string>>({});
  const [aceHolder, setAceHolder] = useState<string | null>(null);
  const [winner, setWinner] = useState<string | null>(null);

  useEffect(() => {
    if (round) {
      const stringScores: Record<string, string> = {};
      Object.entries(round.scores).forEach(([playerId, score]) => {
        stringScores[playerId] = String(score);
      });
      setScores(stringScores);
      setAceHolder(round.aceHolder);
      setWinner(round.winner);
    }
  }, [round]);

  const handleScoreChange = (playerId: string, value: string) => {
    if (value === "" || value === "-" || /^-?\d*$/.test(value)) {
      setScores((prev) => ({ ...prev, [playerId]: value }));
    }
  };

  const adjustScore = (playerId: string, delta: number) => {
    const current = parseInt(scores[playerId] || "0") || 0;
    setScores((prev) => ({ ...prev, [playerId]: String(current + delta) }));
  };

  const handleSave = () => {
    if (!round) return;

    const numericScores: Record<string, number> = {};
    players.forEach((player) => {
      numericScores[player.id] = parseInt(scores[player.id] || "0") || 0;
    });
    onSave(round.id, numericScores, aceHolder, winner);
    onOpenChange(false);
  };

  const handleDelete = () => {
    if (!round) return;
    onDelete(round.id);
    onOpenChange(false);
  };

  if (!round) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">
            Edit Round #{round.id}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
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
                    ? "bg-primary text-primary-foreground shadow-[0_4px_20px_-4px_hsl(42_100%_50%_/_0.3)]"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
                title="Toggle Ace (+50)"
              >
                <Sparkles className="w-5 h-5" />
              </button>

              <button
                onClick={() =>
                  setWinner(winner === player.id ? null : player.id)
                }
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

          {(aceHolder || winner) && (
            <div className="text-center text-sm space-y-1">
              {winner && (
                <div className="text-success">
                  <Trophy className="w-4 h-4 inline mr-1" />
                  {players.find((p) => p.id === winner)?.name} won this round
                </div>
              )}
              {aceHolder && (
                <div className="text-primary">
                  <Sparkles className="w-4 h-4 inline mr-1" />
                  {players.find((p) => p.id === aceHolder)?.name} has the Ace
                  (+50)
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2 sm:gap-0">
          <Button
            variant="destructive"
            onClick={handleDelete}
            className="mr-auto"
          >
            Delete Round
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="gold" onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
