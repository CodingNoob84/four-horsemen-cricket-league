"use client";
import { PeopleList } from "@/components/betting/people-list";
import { PlaceYourBet } from "@/components/betting/place-bet";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { LoadingScreen } from "@/components/common/loading-screen";
import { MatchDetailCard } from "@/components/matches/matchdetail-card";
import { useQuery } from "convex/react";
import { useParams } from "next/navigation";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";

export default function MatchDetailsPage() {
  const { matchId } = useParams();
  const match = useQuery(api.betting.getMatchById, {
    matchId: matchId as Id<"matches">,
  });

  if (match == undefined) {
    return <LoadingScreen />;
  }

  const matchDetail = {
    _id: match._id,
    _creationTime: match._creationTime,
    datetimeUtc: match.datetimeUtc,
    venue: match.venue,
    homeTeam: match.homeTeam,
    awayTeam: match.awayTeam,
  };
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container px-4 mx-auto">
        <Breadcrumbs
          title="Betting Selection"
          isAdmin={false}
          backLink={"/betting"}
        />
        {match && (
          <>
            <MatchDetailCard matchDetail={matchDetail} />
            <div className="space-y-6">
              <PlaceYourBet match={match} />
              <PeopleList />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
