import { useQuery } from "convex/react";
import { AlertTriangle, ChevronRight, Loader, Trophy } from "lucide-react";
import Link from "next/link";
import { api } from "../../../convex/_generated/api";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Card, CardContent } from "../ui/card";

export const GlobalLeaderBoard = () => {
  const leaderboard = useQuery(api.userspoints.globalLeaderBoard);

  if (leaderboard == undefined) {
    return (
      <div className="flex justify-center items-center">
        <Loader className="animate-spin" />
      </div>
    );
  }

  // Extract top 10 users
  const top10Users = leaderboard.usertable.slice(0, 10);
  const currentUser = leaderboard.usertable.find((user) => user.isCurrentUser);

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

      {top10Users.length == 0 ? (
        <Card className="w-full max-w-[900px] mx-auto mb-6 p-4 flex flex-col items-center text-center">
          <AlertTriangle className="h-8 w-8 text-red-500 mb-2" />
          <span className="text-lg font-semibold">
            No Recent Match Available
          </span>
          <span className="text-sm text-gray-500">
            Stay tuned, we will update shortly!
          </span>
        </Card>
      ) : (
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
                  {top10Users.map((user) => (
                    <tr
                      key={user.userId}
                      className={`border-b hover:bg-muted/50 ${
                        user.isCurrentUser ? "bg-primary/10" : ""
                      }`}
                    >
                      <td className="p-4 font-medium text-sm">#{user.rank}</td>
                      <td className="p-4">
                        <Link
                          href={`/users/${user.userId}`}
                          className="flex items-center gap-3"
                        >
                          <Avatar className="h-8 w-8 shrink-0">
                            <AvatarImage src={user.image} alt={user.name} />
                            <AvatarFallback className="text-xs">
                              {user.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-bold text-sm truncate max-w-[150px] md:max-w-[200px]">
                              {user.name}
                            </span>
                            <span className="text-xs text-muted-foreground truncate max-w-[150px] md:max-w-[200px]">
                              {user.email}
                            </span>
                          </div>
                        </Link>
                      </td>
                      <td className="p-4 text-right font-bold text-sm">
                        {user.totalPoints.toLocaleString()}
                      </td>
                    </tr>
                  ))}

                  {/* Show Gap If Current User is Outside Top 10 */}
                  {currentUser && currentUser.rank > 10 && (
                    <>
                      <tr key="gap" className="border-b">
                        <td colSpan={3} className="p-2 text-center">
                          <span className="text-xs text-muted-foreground">
                            •••
                          </span>
                        </td>
                      </tr>
                      <tr
                        key={currentUser.userId}
                        className="border-b hover:bg-muted/50 bg-primary/10"
                      >
                        <td className="p-4 font-medium text-sm">
                          #{currentUser.rank}
                        </td>
                        <td className="p-4">
                          <span className="font-bold text-sm">
                            {currentUser.name}
                          </span>
                        </td>
                        <td className="p-4 text-right font-bold text-sm">
                          {currentUser.totalPoints.toLocaleString()}
                        </td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GlobalLeaderBoard;
