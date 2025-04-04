"use client";
import { getInitials, getTeamColor } from "@/lib/utils";
import { useQuery } from "convex/react";
import { Coins, Users } from "lucide-react";
import { useParams } from "next/navigation";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { LoadingScreen } from "../common/loading-screen";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { TeamStats } from "./team-stats";

type Bet = {
  teamName: string | undefined;
  userName: string | undefined;
  userImage: string | undefined;
  isCurrentUser: boolean;
  _id: Id<"bettingMatch">;
  _creationTime: number;
  userId: Id<"users">;
  matchId: Id<"matches">;
  team: Id<"teams">;
  bet: number;
  earning: number;
};

const processBets = (bets: Bet[] | undefined) => {
  if (!bets) {
    return []; // If `bets` is undefined, return an empty array
  }
  return bets.reduce(
    (acc, bet) => {
      // Find if the team already exists in the accumulator
      let team = acc.find((t) => t.teamId === bet.team);

      // If the team doesn't exist, create a new one
      if (!team) {
        team = {
          teamId: bet.team, // Correct teamId
          teamName: bet.teamName,
          count: 0,
          totalAmount: 0,
        };
        acc.push(team);
      }

      // Increment the count and totalAmount for the team
      team.count += 1;
      team.totalAmount += bet.bet;

      return acc;
    },
    [] as {
      teamId: Id<"teams">;
      teamName: string | undefined;
      count: number;
      totalAmount: number;
    }[]
  ); // Type the accumulator correctly
};

export const PeopleList = () => {
  const { matchId } = useParams();
  const users = useQuery(api.betting.getBetsByMatchId, {
    matchId: matchId as Id<"matches">,
  });

  if (users == undefined) {
    return <LoadingScreen />;
  }
  const userBets = users.bets;
  const betStats = processBets(userBets);

  return (
    <div className="w-full  mx-auto flex flex-col gap-4">
      {betStats.length > 0 && <TeamStats teamStats={betStats} />}

      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Users size={18} /> Participants
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {users.bets?.map((person, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-3 hover:bg-slate-50"
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {getInitials(person.userName || "U")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col ">
                    <span className="font-medium">{person.userName}</span>
                    <span className="text-xs">{person.userEmail}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    className={`font-normal ${getTeamColor(person.teamName || "")}`}
                  >
                    {person.teamName}
                  </Badge>
                  <div className="flex items-center text-slate-700">
                    <Coins className="h-4 w-4 mr-1" />
                    <span className="font-medium">{person.bet}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
