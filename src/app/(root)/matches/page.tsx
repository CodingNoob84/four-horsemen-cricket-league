"use client";

import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { AllMatches } from "@/components/matches/all-matches";

export default function MatchesPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container px-4 mx-auto">
        <Breadcrumbs title="IPL 2025 Matches" isAdmin={false} backLink={"/"} />

        <AllMatches />
      </div>
    </div>
  );
}
