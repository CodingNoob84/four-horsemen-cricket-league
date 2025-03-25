import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { internalMutation, mutation, query } from "./_generated/server";

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

export const getMatchDataById = query({
  args: { matchId: v.id("matches") },
  handler: async (ctx, { matchId }) => {
    // Fetch match details by matchId
    const match = await ctx.db.get(matchId);
    if (!match) {
      throw new Error("Match not found");
    }

    // Fetch home team and away team details directly
    const homeTeam = await ctx.db.get(match.homeTeamId as Id<"teams">);
    const awayTeam = await ctx.db.get(match.oppTeamId as Id<"teams">);

    // Fetch players for home and away teams
    const homeTeamPlayers = await ctx.db
      .query("players")
      .filter((q) => q.eq(q.field("teamId"), match.homeTeamId))
      .collect();

    const awayTeamPlayers = await ctx.db
      .query("players")
      .filter((q) => q.eq(q.field("teamId"), match.oppTeamId))
      .collect();

    return {
      teams: [
        {
          teamId: homeTeam?._id,
          teamName: homeTeam?.teamName,
        },
        {
          teamId: awayTeam?._id,
          teamName: awayTeam?.teamName,
        },
      ],
      homeTeamPlayers,
      awayTeamPlayers,
    };
  },
});

export const updateMultipleCricbuzzIds = mutation({
  args: {
    data: v.array(
      v.object({
        matchNumber: v.number(),
        cricbuzzId: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    for (const { matchNumber, cricbuzzId } of args.data) {
      const match = await ctx.db
        .query("matches")
        .filter((q) => q.eq(q.field("matchNumber"), matchNumber))
        .first();

      if (!match) {
        console.warn(`Match not found for matchNumber: ${matchNumber}`);
        continue;
      }

      await ctx.db.patch(match._id, {
        cricbuzzId,
      });
    }

    return { status: "done", updated: args.data.length };
  },
});

export const getMatchFiveHrsAgo = query({
  handler: async (ctx) => {
    const now = new Date().toISOString();
    console.log("now", now);
    const matches = await ctx.db
      .query("matches")
      .withIndex("by_datetime", (q) => q.lt("datetimeUtc", now))
      .order("desc")
      .take(1);

    if (matches.length === 0) {
      return { match: null };
    }

    return { match: matches[0] };
  },
});
