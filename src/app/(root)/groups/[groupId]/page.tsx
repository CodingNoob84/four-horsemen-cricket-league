"use client";

import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { LoadingScreen } from "@/components/common/loading-screen";
import { GroupHeader } from "@/components/groups/group-header";
import { GroupTabs } from "@/components/groups/group-tabs";
import { useQuery } from "convex/react";
import { useParams } from "next/navigation";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";

export default function GroupDetailsPage() {
  const { groupId } = useParams();
  const group = useQuery(api.groups.getGroupDetails, {
    groupId: groupId as Id<"groups">,
  });
  const pastMatches = useQuery(api.matches.pastMatchesSelect);

  if (group == undefined) {
    return <LoadingScreen />;
  }

  return (
    <main className="container mx-auto px-4 py-6">
      <Breadcrumbs title="back to Groups" isAdmin={false} backLink="/groups" />
      <GroupHeader group={group} />

      {pastMatches && <GroupTabs group={group} pastMatches={pastMatches} />}
    </main>
  );
}
