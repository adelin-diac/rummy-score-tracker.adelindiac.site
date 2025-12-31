import { Sparkles, Trophy, Pencil, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

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

interface RoundHistoryProps {
  players: Player[];
  rounds: Round[];
  onEditRound: (round: Round) => void;
}

export function RoundHistory({
  players,
  rounds,
  onEditRound,
}: RoundHistoryProps) {
  const copyAsCSV = () => {
    const headers = [
      "Round",
      ...players.map((p) => p.name),
      "Ace Holder",
      "Winner",
    ];
    const rows = rounds.map((round) => {
      const scores = players.map((player) => {
        const baseScore = round.scores[player.id] || 0;
        const aceBonus = round.aceHolder === player.id ? 50 : 0;
        return baseScore + aceBonus;
      });
      const aceHolderName = round.aceHolder
        ? players.find((p) => p.id === round.aceHolder)?.name || ""
        : "";
      const winnerName = round.winner
        ? players.find((p) => p.id === round.winner)?.name || ""
        : "";
      return [round.id, ...scores, aceHolderName, winnerName];
    });

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    navigator.clipboard.writeText(csv);
    toast({
      title: "Copied to clipboard",
      description: "Round history copied as CSV",
    });
  };

  if (rounds.length === 0) {
    return (
      <div className="card-surface rounded-xl p-6 text-center">
        <p className="text-muted-foreground">No rounds played yet</p>
        <p className="text-sm text-muted-foreground/70 mt-1">
          Add scores above to start tracking
        </p>
      </div>
    );
  }

  return (
    <div className="card-surface rounded-xl overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="font-serif text-lg font-semibold">Round History</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Click a row to edit
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={copyAsCSV}>
          <Copy className="w-4 h-4 mr-2" />
          Copy CSV
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Round
              </th>
              {players.map((player) => (
                <th
                  key={player.id}
                  className="px-4 py-3 text-center font-medium"
                >
                  <div className="flex items-center justify-center gap-2">
                    <div
                      className="w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold"
                      style={{ backgroundColor: player.color }}
                    >
                      {player.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden sm:inline truncate max-w-[60px]">
                      {player.name}
                    </span>
                  </div>
                </th>
              ))}
              <th className="px-4 py-3 w-10"></th>
            </tr>
          </thead>
          <tbody>
            {rounds.map((round, idx) => (
              <tr
                key={round.id}
                onClick={() => onEditRound(round)}
                className={cn(
                  "border-b border-border/50 last:border-0 cursor-pointer hover:bg-muted/30 transition-colors",
                  idx === rounds.length - 1 && "animate-score-pop"
                )}
              >
                <td className="px-4 py-3 text-muted-foreground">#{round.id}</td>
                {players.map((player) => {
                  const baseScore = round.scores[player.id] || 0;
                  const aceBonus = round.aceHolder === player.id ? 50 : 0;
                  const totalScore = baseScore + aceBonus;
                  const isWinner = round.winner === player.id;

                  return (
                    <td key={player.id} className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {isWinner && (
                          <Trophy className="w-3 h-3 text-success" />
                        )}
                        <span
                          className={cn(
                            "font-medium",
                            totalScore > 0 && "text-success",
                            totalScore < 0 && "text-destructive"
                          )}
                        >
                          {totalScore > 0 && "+"}
                          {totalScore}
                        </span>
                        {round.aceHolder === player.id && (
                          <Sparkles className="w-3 h-3 text-primary" />
                        )}
                      </div>
                    </td>
                  );
                })}
                <td className="px-4 py-3">
                  <Pencil className="w-3 h-3 text-muted-foreground" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
