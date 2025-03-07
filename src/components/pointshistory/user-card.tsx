import { User } from "@/types";
import { Mail, Trophy } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export const UserCardWithPoints = ({
  user,
  totalPoints,
}: {
  user: User;
  totalPoints: number;
}) => {
  return (
    <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
      <Avatar className="w-24 h-24 border-4 border-primary">
        <AvatarImage src={user.image} alt={user.name} />
        <AvatarFallback className="text-2xl">
          {user.name
            .split(" ")
            .map((n) => n[0])
            .join("")}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col items-center md:items-start">
        <h1 className="text-3xl font-bold">{user.name}</h1>
        <div className="flex items-center gap-2 text-muted-foreground mt-1">
          <Mail className="w-4 h-4" />
          <span>{user.email}</span>
        </div>
        <div className="flex items-center gap-2 mt-4">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <span className="text-xl font-semibold">
            {totalPoints} Total Points
          </span>
        </div>
      </div>
    </div>
  );
};
