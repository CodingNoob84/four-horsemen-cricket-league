import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatLocalDateTime } from "@/lib/utils";
import { useQuery } from "convex/react";
import {
  AlertTriangle,
  Calendar,
  ChevronRight,
  Loader,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import { api } from "../../../convex/_generated/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

export const MatchLeaderboard = () => {
  const match = useQuery(api.userspoints.recentMatchLeaderboard);
  const players = useQuery(api.userspoints.recentMatchPlayerLeaderboard);
  console.log("players", players);

  if (match == undefined) {
    return (
      <div className="flex justify-center items-center">
        <Loader className="animate-spin" />
      </div>
    );
  }

  // Extract top 10 users
  const top10Users = match.usertable.slice(0, 10);
  const currentUser = match.usertable.find((user) => user.isCurrentUser);
  const top10Players = players?.usertable;

  return (
    <>
      {match && (
        <div className="p-2">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <Trophy className="mr-2 h-6 w-6" />
              Match Leaderboard
            </h2>
            <Link
              href="/users"
              className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              View All
              <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          {/* Case: No match available */}
          {match.matchId == null ? (
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
            <Card className="w-full max-w-[900px] mx-auto mb-6">
              <CardHeader className="pb-2">
                <div className="flex flex-row justify-between">
                  <div className="flex items-center space-x-4">
                    <Badge>{match.match}</Badge>
                  </div>
                  <div className="flex items-center mt-2 md:mt-0 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{formatLocalDateTime(match.datetimeUtc)}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Tabs defaultValue="users" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="users">Users</TabsTrigger>
                    <TabsTrigger value="players">Players</TabsTrigger>
                  </TabsList>
                  <TabsContent value="users">
                    <div className="overflow-x-auto">
                      {/* Case: No users in leaderboard */}
                      {top10Users.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-6">
                          <AlertTriangle className="h-8 w-8 text-yellow-600 mb-2" />
                          <span className="text-lg font-semibold">
                            Points are yet to Update
                          </span>
                          <span className="text-sm text-gray-500 text-center">
                            We are currently updating the leaderboard. Please
                            check back soon for the latest player points.
                          </span>
                        </div>
                      ) : (
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left p-4 font-medium">
                                Rank
                              </th>
                              <th className="text-left p-4 font-medium">
                                User
                              </th>
                              <th className="text-right p-4 font-medium">
                                Points
                              </th>
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
                                <td className="p-4 font-medium text-sm">
                                  #{user.rank}
                                </td>
                                <td className="p-4">
                                  <Link
                                    href={`/users/${user.userId}`}
                                    className="flex items-center gap-3"
                                  >
                                    <Avatar className="h-8 w-8 shrink-0">
                                      <AvatarImage
                                        src={user.image}
                                        alt={user.name}
                                      />
                                      <AvatarFallback className="text-xs">
                                        {user.name.charAt(0)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col">
                                      <span className="font-bold text-sm truncate max-w-[150px] md:max-w-[200px]">
                                        {user.name}
                                        {user.isCurrentUser && (
                                          <Badge
                                            variant="outline"
                                            className="ml-2 text-xs"
                                          >
                                            You
                                          </Badge>
                                        )}
                                      </span>
                                      <span className="text-xs text-muted-foreground truncate max-w-[150px] md:max-w-[200px]">
                                        {user.email}
                                      </span>
                                    </div>
                                  </Link>
                                </td>
                                <td className="p-4 text-right font-bold text-sm">
                                  {user.matchPoints.toLocaleString()}
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
                                    <div className="flex items-center gap-3">
                                      <Avatar className="h-8 w-8 shrink-0">
                                        <AvatarImage
                                          src={currentUser.image}
                                          alt={currentUser.name}
                                        />
                                        <AvatarFallback className="text-xs">
                                          {currentUser.name.charAt(0)}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div className="flex flex-col">
                                        <span className="font-bold text-sm truncate max-w-[150px] md:max-w-[200px]">
                                          {currentUser.name}
                                          <Badge
                                            variant="outline"
                                            className="ml-2 text-xs"
                                          >
                                            You
                                          </Badge>
                                        </span>
                                        <span className="text-xs text-muted-foreground truncate max-w-[150px] md:max-w-[200px]">
                                          {currentUser.email}
                                        </span>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="p-4 text-right font-bold text-sm">
                                    {currentUser.matchPoints.toLocaleString()}
                                  </td>
                                </tr>
                              </>
                            )}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </TabsContent>
                  <TabsContent value="players">
                    <div className="overflow-x-auto">
                      {/* Case: No users in leaderboard */}
                      {top10Players && top10Players.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-6">
                          <AlertTriangle className="h-8 w-8 text-yellow-600 mb-2" />
                          <span className="text-lg font-semibold">
                            Points are yet to Update
                          </span>
                          <span className="text-sm text-gray-500 text-center">
                            We are currently updating the leaderboard. Please
                            check back soon for the latest player points.
                          </span>
                        </div>
                      ) : (
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left p-4 font-medium">
                                Rank
                              </th>
                              <th className="text-left p-4 font-medium">
                                User
                              </th>
                              <th className="text-right p-4 font-medium">
                                Points
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {top10Players &&
                              top10Players.map((user) => (
                                <tr
                                  key={user.userId}
                                  className={`border-b hover:bg-muted/50 `}
                                >
                                  <td className="p-4 font-medium text-sm">
                                    #{user.rank}
                                  </td>
                                  <td className="p-4">
                                    <Link
                                      href={`/players/${user.userId}`}
                                      className="flex items-center gap-3"
                                    >
                                      <Avatar className="h-8 w-8 shrink-0">
                                        <AvatarImage
                                          src={user.image}
                                          alt={user.name}
                                        />
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
                                    {user.matchPoints.toLocaleString()}
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </>
  );
};

export default MatchLeaderboard;
