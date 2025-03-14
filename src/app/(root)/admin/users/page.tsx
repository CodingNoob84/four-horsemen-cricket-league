"use client";

import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCreationTime } from "@/lib/utils";
import { useQuery } from "convex/react";
import { CheckCircle2, XCircle } from "lucide-react";
import { api } from "../../../../../convex/_generated/api";

export default function UsersPage() {
  const allUsers = useQuery(api.users.getAllUsers);

  if (!allUsers) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-500">Loading users...</p>
      </div>
    );
  }

  // Filter users based on setup status
  const completedUsers = allUsers.filter((user) => user.isAutoSetupDone);
  const incompleteUsers = allUsers.filter((user) => !user.isAutoSetupDone);

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <Breadcrumbs title="All Users" isAdmin={true} backLink="/admin" />
      </div>

      <Tabs defaultValue="completed" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="completed" className="flex items-center">
            <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
            Setup Completed
            <Badge variant="secondary" className="ml-2">
              {completedUsers.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="incomplete" className="flex items-center">
            <XCircle className="mr-2 h-4 w-4 text-red-500" />
            Setup Incomplete
            <Badge variant="secondary" className="ml-2">
              {incompleteUsers.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {/* Completed Users Tab */}
        <TabsContent value="completed">
          <Card>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 font-medium">User</th>
                      <th className="text-left p-4 font-medium hidden md:table-cell">
                        Joined
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {completedUsers.length > 0 ? (
                      completedUsers.map((user) => (
                        <tr
                          key={user._id}
                          className="border-b hover:bg-muted/50"
                        >
                          <td className="p-4 flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={user.image} alt={user.name} />
                              <AvatarFallback>
                                {user.name?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <span className="font-medium">{user.name}</span>
                              <span> {user.email}</span>
                            </div>
                          </td>
                          <td className="p-4 hidden md:table-cell">
                            {formatCreationTime(user._creationTime)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={3}
                          className="p-4 text-center text-gray-500"
                        >
                          No users found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Incomplete Users Tab */}
        <TabsContent value="incomplete">
          <Card>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 font-medium">User</th>
                      <th className="text-left p-4 font-medium hidden md:table-cell">
                        Joined
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {incompleteUsers.length > 0 ? (
                      incompleteUsers.map((user) => (
                        <tr
                          key={user._id}
                          className="border-b hover:bg-muted/50"
                        >
                          <td className="p-4 flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={user.image} alt={user.name} />
                              <AvatarFallback>
                                {user.name?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <span className="font-medium">{user.name}</span>
                              <span> {user.email}</span>
                            </div>
                          </td>
                          <td className="p-4 hidden md:table-cell">
                            {user._creationTime}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={4}
                          className="p-4 text-center text-gray-500"
                        >
                          No users found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
