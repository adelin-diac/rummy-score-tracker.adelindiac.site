import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus } from "lucide-react";

interface AddPlayerFormProps {
  onAddPlayer: (name: string) => void;
  disabled: boolean;
}

export function AddPlayerForm({ onAddPlayer, disabled }: AddPlayerFormProps) {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAddPlayer(name.trim());
      setName("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        placeholder="Enter player name..."
        value={name}
        onChange={(e) => setName(e.target.value)}
        disabled={disabled}
        className="bg-input border-border"
        maxLength={20}
      />
      <Button type="submit" variant="gold" disabled={disabled || !name.trim()}>
        <UserPlus className="w-4 h-4 mr-2" />
        Add
      </Button>
    </form>
  );
}
