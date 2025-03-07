"use client";

import { AllMatches } from "@/components/matches/all-matches";

export default function MatchesPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container px-4 mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          IPL 2025 Matches
        </h1>

        <AllMatches />
      </div>
    </div>
  );
}
