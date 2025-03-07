"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlayerData } from "@/types";
import { useMutation } from "convex/react";
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

interface PlayerCardProps {
  player: PlayerData;
  team: "homeTeam" | "awayTeam";
  onPlayerChange: (
    playerId: Id<"players">,
    field: keyof PlayerData,
    value: number | boolean
  ) => void;
}

const PlayerDataCard: React.FC<PlayerCardProps> = ({
  player,
  team,
  onPlayerChange,
}) => {
  const { matchId } = useParams();
  const submitSinglePlayer = useMutation(api.admin.submitSinglePlayerData);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleAccordion = () => {
    setExpanded((prev) => !prev);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      console.log(`Submitting Player Data for ${team}:`);
      console.log(`➡️ Player ID: ${player._id}`);
      console.log(`➡️ Player Name: ${player.name}`);
      console.log(`➡️ Is Played: ${player.isPlayed}`);
      console.log(`➡️ Runs: ${player.runs}`);
      console.log(`➡️ Wickets: ${player.wickets}`);
      console.log(`➡️ Catches: ${player.catches}`);
      console.log(`➡️ Stumpings: ${player.stumpings}`);
      console.log(`➡️ Runouts: ${player.runouts}`);
      console.log(`➡️ Total Points: ${player.playerPoints}`);

      // Simulating API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await submitSinglePlayer({
        matchId: matchId as Id<"matches">,
        playerId: player._id,
        isPlayed: player.isPlayed,
        runs: player.runs,
        wickets: player.wickets,
        catches: player.catches,
        stumpings: player.stumpings,
        runouts: player.runouts,
        playerPoints: player.playerPoints,
      });

      toast.success("Player data saved", {
        description: `Statistics for ${player.name} have been updated.`,
      });
    } catch (error) {
      console.error("Error submitting player data:", error);
      toast.error("Failed to save player data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button onClick={toggleAccordion}>
            {expanded ? (
              <ChevronUp className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-600" />
            )}
          </button>

          <Image
            src={player.profileImage || "/placeholder.svg"}
            alt={player.name}
            width={40}
            height={40}
            className="rounded-full mx-4"
          />
          <div>
            <div className="font-medium">{player.name}</div>
            <div className="text-xs text-muted-foreground">{player.role}</div>
          </div>
        </div>
        <div className="text-sm font-bold text-blue-400">
          {player.playerPoints} pts
        </div>
      </div>

      {expanded && (
        <div className="mt-4 space-y-4">
          <div className="flex flex-row justify-between">
            <div className="flex items-center">
              <Checkbox
                id={`played-${player._id}`}
                checked={player.isPlayed}
                onCheckedChange={(checked) =>
                  onPlayerChange(player._id, "isPlayed", !!checked)
                }
              />
              <Label htmlFor={`played-${player._id}`} className="ml-2">
                Playing XI or Impact Substitute?
              </Label>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {["runs", "wickets", "catches", "stumpings", "runouts"].map(
              (field) => (
                <div key={field} className="space-y-2">
                  <Label>
                    {field.charAt(0).toUpperCase() + field.slice(1)}
                  </Label>
                  <Input
                    type="number"
                    value={(player[field as keyof PlayerData] as number) || 0}
                    onChange={(e) =>
                      onPlayerChange(
                        player._id,
                        field as keyof PlayerData,
                        Number(e.target.value)
                      )
                    }
                    disabled={!player.isPlayed}
                  />
                </div>
              )
            )}
          </div>

          <Button size="sm" onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="animate-spin" /> {"Submitting..."}
              </>
            ) : (
              "Submit"
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default PlayerDataCard;
