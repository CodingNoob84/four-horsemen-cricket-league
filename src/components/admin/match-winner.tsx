import { calculateTeamPoints } from "@/lib/utils";
import { Team } from "@/types";
import { useMutation } from "convex/react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";

export const MatchWinnerCard = ({
  homeTeam,
  awayTeam,
  winner,
  hasResult,
}: {
  homeTeam: Team | null;
  awayTeam: Team | null;
  winner: Id<"teams"> | null;
  hasResult: boolean;
}) => {
  console.log("winner", winner);
  const { matchId } = useParams();
  const [selectedTeam, setSelectedTeam] = useState<
    "home" | "away" | "noresult" | null
  >(null);
  const [winnerId, setWinnerId] = useState<string | null>(winner);
  const [loading, setLoading] = useState<boolean>(false);

  const submitTeamData = useMutation(api.admin.submitTeamData);

  useEffect(() => {
    if (hasResult) {
      if (winner === homeTeam?._id) {
        setSelectedTeam("home");
        setWinnerId(homeTeam._id);
      } else if (winner === awayTeam?._id) {
        setSelectedTeam("away");
        setWinnerId(awayTeam._id);
      }
    } else {
      setSelectedTeam("noresult");
      setWinnerId(null);
    }
  }, [homeTeam, awayTeam, winner, hasResult]);

  const handleSelect = (
    team: "home" | "away" | "noresult",
    teamId?: string
  ) => {
    setSelectedTeam(team);
    setWinnerId(teamId || null);
    console.log(`Selected Winner: ${teamId || "No Result"}`);
  };

  const handleSubmit = async () => {
    if (!selectedTeam) {
      toast.error("Please select a winner or NoResult before submitting.");
      return;
    }
    if (homeTeam && awayTeam) {
      setLoading(true);
      console.log(
        `Submitting Match Winner: ${selectedTeam}, Winner ID: ${winnerId || "No Result"}`
      );

      try {
        await submitTeamData({
          matchId: matchId as Id<"matches">,
          winnerId: winnerId ? (winnerId as Id<"teams">) : undefined, // Convert null to undefined
          teams: calculateTeamPoints(homeTeam?._id, awayTeam?._id, winnerId),
        });

        toast.success("Match winner submitted successfully!");
      } catch (error) {
        console.error("Error submitting match winner:", error);
        toast.error("Failed to submit match winner.");
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {}, []);

  return (
    <Card className="overflow-hidden border-2 rounded-xl mb-2">
      <CardContent className="mt-2 pb-2 flex flex-col gap-2">
        <div className="flex justify-center items-center font-semibold text-lg">
          Match Winner
        </div>

        <div className="flex text-sm gap-5 items-center justify-between">
          {/* Home Team Selection */}
          <div
            className={`w-full text-sm border py-2 rounded-md text-center shadow-md cursor-pointer transition ${
              selectedTeam === "home"
                ? "bg-green-200 text-green-600 font-bold"
                : "hover:bg-gray-100"
            }`}
            onClick={() => handleSelect("home", homeTeam?._id)}
          >
            {homeTeam?.shortForm || "Home Team"}
          </div>

          {/* No Result Selection */}
          <div
            className={`w-full border py-2 rounded-md text-center shadow-md cursor-pointer transition ${
              selectedTeam === "noresult"
                ? "bg-gray-300 text-gray-700 font-bold"
                : "hover:bg-gray-100"
            }`}
            onClick={() => handleSelect("noresult")}
          >
            No Result
          </div>

          {/* Away Team Selection */}
          <div
            className={`w-full border py-2 rounded-md text-center shadow-md cursor-pointer transition ${
              selectedTeam === "away"
                ? "bg-green-200 text-green-600 font-bold"
                : "hover:bg-gray-100"
            }`}
            onClick={() => handleSelect("away", awayTeam?._id)}
          >
            {awayTeam?.shortForm || "Away Team"}
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!selectedTeam || loading}
          className="mt-2"
        >
          {loading ? "Submitting..." : "Submit"}
        </Button>
      </CardContent>
    </Card>
  );
};
