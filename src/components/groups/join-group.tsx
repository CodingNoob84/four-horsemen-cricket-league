"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation } from "convex/react";
import { UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner"; // Import Sonner for toast notifications
import { api } from "../../../convex/_generated/api";

export function JoinGroupButton() {
  const joinGroup = useMutation(api.groups.joinGroup);
  const [open, setOpen] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false); // Loading state
  const router = useRouter();

  const handleJoinGroup = async () => {
    if (!joinCode.trim()) return; // Prevent submission if join code is empty

    setLoading(true); // Start loading
    try {
      // Call the joinGroup mutation
      const result = await joinGroup({ code: joinCode });
      if (result.success) {
        toast.success("Successfully joined the group!");
        setOpen(false);
        router.push(`/groups/${result.groupId}`);
      } else {
        toast.error(
          "Failed to join the group. Please check the code and try again."
        );
      }
      // Show success toast
    } catch (error) {
      // Show error toast
      toast.error(
        "Failed to join the group. Please check the code and try again."
      );
      console.error("Failed to join group:", error);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full sm:w-auto" size="lg">
          <UserPlus className="mr-2 h-5 w-5" />
          Join Group
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Join Existing Group</DialogTitle>
          <DialogDescription>
            Enter the group code to join an existing fantasy cricket group.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="code" className="text-right">
              Code
            </Label>
            <Input
              id="code"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              className="col-span-3"
              placeholder="Enter join code"
              disabled={loading} // Disable input while loading
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            onClick={handleJoinGroup}
            disabled={!joinCode.trim() || loading} // Disable button while loading
          >
            {loading ? "Joining..." : "Join Group"} {/* Show loading text */}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
