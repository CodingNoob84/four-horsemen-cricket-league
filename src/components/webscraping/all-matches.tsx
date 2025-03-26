"use client";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { mergeForFinalInsert } from "@/lib/scraping";
import {
  calculatePlayerPoints,
  calculateTeamPoints,
  formatLocalDateTime,
} from "@/lib/utils";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { toast } from "sonner"; // ✅ Import toast from sonner
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Textarea } from "../ui/textarea";

export const AllMatches = () => {
  const pastMatches = useQuery(api.matches.pastMatchesSelect);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false); // ✅ Loading state
  const [selectedMatchId, setSelectedMatchId] = useState<Id<"matches"> | null>(
    null
  );

  const matchData = useQuery(
    api.admin.getMatchDataById,
    selectedMatchId ? { matchId: selectedMatchId } : "skip"
  );

  const submitTeamData = useMutation(api.admin.submitTeamData);
  const submitPlayersData = useMutation(api.admin.submitBulkPlayerData);
  const updateUserPoints = useMutation(api.userspoints.updateUserPoints);
  const scrape = async () => {
    if (!selectedMatchId || !matchData || !url) {
      toast.error("Please select a match and enter a valid URL");
      return;
    }

    try {
      setLoading(true);
      toast.info("Scraping in progress...");

      const res = await fetch("/api/scraping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const scraped = await res.json();
      console.log("scraped", scraped);
      const merged = mergeForFinalInsert(scraped.data, matchData);
      console.log("m", merged);
      if (merged) {
        const winnerId = merged.winningTeam.teamId;
        await submitTeamData({
          matchId: selectedMatchId as Id<"matches">,
          winnerId: winnerId ? (winnerId as Id<"teams">) : undefined,
          teams: calculateTeamPoints(
            matchData.teams[0].teamId as Id<"teams">,
            matchData.teams[1].teamId as Id<"teams">,
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

        await submitPlayersData({
          matchId: selectedMatchId as Id<"matches">,
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
    if (!selectedMatchId) {
      alert("Match ID is missing!");
      return;
    }

    setLoading(true);
    try {
      await updateUserPoints({ matchId: selectedMatchId as Id<"matches"> });
      toast.success("Match Data and User Points have been updated");
    } catch (error) {
      console.error("Error updating user points:", error);
      toast.error("Failed to update user points. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <div className="w-full py-4">
        {pastMatches && (
          <Select
            value={selectedMatchId ?? ""}
            onValueChange={(value) =>
              setSelectedMatchId(value as Id<"matches">)
            }
          >
            <SelectTrigger className="w-full sm:w-[300px]">
              <SelectValue placeholder="Select a match" />
            </SelectTrigger>
            <SelectContent>
              {pastMatches.map((match) => (
                <SelectItem key={match.matchId} value={match.matchId}>
                  <div className="flex flex-row gap-4 items-center justify-between w-full">
                    <span>{match.match}</span>
                    <span className="text-muted-foreground text-sm">
                      {formatLocalDateTime(match.datetimeUtc)}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
      <div className="flex flex-col gap-4">
        <Textarea
          placeholder="Enter Cricbuzz URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="h-32"
        />
        <Button onClick={() => scrape()} disabled={loading}>
          {loading ? "Processing..." : "Scrape"}
        </Button>
        <Button onClick={() => handleSubmit()}>User Points Update</Button>
      </div>
    </div>
  );
};
