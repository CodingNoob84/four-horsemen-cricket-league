"use server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";
import { query } from "./_generated/server";

export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    return userId !== null ? ctx.db.get(userId) : null;
  },
});

export const userwithTotalPoints = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }

    // Fetch user details
    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const matches = await ctx.db
      .query("userMatchPoints")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .collect();

    const totalPoints = await ctx.db
      .query("userTotalPoints")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .first();

    return {
      ...user,
      matches: matches.length || 0,
      totalOverallPoints: totalPoints?.totalPoints,
    };
  },
});

export const getUserDetailsWithLastMatch = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }

    // Fetch user details
    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const now = new Date().toISOString();

    // Fetch the most recent past match
    const lastMatch = await ctx.db
      .query("matches")
      .filter((q) => q.lt(q.field("datetimeUtc"), now))
      .order("desc") // Get the latest past match
      .first();

    if (!lastMatch) {
      return {
        user: {
          userId,
          name: user.name,
          email: user.email,
          image: user.image || "",
        },
        lastMatch: null,
        totalOverallPoints: 0,
      };
    }

    // Fetch home and away team details
    const homeTeam = await ctx.db.get(lastMatch.homeTeamId as Id<"teams">);
    const awayTeam = await ctx.db.get(lastMatch.oppTeamId as Id<"teams">);

    // Get user's fantasy team selection for this match
    const fantasySelection = await ctx.db
      .query("fantasyUsers")
      .withIndex("userId_matchId", (q) =>
        q.eq("userId", userId).eq("matchId", lastMatch._id)
      )
      .first();

    if (!fantasySelection) {
      return {
        user: {
          userId,
          name: user.name,
          email: user.email,
          image: user.image || "",
        },
        lastMatch: {
          matchId: lastMatch._id,
          homeTeamName: homeTeam?.shortForm || "Unknown",
          awayTeamName: awayTeam?.shortForm || "Unknown",
          team: null,
          players: [],
          matchPoints: 0,
        },
        totalOverallPoints: 0,
      };
    }

    // Fetch match player data for this match
    const allMatchPlayerPoints = await ctx.db
      .query("matchPlayersData")
      .withIndex("matchId", (q) => q.eq("matchId", lastMatch._id))
      .collect();

    // Create a map for quick lookup of player points
    const playerPointsMap = new Map(
      allMatchPlayerPoints.map((p) => [p.playerId, p.playerPoints || 0])
    );

    // Fetch all player details in parallel
    const playersWithPoints = await Promise.all(
      fantasySelection.selectedPlayers.map(async (playerId) => {
        const playerDetails = await ctx.db.get(playerId);
        return {
          playerId,
          playerName: playerDetails?.name || "Unknown Player",
          playerPoints: playerPointsMap.get(playerId) || 0, // Assign 0 if player data is missing
        };
      })
    );

    // Fetch match team data for user's selected team
    const matchTeamData = await ctx.db
      .query("matchTeamData")
      .withIndex("matchId_teamId", (q) =>
        q
          .eq("matchId", lastMatch._id)
          .eq("teamId", fantasySelection.selectedTeam)
      )
      .first();

    const teamPoints = matchTeamData?.teamPoints || 0;

    // Calculate total points from players
    const totalPlayerPoints = playersWithPoints.reduce(
      (acc, p) => acc + (p.playerPoints || 0),
      0
    );

    // Calculate match points (team points + player points)
    const matchPoints = teamPoints + totalPlayerPoints;

    // Fetch total overall points from userPoints table (sum of all matches)
    const totalOverallPoints = (
      await ctx.db
        .query("userMatchPoints")
        .withIndex("userId", (q) => q.eq("userId", userId))
        .collect()
    ).reduce((acc, entry) => acc + (entry.points || 0), 0);

    return {
      user: {
        userId,
        name: user.name,
        email: user.email,
        image: user.image || "",
      },
      lastMatch: {
        matchId: lastMatch._id,
        homeTeamName: homeTeam?.shortForm || "Unknown",
        awayTeamName: awayTeam?.shortForm || "Unknown",
        team: {
          selectedTeamName:
            homeTeam?._id === fantasySelection.selectedTeam
              ? homeTeam?.shortForm
              : awayTeam?.shortForm,
          teamPoints,
        },
        players: playersWithPoints,
        matchPoints,
      },
      totalOverallPoints,
    };
  },
});

export const getAllUsersCount = query({
  args: {},
  handler: async (ctx) => {
    // Fetch all users
    const users = await ctx.db.query("users").collect();

    // Count total users
    const totalUsers = users.length;

    // Count users where `isAutoSetupDone` is false
    const pendingSetupUsers = users.filter(
      (user) => !user.isAutoSetupDone
    ).length;

    return {
      totalUsers,
      pendingSetupUsers,
    };
  },
});

export const getAllUsers = query({
  args: {},
  handler: async (ctx) => {
    // Fetch all users
    return await ctx.db.query("users").collect();
  },
});
