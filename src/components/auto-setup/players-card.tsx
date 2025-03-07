"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, X } from "lucide-react";
import Image from "next/image";
import { Team } from "@/types";
import { useAllPlayersByTeamId } from "@/hooks/convex-hooks";
import { Id } from "../../../convex/_generated/dataModel";
import { LoadingScreen } from "../common/loading-screen";
import { toast } from "sonner";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

interface PlayersCardProps {
  selectedTeam: Team;
  clearSelectedTeam: () => void;
  selectedPlayersId: Id<"players">[];
}

export default function PlayersCard({
  selectedTeam,
  clearSelectedTeam,
  selectedPlayersId,
}: PlayersCardProps) {
  const { allPlayers, loading } = useAllPlayersByTeamId({
    teamId: selectedTeam._id,
  });
  const updatePlayersByTeam = useMutation(api.teams.updatePlayersByTeam);
  const [selectedPlayers, setSelectedPlayers] =
    useState<Id<"players">[]>(selectedPlayersId);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // <-- Added Loading State

  useEffect(() => {
    setSelectedPlayers(selectedPlayersId);
  }, [selectedPlayersId]);

  if (loading) return <LoadingScreen />;

  const handlePlayerSelection = (playerId: Id<"players">) => {
    setError(null);

    setSelectedPlayers((prevSelected) => {
      if (prevSelected.includes(playerId)) {
        return prevSelected.filter((id) => id !== playerId);
      } else if (prevSelected.length < 2) {
        return [...prevSelected, playerId];
      } else {
        setError("You can only select up to 2 players.");
        return prevSelected;
      }
    });
  };

  const handleRemovePlayer = (playerId: Id<"players">) => {
    setSelectedPlayers((prev) => prev.filter((id) => id !== playerId));
  };

  const handleSubmit = async () => {
    if (selectedPlayers.length !== 2) {
      setError("Please select exactly 2 players before submitting.");
      toast.error("You must select exactly 2 players.");
      return;
    }

    setIsSubmitting(true); // Start loading state
    try {
      await updatePlayersByTeam({
        teamId: selectedTeam._id,
        players: selectedPlayers,
      });

      clearSelectedTeam();
      toast.success("Players successfully updated!");
    } catch (err) {
      console.error("Submission failed:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false); // Stop loading state
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-lg animate-fade-in">
      <CardHeader className="text-center bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-t-lg">
        <CardTitle className="text-2xl font-bold">Select Players</CardTitle>
      </CardHeader>

      <CardContent className="p-6">
        <div className="mb-4 text-center">
          <h3 className="text-xl font-semibold mb-2">
            {selectedTeam.teamName}
          </h3>
          <p className="text-sm text-gray-600">
            Select 2 players from this team ({selectedPlayers.length}/2
            selected)
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Selected Players Display */}
        {selectedPlayers.length > 0 && (
          <div className="border rounded-md py-4">
            <div className="mb-4 flex flex-row justify-center gap-3">
              {selectedPlayers.map((playerId) => {
                const player = allPlayers.find((p) => p._id === playerId);
                return player ? (
                  <div
                    key={player._id}
                    className="relative flex flex-col items-center gap-2 p-3 bg-blue-100 rounded-lg shadow-md"
                  >
                    {/* Remove button at the top-right corner */}
                    <button
                      onClick={() => handleRemovePlayer(player._id)}
                      className="absolute top-1 right-1 text-red-500 hover:text-red-700"
                    >
                      <X size={18} />
                    </button>

                    <Image
                      src={player.profileImage || "/placeholder.svg"}
                      alt={player.name}
                      width={50}
                      height={50}
                      className="rounded-full border border-gray-300"
                    />
                    <p className="text-sm font-medium">{player.name}</p>
                  </div>
                ) : null;
              })}
            </div>
            <div className="flex justify-center items-center gap-4 mt-4">
              {/* Back Button */}
              <Button
                onClick={clearSelectedTeam}
                className="bg-gray-500 hover:bg-gray-600 text-white font-semibold px-6 py-2 rounded-full transition-all"
              >
                Back
              </Button>

              {/* Submit Button */}
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting} // Disable button when submitting
                className={`bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-semibold px-8 py-2 rounded-full transition-all ${
                  isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </div>
        )}

        {/* Player List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {allPlayers.map((player) => {
            const isSelected = selectedPlayers.includes(player._id);

            return (
              <div
                key={player._id}
                className={`flex items-center p-3 rounded-lg border ${
                  isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200"
                } hover:border-blue-300 transition-colors`}
              >
                <div className="flex-shrink-0 w-10 h-10 relative mr-3">
                  <Image
                    src={player.profileImage || "/placeholder.svg"}
                    alt={player.name}
                    fill
                    className="object-cover rounded-full"
                  />
                </div>
                <div className="flex-grow">
                  <p className="font-medium">{player.name}</p>
                  <p className="text-sm text-gray-600">{player.role}</p>
                </div>
                <Checkbox
                  id={player._id}
                  checked={isSelected}
                  onCheckedChange={() => handlePlayerSelection(player._id)}
                  className="ml-2"
                />
              </div>
            );
          })}
        </div>
      </CardContent>

      <CardFooter className="flex justify-center p-6 gap-4"></CardFooter>
    </Card>
  );
}
