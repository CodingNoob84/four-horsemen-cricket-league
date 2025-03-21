"use client";

import { PastMatches } from "@/components/admin/admin-matches";
import { Breadcrumbs } from "@/components/common/breadcrumbs";

export default function AdminMatchesPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="px-4 mx-auto">
        <Breadcrumbs title="MatchManagement" isAdmin={true} backLink="/admin" />

        <div>
          <PastMatches />
        </div>
        {/* <Tabs defaultValue="upcoming" className="mb-6">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="upcoming">Upcoming Matches</TabsTrigger>
            <TabsTrigger value="past">Completed Matches</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            <div className="space-y-8">
              <UpcomingMatches />
            </div>
          </TabsContent>

          <TabsContent value="past">
            <div className="space-y-8">
              <PastMatches />
            </div>
          </TabsContent>
        </Tabs> */}
      </div>
    </div>
  );
}
