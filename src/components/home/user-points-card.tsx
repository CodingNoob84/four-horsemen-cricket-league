"use client";

import { getInitials } from "@/lib/utils";
import { useQuery } from "convex/react";
import {
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Mail,
  Shield,
  Star,
  Trophy,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";

export default function UserScoreCard() {
  const userdata = useQuery(api.users.getUserDetailsWithLastMatch);
  const [expand, setExpand] = useState(false);
  console.log("userdata", userdata);

  return (
    <div className="flex justify-center p-2">
      <Card className="bg-card text-card-foreground w-full max-w-md overflow-hidden border-2 rounded-xl shadow-md">
        <CardHeader className="p-4">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <Avatar className="h-10 w-10 border-2 border-primary/20">
              <AvatarImage
                src={userdata?.user.image}
                alt={userdata?.user.name}
              />
              <AvatarFallback className="bg-primary/10 text-primary text-lg">
                {getInitials(userdata?.user.name || "")}
              </AvatarFallback>
            </Avatar>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold">{userdata?.user.name}</h3>
              <div className="flex items-center text-muted-foreground text-xs mt-1 truncate">
                <Mail className="h-3 w-3 mr-1 shrink-0" />
                <span className="truncate">{userdata?.user.email}</span>
              </div>
            </div>

            {/* Points Badge */}
            <Badge
              variant="secondary"
              className="flex items-center gap-1 px-2.5 py-1 whitespace-nowrap"
            >
              <Trophy className="h-3 w-3 text-amber-500" />
              <span className="font-semibold">
                {userdata?.totalOverallPoints}
              </span>
              <span className="text-xs ml-0.5">points</span>
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="px-4 py-2">
          <div className="rounded-lg mb-2">
            <div className="flex flex-row justify-between items-center">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setExpand((prev) => !prev)}
                  className="p-1 rounded-full hover:bg-muted transition-colors"
                >
                  {expand ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
                <div className="flex flex-row gap-2">
                  <Badge variant="outline" className="font-medium text-xs">
                    {userdata?.lastMatch?.homeTeamName}
                  </Badge>
                  vs
                  <Badge variant="outline" className="font-medium text-xs">
                    {userdata?.lastMatch?.awayTeamName}
                  </Badge>
                </div>
              </div>
              <span className="text-lg font-bold text-primary">
                {userdata?.lastMatch?.matchPoints}
              </span>
            </div>
          </div>

          {expand && (
            <div className="space-y-4 mt-2">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Shield className="h-3.5 w-3.5 text-muted-foreground" />
                  <h4 className="font-medium text-sm">Team Points</h4>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-md bg-background border">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="text-xs bg-primary/10">
                      {userdata?.lastMatch?.team?.selectedTeamName}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium truncate">
                      {" "}
                      {userdata?.lastMatch?.team?.selectedTeamName}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <Star className="h-3 w-3 text-amber-500 mr-0.5" />
                    <span className="text-xs font-semibold">
                      {" "}
                      {userdata?.lastMatch?.team?.teamPoints}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Users className="h-3.5 w-3.5 text-muted-foreground" />
                  <h4 className="font-medium text-sm">Player Points</h4>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {userdata?.lastMatch?.players.map((player, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 rounded-md bg-background border"
                    >
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="text-xs bg-primary/10">
                          {getInitials(player.playerName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium truncate">
                          {player.playerName}
                        </p>
                        <div className="flex items-center mt-0.5">
                          <Star className="h-3 w-3 text-amber-500 mr-0.5" />
                          <span className="text-xs font-semibold">
                            {player.playerPoints}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="p-4 pt-3">
          <Button variant="outline" className="w-full text-sm" asChild>
            <Link
              href="/points-history"
              className="flex items-center justify-center"
            >
              View All Match History
              <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
