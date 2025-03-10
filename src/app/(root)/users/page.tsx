"use client";

import { ChevronRight, Search, Trophy } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { LoadingScreen } from "@/components/common/loading-screen";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useQuery } from "convex/react";
import { debounce } from "lodash"; // Import lodash debounce
import { api } from "../../../../convex/_generated/api";

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Global Leaderboard (only fetch if no search query)
  const users = useQuery(api.userspoints.globalLeaderBoard);

  // Search Users (only runs when `debouncedQuery` is non-empty)
  const searchedUsers = useQuery(
    api.userspoints.searchUserWithPoints,
    debouncedQuery.length > 0 ? { searchTerm: debouncedQuery } : "skip"
  );

  // Debounce search input (wait 500ms before setting the query)
  useEffect(() => {
    const handler = debounce((query) => {
      setDebouncedQuery(query);
    }, 500);
    handler(searchQuery);

    return () => {
      handler.cancel();
    };
  }, [searchQuery]);

  // Determine which user list to show
  const displayedUsers =
    debouncedQuery.length > 0 ? (searchedUsers ?? []) : (users ?? []);

  if (users == undefined) {
    return <LoadingScreen />;
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <Breadcrumbs title="Fantasy League Users" isAdmin={false} backLink="/" />
      <div className="flex flex-col items-start mb-6 gap-4">
        <div>
          <p className="text-muted-foreground mt-1">
            Browse top fantasy players and their scores
          </p>
        </div>

        {/* Search Input */}
        <div className="w-full md:w-auto relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            className="pl-9 w-full md:w-[300px]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* User List */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Top Users</CardTitle>
          <CardDescription>
            Click on a user to view their detailed stats and match history
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {displayedUsers.length > 0 ? (
              displayedUsers.map((user) => (
                <Link
                  href={`/users/${user.userId}`}
                  key={user.userId}
                  className="block"
                >
                  <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-10 w-10 border">
                        <AvatarImage src={user.image} alt={user.name} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground hidden sm:block">
                          {user.email}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="bg-primary/10 flex items-center gap-1"
                      >
                        <Trophy className="h-3 w-3 text-amber-500" />
                        <span>{user.totalPoints.toLocaleString()} pts</span>
                      </Badge>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                {debouncedQuery.length > 0
                  ? `No users found matching "${debouncedQuery}"`
                  : "No users available"}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
