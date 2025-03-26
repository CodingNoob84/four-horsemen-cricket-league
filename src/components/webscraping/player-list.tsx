"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Award,
  Edit2,
  HandMetal,
  MonitorIcon as Running,
  Save,
  Target,
  ThumbsUp,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { Id } from "../../../convex/_generated/dataModel";
import { PlayedPlayers } from "./last-match";

export default function CricketPlayerStats({
  InitPlayers,
}: {
  InitPlayers: PlayedPlayers[];
}) {
  const [playedPlayers, setPlayedPlayers] =
    useState<PlayedPlayers[]>(InitPlayers);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState<PlayedPlayers | null>(
    null
  );
  const [editFormData, setEditFormData] = useState({
    runs: 0,
    wickets: 0,
    catches: 0,
    stumpings: 0,
    runouts: 0,
  });

  const handleEdit = (playerId: Id<"players">) => {
    const playerToEdit =
      playedPlayers.find((player) => player.playerId === playerId) || null;

    if (playerToEdit) {
      setCurrentPlayer(playerToEdit);
      setEditFormData({
        runs: playerToEdit.runs,
        wickets: playerToEdit.wickets,
        catches: playerToEdit.catches,
        stumpings: playerToEdit.stumpings,
        runouts: playerToEdit.runouts,
      });
      setIsEditModalOpen(true);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: Number.parseInt(value) || 0,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPlayer) return;

    // Calculate new player points based on stats
    // This is a simple formula - you can adjust based on your scoring system
    const newPoints =
      editFormData.runs * 1 +
      editFormData.wickets * 10 +
      editFormData.catches * 5 +
      editFormData.stumpings * 8 +
      editFormData.runouts * 4;

    // Update the player data
    const updatedPlayers = playedPlayers.map((player) => {
      if (player.playerId === currentPlayer.playerId) {
        return {
          ...player,
          runs: editFormData.runs,
          wickets: editFormData.wickets,
          catches: editFormData.catches,
          stumpings: editFormData.stumpings,
          runouts: editFormData.runouts,
          playerPoints: newPoints,
        };
      }
      return player;
    });

    setPlayedPlayers(updatedPlayers);
    setIsEditModalOpen(false);
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-3 sm:p-4 space-y-4">
      <div className="flex flex-col space-y-3">
        {playedPlayers.length > 0 &&
          playedPlayers.map((player) => (
            <Card
              key={player.playerId}
              className="w-full overflow-hidden border border-slate-200 hover:border-slate-300 transition-all duration-200"
            >
              <div className=" bg-gradient-to-r from-slate-50 to-white p-2">
                <div className="w-full flex flex-row justify-between items-start gap-2">
                  <div className="font-medium text-lg">{player.playerName}</div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-1 rounded-md">
                      <Award className="h-4 w-4" />
                      <span className="font-semibold">
                        {player.playerPoints}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-slate-500 hover:text-primary"
                      onClick={() => handleEdit(player.playerId)}
                    >
                      <Edit2 className="h-5 w-5" />
                      <span className="sr-only">Edit {player.playerName}</span>
                    </Button>
                  </div>
                </div>

                <div className="flex flex-row flex-wrap gap-2">
                  <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 p-2 sm:p-1.5 rounded-md">
                    <span className="font-medium">Runs: {player.runs}</span>
                  </div>

                  <div className="flex items-center gap-1.5 bg-red-50 text-red-700 p-2 sm:p-1.5 rounded-md">
                    <span className="font-medium">
                      Wickets: {player.wickets}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 bg-green-50 text-green-700 p-2 sm:p-1.5 rounded-md">
                    <span className="font-medium">
                      Catches: {player.catches}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 bg-purple-50 text-purple-700 p-2 sm:p-1.5 rounded-md">
                    <span className="font-medium">
                      Stumpings: {player.stumpings}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 bg-orange-50 text-orange-700 p-2 sm:p-1.5 rounded-md">
                    <span className="font-medium">
                      Runouts: {player.runouts}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
      </div>

      {playedPlayers.length === 0 && (
        <div className="text-center p-8 text-slate-500">
          No player statistics available
        </div>
      )}

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Player Statistics</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 gap-2">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="runs" className="flex items-center gap-1.5">
                    <Running className="h-4 w-4 text-blue-600" />
                    Runs
                  </Label>
                  <Input
                    id="runs"
                    name="runs"
                    type="number"
                    value={editFormData.runs}
                    onChange={handleInputChange}
                    min="0"
                    className="col-span-3"
                  />
                </div>

                <div className="flex flex-col space-y-1.5">
                  <Label
                    htmlFor="wickets"
                    className="flex items-center gap-1.5"
                  >
                    <Zap className="h-4 w-4 text-red-600" />
                    Wickets
                  </Label>
                  <Input
                    id="wickets"
                    name="wickets"
                    type="number"
                    value={editFormData.wickets}
                    onChange={handleInputChange}
                    min="0"
                    className="col-span-3"
                  />
                </div>

                <div className="flex flex-col space-y-1.5">
                  <Label
                    htmlFor="catches"
                    className="flex items-center gap-1.5"
                  >
                    <HandMetal className="h-4 w-4 text-green-600" />
                    Catches
                  </Label>
                  <Input
                    id="catches"
                    name="catches"
                    type="number"
                    value={editFormData.catches}
                    onChange={handleInputChange}
                    min="0"
                    className="col-span-3"
                  />
                </div>

                <div className="flex flex-col space-y-1.5">
                  <Label
                    htmlFor="stumpings"
                    className="flex items-center gap-1.5"
                  >
                    <ThumbsUp className="h-4 w-4 text-purple-600" />
                    Stumpings
                  </Label>
                  <Input
                    id="stumpings"
                    name="stumpings"
                    type="number"
                    value={editFormData.stumpings}
                    onChange={handleInputChange}
                    min="0"
                    className="col-span-3"
                  />
                </div>

                <div className="flex flex-col space-y-1.5">
                  <Label
                    htmlFor="runouts"
                    className="flex items-center gap-1.5"
                  >
                    <Target className="h-4 w-4 text-orange-600" />
                    Runouts
                  </Label>
                  <Input
                    id="runouts"
                    name="runouts"
                    type="number"
                    value={editFormData.runouts}
                    onChange={handleInputChange}
                    min="0"
                    className="col-span-3"
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="gap-1">
                <Save className="h-4 w-4" />
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
