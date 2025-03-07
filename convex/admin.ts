import { v } from "convex/values";
import { internalMutation, mutation } from "./_generated/server";

export const submitTeamData = mutation({
  args: {
    matchId: v.id("matches"),
    winnerId: v.optional(v.id("teams")),
    teams: v.array(v.object({ teamId: v.id("teams"), teamPoints: v.number() })),
  },
  handler: async (ctx, { matchId, winnerId, teams }) => {
    const match = await ctx.db.get(matchId);
    if (!match) {
      throw new Error("Match not found");
    }

    // Update the match details
    await ctx.db.patch(matchId, {
      winner: winnerId, // Store the winning team ID or null if no result
      hasPlayed: true, // Mark match as completed
      hasResult: !!winnerId, // If a winner is provided, hasResult = true; otherwise false
    });

    // Process team points: Insert if not exists, Update if exists
    for (const team of teams) {
      const existingTeam = await ctx.db
        .query("matchTeamData")
        .filter((q) => q.eq(q.field("matchId"), matchId))
        .filter((q) => q.eq(q.field("teamId"), team.teamId))
        .first();

      if (existingTeam) {
        // Update existing record
        await ctx.db.patch(existingTeam._id, {
          teamPoints: team.teamPoints,
        });
      } else {
        // Insert new record
        await ctx.db.insert("matchTeamData", {
          matchId,
          teamId: team.teamId,
          teamPoints: team.teamPoints,
        });
      }
    }

    return {
      success: true,
      message: "Match winner and team points updated successfully",
    };
  },
});

export const submitSinglePlayerData = mutation({
  args: {
    matchId: v.id("matches"),
    playerId: v.id("players"),
    isPlayed: v.boolean(),
    runs: v.number(),
    wickets: v.number(),
    catches: v.number(),
    stumpings: v.number(),
    runouts: v.number(),
    playerPoints: v.number(),
  },
  handler: async (
    ctx,
    {
      matchId,
      playerId,
      isPlayed,
      runs,
      wickets,
      catches,
      stumpings,
      runouts,
      playerPoints,
    }
  ) => {
    // Fetch existing player match data
    const existingData = await ctx.db
      .query("matchPlayersData")
      .filter((q) => q.eq(q.field("matchId"), matchId))
      .filter((q) => q.eq(q.field("playerId"), playerId))
      .first();

    if (existingData) {
      // Update existing player match data
      await ctx.db.patch(existingData._id, {
        isPlayed,
        runs,
        wickets,
        catches,
        stumpings,
        runouts,
        playerPoints,
      });
    } else {
      // Insert new player match data if not found
      await ctx.db.insert("matchPlayersData", {
        matchId,
        playerId,
        isPlayed,
        runs,
        wickets,
        catches,
        stumpings,
        runouts,
        playerPoints,
      });
    }

    return { success: true, message: "Player data updated successfully" };
  },
});

export const submitBulkPlayerData = mutation({
  args: {
    matchId: v.id("matches"),
    playersData: v.array(
      v.object({
        playerId: v.id("players"),
        isPlayed: v.boolean(),
        runs: v.number(),
        wickets: v.number(),
        catches: v.number(),
        stumpings: v.number(),
        runouts: v.number(),
        playerPoints: v.number(),
      })
    ),
  },
  handler: async (ctx, { matchId, playersData }) => {
    const updates = playersData.map(async (playerData) => {
      const {
        playerId,
        isPlayed,
        runs,
        wickets,
        catches,
        stumpings,
        runouts,
        playerPoints,
      } = playerData;

      // Check if player match data already exists
      const existingData = await ctx.db
        .query("matchPlayersData")
        .filter((q) => q.eq(q.field("matchId"), matchId))
        .filter((q) => q.eq(q.field("playerId"), playerId))
        .first();

      if (existingData) {
        // Update existing player data
        return ctx.db.patch(existingData._id, {
          isPlayed,
          runs,
          wickets,
          catches,
          stumpings,
          runouts,
          playerPoints,
        });
      } else {
        // Insert new player data if not found
        return ctx.db.insert("matchPlayersData", {
          matchId,
          playerId,
          isPlayed,
          runs,
          wickets,
          catches,
          stumpings,
          runouts,
          playerPoints,
        });
      }
    });

    await Promise.all(updates);

    return { success: true, message: "Bulk player data updated successfully" };
  },
});

export const updateUserPoints = internalMutation({
  args: {
    matchId: v.id("matches"),
    teamId: v.id("teams"),
    teamPoints: v.number(),
  },
  handler: async (ctx, { matchId, teamId }) => {
    const fantasyUsers = await ctx.db
      .query("fantasyUsers")
      .withIndex("matchId", (q) => q.eq("matchId", matchId))
      .collect();
  },
});
