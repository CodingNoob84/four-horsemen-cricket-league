import { getTeamColor } from "@/lib/utils";
import { Coins, Users } from "lucide-react";
import { Id } from "../../../convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export type TeamStatsTpye = {
  teamId: Id<"teams">;
  teamName: string | undefined;
  count: number;
  totalAmount: number;
};

export const TeamStats = ({ teamStats }: { teamStats: TeamStatsTpye[] }) => {
  // Calculate percentages for the stats bar
  const totalUsers = teamStats.reduce((total, team) => total + team.count, 0);
  const totalCoinsPlaced = teamStats.reduce(
    (total, team) => total + team.totalAmount,
    0
  );

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Users size={18} /> Team Statistics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Users distribution */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            {teamStats.map((team) => (
              <div key={team.teamId} className="flex items-center gap-1">
                <Users size={16} className={``} />
                <span className={`font-medium `}>
                  {team.teamName}: {team.count} bets
                </span>
              </div>
            ))}
          </div>
          <div className="rounded-lg overflow-hidden border h-8">
            <div className="flex items-center h-full">
              {teamStats.map((team) => {
                const teamUserPercentage = (team.count / totalUsers) * 100;
                return (
                  <div
                    key={team.teamId}
                    className={`h-full flex items-center justify-center text-white font-medium px-3 ${getTeamColor(team.teamName || "")}`}
                    style={{ width: `${teamUserPercentage}%` }}
                  >
                    <span className="text-xs">
                      {Math.round(teamUserPercentage)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Coins distribution */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            {teamStats.map((team) => (
              <div key={team.teamId} className="flex items-center gap-1">
                <Coins size={16} className={``} />
                <span className={`font-medium `}>
                  {team.teamName}: {team.totalAmount} coins
                </span>
              </div>
            ))}
          </div>
          <div className="rounded-lg overflow-hidden border h-8">
            <div className="flex items-center h-full">
              {teamStats.map((team) => {
                const teamCoinsPercentage =
                  (team.totalAmount / totalCoinsPlaced) * 100;
                return (
                  <div
                    key={team.teamId}
                    className={`h-full flex items-center justify-center text-white font-medium px-3 ${getTeamColor(team.teamName || "")}`}
                    style={{ width: `${teamCoinsPercentage}%` }}
                  >
                    <span className="text-xs">
                      {Math.round(teamCoinsPercentage)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
