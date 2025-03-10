"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trophy } from "lucide-react";

// Mock data - in a real app, this would come from an API
const getMockPointsData = (groupId: string, matchId: string | null) => {
  // Base members for the group
  const members = [
    {
      id: "1",
      name: "John Doe",
      avatar: "/placeholder.svg?height=40&width=40",
      overallPoints: 450,
      matchPoints: { m1: 85, m2: 120, m3: 245 },
    },
    {
      id: "2",
      name: "Jane Smith",
      avatar: "/placeholder.svg?height=40&width=40",
      overallPoints: 520,
      matchPoints: { m1: 95, m2: 180, m3: 245 },
    },
    {
      id: "3",
      name: "Mike Johnson",
      avatar: "/placeholder.svg?height=40&width=40",
      overallPoints: 380,
      matchPoints: { m1: 75, m2: 110, m3: 195 },
    },
    {
      id: "4",
      name: "Sarah Williams",
      avatar: "/placeholder.svg?height=40&width=40",
      overallPoints: 490,
      matchPoints: { m1: 90, m2: 150, m3: 250 },
    },
  ];

  // Filter members based on group
  let filteredMembers = members;
  if (groupId === "def456") {
    filteredMembers = members.slice(0, 3);
  } else if (groupId === "ghi789") {
    filteredMembers = members.slice(0, 2);
  }

  // Sort by points (overall or match-specific)
  return filteredMembers.sort((a, b) => {
    if (matchId) {
      return (
        (b.matchPoints[matchId as keyof typeof b.matchPoints] || 0) -
        (a.matchPoints[matchId as keyof typeof a.matchPoints] || 0)
      );
    }
    return b.overallPoints - a.overallPoints;
  });
};

export function PointsTable({
  groupId,
  matchId,
}: {
  groupId: string;
  matchId: string | null;
}) {
  const pointsData = getMockPointsData(groupId, matchId);

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">#</TableHead>
            <TableHead>Player</TableHead>
            <TableHead className="text-right">Points</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pointsData.map((player, index) => (
            <TableRow key={player.id}>
              <TableCell className="font-medium">
                {index === 0 ? (
                  <Badge
                    variant="default"
                    className="bg-yellow-500 hover:bg-yellow-600"
                  >
                    <Trophy className="h-3 w-3 mr-1" />
                    {index + 1}
                  </Badge>
                ) : (
                  index + 1
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarImage src={player.avatar} alt={player.name} />
                    <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span>{player.name}</span>
                </div>
              </TableCell>
              <TableCell className="text-right font-semibold">
                {matchId
                  ? player.matchPoints[
                      matchId as keyof typeof player.matchPoints
                    ] || 0
                  : player.overallPoints}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
