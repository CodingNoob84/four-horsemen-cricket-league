"use client";

import { UpcomingMatchForHome } from "@/components/betting/upcoming-match";
import { UserCard } from "@/components/betting/user-card";
import { Breadcrumbs } from "@/components/common/breadcrumbs";

export default function BettingMatchesPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container px-4 mx-auto">
        <Breadcrumbs title="IPL 2025 Matches" isAdmin={false} backLink={"/"} />
        <UserCard />
        <UpcomingMatchForHome />
      </div>
    </div>
  );
}
