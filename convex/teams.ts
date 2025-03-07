import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getIPLTeams = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("teams").collect();
  },
});

export const updateTeamsSetup = mutation({
  args: { orderedTeams: v.array(v.id("teams")) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return;
    const existingSetup = await ctx.db
      .query("userTeamsSetup")
      .withIndex("user_setup", (q) => q.eq("userId", userId))
      .unique();

    if (existingSetup) {
      await ctx.db.patch(existingSetup._id, { teams: args.orderedTeams });
    } else {
      // Create new user team setup entry
      await ctx.db.insert("userTeamsSetup", {
        userId,
        teams: args.orderedTeams,
      });
    }
  },
});

export const getUserOrderedTeams = query({
  args: {},
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return;

    // Fetch all teams
    const teams = await ctx.db.query("teams").collect();

    // Fetch user-specific team order
    const userTeamSetup = await ctx.db
      .query("userTeamsSetup")
      .withIndex("user_setup", (q) => q.eq("userId", userId))
      .first();

    // Check if the user has a stored team order
    const hasUserSetup = !!userTeamSetup;

    // If user has a setup, reorder teams based on saved order
    let orderedTeams = teams;
    if (userTeamSetup && userTeamSetup.teams) {
      const teamOrderMap = new Map(
        userTeamSetup.teams.map((teamId: string, index: number) => [
          teamId,
          index,
        ])
      );
      orderedTeams = teams.sort(
        (a, b) =>
          (teamOrderMap.get(a._id) ?? Infinity) -
          (teamOrderMap.get(b._id) ?? Infinity)
      );
    }

    return {
      orderedTeams,
      hasUserSetup,
    };
  },
});

export const getUserTeamPlayers = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return;

    // Fetch all teams
    const teams = await ctx.db.query("teams").collect();

    // Fetch user-specific player setup
    const userTeamPlayers = await ctx.db
      .query("userPlayersSetup")
      .withIndex("user_team_players", (q) => q.eq("userId", userId))
      .collect();

    return {
      teams,
      userTeamPlayers,
      hasUserSetup: userTeamPlayers.length > 0, // Boolean flag if setup exists
    };
  },
});

export const getUserAutoSetup = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return;

    // Fetch all teams
    const teams = await ctx.db.query("teams").collect();

    // Fetch user-specific team order
    const userTeamSetup = await ctx.db
      .query("userTeamsSetup")
      .withIndex("user_setup", (q) => q.eq("userId", userId))
      .first();

    // Check if user has a stored team order
    const hasTeamSetup = !!userTeamSetup;

    // Order teams based on saved order
    let orderedTeams = teams;
    if (userTeamSetup && userTeamSetup.teams) {
      const teamOrderMap = new Map(
        userTeamSetup.teams.map((teamId: string, index: number) => [
          teamId,
          index,
        ])
      );
      orderedTeams = teams.sort(
        (a, b) =>
          (teamOrderMap.get(a._id) ?? Infinity) -
          (teamOrderMap.get(b._id) ?? Infinity)
      );
    }

    // Fetch user-specific player setup
    const userTeamPlayers = await ctx.db
      .query("userPlayersSetup")
      .withIndex("user_team_players", (q) => q.eq("userId", userId))
      .collect();

    return {
      orderedTeams,
      hasTeamSetup,
      userTeamPlayers,
      hasPlayerSetup: userTeamPlayers.length == 10,
    };
  },
});

export const getAllPlayersByTeamId = query({
  args: { teamId: v.id("teams") },
  handler: async (ctx, { teamId }) => {
    return await ctx.db
      .query("players")
      .withIndex("by_team", (q) => q.eq("teamId", teamId))
      .collect();
  },
});

export const updatePlayersByTeam = mutation({
  args: {
    teamId: v.id("teams"),
    players: v.array(v.id("players")),
  },
  handler: async (ctx, { teamId, players }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }

    // Find existing record for this user and team
    const existingRecord = await ctx.db
      .query("userPlayersSetup")
      .withIndex("user_team_players", (q) =>
        q.eq("userId", userId).eq("teamId", teamId)
      )
      .unique(); // Ensures we only get one record

    if (existingRecord) {
      // Update existing record
      await ctx.db.patch(existingRecord._id, { players });
    } else {
      // Create new record if none exists
      await ctx.db.insert("userPlayersSetup", {
        userId,
        teamId,
        players,
      });
    }
  },
});

export const submitAutoSetupBoolean = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }

    // Fetch the user record
    const user = await ctx.db.get(userId);

    if (!user) {
      throw new Error("User not found");
    }

    // Update `isAutoSetupDone` to true
    await ctx.db.patch(user._id, { isAutoSetupDone: true });
  },
});

