"use client";

import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { LoadingScreen } from "@/components/common/loading-screen";
import { AllPlayers } from "@/components/matches/allplayers";
import { MatchDetailCard } from "@/components/matches/matchdetail-card";
import { SelectionCard } from "@/components/matches/selection-card";
import { useMatchById } from "@/hooks/convex-hooks";
import { Player } from "@/types";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Id } from "../../../../../convex/_generated/dataModel";

function getPlayers(
  playerIds: Id<"players">[] | undefined,
  homeTeamPlayers: Player[],
  awayTeamPlayers: Player[]
): Player[] {
  if (!playerIds) return []; // Avoid errors when playerIds is undefined
  return [...homeTeamPlayers, ...awayTeamPlayers].filter((player) =>
    playerIds.includes(player._id)
  );
}

export default function MatchDetailsPage() {
  const { matchId } = useParams();
  const { match, loading } = useMatchById(matchId as Id<"matches">);
  console.log("render");
  // State for selected players (initialize only after data is available)
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);

  // Update selectedPlayers when match data is loaded
  useEffect(() => {
    if (match) {
      setSelectedPlayers(
        getPlayers(
          match.fantasySelection?.selectedPlayers,
          match.homeTeamPlayers || [],
          match.awayTeamPlayers || []
        )
      );
    }
  }, [match]);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container px-4 mx-auto">
        <Breadcrumbs
          title="Player Selection"
          isAdmin={false}
          backLink={"/matches"}
        />
        {match && (
          <>
            {/* Match Details */}
            <MatchDetailCard matchDetail={match.matchDetail} />

            <div className="space-y-6">
              {/* Selected Players */}
              <SelectionCard
                homeTeamName={match.matchDetail.homeTeam?.shortForm || ""}
                homeTeamId={match.matchDetail.homeTeamId}
                awayTeamName={match.matchDetail.awayTeam?.shortForm || ""}
                awayTeamId={match.matchDetail.oppTeamId}
                selectedPlayers={selectedPlayers}
                setSelectedPlayers={setSelectedPlayers}
                selectedTeamId={match.fantasySelection?.selectedTeam as string}
                selectedCaptainId={match.fantasySelection?.captain as string}
                canSubmit={match.matchDetail.canSubmit}
              />

              {/* All Players */}
              <AllPlayers
                homeTeamName={match.matchDetail.homeTeam?.shortForm || ""}
                homeTeamPlayers={match.homeTeamPlayers}
                awayTeamName={match.matchDetail.awayTeam?.shortForm || ""}
                awayTeamPlayers={match.awayTeamPlayers}
                selectedPlayers={selectedPlayers}
                setSelectedPlayers={setSelectedPlayers}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
