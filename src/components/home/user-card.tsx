import { Avatar } from "@radix-ui/react-avatar";
import { useQuery } from "convex/react";
import { Loader, Mail, Trophy } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { AvatarFallback, AvatarImage } from "../ui/avatar";

export const UserCard = () => {
  const user = useQuery(api.users.userwithTotalPoints);

  if (user == undefined) {
    return (
      <div className="w-full max-w-md shadow-lg border rounded-md p-4">
        <Loader className="animate-spin" />
      </div>
    );
  }
  return (
    <div className="mb-8 p-2">
      {user && (
        <div className="w-full max-w-xl shadow-lg border rounded-lg p-4">
          <div className="flex flex-col sm:flex-row justify-between gap-2">
            <div className="flex flex-row gap-2">
              <Avatar className="h-16 w-16 rounded-full">
                <AvatarImage
                  className="rounded-full"
                  src={user.image}
                  alt={user?.name}
                />
                <AvatarFallback>{user.name?.charAt(0) ?? "U"}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <h1 className="text-2xl font-bold">{user.name}</h1>
                <div className="flex items-center justify-center md:justify-start mt-1 text-muted-foreground">
                  <Mail className="h-4 w-4 mr-1" />
                  <span>{user.email}</span>
                </div>
              </div>
            </div>

            <div className="border rounded-md bg-primary/5 flex flex-col gap-2 p-2">
              <p className="text-sm font-medium">Total Points</p>

              <div className="flex flex-row items-center gap-2">
                <Trophy className="h-6 w-6 text-primary" />
                <p className="text-2xl font-bold">
                  {user.totalOverallPoints ?? 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
