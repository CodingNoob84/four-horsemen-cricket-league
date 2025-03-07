"use client";

import { PastMatches, UpcomingMatches } from "@/components/admin/admin-matches";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield } from "lucide-react";

export default function AdminMatchesPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="px-4 mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Match Management</h1>
          <Badge className="bg-red-100 text-red-800 border border-red-300 px-3 py-1 flex items-center">
            <Shield className="w-4 h-4 mr-1" />
            Admin
          </Badge>
        </div>

        <Tabs defaultValue="upcoming" className="mb-6">
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
        </Tabs>
      </div>
    </div>
  );
}
