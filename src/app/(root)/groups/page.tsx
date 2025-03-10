"use client";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { CreateGroupButton } from "@/components/groups/create-group";
import { GroupsList } from "@/components/groups/groups-list";
import { JoinGroupButton } from "@/components/groups/join-group";

export default function GroupsPage() {
  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <Breadcrumbs title="Groups" isAdmin={false} backLink="/" />
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <CreateGroupButton />
        <JoinGroupButton />
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Your Groups</h2>
        <GroupsList />
      </div>
    </div>
  );
}
