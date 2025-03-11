"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { UserCardWithPoints } from "@/components/pointshistory/user-card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { cn, formatLocalDateTime } from "@/lib/utils";
import {
  AlertCircle,
  Calendar,
  ChevronDown,
  Star,
  Trophy,
  User,
  Users,
} from "lucide-react";

const teamColors: Record<string, string> = {
  CSK: "bg-yellow-500",
  RCB: "bg-red-600",
  MI: "bg-blue-600",
  KKR: "bg-purple-600",
  SRH: "bg-orange-500",
  DC: "bg-blue-400",
  RR: "bg-pink-500",
  PBKS: "bg-red-500",
  GT: "bg-teal-500",
  LSG: "bg-cyan-600",
};

export default function UserPointsHistoryPage() {
  const userpoints = useQuery(api.userspoints.fetchPastMatchesUserPoints);
  console.log("userponts", userpoints);

  return (
    <div className="container mx-auto py-8 px-4">
      <Breadcrumbs title="Points History" isAdmin={false} backLink="/" />
      {/* User Profile Section */}
      {userpoints && (
        <>
          <UserCardWithPoints
            user={userpoints.user}
            totalPoints={userpoints.totalPoints}
          />

          {/* Points Summary Card */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                Points Summary
              </CardTitle>
              <CardDescription>
                Your fantasy cricket performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
                  <span className="text-muted-foreground text-sm">
                    Total Matches
                  </span>
                  <span className="text-2xl font-bold">
                    {userpoints?.matches.length}
                  </span>
                </div>
                <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
                  <span className="text-muted-foreground text-sm">
                    Played Matches
                  </span>
                  <span className="text-2xl font-bold">
                    {userpoints?.matches.filter(
                      (match) => match?.selectedPlayers.length > 0
                    ).length || 0}
                  </span>
                </div>

                {/* Missed Matches (where user did not participate) */}
                <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
                  <span className="text-muted-foreground text-sm">
                    Missed Matches
                  </span>
                  <span className="text-2xl font-bold">
                    {userpoints?.matches.filter(
                      (match) => match?.selectedPlayers.length === 0
                    ).length || 0}
                  </span>
                </div>
                <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
                  <span className="text-muted-foreground text-sm">
                    Average Points
                  </span>
                  <span className="text-2xl font-bold">
                    {Math.round(
                      userpoints?.matches.reduce(
                        (acc, match) => acc + match.matchPoints,
                        0
                      ) / userpoints?.matches.length
                    )}
                  </span>
                </div>
                <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
                  <span className="text-muted-foreground text-sm">
                    Highest Points
                  </span>
                  <span className="text-2xl font-bold">
                    {Math.max(
                      ...userpoints?.matches.map((match) => match.matchPoints)
                    )}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Matches Accordion */}
          <Card className="w-full shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Trophy className="w-5 h-5 text-amber-500" />
                Match History
              </CardTitle>
              <CardDescription>Your points breakdown by match</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {userpoints?.matches.map((match) => {
                  const played = match.selectedPlayers.length > 0;

                  return (
                    <AccordionItem
                      key={match.matchId}
                      value={`match-${match.matchId}`}
                      className={cn(
                        "border rounded-md mb-2 overflow-hidden",
                        !played && "bg-gray-50 dark:bg-gray-900/30"
                      )}
                    >
                      <AccordionTrigger
                        className={cn(
                          "px-4 py-3 hover:no-underline group",
                          !played && "cursor-default"
                        )}
                        disabled={!played}
                      >
                        <div className="flex flex-col md:flex-row w-full items-start md:items-center justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center">
                              <Badge
                                className={cn(
                                  "text-white font-medium",
                                  teamColors[match.homeTeamName] ||
                                    teamColors.default
                                )}
                              >
                                {match.homeTeamName}
                              </Badge>
                              <span className="mx-2 text-xs md:text-sm">
                                vs
                              </span>
                              <Badge
                                className={cn(
                                  "text-white font-medium",
                                  teamColors[match.awayTeamName] ||
                                    teamColors.default
                                )}
                              >
                                {match.awayTeamName}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 md:gap-4">
                            <div className="flex items-center gap-1 text-xs md:text-sm text-muted-foreground">
                              <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                              <span>
                                {formatLocalDateTime(match.datetimeUtc)}
                              </span>
                            </div>

                            {played ? (
                              <Badge
                                variant="outline"
                                className="bg-primary/10 ml-auto md:ml-2"
                              >
                                <Trophy className="w-3 h-3 mr-1 text-amber-500" />
                                {match.matchPoints} pts
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 ml-auto md:ml-2"
                              >
                                <AlertCircle className="w-3 h-3 mr-1" />
                                Not Played
                              </Badge>
                            )}

                            {played && (
                              <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180 hidden md:block" />
                            )}
                          </div>
                        </div>
                      </AccordionTrigger>

                      {played && (
                        <AccordionContent>
                          <div className="px-4 pt-2 pb-4">
                            <div className="mb-4">
                              <h4 className="text-sm font-semibold flex items-center gap-2 mb-2 text-primary">
                                <Users className="w-4 h-4" />
                                Team Points
                              </h4>
                              <div className="flex items-center justify-between p-3 rounded-lg border bg-card/50">
                                <div className="flex items-center gap-2">
                                  <Avatar className="w-8 h-8 border">
                                    <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium">
                                      {match?.selectedTeamName
                                        ? match.selectedTeamName
                                        : "TM"}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="text-sm font-medium">
                                      {match.selectedTeamName}
                                    </p>
                                  </div>
                                </div>
                                <Badge
                                  variant="outline"
                                  className="bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800"
                                >
                                  <Star className="w-3 h-3 mr-1 text-amber-500" />
                                  {match.teamPoints} pts
                                </Badge>
                              </div>
                            </div>

                            <h4 className="text-sm font-semibold flex items-center gap-2 mb-2 text-primary">
                              <User className="w-4 h-4" />
                              Player Points
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {match.selectedPlayers.map((player, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between p-3 rounded-lg border bg-card/50"
                                >
                                  <div className="flex items-center gap-2">
                                    <Avatar className="w-8 h-8 border">
                                      <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium">
                                        {player.playerName
                                          .split(" ")
                                          .map((n) => n[0])
                                          .join("")}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <p className="text-sm font-medium">
                                        {player.playerName}
                                      </p>
                                    </div>
                                  </div>
                                  <Badge
                                    variant="outline"
                                    className="bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800"
                                  >
                                    <Star className="w-3 h-3 mr-1 text-amber-500" />
                                    {player.playerPoints} pts
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        </AccordionContent>
                      )}
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
