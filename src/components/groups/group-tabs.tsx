"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatLocalDateTime } from "@/lib/utils";
import { Group, Team } from "@/types";
import { useQuery } from "convex/react"; // Import convex query
import { Calendar, Trophy } from "lucide-react";
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
  const [selectedMatchId, setSelectedMatchId] = useState<Id<"matches">>(
    group.pastRecentMatch.matchId
  );
  const [matchPoints, setMatchPoints] = useState<MatchPoints | null>(null);

  // Fetch match points dynamically on match selection
  const selectedMatchPoints = useQuery(api.groups.getMatchPointsById, {
    matchId: selectedMatchId,
    groupId: group.groupId,
  });

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

      {/* Total Points Tab */}
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
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-medium">Rank</th>
                    <th className="text-left p-4 font-medium">User</th>
                    <th className="text-right p-4 font-medium">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {group.members.map((player, index) => (
                    <tr
                      key={player.userId}
                      className={`border-b hover:bg-muted/50 ${player.isUser ? "bg-primary/10" : ""}`}
                    >
                      <td className="p-4 font-medium">
                        {index === 0 ? (
                          <span className="flex items-center">
                            <Trophy className="h-4 w-4 mr-1 text-yellow-500" />
                            1st
                          </span>
                        ) : index === 1 ? (
                          <span className="flex items-center">
                            <Trophy className="h-4 w-4 mr-1 text-gray-400" />
                            2nd
                          </span>
                        ) : index === 2 ? (
                          <span className="flex items-center">
                            <Trophy className="h-4 w-4 mr-1 text-amber-700" />
                            3rd
                          </span>
                        ) : (
                          `#${index + 1}`
                        )}
                      </td>
                      <td className="p-4 flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          {player.image ? (
                            <AvatarImage src={player.image} alt={player.name} />
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

      {/* Match Points Tab */}
      <TabsContent value="match" className="mt-0">
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
                      <th className="text-right p-4 font-medium">Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {matchPoints.members.map((player, index) => (
                      <tr
                        key={player.userId}
                        className={`border-b hover:bg-muted/50 ${player.isUser ? "bg-primary/10" : ""}`}
                      >
                        <td className="p-4 font-medium">#{index + 1}</td>
                        <td className="p-4">{player.name}</td>
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
          <p className="text-center text-muted-foreground">
            Loading match points...
          </p>
        )}
      </TabsContent>
    </Tabs>
  );
}
