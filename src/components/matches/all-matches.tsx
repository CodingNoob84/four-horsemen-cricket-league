"use client";
import { MatchesgrpByDate } from "@/lib/utils";
import { useQuery } from "convex/react";
import Link from "next/link";
import { api } from "../../../convex/_generated/api";
import { LoadingScreen } from "../common/loading-screen";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { PastMatchCard, UpcomingMatchCard } from "./match-cards";

export const AllMatches = () => {
  const upcomingMatches = useQuery(api.matches.upcomingMatchesByUser);
  const pastMatches = useQuery(api.matches.PastMatchesByUser);
  console.log("past", pastMatches);
  const grpUpcomingMatches = upcomingMatches
    ? MatchesgrpByDate(upcomingMatches)
    : [];
  const grpPastMatches = pastMatches ? MatchesgrpByDate(pastMatches) : [];
  // Handling loading states
  if (upcomingMatches === undefined || pastMatches === undefined) {
    return <LoadingScreen />;
  }

  return (
    <Tabs defaultValue="upcoming" className="mb-6">
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="upcoming">Upcoming Matches</TabsTrigger>
        <TabsTrigger value="past">Past Matches</TabsTrigger>
      </TabsList>
      <TabsContent value="upcoming">
        {" "}
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
                  <Link href={`/matches/${match._id}`} key={match._id}>
                    <UpcomingMatchCard key={match._id} match={match} />
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </TabsContent>
      <TabsContent value="past">
        <div className="space-y-8">
          {grpPastMatches.map((dateGroup) => (
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
                  <PastMatchCard key={match._id} match={match} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </TabsContent>
    </Tabs>
  );
};
