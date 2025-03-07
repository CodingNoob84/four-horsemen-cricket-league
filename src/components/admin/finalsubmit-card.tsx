import { useMutation } from "convex/react";
import { Loader2 } from "lucide-react"; // Import a spinner icon
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";

export const FinalSubmit = () => {
  const { matchId } = useParams();
  const [loading, setLoading] = useState(false);
  const updateUserPoints = useMutation(api.userspoints.updateUserPoints);

  const handleSubmit = async () => {
    if (!matchId) {
      alert("Match ID is missing!");
      return;
    }

    setLoading(true);
    try {
      console.log("Updating user points for matchId:", matchId);
      await updateUserPoints({ matchId: matchId as Id<"matches"> });
      toast.success("Match Data and User Points have been updated");
    } catch (error) {
      console.error("Error updating user points:", error);
      toast.error("Failed to update user points. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="overflow-hidden border-2 rounded-xl mb-2">
      <CardContent className="mt-2 pb-2 flex flex-col gap-2">
        <div className="flex justify-center items-center text-lg text-center">
          After updating the team winner and players data, click below to update
          the users points table.
        </div>
        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="flex items-center justify-center"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            "Final Submit"
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
