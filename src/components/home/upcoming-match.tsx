import { formatLocalDate } from "@/lib/utils";
import { useQuery } from "convex/react";
import { AlertCircle, CalendarClock, ChevronRight, Loader } from "lucide-react";
import Link from "next/link";
import { api } from "../../../convex/_generated/api";
import { UpcomingMatchCard } from "../matches/match-cards";
import { Card, CardContent } from "../ui/card";

export const UpcomingMatchForHome = () => {
  const upcomingMatch = useQuery(api.matches.upcomingMatchesForHome);
  console.log("up", upcomingMatch);
  if (upcomingMatch == undefined) {
    return (
      <div>
        <Loader />
      </div>
    );
  }
  return (
    <section className="p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold mb-4 flex items-center">
          <CalendarClock className="mr-2 h-6 w-6" />
          Upcoming Matches
        </h2>
        <Link
          href="/matches"
          className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          View All
          <ChevronRight className="w-4 h-4 ml-1" />
        </Link>
      </div>

      {upcomingMatch.length === 0 ? (
        <div className="w-full flex justify-center items-center">
          <Card className="w-full mb-8">
            <CardContent className="flex flex-col justify-center items-center p-6 gap-2">
              <AlertCircle className="h-8 w-8 text-muted-foreground" />
              <p className="text-muted-foreground">
                No upcoming matches available
              </p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-4 mb-4">
            <div className="h-px bg-gray-200 flex-grow" />
            <h2 className="text-lg font-semibold text-gray-600 whitespace-nowrap px-4">
              {formatLocalDate(upcomingMatch[0].datetimeUtc)}
            </h2>
            <div className="h-px bg-gray-200 flex-grow" />
          </div>

          <div className="flex flex-row justify-center gap-2">
            {upcomingMatch.map((match) => (
              <Link
                key={match._id}
                href={`/matches/${match._id}`}
                className="w-full flex justify-center"
              >
                <UpcomingMatchCard key={match._id} match={match} />
              </Link>
            ))}
          </div>
        </>
      )}
    </section>
  );
};
