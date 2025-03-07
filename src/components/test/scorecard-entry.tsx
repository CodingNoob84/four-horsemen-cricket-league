"use client";

import type React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChevronDown,
  ChevronUp,
  Filter,
  Loader2,
  Minus,
  Plus,
  Save,
  Trophy,
  Users,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

// Types
interface PlayerData {
  _id: string;
  name: string;
  role: string;
  profileImage: string;
  isPlayed: boolean;
  runs: number;
  wickets: number;
  catches: number;
  stumpings: number;
  runouts: number;
  playerPoints: number;
  team: "homeTeam" | "awayTeam";
}

interface MatchDetail {
  homeTeam: {
    name: string;
    shortForm: string;
    logo: string;
  };
  awayTeam: {
    name: string;
    shortForm: string;
    logo: string;
  };
  venue: string;
  date: string;
  matchType: string;
}

// Dummy data
const dummyMatchDetail: MatchDetail = {
  homeTeam: {
    name: "Mumbai Indians",
    shortForm: "MI",
    logo: "/placeholder.svg?height=80&width=80",
  },
  awayTeam: {
    name: "Chennai Super Kings",
    shortForm: "CSK",
    logo: "/placeholder.svg?height=80&width=80",
  },
  venue: "Wankhede Stadium, Mumbai",
  date: "2025-03-07",
  matchType: "T20",
};

// Generate dummy players
const generatePlayers = (
  team: "homeTeam" | "awayTeam",
  count: number
): PlayerData[] => {
  const teamName =
    team === "homeTeam" ? "Mumbai Indians" : "Chennai Super Kings";
  const roles = ["Batsman", "Bowler", "All-rounder", "Wicket-keeper"];

  return Array.from({ length: count }, (_, i) => ({
    _id: `${team}-player-${i + 1}`,
    name: `${teamName} Player ${i + 1}`,
    role: roles[Math.floor(Math.random() * roles.length)],
    profileImage: `/placeholder.svg?height=40&width=40`,
    isPlayed: i < 11, // First 11 players are in playing XI
    runs: 0,
    wickets: 0,
    catches: 0,
    stumpings: 0,
    runouts: 0,
    playerPoints: 0,
    team,
  }));
};

const dummyHomeTeamPlayers = generatePlayers("homeTeam", 15);
const dummyAwayTeamPlayers = generatePlayers("awayTeam", 15);

// PlayerDataCard component
const PlayerDataCard: React.FC<{
  player: PlayerData;
  onPlayerChange: (
    playerId: string,
    field: keyof PlayerData,
    value: number | boolean
  ) => void;
  onSubmit: (player: PlayerData) => void;
  expanded: boolean;
  onToggle: () => void;
}> = ({ player, onPlayerChange, onSubmit, expanded, onToggle }) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));
      onSubmit(player);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickIncrement = (field: keyof PlayerData, amount: number) => {
    if (typeof player[field] === "number") {
      const newValue = Math.max(0, (player[field] as number) + amount);
      onPlayerChange(player._id, field, newValue);
    }
  };

  return (
    <Card
      className={`transition-all duration-200 ${expanded ? "border-primary" : ""}`}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center flex-1">
            <button
              onClick={onToggle}
              className="p-1 rounded-full hover:bg-muted"
              aria-label={
                expanded ? "Collapse player card" : "Expand player card"
              }
            >
              {expanded ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              )}
            </button>

            <div className="relative ml-2">
              <Image
                src={player.profileImage || "/placeholder.svg"}
                alt={player.name}
                width={40}
                height={40}
                className="rounded-full"
              />
              {player.isPlayed && (
                <Badge
                  variant="secondary"
                  className="absolute -bottom-2 -right-2 text-[10px] px-1"
                >
                  XI
                </Badge>
              )}
            </div>

            <div className="ml-3 flex-1 min-w-0">
              <div className="font-medium truncate">{player.name}</div>
              <div className="text-xs text-muted-foreground flex items-center">
                <span className="truncate">{player.role}</span>
                {player.playerPoints > 0 && (
                  <Badge variant="outline" className="ml-2 text-xs">
                    {player.playerPoints} pts
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center">
            <Checkbox
              id={`played-${player._id}`}
              checked={player.isPlayed}
              onCheckedChange={(checked) =>
                onPlayerChange(player._id, "isPlayed", !!checked)
              }
              className="mr-2"
            />
            <Label htmlFor={`played-${player._id}`} className="text-xs mr-2">
              Playing
            </Label>
          </div>
        </div>

        {expanded && (
          <div className="mt-4 space-y-4">
            {/* Mobile-optimized stat entry */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {["runs", "wickets", "catches", "stumpings", "runouts"].map(
                (field) => (
                  <div
                    key={field}
                    className="space-y-1 bg-muted/30 p-2 rounded-lg"
                  >
                    <Label className="text-xs font-medium flex justify-between">
                      <span>
                        {field.charAt(0).toUpperCase() + field.slice(1)}
                      </span>
                      <span className="text-primary">
                        {(player[field as keyof PlayerData] as number) || 0}
                      </span>
                    </Label>
                    <div className="flex items-center gap-1 mt-1">
                      <button
                        type="button"
                        onClick={() =>
                          handleQuickIncrement(field as keyof PlayerData, -1)
                        }
                        disabled={
                          !player.isPlayed ||
                          (player[field as keyof PlayerData] as number) <= 0
                        }
                        className="h-10 flex-1 rounded-md border flex items-center justify-center bg-background disabled:opacity-50 touch-manipulation"
                        aria-label={`Decrease ${field}`}
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleQuickIncrement(field as keyof PlayerData, 1)
                        }
                        disabled={!player.isPlayed}
                        className="h-10 flex-1 rounded-md border flex items-center justify-center bg-background disabled:opacity-50 touch-manipulation"
                        aria-label={`Increase ${field}`}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <Input
                      type="number"
                      value={(player[field as keyof PlayerData] as number) || 0}
                      onChange={(e) =>
                        onPlayerChange(
                          player._id,
                          field as keyof PlayerData,
                          Number(e.target.value)
                        )
                      }
                      disabled={!player.isPlayed}
                      className="h-8 mt-1 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                )
              )}
            </div>

            {/* Quick action buttons for common scenarios */}
            <div className="grid grid-cols-3 gap-2 mt-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-8"
                onClick={() => {
                  if (player.isPlayed) {
                    onPlayerChange(
                      player._id,
                      "catches",
                      (player.catches as number) + 1
                    );
                  }
                }}
                disabled={!player.isPlayed}
              >
                +1 Catch
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-8"
                onClick={() => {
                  if (player.isPlayed) {
                    onPlayerChange(
                      player._id,
                      "wickets",
                      (player.wickets as number) + 1
                    );
                  }
                }}
                disabled={!player.isPlayed}
              >
                +1 Wicket
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-8"
                onClick={() => {
                  if (player.isPlayed) {
                    onPlayerChange(
                      player._id,
                      "runs",
                      (player.runs as number) + 4
                    );
                  }
                }}
                disabled={!player.isPlayed}
              >
                +4 Runs
              </Button>
            </div>

            <div className="flex justify-end">
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={loading || !player.isPlayed}
                className="w-full sm:w-auto"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Main component
export default function CricketScorecard() {
  const matchDetail: MatchDetail = dummyMatchDetail;
  //const [matchDetail, setMatchDetail] = useState<MatchDetail>(dummyMatchDetail);
  const [homeTeamPlayers, setHomeTeamPlayers] =
    useState<PlayerData[]>(dummyHomeTeamPlayers);
  const [awayTeamPlayers, setAwayTeamPlayers] =
    useState<PlayerData[]>(dummyAwayTeamPlayers);
  const [loadingBulkSubmit, setLoadingBulkSubmit] = useState(false);
  const [expandedPlayers, setExpandedPlayers] = useState<
    Record<string, boolean>
  >({});
  const [filterPlayed, setFilterPlayed] = useState(false);
  const [bulkEditMode, setBulkEditMode] = useState(false);
  const [selectedPlayers, setSelectedPlayers] = useState<
    Record<string, boolean>
  >({});
  const [bulkValues, setBulkValues] = useState({
    runs: 0,
    wickets: 0,
    catches: 0,
    stumpings: 0,
    runouts: 0,
  });

  // Toggle player expansion
  const togglePlayerExpansion = (playerId: string) => {
    setExpandedPlayers((prev) => ({
      ...prev,
      [playerId]: !prev[playerId],
    }));
  };

  // Handle player data change
  const handlePlayerChange = (
    team: "homeTeam" | "awayTeam",
    playerId: string,
    field: keyof PlayerData,
    value: number | boolean
  ) => {
    const updatePlayers = (players: PlayerData[]) =>
      players.map((player) => {
        if (player._id === playerId) {
          const updatedPlayer = { ...player, [field]: value };

          // Calculate player points (simplified example)
          if (typeof value === "number") {
            const runs = field === "runs" ? value : player.runs;
            const wickets = field === "wickets" ? value : player.wickets;
            const catches = field === "catches" ? value : player.catches;
            const stumpings = field === "stumpings" ? value : player.stumpings;
            const runouts = field === "runouts" ? value : player.runouts;

            // Simple scoring system
            const points =
              runs +
              wickets * 25 +
              catches * 10 +
              stumpings * 15 +
              runouts * 10;

            updatedPlayer.playerPoints = points;
          }

          return updatedPlayer;
        }
        return player;
      });

    if (team === "homeTeam") {
      setHomeTeamPlayers(updatePlayers(homeTeamPlayers));
    } else {
      setAwayTeamPlayers(updatePlayers(awayTeamPlayers));
    }
  };

  // Handle single player submission
  const handleSubmitPlayer = (player: PlayerData) => {
    toast("Player data saved", {
      description: `Statistics for ${player.name} have been updated.`,
    });
  };

  // Handle bulk submission
  const handleSubmitAll = async () => {
    setLoadingBulkSubmit(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast("All player data saved");
    } finally {
      setLoadingBulkSubmit(false);
    }
  };

  // Toggle selection of all players
  const toggleSelectAll = (team: "homeTeam" | "awayTeam") => {
    const players = team === "homeTeam" ? homeTeamPlayers : awayTeamPlayers;
    const filteredPlayers = filterPlayed
      ? players.filter((p) => p.isPlayed)
      : players;

    // Check if all are selected
    const allSelected = filteredPlayers.every((p) => selectedPlayers[p._id]);

    // Toggle selection
    const newSelectedPlayers = { ...selectedPlayers };
    filteredPlayers.forEach((player) => {
      newSelectedPlayers[player._id] = !allSelected;
    });

    setSelectedPlayers(newSelectedPlayers);
  };

  // Apply bulk edit to selected players
  const applyBulkEdit = (team: "homeTeam" | "awayTeam") => {
    const players = team === "homeTeam" ? homeTeamPlayers : awayTeamPlayers;

    // Update each selected player
    players.forEach((player) => {
      if (selectedPlayers[player._id]) {
        Object.entries(bulkValues).forEach(([field, value]) => {
          handlePlayerChange(
            team,
            player._id,
            field as keyof PlayerData,
            value
          );
        });
      }
    });

    toast("Bulk update applied", {
      description:
        "Selected players have been updated with the specified values.",
    });

    // Reset selection and bulk edit mode
    setSelectedPlayers({});
    setBulkEditMode(false);
  };

  // Expand all players
  const expandAllPlayers = (team: "homeTeam" | "awayTeam") => {
    const players = team === "homeTeam" ? homeTeamPlayers : awayTeamPlayers;
    const filteredPlayers = filterPlayed
      ? players.filter((p) => p.isPlayed)
      : players;

    const newExpandedPlayers = { ...expandedPlayers };
    filteredPlayers.forEach((player) => {
      newExpandedPlayers[player._id] = true;
    });

    setExpandedPlayers(newExpandedPlayers);
  };

  // Collapse all players
  const collapseAllPlayers = () => {
    setExpandedPlayers({});
  };

  // Filter players based on playing status
  const getFilteredPlayers = (players: PlayerData[]) => {
    return filterPlayed ? players.filter((p) => p.isPlayed) : players;
  };

  const QuickStatEntry = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedStat, setSelectedStat] = useState<string | null>(null);
    const [selectedTeam, setSelectedTeam] = useState<"homeTeam" | "awayTeam">(
      "homeTeam"
    );
    const [selectedPlayer, setSelectedPlayer] = useState<string>("");

    const handleQuickAdd = (amount: number) => {
      if (!selectedPlayer || !selectedStat) return;

      const team = selectedTeam;
      const playerId = selectedPlayer;
      const field = selectedStat as keyof PlayerData;

      const players = team === "homeTeam" ? homeTeamPlayers : awayTeamPlayers;
      const player = players.find((p) => p._id === playerId);

      if (player) {
        const currentValue = player[field] as number;
        handlePlayerChange(team, playerId, field, currentValue + amount);

        toast("Stat updated", {
          description: `Added ${amount} ${field} to ${player.name}`,
        });
      }
    };

    return (
      <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end space-y-2">
        {isOpen && (
          <div className="bg-card rounded-lg shadow-lg p-4 w-[280px] border animate-in slide-in-from-bottom-5">
            <h3 className="font-medium mb-3">Quick Stat Entry</h3>

            <div className="space-y-3">
              <div>
                <Label className="text-xs">Team</Label>
                <Select
                  value={selectedTeam}
                  onValueChange={(value) =>
                    setSelectedTeam(value as "homeTeam" | "awayTeam")
                  }
                >
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Select team" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="homeTeam">
                      {matchDetail.homeTeam.shortForm}
                    </SelectItem>
                    <SelectItem value="awayTeam">
                      {matchDetail.awayTeam.shortForm}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs">Player</Label>
                <Select
                  value={selectedPlayer}
                  onValueChange={setSelectedPlayer}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Select player" />
                  </SelectTrigger>
                  <SelectContent>
                    {(selectedTeam === "homeTeam"
                      ? homeTeamPlayers
                      : awayTeamPlayers
                    )
                      .filter((p) => p.isPlayed)
                      .map((player) => (
                        <SelectItem key={player._id} value={player._id}>
                          {player.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs">Stat</Label>
                <Select
                  value={selectedStat || ""}
                  onValueChange={setSelectedStat}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Select stat" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="runs">Runs</SelectItem>
                    <SelectItem value="wickets">Wickets</SelectItem>
                    <SelectItem value="catches">Catches</SelectItem>
                    <SelectItem value="stumpings">Stumpings</SelectItem>
                    <SelectItem value="runouts">Runouts</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-4 gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10"
                  onClick={() => handleQuickAdd(1)}
                  disabled={!selectedPlayer || !selectedStat}
                >
                  +1
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10"
                  onClick={() => handleQuickAdd(4)}
                  disabled={
                    !selectedPlayer || !selectedStat || selectedStat !== "runs"
                  }
                >
                  +4
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10"
                  onClick={() => handleQuickAdd(6)}
                  disabled={
                    !selectedPlayer || !selectedStat || selectedStat !== "runs"
                  }
                >
                  +6
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10"
                  onClick={() => handleQuickAdd(-1)}
                  disabled={!selectedPlayer || !selectedStat}
                >
                  -1
                </Button>
              </div>
            </div>
          </div>
        )}

        <Button
          size="icon"
          className="h-14 w-14 rounded-full shadow-lg"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? (
            <XCircle className="h-6 w-6" />
          ) : (
            <Plus className="h-6 w-6" />
          )}
        </Button>
      </div>
    );
  };

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Cricket Match Scorecard
          </h1>
          <p className="text-muted-foreground">
            {matchDetail.homeTeam.name} vs {matchDetail.awayTeam.name} |{" "}
            {matchDetail.venue} |{" "}
            {new Date(matchDetail.date).toLocaleDateString()}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            onClick={handleSubmitAll}
            disabled={loadingBulkSubmit}
            className="flex items-center gap-2"
          >
            {loadingBulkSubmit ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving All Data...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save All Data
              </>
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Options
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>View Options</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setFilterPlayed(!filterPlayed)}>
                {filterPlayed ? "Show All Players" : "Show Only Playing XI"}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => expandAllPlayers(homeTeamPlayers[0].team)}
              >
                Expand All Players
              </DropdownMenuItem>
              <DropdownMenuItem onClick={collapseAllPlayers}>
                Collapse All Players
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Bulk Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setBulkEditMode(!bulkEditMode)}>
                {bulkEditMode ? "Exit Bulk Edit Mode" : "Enter Bulk Edit Mode"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {bulkEditMode && (
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Bulk Edit Mode</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setBulkEditMode(false)}
                  className="h-8 px-2"
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Exit
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.keys(bulkValues).map((field) => (
                  <div key={field} className="space-y-1">
                    <Label className="text-xs">
                      {field.charAt(0).toUpperCase() + field.slice(1)}
                    </Label>
                    <Input
                      type="number"
                      value={bulkValues[field as keyof typeof bulkValues]}
                      onChange={(e) =>
                        setBulkValues({
                          ...bulkValues,
                          [field]: Number(e.target.value),
                        })
                      }
                      className="h-8"
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-end">
                <Button
                  size="sm"
                  onClick={() => applyBulkEdit("homeTeam")}
                  disabled={
                    Object.keys(selectedPlayers).filter(
                      (id) => selectedPlayers[id]
                    ).length === 0
                  }
                >
                  Apply to Selected Players
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="homeTeam" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="homeTeam" className="flex items-center gap-2">
            <Image
              src={matchDetail.homeTeam.logo || "/placeholder.svg"}
              alt={matchDetail.homeTeam.name}
              width={24}
              height={24}
              className="rounded-full"
            />
            {matchDetail.homeTeam.shortForm}
          </TabsTrigger>
          <TabsTrigger value="awayTeam" className="flex items-center gap-2">
            <Image
              src={matchDetail.awayTeam.logo || "/placeholder.svg"}
              alt={matchDetail.awayTeam.name}
              width={24}
              height={24}
              className="rounded-full"
            />
            {matchDetail.awayTeam.shortForm}
          </TabsTrigger>
        </TabsList>

        {["homeTeam", "awayTeam"].map((team) => (
          <TabsContent key={team} value={team}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {
                    getFilteredPlayers(
                      team === "homeTeam" ? homeTeamPlayers : awayTeamPlayers
                    ).length
                  }{" "}
                  Players
                </Badge>

                <Badge variant="outline" className="flex items-center gap-1">
                  <Trophy className="h-3 w-3" />
                  {getFilteredPlayers(
                    team === "homeTeam" ? homeTeamPlayers : awayTeamPlayers
                  ).reduce((sum, player) => sum + player.playerPoints, 0)}{" "}
                  Total Points
                </Badge>
              </div>

              {bulkEditMode && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      toggleSelectAll(team as "homeTeam" | "awayTeam")
                    }
                    className="h-8"
                  >
                    Select All
                  </Button>
                </div>
              )}
            </div>

            <ScrollArea className="h-[calc(100vh-300px)]">
              <div className="space-y-2">
                {getFilteredPlayers(
                  team === "homeTeam" ? homeTeamPlayers : awayTeamPlayers
                ).map((player) => (
                  <div key={player._id} className="flex items-center">
                    {bulkEditMode && (
                      <Checkbox
                        checked={!!selectedPlayers[player._id]}
                        onCheckedChange={(checked) => {
                          setSelectedPlayers({
                            ...selectedPlayers,
                            [player._id]: !!checked,
                          });
                        }}
                        className="mr-2"
                      />
                    )}

                    <div className="flex-1">
                      <PlayerDataCard
                        player={player}
                        onPlayerChange={(playerId, field, value) =>
                          handlePlayerChange(
                            team as "homeTeam" | "awayTeam",
                            playerId,
                            field,
                            value
                          )
                        }
                        onSubmit={handleSubmitPlayer}
                        expanded={!!expandedPlayers[player._id]}
                        onToggle={() => togglePlayerExpansion(player._id)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="flex items-center justify-center mt-4">
              <Button
                onClick={handleSubmitAll}
                disabled={loadingBulkSubmit}
                className="w-full sm:w-auto"
              >
                {loadingBulkSubmit ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving All Data...
                  </>
                ) : (
                  "Save All Player Data"
                )}
              </Button>
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <QuickStatEntry />
    </div>
  );
}
