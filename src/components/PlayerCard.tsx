import { Crown, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlayerCardProps {
  name: string;
  score: number;
  isLeading: boolean;
  onRemove: () => void;
  color: string;
}

export function PlayerCard({
  name,
  score,
  isLeading,
  onRemove,
  color,
}: PlayerCardProps) {
  return (
    <div
      className={cn(
        "relative card-surface rounded-xl p-4 transition-all duration-300",
        isLeading && "ring-2 ring-primary gold-glow"
      )}
    >
      <button
        onClick={onRemove}
        className="absolute -top-2 -right-2 w-6 h-6 bg-destructive/80 hover:bg-destructive rounded-full flex items-center justify-center transition-colors"
        aria-label={`Remove ${name}`}
      >
        <X className="w-3 h-3 text-destructive-foreground" />
      </button>

      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold"
          style={{ backgroundColor: color }}
        >
          {name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-serif text-lg font-semibold truncate">{name}</h3>
          {isLeading && (
            <div className="flex items-center gap-1 text-primary text-xs">
              <Crown className="w-3 h-3" />
              <span>Leading</span>
            </div>
          )}
        </div>
      </div>

      <div className="text-center">
        <div
          className={cn(
            "font-serif text-4xl font-bold transition-colors",
            score > 0 && "text-success",
            score < 0 && "text-destructive",
            score === 0 && "text-foreground"
          )}
        >
          {score > 0 && "+"}
          {score}
        </div>
        <p className="text-xs text-muted-foreground mt-1">Total Points</p>
      </div>
    </div>
  );
}
