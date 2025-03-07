import { usePastMatches, useUpcomingMatches } from "@/hooks/convex-hooks";
import { MatchesgrpByDate } from "@/lib/utils";
import { UpcomingMatchByUser } from "@/types";
import { MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { LoadingScreen } from "../common/loading-screen";
import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";

export const UpcomingMatches = () => {
  const { matches, loading } = useUpcomingMatches();
  if (loading) {
    return <LoadingScreen />;
  }
  const groupedMatches = matches ? MatchesgrpByDate(matches) : [];

  return (
    <div className="space-y-8">
      {groupedMatches.map((dateGroup) => (
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
              <Link href={`/admin/matches/${match._id}`} key={match._id}>
                <UpcomingMatchCard match={match} />
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export const UpcomingMatchCard = ({
  match,
}: {
  match: UpcomingMatchByUser;
}) => {
  return (
    <Card className="w-full max-w-md overflow-hidden border-2 rounded-xl shadow-md">
      <CardContent className="p-5">
        {/* Header with City and Time */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="w-4 h-4 mr-1" />
            {match.venue}
          </div>

          <div className="text-sm font-medium text-gray-600">{match.time}</div>
        </div>

        {/* Teams and VS */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col items-center space-y-2 w-2/5">
            <Image
              src={match.homeTeam.image || "/placeholder.svg"}
              alt={match.homeTeam.shortForm}
              width={70}
              height={70}
              className=" p-1"
            />
            <span className="text-xs font-medium text-center">
              {match.homeTeam.teamName}
            </span>
          </div>
          <div className="flex flex-col items-center space-y-3">
            <div className="text-xl font-bold text-gray-700">VS</div>
          </div>
          <div className="flex flex-col items-center space-y-2 w-2/5">
            <Image
              src={match.awayTeam.image || "/placeholder.svg"}
              alt={match.awayTeam.shortForm}
              width={70}
              height={70}
              className="p-1"
            />
            <span className="text-xs font-medium text-center">
              {match.awayTeam.teamName}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const PastMatches = () => {
  const { matches, loading } = usePastMatches();
  console.log("past", matches);
  if (loading) {
    return <LoadingScreen />;
  }
  const groupedMatches = matches ? MatchesgrpByDate(matches) : [];

  return (
    <div className="space-y-8">
      {groupedMatches.map((dateGroup) => (
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
              <Link href={`/admin/matches/${match._id}`} key={match._id}>
                <PastMatchCard match={match} />
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export const PastMatchCard = ({ match }: { match: UpcomingMatchByUser }) => {
  return (
    <Card className="w-full max-w-md overflow-hidden border-2 rounded-xl shadow-md">
      <CardContent className="p-5">
        {/* Header with City and Time */}
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="w-4 h-4 mr-1" />
            {match.venue}
          </div>

          <div className="text-sm font-medium text-gray-600">{match.time}</div>
        </div>

        <div className="flex justify-center items-center">
          <Badge
            className={`${
              match.hasSubmitted
                ? "bg-green-100 text-green-800 border border-green-300"
                : "bg-orange-100 text-orange-800 border border-orange-300"
            } rounded-full px-3 py-1 text-xs`}
          >
            {match.hasSubmitted ? "Submitted" : "Yet to submit"}
          </Badge>
        </div>

        {/* Teams and VS */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col items-center space-y-2 w-2/5">
            <Image
              src={match.homeTeam.image || "/placeholder.svg"}
              alt={match.homeTeam.shortForm}
              width={70}
              height={70}
              className=" p-1"
            />
            <span className="text-xs font-medium text-center">
              {match.homeTeam.teamName}
            </span>
          </div>
          <div className="flex flex-col items-center space-y-3">
            <div className="text-xl font-bold text-gray-700">VS</div>
          </div>
          <div className="flex flex-col items-center space-y-2 w-2/5">
            <Image
              src={match.awayTeam.image || "/placeholder.svg"}
              alt={match.awayTeam.shortForm}
              width={70}
              height={70}
              className="p-1"
            />
            <span className="text-xs font-medium text-center">
              {match.awayTeam.teamName}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
