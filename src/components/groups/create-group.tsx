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
import { PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "../../../convex/_generated/api";

export function CreateGroupButton() {
  const createGroup = useMutation(api.groups.createGroup);
  const [open, setOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(false); // Loading state
  const router = useRouter();

  const handleCreateGroup = async () => {
    if (!groupName.trim()) return; // Prevent submission if group name is empty

    setLoading(true); // Start loading
    try {
      const data = await createGroup({ name: groupName });
      toast.success("Group has been created");
      setOpen(false);
      router.push(`/groups/${data.groupId}`);
    } catch (error) {
      console.error("Failed to create group:", error);
      toast.error("Failed to create group");
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto" size="lg">
          <PlusCircle className="mr-2 h-5 w-5" />
          Create Group
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Group</DialogTitle>
          <DialogDescription>
            Create a new fantasy cricket group and invite your friends to join.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="col-span-3"
              placeholder="Enter group name"
              disabled={loading} // Disable input while loading
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            onClick={handleCreateGroup}
            disabled={!groupName.trim() || loading} // Disable button while loading
          >
            {loading ? "Creating..." : "Create Group"} {/* Show loading text */}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
