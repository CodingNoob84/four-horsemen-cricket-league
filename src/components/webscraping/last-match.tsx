"use client";
import { mergeForFinalInsert } from "@/lib/scraping";
import {
  calculatePlayerPoints,
  calculateTeamPoints,
  formatLocalDateTime,
} from "@/lib/utils";
import { useMutation, useQuery } from "convex/react";
import { MapPin } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { LoadingScreen } from "../common/loading-screen";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Textarea } from "../ui/textarea";
import CricketPlayerStats from "./player-list";

export type PlayedPlayers = {
  playerId: Id<"players">;
  playerName: string;
  runs: number;
  wickets: number;
  catches: number;
  stumpings: number;
  runouts: number;
  playerPoints: number;
};

export const LastMatchData = () => {
  const [loading, setLoading] = useState(false);
  const [playedPlayers, setPlayedPlayers] = useState<PlayedPlayers[] | []>([]);
  const getData = useQuery(api.admin.getCricbuzzUrl);
  console.log("data", getData);

  const submitTeamData = useMutation(api.admin.submitTeamData);
  const submitPlayersData = useMutation(api.admin.submitBulkPlayerData);
  const updateUserPoints = useMutation(api.userspoints.updateUserPoints);

  if (getData == undefined) {
    return <LoadingScreen />;
  }
  const scrape = async () => {
    if (!getData) {
      toast.error("Please select a match and enter a valid URL");
      return;
    }

    try {
      setLoading(true);
      toast.info("Scraping in progress...");

      const res = await fetch("/api/scraping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: getData.url }),
      });

      const scraped = await res.json();
      console.log("scraped", scraped);
      const merged = mergeForFinalInsert(scraped.data, {
        teams: getData.teams,
        homeTeamPlayers: getData.homeTeamPlayers,
        awayTeamPlayers: getData.awayTeamPlayers,
      });
      console.log("m", merged);
      if (merged) {
        const winnerId = merged.winningTeam.teamId;
        await submitTeamData({
          matchId: getData.match?._id as Id<"matches">,
          winnerId: winnerId ? (winnerId as Id<"teams">) : undefined,
          teams: calculateTeamPoints(
            getData.teams[0].teamId as Id<"teams">,
            getData.teams[1].teamId as Id<"teams">,
            winnerId
          ),
        });
        console.log("players", merged.players);

        const players = merged.players.map((player) => ({
          ...player,
          isPlayed: true,
          playerPoints: calculatePlayerPoints(
            player.runs,
            player.wickets,
            player.catches,
            player.stumpings,
            player.runouts
          ),
        }));
        setPlayedPlayers(players);
        await submitPlayersData({
          matchId: getData.match?._id as Id<"matches">,
          playersData: players,
        });

        toast.success("Data inserted successfully!");
      } else {
        toast.error("Merging failed. Please verify scraped data.");
      }
    } catch (err) {
      console.error("Scrape error:", err);
      toast.error("Scraping or data submission failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!getData.match?._id) {
      alert("Match ID is missing!");
      return;
    }

    setLoading(true);
    try {
      await updateUserPoints({ matchId: getData.match?._id as Id<"matches"> });
      toast.success("Match Data and User Points have been updated");
    } catch (error) {
      console.error("Error updating user points:", error);
      toast.error("Failed to update user points. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  console.log("playedPlayers", playedPlayers.length);
  return (
    <div>
      {getData && (
        <Card className="overflow-hidden border-2 rounded-xl mb-2">
          <CardContent className="mt-4 pb-0">
            <div className="flex justify-between items-center">
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="w-4 h-4 mr-1" />
                {getData.match?.venue}
              </div>
              <div className="text-sm font-medium text-gray-600">
                {formatLocalDateTime(getData.match?.datetimeUtc || "")}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex flex-row items-center w-2/5">
                <Image
                  src={getData.homeTeam?.image || "/placeholder.svg"}
                  alt={getData.homeTeam?.shortForm || "Home Team"}
                  width={50}
                  height={50}
                  className=" p-1"
                />
                <span className="text-sm font-medium text-center">
                  {getData.homeTeam?.shortForm}
                </span>
              </div>
              <div className="text-xl font-bold text-gray-700">VS</div>
              <div className="flex flex-row-reverse items-center w-2/5">
                <Image
                  src={getData.awayTeam?.image || "/placeholder.svg"}
                  alt={getData.awayTeam?.shortForm || "Away Team"}
                  width={50}
                  height={50}
                  className=" p-1"
                />
                <span className="text-sm font-medium text-center">
                  {getData.awayTeam?.shortForm}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid w-full gap-2">
        <Textarea defaultValue={getData.url} className="h-32" />
        <Button disabled={loading} onClick={() => scrape()}>
          {loading ? "Scraping..." : "Cricbuzz Scrape"}
        </Button>
        <Button onClick={() => handleSubmit()}>UserPoints Update</Button>
      </div>
      {playedPlayers.length > 0 && (
        <CricketPlayerStats InitPlayers={playedPlayers} />
      )}
    </div>
  );
};
