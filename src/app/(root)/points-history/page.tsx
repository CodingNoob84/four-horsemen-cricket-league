"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar, Clock, Mail, Star, Trophy, User, Users } from "lucide-react";

export default function UserPointsHistoryPage() {
  const userpoints = useQuery(api.userspoints.fetchPastMatchesUserPoints);
  console.log("userponts", userpoints);
  // Dummy user data
  const user = {
    name: "Rahul Sharma",
    email: "rahul.sharma@example.com",
    avatar: "/placeholder.svg?height=100&width=100",
    totalPoints: 1250,
  };

  // Dummy matches data
  const matches = [
    {
      id: 1,
      team1: "CSK",
      team2: "RCB",
      date: "2023-04-15",
      time: "7:30 PM",
      matchPoints: 120,
      teamPoints: 75,
      playerPoints: [
        { name: "MS Dhoni", points: 15, team: "CSK" },
        { name: "Virat Kohli", points: 12, team: "RCB" },
        { name: "Ravindra Jadeja", points: 10, team: "CSK" },
        { name: "Glenn Maxwell", points: 8, team: "RCB" },
      ],
    },
    {
      id: 2,
      team1: "MI",
      team2: "KKR",
      date: "2023-04-18",
      time: "7:30 PM",
      matchPoints: 95,
      teamPoints: 60,
      playerPoints: [
        { name: "Rohit Sharma", points: 12, team: "MI" },
        { name: "Andre Russell", points: 10, team: "KKR" },
        { name: "Jasprit Bumrah", points: 8, team: "MI" },
        { name: "Sunil Narine", points: 5, team: "KKR" },
      ],
    },
    {
      id: 3,
      team1: "SRH",
      team2: "DC",
      date: "2023-04-22",
      time: "3:30 PM",
      matchPoints: 85,
      teamPoints: 50,
      playerPoints: [
        { name: "David Warner", points: 14, team: "DC" },
        { name: "Bhuvneshwar Kumar", points: 9, team: "SRH" },
        { name: "Rishabh Pant", points: 7, team: "DC" },
        { name: "Aiden Markram", points: 5, team: "SRH" },
      ],
    },
    {
      id: 4,
      team1: "RR",
      team2: "PBKS",
      date: "2023-04-26",
      time: "7:30 PM",
      matchPoints: 110,
      teamPoints: 65,
      playerPoints: [
        { name: "Jos Buttler", points: 18, team: "RR" },
        { name: "Shikhar Dhawan", points: 11, team: "PBKS" },
        { name: "Yuzvendra Chahal", points: 9, team: "RR" },
        { name: "Arshdeep Singh", points: 7, team: "PBKS" },
      ],
    },
    {
      id: 5,
      team1: "GT",
      team2: "LSG",
      date: "2023-04-30",
      time: "3:30 PM",
      matchPoints: 105,
      teamPoints: 70,
      playerPoints: [
        { name: "Hardik Pandya", points: 16, team: "GT" },
        { name: "KL Rahul", points: 13, team: "LSG" },
        { name: "Rashid Khan", points: 10, team: "GT" },
        { name: "Krunal Pandya", points: 6, team: "LSG" },
      ],
    },
  ];

  // Team colors for badges
  const teamColors: Record<string, string> = {
    CSK: "bg-yellow-500",
    RCB: "bg-red-600",
    MI: "bg-blue-600",
    KKR: "bg-purple-600",
    SRH: "bg-orange-500",
    DC: "bg-blue-400",
    RR: "bg-pink-500",
    PBKS: "bg-red-500",
    GT: "bg-teal-500",
    LSG: "bg-cyan-600",
  };

  return (
    <div className="container mx-auto py-8 px-4">
      {/* User Profile Section */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
        <Avatar className="w-24 h-24 border-4 border-primary">
          <AvatarImage src={user.avatar} alt={user.name} />
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
              {user.totalPoints} Total Points
            </span>
          </div>
        </div>
      </div>

      {/* Points Summary Card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Points Summary
          </CardTitle>
          <CardDescription>Your fantasy cricket performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
              <span className="text-muted-foreground text-sm">
                Total Matches
              </span>
              <span className="text-2xl font-bold">{matches.length}</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
              <span className="text-muted-foreground text-sm">
                Average Points
              </span>
              <span className="text-2xl font-bold">
                {Math.round(
                  matches.reduce((acc, match) => acc + match.matchPoints, 0) /
                    matches.length
                )}
              </span>
            </div>
            <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
              <span className="text-muted-foreground text-sm">
                Highest Points
              </span>
              <span className="text-2xl font-bold">
                {Math.max(...matches.map((match) => match.matchPoints))}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Matches Accordion */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            Match History
          </CardTitle>
          <CardDescription>Your points breakdown by match</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {matches.map((match) => (
              <AccordionItem key={match.id} value={`match-${match.id}`}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex flex-col md:flex-row w-full items-start md:items-center justify-between pr-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center">
                        <Badge
                          className={`${teamColors[match.team1]} text-white`}
                        >
                          {match.team1}
                        </Badge>
                        <span className="mx-2 text-xs md:text-sm">vs</span>
                        <Badge
                          className={`${teamColors[match.team2]} text-white`}
                        >
                          {match.team2}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-2 md:mt-0">
                      <div className="flex items-center gap-1 text-xs md:text-sm text-muted-foreground">
                        <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                        <span>{match.date}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs md:text-sm text-muted-foreground">
                        <Clock className="w-3 h-3 md:w-4 md:h-4" />
                        <span>{match.time}</span>
                      </div>
                      <Badge variant="outline" className="ml-2 bg-primary/10">
                        <Trophy className="w-3 h-3 mr-1 text-primary" />
                        {match.matchPoints} pts
                      </Badge>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pl-4 pt-4 pb-2">
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4 text-primary" />
                        Team Points
                      </h4>
                      <Badge variant="outline" className="bg-primary/10">
                        {match.teamPoints} pts
                      </Badge>
                    </div>

                    <h4 className="text-sm font-semibold flex items-center gap-2 mb-2">
                      <User className="w-4 h-4 text-primary" />
                      Player Points
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {match.playerPoints.map((player, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 rounded-lg border"
                        >
                          <div className="flex items-center gap-2">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="text-xs bg-muted">
                                {player.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">
                                {player.name}
                              </p>
                              <Badge
                                className={`${teamColors[player.team]} text-white text-xs`}
                              >
                                {player.team}
                              </Badge>
                            </div>
                          </div>
                          <Badge variant="outline" className="bg-primary/10">
                            <Star className="w-3 h-3 mr-1 text-yellow-500" />
                            {player.points} pts
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
