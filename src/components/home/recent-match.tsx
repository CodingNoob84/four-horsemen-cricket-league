import { formatLocalDateTime } from "@/lib/utils";
import { useQuery } from "convex/react";
import {
  AlertCircle,
  Calendar,
  Check,
  ChevronRight,
  Crown,
  Loader,
} from "lucide-react";
import Link from "next/link";
import { api } from "../../../convex/_generated/api";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export const RecentMatch = () => {
  const recentMatch = useQuery(api.userspoints.recentMatchPoints);
  //console.log("recentMatch", recentMatch);
  if (recentMatch === undefined) {
    return (
      <div className="p-2">
        <h2 className="text-2xl font-bold mb-4 flex items-center">
          <Calendar className="mr-2 h-6 w-6" />
          Recent Match
        </h2>
        <Card className="mb-8">
          <CardContent className="flex justify-center items-center p-6">
            <Loader className="animate-spin" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!recentMatch.hasMatch) {
    return (
      <div className="p-2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <Calendar className="mr-2 h-6 w-6" />
            Recent Match
          </h2>
          <Link
            href="/points-history"
            className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            View All
            <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        <Card className="mb-8">
          <CardContent className="flex flex-col justify-center items-center p-6 gap-2">
            <AlertCircle className="h-8 w-8 text-muted-foreground" />
            <p className="text-muted-foreground">No recent matches available</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-2">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold mb-4 flex items-center">
          <Calendar className="mr-2 h-6 w-6" />
          Recent Match
        </h2>
        <Link
          href="/points-history"
          className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          View All
          <ChevronRight className="w-4 h-4 ml-1" />
        </Link>
      </div>
      <Card className="">
        <CardHeader className="pb-2">
          <div className="flex flex-row justify-between">
            <div className="flex flex-col">
              <CardTitle className="flex flex-row gap-4 ">
                <div className="text-xl ">
                  {recentMatch.homeTeamShortForm} vs{" "}
                  {recentMatch.awayTeamShortForm}
                </div>
                {recentMatch.hasMatchLive ? (
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                    <Badge className="bg-green-100 text-green-800">Live</Badge>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-red-500" />
                    <Badge className="bg-red-100 text-red-800">Completed</Badge>
                  </div>
                )}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {formatLocalDateTime(recentMatch.datetimeUtc ?? "")}
              </p>
            </div>
            <div className="p-2 flex justify-center items-center border rounded-sm shadow-sm bg-muted/30">
              <span className="text-primary font-bold">
                {recentMatch.matchPoints} pts
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="">
            <div>
              <h3 className="font-medium mb-3">Team Points</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-2 rounded-md bg-muted/30">
                  <div className="flex items-center gap-2">
                    <div>
                      <p className="font-medium">
                        {recentMatch.team?.teamName}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="font-bold">
                    {recentMatch.team?.teamPoints} pts
                  </Badge>
                </div>
              </div>
            </div>
            <div className="">
              <h3 className="font-medium mb-3">Player Points</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {recentMatch.players.map((player) => (
                  <div
                    key={player.playerId}
                    className="flex justify-between items-center p-2 rounded-md bg-muted/30"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`p-2 rounded-full ${
                          player.isCaptain
                            ? "text-yellow-600 bg-yellow-100"
                            : "text-gray-400 "
                        }`}
                      >
                        <Crown className="w-5 h-5" />
                      </div>

                      <div>
                        <p className="font-medium">{player.playerName}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="font-bold">
                      {player.playerPoints} pts
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
