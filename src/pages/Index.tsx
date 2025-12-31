import { useState, useMemo, useEffect } from "react";
import { PlayerCard } from "@/components/PlayerCard";
import { ScoreInput } from "@/components/ScoreInput";
import { RoundHistory } from "@/components/RoundHistory";
import { AddPlayerForm } from "@/components/AddPlayerForm";
import { EditRoundDialog } from "@/components/EditRoundDialog";
import { Button } from "@/components/ui/button";
import { RotateCcw, Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const STORAGE_KEY = "rummy-scores-game";

const PLAYER_COLORS = [
  "hsl(0 70% 50%)", // Red
  "hsl(210 80% 50%)", // Blue
  "hsl(45 90% 50%)", // Gold
  "hsl(280 70% 55%)", // Purple
];

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

interface GameState {
  players: Player[];
  rounds: Round[];
}

const loadGameState = (): GameState => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        players: parsed.players || [],
        rounds: parsed.rounds || [],
      };
    }
  } catch (e) {
    console.error("Failed to load game state:", e);
  }
  return { players: [], rounds: [] };
};

const Index = () => {
  const [players, setPlayers] = useState<Player[]>(
    () => loadGameState().players
  );
  const [rounds, setRounds] = useState<Round[]>(() => loadGameState().rounds);
  const [editingRound, setEditingRound] = useState<Round | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Persist to localStorage whenever players or rounds change
  useEffect(() => {
    const gameState: GameState = { players, rounds };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
  }, [players, rounds]);

  const addPlayer = (name: string) => {
    if (players.length >= 4) {
      toast({
        title: "Maximum players reached",
        description: "Rummy supports up to 4 players",
        variant: "destructive",
      });
      return;
    }

    const newPlayer: Player = {
      id: crypto.randomUUID(),
      name,
      color: PLAYER_COLORS[players.length],
    };

    setPlayers([...players, newPlayer]);
    toast({
      title: `${name} joined the game!`,
      description: `${4 - players.length - 1} spots remaining`,
    });
  };

  const removePlayer = (id: string) => {
    const player = players.find((p) => p.id === id);
    setPlayers(players.filter((p) => p.id !== id));
    // Also remove player scores from rounds
    setRounds(
      rounds.map((round) => {
        const newScores = { ...round.scores };
        delete newScores[id];
        return {
          ...round,
          scores: newScores,
          aceHolder: round.aceHolder === id ? null : round.aceHolder,
        };
      })
    );

    if (player) {
      toast({
        title: `${player.name} left the game`,
      });
    }
  };

  const addRound = (
    scores: Record<string, number>,
    aceHolder: string | null,
    winner: string | null
  ) => {
    const newRound: Round = {
      id: rounds.length + 1,
      scores,
      aceHolder,
      winner,
    };
    setRounds([...rounds, newRound]);

    const acePlayer = aceHolder
      ? players.find((p) => p.id === aceHolder)?.name
      : null;
    const winnerPlayer = winner
      ? players.find((p) => p.id === winner)?.name
      : null;
    toast({
      title: `Round ${newRound.id} recorded`,
      description: winnerPlayer
        ? `${winnerPlayer} won!${
            acePlayer ? ` ${acePlayer} got the Ace bonus!` : ""
          }`
        : acePlayer
        ? `${acePlayer} got the Ace bonus!`
        : undefined,
    });
  };

  const resetGame = () => {
    setPlayers([]);
    setRounds([]);
    toast({
      title: "Game reset",
      description: "Starting fresh!",
    });
  };

  const handleEditRound = (round: Round) => {
    setEditingRound(round);
    setIsEditDialogOpen(true);
  };

  const handleSaveRound = (
    roundId: number,
    scores: Record<string, number>,
    aceHolder: string | null,
    winner: string | null
  ) => {
    setRounds(
      rounds.map((round) =>
        round.id === roundId ? { ...round, scores, aceHolder, winner } : round
      )
    );
    toast({
      title: `Round #${roundId} updated`,
    });
  };

  const handleDeleteRound = (roundId: number) => {
    setRounds(rounds.filter((round) => round.id !== roundId));
    toast({
      title: `Round #${roundId} deleted`,
    });
  };
  const playerScores = useMemo(() => {
    const scores: Record<string, number> = {};
    players.forEach((player) => {
      scores[player.id] = 0;
    });

    rounds.forEach((round) => {
      Object.entries(round.scores).forEach(([playerId, score]) => {
        if (scores[playerId] !== undefined) {
          scores[playerId] += score;
        }
      });
      if (round.aceHolder && scores[round.aceHolder] !== undefined) {
        scores[round.aceHolder] += 50;
      }
    });

    return scores;
  }, [players, rounds]);

  const leadingPlayerId = useMemo(() => {
    if (players.length === 0) return null;

    let maxScore = -Infinity;
    let leaderId = players[0].id;

    Object.entries(playerScores).forEach(([playerId, score]) => {
      if (score > maxScore) {
        maxScore = score;
        leaderId = playerId;
      }
    });

    return leaderId;
  }, [playerScores, players]);

  return (
    <div className="min-h-screen felt-texture">
      {/* Header */}
      <header className="sticky top-0 z-10 backdrop-blur-md bg-background/80 border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center gold-glow">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="font-serif text-2xl font-bold text-gradient-gold">
              Rummy Scores
            </h1>
          </div>

          {(players.length > 0 || rounds.length > 0) && (
            <Button variant="ghost" size="sm" onClick={resetGame}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6 max-w-4xl">
        {/* Add Player Section */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-serif text-lg font-semibold">
              Players ({players.length}/4)
            </h2>
          </div>
          <AddPlayerForm
            onAddPlayer={addPlayer}
            disabled={players.length >= 4}
          />
        </section>

        {/* Player Cards - Sorted by Score */}
        {players.length > 0 && (
          <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[...players]
              .sort(
                (a, b) => (playerScores[b.id] || 0) - (playerScores[a.id] || 0)
              )
              .map((player) => (
                <PlayerCard
                  key={player.id}
                  name={player.name}
                  score={playerScores[player.id]}
                  isLeading={player.id === leadingPlayerId && rounds.length > 0}
                  onRemove={() => removePlayer(player.id)}
                  color={player.color}
                />
              ))}
          </section>
        )}

        {/* Score Input */}
        {players.length >= 2 && (
          <section>
            <ScoreInput players={players} onSubmitRound={addRound} />
          </section>
        )}

        {/* Round History */}
        {players.length >= 2 && (
          <section>
            <RoundHistory
              players={players}
              rounds={rounds}
              onEditRound={handleEditRound}
            />
          </section>
        )}

        {/* Edit Round Dialog */}
        <EditRoundDialog
          round={editingRound}
          players={players}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSave={handleSaveRound}
          onDelete={handleDeleteRound}
        />

        {/* Empty State */}
        {players.length < 2 && (
          <div className="card-surface rounded-xl p-8 text-center">
            <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="font-serif text-xl font-semibold mb-2">
              Ready to Play?
            </h3>
            <p className="text-muted-foreground">
              Add at least 2 players to start tracking scores
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-auto py-4">
        <p className="text-center text-sm text-muted-foreground">
          Ace bonus: +50 points per round
        </p>
      </footer>
    </div>
  );
};

export default Index;
