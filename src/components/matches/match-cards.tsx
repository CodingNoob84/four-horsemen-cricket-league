import { formatLocalTime } from "@/lib/utils";
import { UpcomingMatchByUser } from "@/types";
import { History, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";

export const UpcomingMatchCard = ({
  match,
}: {
  match: UpcomingMatchByUser;
}) => {
  return (
    <Card className="w-full max-w-md overflow-hidden border-2 rounded-xl shadow-md">
      <CardContent className="flex flex-col gap-2 p-5">
        {/* Header with City and Time */}
        <div className="flex justify-end md:justify-between items-center ">
          <div className="hidden md:flex items-center text-sm text-gray-600">
            <MapPin className="w-4 h-4 mr-1" />
            {match.venue}
          </div>

          <div className="text-sm font-medium text-gray-600">
            {match.time ? match.time : formatLocalTime(match.datetimeUtc)}
          </div>
        </div>
        <div className="flex justify-center items-center">
          <Badge
            className={`${
              match.submittedStatus
                ? "bg-green-100 text-green-800 border border-green-300"
                : "bg-orange-100 text-orange-800 border border-orange-300"
            } rounded-full px-3 py-1 text-xs`}
          >
            {match.submittedStatus ? "Submitted" : "Yet to submit"}
          </Badge>
        </div>

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
              {/* Show full team name on larger screens */}
              <span className="hidden md:inline">
                {match.homeTeam.teamName}
              </span>
              {/* Show short form on mobile */}
              <span className="md:hidden">{match.homeTeam.shortForm}</span>
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
              {/* Show full team name on larger screens */}
              <span className="hidden md:inline">
                {match.awayTeam.teamName}
              </span>
              {/* Show short form on mobile */}
              <span className="md:hidden">{match.awayTeam.shortForm}</span>
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const PastMatchCard = ({ match }: { match: UpcomingMatchByUser }) => {
  return (
    <Card className="w-full max-w-md overflow-hidden border-2 rounded-xl shadow-md">
      <CardContent className="p-5">
        {/* Header with City */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="w-4 h-4 mr-1" />
            {match.venue}
          </div>
          <div className="text-sm font-medium text-gray-600">{match.time}</div>
        </div>

        {/* Teams and Scores */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex flex-col items-center space-y-2 w-2/5">
            <Image
              src={match.homeTeam.image || "/placeholder.svg"}
              alt={match.homeTeam.shortForm}
              width={70}
              height={70}
              className="rounded-full border-2 border-gray-100 p-1"
            />
            <div className="flex flex-col items-center">
              <span className="text-xs font-medium text-center">
                {/* Show full team name on larger screens */}
                <span className="hidden md:inline">
                  {match.homeTeam.teamName}
                </span>
                {/* Show short form on mobile */}
                <span className="md:hidden">{match.homeTeam.shortForm}</span>
              </span>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-xl font-bold text-gray-700">VS</div>
          </div>
          <div className="flex flex-col items-center space-y-2 w-2/5">
            <Image
              src={match.awayTeam.image || "/placeholder.svg"}
              alt={match.awayTeam.shortForm}
              width={70}
              height={70}
              className="rounded-full border-2 border-gray-100 p-1"
            />
            <span className="text-xs font-medium text-center">
              {/* Show full team name on larger screens */}
              <span className="hidden md:inline">
                {match.awayTeam.teamName}
              </span>
              {/* Show short form on mobile */}
              <span className="md:hidden">{match.awayTeam.shortForm}</span>
            </span>
          </div>
        </div>

        {/* Match Result */}
        <div className="text-xs text-center text-gray-600 mb-4">
          {match.winner == match.homeTeam._id
            ? `${match.homeTeam.shortForm} have won the game`
            : `${match.awayTeam.shortForm} have won the game`}
        </div>

        {/* Points Earned */}
        <div className="border-t pt-3 flex justify-between items-center">
          <div className="text-sm font-medium text-blue-700">
            You scored {match.matchPoints} points
          </div>
          <Link
            href="/points-history"
            className="flex items-center text-xs text-gray-600 hover:text-blue-700"
          >
            <History className="w-4 h-4 mr-1" />
            View Points History
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};
