"use client";
import IntroCard from "@/components/auto-setup/intro-card";
import TeamsOverview from "@/components/auto-setup/teamplayer-overview";
import TeamsCard from "@/components/auto-setup/teams-card";
import { LoadingScreen } from "@/components/common/loading-screen";
import { useAutoSetup } from "@/hooks/convex-hooks";
import { useState } from "react";

type CardSelectionTypes = "intro" | "teams" | "players";

export default function AutoSetupPage() {
  const { userAutoSetup, loading } = useAutoSetup();
  console.log("userAutoSetup", userAutoSetup);
  const [currentCard, setCurrentCard] = useState<CardSelectionTypes>("intro");

  const handleCardSelection = (option: CardSelectionTypes) => {
    setCurrentCard(option);
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {currentCard === "intro" && (
          <IntroCard
            hasTeamSetup={userAutoSetup?.hasTeamSetup ?? false}
            hasPlayersSetup={userAutoSetup?.hasPlayerSetup ?? false}
            handleCardSelection={handleCardSelection}
          />
        )}
        {currentCard === "teams" && (
          <TeamsCard
            initTeams={userAutoSetup?.orderedTeams ?? []}
            handleCardSelection={handleCardSelection}
          />
        )}
        {currentCard === "players" && (
          <TeamsOverview
            teams={userAutoSetup?.orderedTeams ?? []}
            userTeamPlayers={userAutoSetup?.userTeamPlayers ?? []}
            onBack={() => setCurrentCard("intro")}
          />
        )}
      </div>
    </main>
  );
}
