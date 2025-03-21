"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatLocalDateTime } from "@/lib/utils";
import { Group, Team } from "@/types";
import { useQuery } from "convex/react"; // Import convex query
import { AlertCircle, Calendar, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../../../convex/_generated/api"; // Import API
import { Id } from "../../../convex/_generated/dataModel";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export interface PastMatchesSelect {
  matchId: Id<"matches">;
  match: string;
  datetimeUtc: string;
}

export interface MatchPoints {
  matchId: Id<"matches">;
  matchNumber: number;
  datetimeUtc: string;
  venue: string;
  homeTeam: Team;
  awayTeam: Team;
  members: {
    userId: Id<"users">;
    isUser: boolean;
    name: string;
    email: string;
    image: string;
    matchPoints: number;
    totalPoints?: number;
  }[];
}

export function GroupTabs({
  group,
  pastMatches,
}: {
  group: Group;
  pastMatches: PastMatchesSelect[];
}) {
  console.log("group", group);
  const [selectedMatchId, setSelectedMatchId] = useState<
    Id<"matches"> | undefined
  >(group.pastRecentMatch?.matchId);
  const [matchPoints, setMatchPoints] = useState<MatchPoints | null>(null);

  // Fetch match points dynamically on match selection
  const selectedMatchPoints = useQuery(
    api.groups.getMatchPointsById,
    selectedMatchId
      ? { matchId: selectedMatchId, groupId: group.groupId }
      : "skip"
  );

  useEffect(() => {
    if (selectedMatchPoints) {
      setMatchPoints(selectedMatchPoints);
    }
  }, [selectedMatchPoints]);

  return (
    <Tabs defaultValue="total" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="total" className="flex items-center">
          <Trophy className="h-4 w-4 mr-2" />
          Total Points
        </TabsTrigger>
        <TabsTrigger value="match" className="flex items-center">
          <Calendar className="h-4 w-4 mr-2" />
          Match Points
        </TabsTrigger>
      </TabsList>

      {/* Total Points Tab (Sorted by `totalPoints`) */}
      <TabsContent value="total" className="mt-0">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Overall Rankings</CardTitle>
            <CardDescription>
              Total points accumulated across all matches
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              {group.members && group.members.length > 0 ? (
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 font-medium">Rank</th>
                      <th className="text-left p-4 font-medium">User</th>
                      <th className="text-right p-4 font-medium">
                        Total Points
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.members
                      ?.filter((m): m is NonNullable<typeof m> => m !== null)
                      .slice()
                      .sort((a, b) => b.totalPoints - a.totalPoints) // Sort by totalPoints (Descending)
                      .map((player, index) => (
                        <tr
                          key={player?.userId}
                          className={`border-b hover:bg-muted/50 ${
                            player?.isUser ? "bg-primary/10" : ""
                          }`}
                        >
                          <td className="p-4 font-medium">#{index + 1}</td>
                          <td className="p-4 flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              {player?.image ? (
                                <AvatarImage
                                  src={player.image}
                                  alt={player.name}
                                />
                              ) : null}
                              <AvatarFallback>
                                {player?.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span>{player?.name}</span>
                          </td>
                          <td className="p-4 text-right font-bold">
                            {player?.totalPoints}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              ) : (
                <div>No Players</div>
              )}
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-medium">Rank</th>
                    <th className="text-left p-4 font-medium">User</th>
                    <th className="text-right p-4 font-medium">Total Points</th>
                  </tr>
                </thead>
                <tbody>
                  {group.members
                    ?.filter((m): m is NonNullable<typeof m> => m !== null)
                    .slice()
                    .sort((a, b) => b.totalPoints - a.totalPoints) // Sort by totalPoints (Descending)
                    .map((player, index) => (
                      <tr
                        key={player.userId}
                        className={`border-b hover:bg-muted/50 ${
                          player.isUser ? "bg-primary/10" : ""
                        }`}
                      >
                        <td className="p-4 font-medium">#{index + 1}</td>
                        <td className="p-4 flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            {player.image ? (
                              <AvatarImage
                                src={player.image}
                                alt={player.name}
                              />
                            ) : null}
                            <AvatarFallback>
                              {player.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span>{player.name}</span>
                        </td>
                        <td className="p-4 text-right font-bold">
                          {player.totalPoints}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Match Points Tab (Sorted by `matchPoints`) */}
      <TabsContent value="match" className="mt-0">
        {selectedMatchId == null ? (
          <Card className="mb-8">
            <CardContent className="flex flex-col justify-center items-center p-6 gap-2">
              <AlertCircle className="h-8 w-8 text-muted-foreground" />
              <p className="text-muted-foreground">
                No recent matches available
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="mb-6">
              {pastMatches && (
                <Select
                  value={selectedMatchId}
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

            {matchPoints ? (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>
                    {matchPoints.homeTeam.shortForm} vs{" "}
                    {matchPoints.awayTeam.shortForm}
                  </CardTitle>
                  <CardDescription>
                    Points for {formatLocalDateTime(matchPoints.datetimeUtc)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-4 font-medium">Rank</th>
                          <th className="text-left p-4 font-medium">User</th>
                          <th className="text-right p-4 font-medium">
                            Match Points
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {matchPoints.members
                          .slice()
                          .sort((a, b) => b.matchPoints - a.matchPoints) // Sort by matchPoints (Descending)
                          .map((player, index) => (
                            <tr
                              key={player.userId}
                              className={`border-b hover:bg-muted/50 ${
                                player.isUser ? "bg-primary/10" : ""
                              }`}
                            >
                              <td className="p-4 font-medium">#{index + 1}</td>
                              <td className="p-4 flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                  {player.image ? (
                                    <AvatarImage
                                      src={player.image}
                                      alt={player.name}
                                    />
                                  ) : null}
                                  <AvatarFallback>
                                    {player.name.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <span>{player.name}</span>
                              </td>
                              <td className="p-4 text-right font-bold">
                                {player.matchPoints}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="flex flex-col items-center justify-center p-6">
                <Trophy className="h-8 w-8 text-yellow-500 mb-2" />
                <span className="text-lg font-semibold">
                  Player Points for This Match Are Not Yet Available
                </span>
                <span className="text-sm text-gray-500 text-center">
                  We are currently updating the leaderboard. Please check back
                  soon for the latest player points.
                </span>
              </div>
            )}
          </>
        )}
      </TabsContent>
    </Tabs>
  );
}
