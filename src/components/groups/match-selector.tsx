"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Match {
  id: string;
  name: string;
  date: string;
}

interface MatchSelectorProps {
  matches: Match[];
  selectedMatch: string | null;
  onSelectMatch: (matchId: string) => void;
}

export function MatchSelector({
  matches,
  selectedMatch,
  onSelectMatch,
}: MatchSelectorProps) {
  return (
    <Select value={selectedMatch || ""} onValueChange={onSelectMatch}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select a match" />
      </SelectTrigger>
      <SelectContent>
        {matches.map((match) => (
          <SelectItem key={match.id} value={match.id}>
            {match.name} ({new Date(match.date).toLocaleDateString()})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
