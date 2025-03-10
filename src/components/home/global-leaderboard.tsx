import { useQuery } from "convex/react";
import { ChevronRight, Trophy } from "lucide-react";
import Link from "next/link";
import { api } from "../../../convex/_generated/api";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Card, CardContent } from "../ui/card";

export const GlobalLeaderBoard = () => {
  const leaderboard = useQuery(api.userspoints.globalLeaderBoard);
  return (
    <div className="p-2">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold mb-4 flex items-center">
          <Trophy className="mr-2 h-6 w-6" />
          Global Leaderboard
        </h2>
        <Link
          href="/users"
          className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          View All
          <ChevronRight className="w-4 h-4 ml-1" />
        </Link>
      </div>

      <Card className="w-full max-w-[900px] mx-auto">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-medium">Rank</th>
                  <th className="text-left p-4 font-medium">User</th>
                  <th className="text-right p-4 font-medium">Points</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard?.map((user, index) => (
                  <tr
                    key={user.userId}
                    className={`border-b hover:bg-muted/50 ${user.isCurrentUser ? "bg-primary/10" : ""}`}
                  >
                    <td className="p-4 font-medium text-sm">#{index + 1}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarFallback className="text-xs">
                            {user.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>

                        {/* User Details */}
                        <div className="flex flex-col">
                          <span className="font-bold text-sm truncate max-w-[150px] md:max-w-[200px]">
                            {user.name}
                          </span>
                          <span className="text-xs text-muted-foreground truncate max-w-[150px] md:max-w-[200px]">
                            {user.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Points */}
                    <td className="p-4 text-right font-bold text-sm">
                      {user.totalPoints.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
