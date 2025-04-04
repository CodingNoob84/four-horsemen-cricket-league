"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getTeamColor } from "@/lib/utils";
import { Team } from "@/types";
import { useMutation } from "convex/react";
import { BadgeCheck, Coins, Shield, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

type TeamType = {
  teamId: Id<"teams"> | undefined;
  teamName: string | undefined;
  odds: number;
};

type matchBetType = {
  _id: Id<"bettingMatch">;
  _creationTime: number;
  userId: Id<"users">;
  matchId: Id<"matches">;
  team: Id<"teams">;
  bet: number;
  earning: number;
};

type matchType = {
  _id: Id<"matches">;
  _creationTime: number;
  datetimeUtc: string;
  venue: string;
  homeTeam: Team | null;
  awayTeam: Team | null;
  homeTeamOdd: number;
  awayTeamOdd: number;
  hasBet: boolean;
  canSubmit: boolean;
  maxLimit: number;
  matchBets: matchBetType[];
};

export const PlaceYourBet = ({ match }: { match: matchType }) => {
  const placeBet = useMutation(api.betting.placeBet);
  const deleteBet = useMutation(api.betting.deleteBet);
  const [selectedTeam, setSelectedTeam] = useState<Id<"teams"> | string>("");
  const [betAmount, setBetAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const teams: TeamType[] = [
    {
      teamId: match.homeTeam?._id,
      teamName: match.homeTeam?.shortForm,
      odds: match.homeTeamOdd,
    },
    {
      teamId: match.awayTeam?._id,
      teamName: match.awayTeam?.shortForm,
      odds: match.awayTeamOdd,
    },
  ];

  const handlePlaceBet = async () => {
    if (!selectedTeam || !betAmount || Number.parseInt(betAmount) <= 0) {
      setErrorMessage("Please select a team and enter a valid bet amount.");
      return;
    }

    const amount = Number.parseInt(betAmount);

    if (amount < 100) {
      setErrorMessage("Bet amount must be at least 100 coins.");
      return;
    }

    if (amount > match.maxLimit) {
      setErrorMessage("Insufficient coins for this bet.");
      return;
    }

    const team = teams.find((t) => t.teamId === selectedTeam);
    if (!team) return;
    setLoading(true);
    try {
      // Call the mutation to place or update the bet
      const result = await placeBet({
        teamId: selectedTeam as Id<"teams">,
        matchId: match._id,
        bet: amount,
      });

      if (result.success) {
        toast.success("Bet placed successfully!");
      } else {
        toast.error(
          result.message || "Something went wrong, please try again."
        );
      }
    } catch (error) {
      console.log("error", error);
      // Handle any errors that occurred during the bet update process
      toast.error("An error occurred while placing the bet. Please try again.");
    }
    setLoading(false);
    setBetAmount("");
    setSelectedTeam("");
    setErrorMessage("");
  };

  const handleDeleteBet = async (betId: string) => {
    try {
      const result = await deleteBet({
        betId: betId as Id<"bettingMatch">,
      });

      // Check if the deletion was successful
      if (result.success) {
        toast.success(result.message || "Bet deleted successfully!");
      } else {
        toast.error(
          result.message || "Something went wrong while deleting the bet."
        );
      }
    } catch (error) {
      console.log("error", error);
      toast.error(
        "An error occurred while deleting the bet. Please try again."
      );
    }
  };

  return (
    <div className="w-full flex flex-col md:flex-row gap-2">
      {match.canSubmit && (
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-amber-500" />
              Place Your Bet
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Team</label>
                <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a team" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem key={team.teamId} value={team.teamId || ""}>
                        <div className="flex items-center gap-2">
                          {team.teamName}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Bet Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-muted-foreground">
                    ₹
                  </span>
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    className="pl-7"
                    value={betAmount}
                    onChange={(e) => setBetAmount(e.target.value)}
                  />
                </div>

                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Coins className="h-4 w-4 text-amber-500" />
                  Remaining Coins: ₹{match.maxLimit}
                </div>
              </div>

              {errorMessage && (
                <div className="text-red-600 text-sm">{errorMessage}</div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setSelectedTeam("");
                setBetAmount("");
              }}
            >
              Cancel
            </Button>
            <Button onClick={handlePlaceBet} disabled={loading}>
              {loading ? "Submitting..." : "Place Bet"}
            </Button>
          </CardFooter>
        </Card>
      )}

      <Card className="bg-slate-50 w-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <BadgeCheck className="h-5 w-5 text-green-500" />
            Your Placed Bets
          </CardTitle>
        </CardHeader>
        <CardContent>
          {match.matchBets.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-4">
              No bets placed yet
            </div>
          ) : (
            <div className="space-y-3">
              {match.matchBets.map((bet) => (
                <div
                  key={bet._id}
                  className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm"
                >
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`${getTeamColor(
                        bet.team == match.homeTeam?._id
                          ? match.homeTeam.shortForm
                          : match.awayTeam?.shortForm || ""
                      )}`}
                    >
                      <Shield className="h-3 w-3 mr-1" />
                      {bet.team == match.homeTeam?._id
                        ? match.homeTeam.shortForm
                        : match.awayTeam?.shortForm}
                    </Badge>
                    <span className="text-sm font-medium">₹{bet.bet}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-green-600">
                      <span className="md:hidden">Potential:</span> ₹{" "}
                      {bet.team == match.homeTeam?._id
                        ? Math.floor(bet.bet * (match.homeTeamOdd + 1))
                        : Math.floor(bet.bet * (match.awayTeamOdd + 1))}
                    </span>
                    {match.canSubmit && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteBet(bet._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter className="pt-0 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Coins className="h-4 w-4 text-amber-500" />
            Remaining: ₹{match.maxLimit}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};
