"use client";
import { LoadingScreen } from "@/components/common/loading-screen";
import { useQuery } from "convex/react";
import { useParams } from "next/navigation";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";

import { Breadcrumbs } from "@/components/common/breadcrumbs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  House,
  LandPlot,
  Star,
  Trophy,
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

export default function PlayerDetailPage() {
  const { playerId } = useParams();
  const playerDetails = useQuery(api.players.getPlayerById, {
    playerId: playerId as Id<"players">,
  });
  if (playerDetails == undefined) {
    return <LoadingScreen />;
  }
  return (
    <div className="container mx-auto py-8 px-4">
      <Breadcrumbs title="User History" isAdmin={false} backLink="/users" />
      {/* User Profile Section */}
      {playerDetails && (
        <>
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
            <Avatar className="w-24 h-24 border-4 border-primary">
              <AvatarImage
                src={playerDetails.player.profileImage}
                alt={playerDetails.player.name}
              />
              <AvatarFallback className="text-2xl">
                {playerDetails.player.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-center md:items-start">
              <h1 className="text-3xl font-bold">
                {playerDetails.player.name}
              </h1>
              <div className="flex flex-row gap-2">
                <div className="flex items-center gap-2 text-muted-foreground mt-1">
                  <LandPlot className="w-4 h-4" />
                  <span>{playerDetails.player.role}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground mt-1">
                  <House className="w-4 h-4" />
                  <span>{playerDetails.team?.teamName}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <span className="text-xl font-semibold">
                  {playerDetails.totalPoints} Points
                </span>
                from
                <span> {playerDetails.totalMatchesPlayed} Matches</span>
              </div>
            </div>
          </div>

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
                {playerDetails?.matches.map((match) => {
                  //const played = match.selectedPlayers.length > 0;

                  return (
                    <AccordionItem
                      key={match._id}
                      value={`match-${match.matchNumber}`}
                      className={cn(
                        "border rounded-md mb-2 overflow-hidden",
                        !match.hasPlayed && "bg-gray-50 dark:bg-gray-900/30"
                      )}
                    >
                      <AccordionTrigger
                        className={cn(
                          "px-4 py-3 hover:no-underline group",
                          !match.hasPlayed && "cursor-default"
                        )}
                        disabled={!match.hasPlayed}
                      >
                        <div className="flex flex-col md:flex-row w-full items-start md:items-center justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center">
                              <Badge
                                className={cn(
                                  "text-white font-medium",
                                  teamColors[match.oppTeam] || "bg-gray-500"
                                )}
                              >
                                {match.oppTeam}
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

                            {match.hasPlayed ? (
                              <Badge
                                variant="outline"
                                className="bg-primary/10 ml-auto md:ml-2"
                              >
                                <Trophy className="w-3 h-3 mr-1 text-amber-500" />
                                {match.playerPoints} pts
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
                          </div>
                        </div>
                      </AccordionTrigger>

                      {match.hasPlayed && (
                        <AccordionContent>
                          <div className="px-4 pt-2 pb-4">
                            <div className="mb-4 flex flex-col gap-2">
                              <div className="flex items-center justify-between p-3 rounded-lg border bg-card/50">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-medium">
                                    Runs Scored
                                  </p>
                                </div>
                                <Badge
                                  variant="outline"
                                  className="bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800"
                                >
                                  <Star className="w-3 h-3 mr-1 text-amber-500" />
                                  {match.runs}
                                </Badge>
                              </div>
                              <div className="flex items-center justify-between p-3 rounded-lg border bg-card/50">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-medium">
                                    Wickets Taken
                                  </p>
                                </div>
                                <Badge
                                  variant="outline"
                                  className="bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800"
                                >
                                  <Star className="w-3 h-3 mr-1 text-amber-500" />
                                  {match.wickets}
                                </Badge>
                              </div>
                              <div className="flex items-center justify-between p-3 rounded-lg border bg-card/50">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-medium">Catches</p>
                                </div>
                                <Badge
                                  variant="outline"
                                  className="bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800"
                                >
                                  <Star className="w-3 h-3 mr-1 text-amber-500" />
                                  {match.catches}
                                </Badge>
                              </div>
                              <div className="flex items-center justify-between p-3 rounded-lg border bg-card/50">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-medium">
                                    Stumpings
                                  </p>
                                </div>
                                <Badge
                                  variant="outline"
                                  className="bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800"
                                >
                                  <Star className="w-3 h-3 mr-1 text-amber-500" />
                                  {match.stumpings}
                                </Badge>
                              </div>
                              <div className="flex items-center justify-between p-3 rounded-lg border bg-card/50">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-medium">Runouts</p>
                                </div>
                                <Badge
                                  variant="outline"
                                  className="bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800"
                                >
                                  <Star className="w-3 h-3 mr-1 text-amber-500" />
                                  {match.runouts}
                                </Badge>
                              </div>
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
