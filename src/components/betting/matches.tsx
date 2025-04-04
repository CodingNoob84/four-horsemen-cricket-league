"use client";
import { MatchesgrpByDate } from "@/lib/utils";
import { useQuery } from "convex/react";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { api } from "../../../convex/_generated/api";
import { LoadingScreen } from "../common/loading-screen";
import { UpcomingMatchCard } from "../matches/match-cards";
import { Card, CardContent } from "../ui/card";

export const AllMatches = () => {
  const upcomingMatches = useQuery(api.matches.upcomingMatchesByUser);
  const grpUpcomingMatches = upcomingMatches
    ? MatchesgrpByDate(upcomingMatches)
    : [];
  // Handling loading states
  if (upcomingMatches === undefined) {
    return <LoadingScreen />;
  }

  return (
    <div>
      {grpUpcomingMatches.length > 0 ? (
        <div className="space-y-8">
          {grpUpcomingMatches.map((dateGroup) => (
            <div key={dateGroup.date}>
              <div className="flex items-center gap-4 mb-4">
                <div className="h-px bg-gray-200 flex-grow" />
                <h2 className="text-lg font-semibold text-gray-600 whitespace-nowrap px-4">
                  {dateGroup.date}
                </h2>
                <div className="h-px bg-gray-200 flex-grow" />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
                {dateGroup.matches.map((match) => (
                  <Link href={`/betting/${match._id}`} key={match._id}>
                    <UpcomingMatchCard key={match._id} match={match} />
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Card className="mb-8">
          <CardContent className="flex flex-col justify-center items-center p-6 gap-2">
            <AlertCircle className="h-8 w-8 text-muted-foreground" />
            <p className="text-muted-foreground">
              No upcoming matches available
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
