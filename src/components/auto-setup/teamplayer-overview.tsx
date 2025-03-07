import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Team, TeamFavPlayers } from "@/types";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Trophy,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Id } from "../../../convex/_generated/dataModel";
import PlayersCard from "./players-card";

interface TeamsOverviewProps {
  teams: Team[];
  userTeamPlayers: TeamFavPlayers[];
  onBack: () => void;
}

export default function TeamsOverview({
  teams,
  userTeamPlayers,
  onBack,
}: TeamsOverviewProps) {
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  const handleTeamSelection = (team: Team) => {
    setSelectedTeam(team);
  };

  return (
    <>
      {selectedTeam ? (
        <PlayersCard
          selectedTeam={selectedTeam}
          clearSelectedTeam={() => setSelectedTeam(null)}
          selectedPlayersId={
            userTeamPlayers.find((team) => team.teamId === selectedTeam._id)
              ?.players || []
          }
        />
      ) : (
        <TeamsDisplay
          teams={teams}
          userTeamPlayers={userTeamPlayers}
          handleTeamSelection={handleTeamSelection}
          onBack={onBack}
        />
      )}
    </>
  );
}

export const TeamsDisplay = ({
  teams,
  userTeamPlayers,
  handleTeamSelection,
  onBack,
}: {
  teams: Team[];
  userTeamPlayers: TeamFavPlayers[];
  handleTeamSelection: (team: Team) => void;
  onBack: () => void;
}) => {
  const getTeamStatus = (teamId: Id<"teams">) => {
    const selectedCount: number =
      userTeamPlayers.find((team) => team.teamId === teamId)?.players.length ||
      0;

    if (selectedCount === 0) {
      return {
        status: "Not Started",
        color: "bg-yellow-100 text-yellow-700",
        icon: <Clock className="h-3.5 w-3.5" />,
      };
    } else if (selectedCount === 1) {
      return {
        status: "In Progress",
        color: "bg-blue-100 text-blue-700",
        icon: <AlertCircle className="h-3.5 w-3.5" />,
      };
    } else {
      return {
        status: "Completed",
        color: "bg-green-100 text-green-700",
        icon: <CheckCircle2 className="h-3.5 w-3.5" />,
      };
    }
  };
  return (
    <Card className="w-full max-w-4xl mx-auto shadow-lg animate-fade-in">
      <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-t-lg p-4">
        <div className="flex items-center justify-between flex-wrap">
          {/* Back Button */}
          <Button
            variant="ghost"
            className="text-white hover:text-white/90 flex items-center"
            onClick={() => onBack()}
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            Back
          </Button>

          {/* Title Centered */}
          <CardTitle className="text-xl md:text-2xl font-bold flex justify-center items-center gap-2">
            <Trophy className="h-6 w-6" />
            Select Team Players
          </CardTitle>

          {/* Spacer for Alignment */}
          <div className="w-[70px] md:w-[89px]" />
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teams.map((team) => {
            const selectedCount: number =
              userTeamPlayers.find((selteam) => selteam.teamId === team._id)
                ?.players.length || 0;
            const status = getTeamStatus(team._id);

            return (
              <Button
                key={team._id}
                variant="outline"
                className="h-auto p-4 hover:bg-accent/50"
                onClick={() => handleTeamSelection(team)}
              >
                <div className="flex flex-col w-full space-y-4">
                  <div className="flex items-start justify-between w-full">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 relative">
                        <Image
                          src={team.image}
                          alt={`${team.shortForm} logo`}
                          fill
                          className="object-contain"
                        />
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold text-md">
                          {team.shortForm}
                        </h3>
                        <div
                          className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium ${status.color}`}
                        >
                          {status.icon}
                          {status.status}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="w-full space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Players Selected
                      </span>
                      <span className="font-medium">{selectedCount}/2</span>
                    </div>
                    <Progress value={selectedCount * 50} className="h-2" />
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
