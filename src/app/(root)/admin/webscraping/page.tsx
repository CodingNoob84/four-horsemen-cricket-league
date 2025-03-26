"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AllMatches } from "@/components/webscraping/all-matches";
import { LastMatchData } from "@/components/webscraping/last-match";

export default function WebScrapingPage() {
  return (
    <div className="m-4">
      <Tabs defaultValue="account" className="">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="account">Last Match</TabsTrigger>
          <TabsTrigger value="password">All Matches</TabsTrigger>
        </TabsList>
        <TabsContent value="account">
          <LastMatchData />
        </TabsContent>
        <TabsContent value="password">
          <AllMatches />
        </TabsContent>
      </Tabs>
    </div>
  );
}
