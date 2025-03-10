import { useQuery } from "convex/react";
import { Trophy } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Card, CardContent } from "../ui/card";

export const GlobalLeaderBoard = () => {
  const leaderboard = useQuery(api.userspoints.globalLeaderBoard);
  return (
    <div className="p-2">
      <h2 className="text-2xl font-bold mb-4 flex items-center">
        <Trophy className="mr-2 h-6 w-6" />
        Global Leaderboard
      </h2>
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-medium">Rank</th>
                  <th className="text-left p-4 font-medium">User</th>
                  <th className="text-left p-4 font-medium hidden md:table-cell">
                    Email
                  </th>
                  <th className="text-right p-4 font-medium">Points</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard?.map((user, index) => (
                  <tr
                    key={user.userId}
                    className={`border-b hover:bg-muted/50 ${user.isCurrentUser ? "bg-primary/10" : ""}`}
                  >
                    <td className="p-4 font-medium">#{index + 1}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span>{user.name}</span>
                      </div>
                    </td>
                    <td className="p-4 hidden md:table-cell text-muted-foreground">
                      {user.email}
                    </td>
                    <td className="p-4 text-right font-bold">
                      {user.totalPoints}
                    </td>
                  </tr>
                ))}
                {/* {user.globalRank > 10 && (
                  <>
                    <tr className="border-b">
                      <td
                        colSpan={4}
                        className="p-2 text-center text-muted-foreground"
                      >
                        <div className="flex justify-center">
                          <span>•••</span>
                        </div>
                      </td>
                    </tr>
                    <tr className="bg-primary/10">
                      <td className="p-4 font-medium">#{user.globalRank}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {user.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span>{user.name}</span>
                          <Badge variant="outline" className="ml-2">
                            You
                          </Badge>
                        </div>
                      </td>
                      <td className="p-4 hidden md:table-cell text-muted-foreground">
                        {user.email}
                      </td>
                      <td className="p-4 text-right font-bold">
                        {user.totalPoints}
                      </td>
                    </tr>
                  </>
                )} */}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
