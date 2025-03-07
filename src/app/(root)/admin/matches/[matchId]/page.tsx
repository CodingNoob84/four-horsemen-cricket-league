"use client";

import { MatchDetailCard } from "@/components/matches/matchdetail-card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMatchPlayersDataById } from "@/hooks/convex-hooks";
import { Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { FinalSubmit } from "@/components/admin/finalsubmit-card";
import { MatchWinnerCard } from "@/components/admin/match-winner";
import PlayerDataCard from "@/components/admin/playerdata-card";
import { TimerFutureMatches } from "@/components/admin/timer-futurematches";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { LoadingScreen } from "@/components/common/loading-screen";
import { calculatePlayerPoints } from "@/lib/utils";
import { PlayerData } from "@/types";
import { Id } from "../../../../../../convex/_generated/dataModel";

export default function AdminMatchDetailsPage() {
  const { matchId } = useParams();

  const { matchPlayerData, loading } = useMatchPlayersDataById(
    matchId as Id<"matches">
  );

  const [homeTeamPlayers, setHomeTeamPlayers] = useState<PlayerData[]>([]);
  console.log("home", homeTeamPlayers);
  const [awayTeamPlayers, setAwayTeamPlayers] = useState<PlayerData[]>([]);

  const [loadingBulkSubmit, setLoadingBulkSubmit] = useState<boolean>(false);

  useEffect(() => {
    if (matchPlayerData) {
      setHomeTeamPlayers(matchPlayerData.homeTeamPlayers);
      setAwayTeamPlayers(matchPlayerData.awayTeamPlayers);
    }
  }, [matchPlayerData]);

  if (loading) return <LoadingScreen />;

  const handlePlayerChange = (
    team: "homeTeam" | "awayTeam",
    playerId: Id<"players">,
    field: keyof PlayerData,
    value: number | boolean
  ) => {
    const updatePlayerStats = (players: PlayerData[]) =>
      players.map((player) =>
        player._id === playerId
          ? {
              ...player,
              [field]: value,
              playerPoints: calculatePlayerPoints(
                field === "runs" ? (value as number) : player.runs,
                field === "wickets" ? (value as number) : player.wickets,
                field === "catches" ? (value as number) : player.catches,
                field === "stumpings" ? (value as number) : player.stumpings,
                field === "runouts" ? (value as number) : player.runouts
              ),
            }
          : player
      );

    if (team === "homeTeam") {
      setHomeTeamPlayers((prevPlayers) => updatePlayerStats(prevPlayers));
    } else {
      setAwayTeamPlayers((prevPlayers) => updatePlayerStats(prevPlayers));
    }
  };

  const handleSubmitAll = async () => {
    setLoadingBulkSubmit(true);
    try {
      console.log("Submitting Bulk Data:", {
        homeTeamPlayers,
        awayTeamPlayers,
      });

      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast.success("All player data saved", {
        description:
          "Statistics for all players have been updated successfully.",
      });
    } catch (error) {
      console.error("Error submitting bulk data:", error);
      toast.error("Failed to save data");
    } finally {
      setLoadingBulkSubmit(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container px-4 mx-auto">
        <Breadcrumbs
          title={"Match Player Data"}
          isAdmin={true}
          backLink={"/admin/matches"}
        />
        <FinalSubmit />
        {matchPlayerData && (
          <>
            <MatchDetailCard matchDetail={matchPlayerData.matchDetail} />
            <>
              {new Date(matchPlayerData.matchDetail.datetimeUtc).getTime() >
              new Date().getTime() ? (
                <TimerFutureMatches
                  dateTime={matchPlayerData.matchDetail.datetimeUtc}
                />
              ) : (
                <>
                  {" "}
                  <MatchWinnerCard
                    homeTeam={matchPlayerData?.matchDetail.homeTeam}
                    awayTeam={matchPlayerData?.matchDetail.awayTeam}
                    winner={matchPlayerData?.matchDetail.winner ?? null}
                    hasResult={matchPlayerData.matchDetail.hasResult ?? false}
                  />
                  <Tabs defaultValue="homeTeam" className="mb-6">
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                      <TabsTrigger value="homeTeam">
                        {matchPlayerData?.matchDetail.homeTeam?.shortForm}
                      </TabsTrigger>
                      <TabsTrigger value="awayTeam">
                        {matchPlayerData?.matchDetail.awayTeam?.shortForm}
                      </TabsTrigger>
                    </TabsList>

                    {["homeTeam", "awayTeam"].map((team) => (
                      <TabsContent key={team} value={team}>
                        <div className="space-y-2">
                          {(team === "homeTeam"
                            ? homeTeamPlayers
                            : awayTeamPlayers
                          ).map((player) => (
                            <PlayerDataCard
                              key={player._id}
                              player={player}
                              team={team as "homeTeam" | "awayTeam"}
                              onPlayerChange={(playerId, field, value) =>
                                handlePlayerChange(
                                  team as "homeTeam" | "awayTeam",
                                  playerId,
                                  field,
                                  value
                                )
                              }
                            />
                          ))}
                          <div className="flex items-center justify-center">
                            <Button
                              size="sm"
                              onClick={handleSubmitAll}
                              disabled={loadingBulkSubmit}
                            >
                              {loadingBulkSubmit ? (
                                <Loader2 className="animate-spin" />
                              ) : (
                                "Submit"
                              )}
                            </Button>
                          </div>
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                </>
              )}
            </>
          </>
        )}
      </div>
    </div>
  );
}
