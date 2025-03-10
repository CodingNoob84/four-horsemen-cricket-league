"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Group } from "@/types";
import { useMutation } from "convex/react";
import { Check, Copy, Info, LogOut, Trash2, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "../../../convex/_generated/api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { Badge } from "../ui/badge";

export function GroupHeader({ group }: { group: Group }) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const deleteGroup = useMutation(api.groups.deleteGroup);
  const leaveGroup = useMutation(api.groups.leaveGroup);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [loadingLeave, setLoadingLeave] = useState(false);

  const copyJoinCode = () => {
    navigator.clipboard.writeText(group.groupCode);
    setCopied(true);
    toast.info("Join code copied!", {
      description: "The join code has been copied to your clipboard.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  // Handle Group Deletion
  const handleDeleteGroup = async () => {
    setLoadingDelete(true);
    try {
      await deleteGroup({ groupId: group.groupId });
      toast.success("Group deleted successfully");
      router.push("/groups");
    } catch (error) {
      console.log("error", error);
      toast.error("Error deleting group", {
        description: "Error while deleting group",
      });
    } finally {
      setLoadingDelete(false);
    }
  };

  // Handle Leaving Group
  const handleLeaveGroup = async () => {
    setLoadingLeave(true);
    try {
      await leaveGroup({ groupId: group.groupId });
      toast.success("You have left the group");
      router.push("/groups");
    } catch (error) {
      console.log("error", error);
      toast.error("Error leaving group", {
        description: "Error while Leaving group",
      });
    } finally {
      setLoadingLeave(false);
    }
  };

  return (
    <div className="mb-6">
      <div className="flex flex-col items-start gap-4 mb-6">
        <div className="flex flex-col gap-2">
          <div className="flex flex-col sm:flex-row justify-between gap-2">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              {group.groupName}
            </h1>
            <div>
              <Badge variant="outline" className="ml-2 text-sm font-normal">
                <Users className="h-3 w-3 mr-1" />
                {group.members.length} members
              </Badge>
            </div>
          </div>

          <p className="text-muted-foreground mt-1">
            {
              "A group of cricket enthusiasts who love fantasy cricket and discussing match strategies."
            }
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {group.isOwner ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={loadingDelete}
                >
                  {loadingDelete ? (
                    "Deleting..."
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Group
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Group</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this group? This action
                    cannot be undone, and all group data will be permanently
                    lost.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteGroup}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    disabled={loadingDelete}
                  >
                    {loadingDelete ? "Deleting..." : "Delete Group"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" disabled={loadingLeave}>
                  {loadingLeave ? (
                    "Leaving..."
                  ) : (
                    <>
                      <LogOut className="h-4 w-4 mr-2" />
                      Leave Group
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Leave Group</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to leave this group? You&apos;ll need
                    a join code to rejoin.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleLeaveGroup}
                    disabled={loadingLeave}
                  >
                    {loadingLeave ? "Leaving..." : "Leave Group"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      <Card className="mb-8 bg-primary/5">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex flex-col sm:max-w-[50%]">
              <h3 className="font-medium flex items-center">
                <Info className="h-4 w-4 mr-2 text-muted-foreground" />
                Group Join Code
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Share this code with friends and family to invite them to join
                your group.
              </p>
            </div>
            <div className="flex flex-row items-center gap-2 w-full sm:w-auto">
              <code className="bg-background px-3 py-2 rounded-md border text-sm font-mono">
                {group.groupCode}
              </code>
              <Button
                variant="outline"
                size="icon"
                onClick={copyJoinCode}
                className="shrink-0"
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
