"use client";

import { useQuery } from "convex/react";
import { Loader, Users } from "lucide-react";
import Link from "next/link";
import { api } from "../../../convex/_generated/api";

export function GroupsList() {
  const groups = useQuery(api.groups.getUserGroups);
  console.log("groups", groups);
  if (groups == undefined) {
    return (
      <div className="flex justify-center items-center m-auto">
        <Loader className="animate-spin" />
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {groups &&
        groups.map((group) => (
          <Link
            href={`/groups/${group._id}`}
            key={group._id}
            className="block transition-transform hover:scale-[1.02]"
          >
            <div className="border rounded-md shadow-md flex flex-col gap-2 p-2">
              <div className="text-lg font-bold">{group.name}</div>
              <div className="flex flex-row gap-2">
                {" "}
                <Users className="h-4 w-4 mr-1" />
                {group.userCount} members
              </div>
            </div>
          </Link>
        ))}
    </div>
  );
}
