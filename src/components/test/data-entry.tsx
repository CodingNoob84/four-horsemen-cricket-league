import { useMatchPlayersDataById } from "@/hooks/convex-hooks";
import { Id } from "../../../convex/_generated/dataModel";

export const DataEntry = () => {
  const matchId = "";

  const { matchPlayerData, loading } = useMatchPlayersDataById(
    matchId as Id<"matches">
  );
  console.log("data", matchPlayerData, loading);
  return <div>Hi</div>;
};
