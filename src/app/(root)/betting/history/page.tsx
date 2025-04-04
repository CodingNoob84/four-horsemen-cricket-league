"use client";

import { LoadingScreen } from "@/components/common/loading-screen";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatLocalDate } from "@/lib/utils";
import { useQuery } from "convex/react";
import { Calendar, Check, MapPin, Trophy, X } from "lucide-react";
import Image from "next/image";
import { api } from "../../../../../convex/_generated/api";

export default function MatchHistory() {
  const data = useQuery(api.betting.getMatchHistory);
  if (data == undefined) {
    return <LoadingScreen />;
  }
  console.log("data", data);

  return (
    <div className="py-6">
      <h2 className="text-2xl font-bold mb-6 text-center">Match History</h2>
      <div className="space-y-4 px-4">
        {data.matches && data.matches.length > 0 ? (
          data.matches.map((match, j) => {
            // Check if any bet was won
            const hasWon = match.userBet?.some((bet) => bet.earning > 0);
            const hasBet = match.userBet && match.userBet.length > 0;

            // Calculate total earnings
            const totalEarnings = hasBet
              ? match.userBet.reduce((sum, bet) => sum + bet.earning, 0)
              : 0;

            return (
              <Card
                key={j}
                className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <CardContent className="p-0">
                  {/* Match header with teams */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          {match.homeTeam.image && (
                            <div className="relative h-8 w-8 rounded-full overflow-hidden bg-white p-1">
                              <Image
                                src={match.homeTeam.image || "/placeholder.svg"}
                                alt={match.homeTeam.teamName}
                                width={32}
                                height={32}
                                className="object-contain"
                              />
                            </div>
                          )}
                          <span className="font-bold text-gray-800">
                            {match.homeTeam.shortForm}
                          </span>
                        </div>

                        <span className="text-sm font-medium text-gray-500">
                          vs
                        </span>

                        <div className="flex items-center gap-2">
                          {match.awayTeam.image && (
                            <div className="relative h-8 w-8 rounded-full overflow-hidden bg-white p-1">
                              <Image
                                src={match.awayTeam.image || "/placeholder.svg"}
                                alt={match.awayTeam.teamName}
                                width={32}
                                height={32}
                                className="object-contain"
                              />
                            </div>
                          )}
                          <span className="font-bold text-gray-800">
                            {match.awayTeam.shortForm}
                          </span>
                        </div>
                      </div>

                      {hasBet ? (
                        <Badge
                          className={
                            hasWon
                              ? "bg-green-100 text-green-800 hover:bg-green-200 border-green-200"
                              : "bg-red-100 text-red-800 hover:bg-red-200 border-red-200"
                          }
                        >
                          {hasWon ? "Won" : "Lost"}
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-200 border-gray-200">
                          No Bet
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-x-6 gap-y-1 mt-3 text-xs text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>{formatLocalDate(match.datetimeUtc)}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span>{match.venue}</span>
                      </div>
                    </div>
                  </div>

                  {/* Bet details */}
                  <div className="p-4 bg-white">
                    {hasBet ? (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <h4 className="text-sm font-medium text-gray-700">
                            Your Bets
                          </h4>
                          {totalEarnings > 0 && (
                            <div className="flex items-center text-green-600 font-medium">
                              <Trophy className="h-3.5 w-3.5 mr-1" />
                              <span>+₹{totalEarnings}</span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          {match.userBet.map((bet, i) => (
                            <div
                              key={i}
                              className="flex justify-between items-center p-3 rounded-lg bg-gray-50 border border-gray-100"
                            >
                              <div className="flex items-center gap-3">
                                {bet.teamName.image && (
                                  <div className="relative h-6 w-6 rounded-full overflow-hidden bg-white">
                                    <Image
                                      src={
                                        bet.teamName.image || "/placeholder.svg"
                                      }
                                      alt={bet.teamName.teamName}
                                      width={24}
                                      height={24}
                                      className="object-contain"
                                    />
                                  </div>
                                )}
                                <div>
                                  <div className="font-medium text-gray-800">
                                    ₹{bet.bet}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    on {bet.teamName.shortForm}
                                  </div>
                                </div>
                              </div>

                              <div>
                                <div
                                  className={`flex items-center ${
                                    bet.earning > 0
                                      ? "text-green-600"
                                      : bet.earning == 0
                                        ? "text-red-600"
                                        : "text-gray-500"
                                  }`}
                                >
                                  {bet.earning > 0 ? (
                                    <>
                                      <Check className="h-4 w-4 mr-1" />
                                      <span className="font-medium">
                                        +₹{bet.earning}
                                      </span>
                                    </>
                                  ) : bet.earning < 0 ? (
                                    <>
                                      <X className="h-4 w-4 mr-1" />
                                      <span className="font-medium">
                                        -₹{Math.abs(bet.earning)}
                                      </span>
                                    </>
                                  ) : (
                                    <span className="font-medium">₹0</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="py-2 text-sm text-gray-500 italic">
                        You didn&apos;t place any bets on this match
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="text-center py-8 text-gray-500">
            No match history available
          </div>
        )}
      </div>
    </div>
  );
}
