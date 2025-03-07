import { formatLocalDateTime } from "@/lib/utils";
import { Team } from "@/types";
import { MapPin } from "lucide-react";
import Image from "next/image";
import { Id } from "../../../convex/_generated/dataModel";
import { Card, CardContent } from "../ui/card";

interface matchDetailTypes {
  _id: Id<"matches">;
  _creationTime: number;
  datetimeUtc: string;
  venue: string;
  homeTeam: Team | null;
  awayTeam: Team | null;
}

export const MatchDetailCard = ({
  matchDetail,
}: {
  matchDetail: matchDetailTypes;
}) => {
  return (
    <Card className="overflow-hidden border-2 rounded-xl mb-2">
      <CardContent className="mt-4 pb-0">
        <div className="flex justify-between items-center">
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="w-4 h-4 mr-1" />
            {matchDetail.venue}
          </div>
          <div className="text-sm font-medium text-gray-600">
            {formatLocalDateTime(matchDetail.datetimeUtc)}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex flex-row items-center w-2/5">
            <Image
              src={matchDetail.homeTeam?.image || "/placeholder.svg"}
              alt={matchDetail.homeTeam?.shortForm || "Home Team"}
              width={50}
              height={50}
              className=" p-1"
            />
            <span className="text-sm font-medium text-center">
              {matchDetail.homeTeam?.shortForm}
            </span>
          </div>
          <div className="text-xl font-bold text-gray-700">VS</div>
          <div className="flex flex-row-reverse items-center w-2/5">
            <Image
              src={matchDetail.awayTeam?.image || "/placeholder.svg"}
              alt={matchDetail.awayTeam?.shortForm || "Away Team"}
              width={50}
              height={50}
              className=" p-1"
            />
            <span className="text-sm font-medium text-center">
              {matchDetail.awayTeam?.shortForm}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
