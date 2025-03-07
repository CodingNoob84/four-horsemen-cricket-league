import { ChevronRight, Trophy } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
const leaderboard = [
  {
    id: 1,
    name: "Virat Kohli",
    avatar: "/placeholder.svg?height=40&width=40",
    points: 1250,
  },
  {
    id: 2,
    name: "Rohit Sharma",
    avatar: "/placeholder.svg?height=40&width=40",
    points: 1180,
  },
  {
    id: 3,
    name: "MS Dhoni",
    avatar: "/placeholder.svg?height=40&width=40",
    points: 1120,
  },
  {
    id: 4,
    name: "KL Rahul",
    avatar: "/placeholder.svg?height=40&width=40",
    points: 1050,
  },
  {
    id: 5,
    name: "Hardik Pandya",
    avatar: "/placeholder.svg?height=40&width=40",
    points: 980,
  },
  {
    id: 6,
    name: "Jasprit Bumrah",
    avatar: "/placeholder.svg?height=40&width=40",
    points: 920,
  },
  {
    id: 7,
    name: "Ravindra Jadeja",
    avatar: "/placeholder.svg?height=40&width=40",
    points: 890,
  },
  {
    id: 8,
    name: "Rishabh Pant",
    avatar: "/placeholder.svg?height=40&width=40",
    points: 850,
  },
  {
    id: 9,
    name: "Shikhar Dhawan",
    avatar: "/placeholder.svg?height=40&width=40",
    points: 820,
  },
  {
    id: 10,
    name: "Yuzvendra Chahal",
    avatar: "/placeholder.svg?height=40&width=40",
    points: 790,
  },
];
export const LeaderBoard = () => {
  return (
    <section className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Leaderboard</h2>
        <Link
          href="/leaderboard"
          className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          View All
          <ChevronRight className="w-4 h-4 ml-1" />
        </Link>
      </div>

      <Card className="max-w-xl">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center text-lg">
            <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
            Top 10 Players
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {leaderboard.map((user, index) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-1 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-6 font-semibold text-gray-600">
                    {index + 1}.
                  </div>
                  <Avatar className="w-8 h-8 border">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{user.name}</span>
                </div>
                <div className="flex items-center px-3 py-1 text-sm font-semibold text-blue-800 bg-blue-100 rounded-full">
                  {user.points} pts
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
};
