import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { nanoid } from "nanoid";
import { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";

export const createGroup = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, { name }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }
    const code = nanoid(12); // Generate a unique code
    const groupId = await ctx.db.insert("groups", {
      name: name,
      code,

      createdBy: userId,
    });

    // Add the creator to the user_groups table
    await ctx.db.insert("user_groups", {
      userId: userId,
      groupId,
    });

    return { groupId, code };
  },
});

export const joinGroup = mutation({
  args: {
    code: v.string(), // Group code
  },
  handler: async (ctx, { code }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }
    // Find the group by its code
    const group = await ctx.db
      .query("groups")
      .withIndex("by_code", (q) => q.eq("code", code))
      .unique();

    if (!group) {
      return { success: false, groupId: null };
    }

    // Check if the user is already in the group
    const existingEntry = await ctx.db
      .query("user_groups")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("groupId"), group._id))
      .first();

    if (existingEntry) {
      return { groupId: existingEntry._id };
    }

    // Add the user to the group
    await ctx.db.insert("user_groups", {
      userId: userId,
      groupId: group._id,
    });

    return { success: true, groupId: group._id };
  },
});

export const getUserGroups = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }
    // Find all user_group entries for the user
    const userGroups = await ctx.db
      .query("user_groups")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    if (!userGroups) {
      return [];
    }

    // Fetch the corresponding groups and count the number of users in each group
    const groupsWithUserCount = await Promise.all(
      userGroups.map(async (userGroup) => {
        const group = await ctx.db.get(userGroup.groupId);

        // Count the number of users in the group
        const userCount = await ctx.db
          .query("user_groups")
          .withIndex("by_groupId", (q) => q.eq("groupId", userGroup.groupId))
          .collect()
          .then((entries) => entries.length);

        return {
          ...group,
          userCount, // Add the user count to the group object
        };
      })
    );

    return groupsWithUserCount;
  },
});

export const getGroupDetailsPast = query({
  args: {
    groupId: v.id("groups"),
  },
  handler: async (ctx, args) => {
    // Fetch group details
    const group = await ctx.db.get(args.groupId);
    if (!group) {
      throw new Error("Group not found");
    }

    // Fetch all members of the group
    const userGroups = await ctx.db
      .query("user_groups")
      .withIndex("by_groupId", (q) => q.eq("groupId", args.groupId))
      .collect();

    // Get the current date and time in ISO format
    const now = new Date().toISOString();

    // Fetch the most recent past match (before the current time)
    const pastRecentMatch = await ctx.db
      .query("matches")
      .withIndex("by_datetime", (q) => q.lt("datetimeUtc", now)) // lt = less than (past matches)
      .order("desc") // Sort by datetimeUtc in descending order
      .first(); // Get the first match (most recent past match)

    if (!pastRecentMatch) {
      throw new Error("No past matches found");
    }

    // Fetch details of each member, their total points, and points for the past recent match
    const membersWithPoints = await Promise.all(
      userGroups.map(async (userGroup) => {
        const user = await ctx.db.get(userGroup.userId);
        if (!user) {
          throw new Error("User not found");
        }

        // Fetch total points for the user
        const totalPointsEntry = await ctx.db
          .query("userTotalPoints")
          .withIndex("userId", (q) => q.eq("userId", userGroup.userId))
          .unique();

        // Fetch points for the past recent match
        const pastMatchPointsEntry = await ctx.db
          .query("userMatchPoints")
          .withIndex("userId_matchId", (q) =>
            q.eq("userId", userGroup.userId).eq("matchId", pastRecentMatch._id)
          )
          .unique();

        return {
          userId: user._id,
          name: user.name || "Unknown",
          email: user.email || "",

          totalPoints: totalPointsEntry ? totalPointsEntry.totalPoints : 0,
          pastMatchPoints: pastMatchPointsEntry
            ? pastMatchPointsEntry.points
            : 0,
        };
      })
    );

    // Return group details with members, their total points, and past recent match points
    return {
      ...group,
      pastRecentMatch: {
        matchId: pastRecentMatch._id,
        matchNumber: pastRecentMatch.matchNumber,
        datetimeUtc: pastRecentMatch.datetimeUtc,
        venue: pastRecentMatch.venue,
      },
      members: membersWithPoints,
    };
  },
});

export const getGroupDetails = query({
  args: {
    groupId: v.id("groups"),
  },
  handler: async (ctx, args) => {
    // 1. Fetch group
    const group = await ctx.db.get(args.groupId);
    if (!group) {
      throw new Error("Group not found");
    }

    // 2. Get current user
    const userId = await getAuthUserId(ctx);
    const isOwner = userId === group.createdBy;

    // 3. Fetch all group members
    const userGroups = await ctx.db
      .query("user_groups")
      .withIndex("by_groupId", (q) => q.eq("groupId", args.groupId))
      .collect();

    // 4. Fetch the most recent past match
    const now = new Date().toISOString();
    const pastRecentMatch = await ctx.db
      .query("matches")
      .withIndex("by_datetime", (q) => q.lt("datetimeUtc", now))
      .order("desc")
      .first();

    // 5. Prepare team data if match exists
    let matchInfo = null;
    if (pastRecentMatch) {
      const homeTeam = await ctx.db.get(
        pastRecentMatch.homeTeamId as Id<"teams">
      );
      const awayTeam = await ctx.db.get(
        pastRecentMatch.oppTeamId as Id<"teams">
      );

      if (homeTeam && awayTeam) {
        matchInfo = {
          matchId: pastRecentMatch._id,
          matchNumber: pastRecentMatch.matchNumber,
          datetimeUtc: pastRecentMatch.datetimeUtc,
          venue: pastRecentMatch.venue,
          homeTeam,
          awayTeam,
        };
      }
    }

    // 6. Gather member data: user info, total points, and past match points (if match exists)
    let members = await Promise.all(
      userGroups.map(async ({ userId: memberId }) => {
        const user = await ctx.db.get(memberId);
        if (!user) return null;

        const totalPointsEntry = await ctx.db
          .query("userTotalPoints")
          .withIndex("userId", (q) => q.eq("userId", memberId))
          .unique();

        let matchPoints = 0;
        if (matchInfo) {
          const pastMatchPointsEntry = await ctx.db
            .query("userMatchPoints")
            .withIndex("userId_matchId", (q) =>
              q.eq("userId", memberId).eq("matchId", matchInfo.matchId)
            )
            .unique();

          matchPoints = pastMatchPointsEntry?.points ?? 0;
        }

        return {
          userId: user._id,
          isUser: user._id === userId,
          name: user.name || "Unknown",
          email: user.email || "",
          image: user.image || "",
          totalPoints: totalPointsEntry?.totalPoints ?? 0,
          matchPoints,
        };
      })
    );

    // Remove nulls safely
    members = members.filter((m): m is NonNullable<typeof m> => m !== null);

    // 7. Final response
    return {
      groupId: group._id,
      groupName: group.name,
      groupCode: group.code,
      isOwner,
      pastRecentMatch: matchInfo, // null if no valid past match
      members: members ?? [],
    };
  },
});

export const getMatchPointsById = query({
  args: { matchId: v.id("matches"), groupId: v.id("groups") },
  handler: async (ctx, { matchId, groupId }) => {
    // Authenticate user
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User is not authenticated");
    }

    // Validate group existence
    const group = await ctx.db.get(groupId);
    if (!group) {
      throw new Error("Group not found");
    }

    // Fetch all users in the group
    const userGroups = await ctx.db
      .query("user_groups")
      .withIndex("by_groupId", (q) => q.eq("groupId", groupId))
      .collect();

    if (!userGroups.length) {
      throw new Error("No users found in this group.");
    }

    // Fetch match details
    const match = await ctx.db.get(matchId);
    if (!match) {
      throw new Error("Match not found");
    }

    // Fetch home and away team details
    const homeTeam = await ctx.db.get(match.homeTeamId as Id<"teams">);
    const awayTeam = await ctx.db.get(match.oppTeamId as Id<"teams">);

    if (!homeTeam || !awayTeam) {
      throw new Error("Team details not found");
    }

    // Fetch match points for each user in the group
    const members = await Promise.all(
      userGroups.map(async (userGroup) => {
        const user = await ctx.db.get(userGroup.userId);
        if (!user) {
          throw new Error("User not found");
        }

        // Fetch match points for the user
        const matchPointsEntry = await ctx.db
          .query("userMatchPoints")
          .withIndex("userId_matchId", (q) =>
            q.eq("userId", userGroup.userId).eq("matchId", matchId)
          )
          .unique();

        return {
          userId: user._id,
          isUser: user._id === userId,
          name: user.name || "Unknown",
          email: user.email || "",
          image: user.image || "", // Assuming the `users` table has an `image` field
          matchPoints: matchPointsEntry ? matchPointsEntry.points : 0,
        };
      })
    );

    return {
      matchId: match._id,
      matchNumber: match.matchNumber,
      datetimeUtc: match.datetimeUtc,
      venue: match.venue,
      homeTeam: homeTeam,
      awayTeam: awayTeam,
      members, // Array of members with their match points
    };
  },
});

export const deleteGroup = mutation({
  args: { groupId: v.id("groups") },
  handler: async (ctx, { groupId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User is not authenticated");
    }

    // Fetch the group
    const group = await ctx.db.get(groupId);
    if (!group) {
      throw new Error("Group not found");
    }

    // Ensure only the creator can delete the group
    if (group.createdBy !== userId) {
      throw new Error("Only the group creator can delete this group");
    }

    // Delete all user-group relationships
    const userGroups = await ctx.db
      .query("user_groups")
      .withIndex("by_groupId", (q) => q.eq("groupId", groupId))
      .collect();

    for (const userGroup of userGroups) {
      await ctx.db.delete(userGroup._id);
    }

    // Delete the group itself
    await ctx.db.delete(groupId);

    return { success: true, message: "Group deleted successfully" };
  },
});

export const leaveGroup = mutation({
  args: { groupId: v.id("groups") },
  handler: async (ctx, { groupId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User is not authenticated");
    }

    // Fetch the group
    const group = await ctx.db.get(groupId);
    if (!group) {
      throw new Error("Group not found");
    }

    // Prevent the creator from leaving without deleting the group
    if (group.createdBy === userId) {
      throw new Error(
        "Group creator cannot leave the group. Delete the group instead."
      );
    }

    // Find user-group relationship
    const userGroup = await ctx.db
      .query("user_groups")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("groupId"), groupId))
      .first();

    if (!userGroup) {
      throw new Error("User is not part of this group");
    }

    // Remove user from the group
    await ctx.db.delete(userGroup._id);

    return { success: true, message: "Successfully left the group" };
  },
});
