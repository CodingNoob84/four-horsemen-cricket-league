import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "../ui/button";

export const Scheduler = () => {
  const getMatch = useQuery(api.admin.getMatchFiveHrsAgo);
  console.log("get", getMatch);
  return (
    <div>
      <Button>Click me</Button>
    </div>
  );
};
