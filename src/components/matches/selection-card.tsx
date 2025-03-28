import { Player } from "@/types";
import { useMutation } from "convex/react";
import { Crown, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export const SelectionCard = ({
  homeTeamName,
  homeTeamId,
  awayTeamName,
  awayTeamId,
  selectedPlayers,
  setSelectedPlayers,
  selectedTeamId,
  selectedCaptainId,
  canSubmit,
}: {
  homeTeamName: string;
  homeTeamId: string;
  awayTeamName: string;
  awayTeamId: string;
  selectedPlayers: Player[];
  setSelectedPlayers: (players: Player[]) => void;
  selectedTeamId: string;
  selectedCaptainId: string;
  canSubmit: boolean;
}) => {
  const { matchId } = useParams();
  const [selectedTeam, setSelectedTeam] = useState<string | null>(
    selectedTeamId
  );
  const [captainId, setCaptainId] = useState<string | null>(selectedCaptainId);
  const [isLoading, setIsLoading] = useState(false);
  const [captainIconFocus, setCaptainIconFocus] = useState(false);
  const [teamButtonFocus, setTeamButtonFocus] = useState(false);
  const submitFantasyData = useMutation(api.matches.submitFantasyData);

  const handleRemovePlayer = (playerId: Id<"players">) => {
    if (captainId === playerId) {
      setCaptainId(null);
    }
    setSelectedPlayers(selectedPlayers.filter((p) => p._id !== playerId));
  };

  const handleSetCaptain = (playerId: Id<"players">) => {
    setCaptainId(playerId === captainId ? null : playerId);
    if (playerId !== captainId) {
      toast.info("Captain selected", {
        description: "You have set a captain for your team.",
        duration: 2000,
      });
    }
  };

  const handleSubmit = async () => {
    if (selectedPlayers.length < 4) {
      toast.error("Submission failed", {
        description: "Please select 4 players",
      });
      return;
    }

    if (!captainId) {
      setCaptainIconFocus(true);
      setTimeout(() => {
        setCaptainIconFocus(false);
      }, 2000);
      toast.error("Submission failed", {
        description: "Please select anyone as captain, click crown icon",
      });
      return;
    }

    if (!selectedTeam) {
      setTeamButtonFocus(true);
      setTimeout(() => {
        setTeamButtonFocus(false);
      }, 2000);
      toast.error("Submission failed", {
        description: "Please select a team",
      });
      return;
    }
    setIsLoading(true);
    try {
      await submitFantasyData({
        matchId: matchId as Id<"matches">,
        selectedTeam: selectedTeam as Id<"teams">,
        selectedPlayers: selectedPlayers.map((player) => player._id),
        captain: captainId as Id<"players">,
      });

      toast.success("Team submitted successfully!", {
        description: "Your fantasy team has been saved.",
      });
    } catch (error) {
      console.log("Error submitting", error);
      toast.error("Error submitting team");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          Selected Team ({selectedTeam == null ? 0 : 1}) and Players (
          {selectedPlayers.length}/4)
        </CardTitle>
        <div className="text-xs italic">
          Please select your winning team and four top performing players
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <div className="flex flex-row gap-5 justify-between items-center">
          <div
            onClick={() => {
              setSelectedTeam(homeTeamId);
              toast.info("Home team selected", {
                description: "You have selected the home team.",
              });
            }}
            className={`w-full flex items-center justify-center p-3 rounded-lg border ${selectedTeam === homeTeamId && "bg-green-200"} ${teamButtonFocus && "border-4 border-green-300"}`}
          >
            {homeTeamName}
          </div>
          <div
            onClick={() => {
              setSelectedTeam(awayTeamId);
              toast.info("Away team selected", {
                description: "You have selected the away team.",
              });
            }}
            className={`w-full flex items-center justify-center p-3 rounded-lg border ${selectedTeam === awayTeamId && "bg-green-200"} ${teamButtonFocus && "border-4 border-green-300"}`}
          >
            {awayTeamName}
          </div>
        </div>
        <div className="space-y-3">
          {selectedPlayers.map((player) => (
            <div
              key={player._id}
              className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent hover:text-accent-foreground"
            >
              <button
                onClick={() => handleSetCaptain(player._id)}
                className={`p-2 rounded-full ${
                  captainId === player._id
                    ? "text-yellow-700 bg-yellow-100"
                    : "text-gray-400 hover:text-yellow-600 hover:bg-yellow-300"
                } ${captainIconFocus && "bg-yellow-100"}`}
              >
                <Crown className="w-5 h-5" />
              </button>

              <div className="flex items-center flex-1 mx-4">
                <Avatar className="h-8 w-8 mr-3">
                  <AvatarImage src={player.profileImage} alt={player.name} />
                  <AvatarFallback>{player.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{player.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {player.role}
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleRemovePlayer(player._id)}
                className="p-2 text-red-500 rounded-full hover:bg-red-50"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}

          {selectedPlayers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No players selected yet.. Please select players from below teams
            </div>
          )}
          <div className="flex flex-row gap-4">
            <Button className="w-full mt-4" size="lg" asChild>
              <Link href="/matches">Back</Link>
            </Button>

            {canSubmit && (
              <Button
                className="w-full mt-4"
                size="lg"
                onClick={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? "Submitting..." : "Submit Team"}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
