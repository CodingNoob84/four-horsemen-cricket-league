import { useQuery } from "convex/react";
import { ChevronRight, Loader, Users } from "lucide-react";
import Link from "next/link";
import { api } from "../../../convex/_generated/api";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";

export const MyGroups = () => {
  const groups = useQuery(api.groups.getUserGroups);
  console.log("groups", groups);

  if (groups === undefined) {
    return (
      <div className="p-2">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <Users className="mr-2 h-6 w-6" />
            My Groups
          </h2>
          <Link
            href="/groups"
            className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            View All
            <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
        <Card className="mb-8">
          <CardContent className="flex justify-center items-center p-6">
            <Loader className="animate-spin" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-2">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold mb-4 flex items-center">
          <Users className="mr-2 h-6 w-6" />
          My Groups
        </h2>
        <Link
          href="/groups"
          className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          View All
          <ChevronRight className="w-4 h-4 ml-1" />
        </Link>
      </div>

      {groups.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 mb-8">
          {groups.slice(0, 2).map((group) => (
            <Card key={group._id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col">
                  <h3 className="font-bold text-lg mb-2">{group.name}</h3>
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center text-muted-foreground">
                      <Users className="h-4 w-4 mr-1" />
                      <span>{group.userCount} members</span>
                    </div>
                  </div>
                </div>

                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/groups/${group._id}`}>View Group</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="mb-8">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground mb-4">
              You haven&apos;t joined any groups yet. Add friends, family, or
              colleagues to compete in fantasy leagues.
            </p>
            <Link
              href="/groups"
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 rounded-md border border-transparent hover:bg-blue-50 transition-colors"
            >
              <Users className="h-4 w-4 mr-2" />
              Explore Groups
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
