import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { internalMutation, query } from "./_generated/server";

export const updateUserPointsAfterMatch = internalMutation({
  args: { matchId: v.id("matches") },
  handler: async (ctx, { matchId }) => {
    // Fetch match details
    const match = await ctx.db.get(matchId);
    if (!match || !match.winner) {
      throw new Error("Match not found or winner not determined");
    }

    // Fetch all player points for this match
    const playerPointsData = await ctx.db
      .query("matchPlayersData")
      .filter((q) => q.eq(q.field("matchId"), matchId))
      .collect();

    // Create a map for quick lookup of player points
    const playerPointsMap: Record<
      Id<"players">,
      number
    > = playerPointsData.reduce(
      (acc, player) => {
        acc[player.playerId] = player.playerPoints;
        return acc;
      },
      {} as Record<Id<"players">, number>
    );

    // Fetch all fantasy teams for this match
    const fantasyTeams = await ctx.db
      .query("fantasyUsers")
      .filter((q) => q.eq(q.field("matchId"), matchId))
      .collect();

    for (const fantasyTeam of fantasyTeams) {
      let totalPoints = 0;

      // Check if the selected fantasy team won
      if (fantasyTeam.selectedTeam === match.winner) {
        totalPoints += 10; // Add 10 points for selecting the winning team
      }

      // Sum points of selected players
      for (const playerId of fantasyTeam.selectedPlayers) {
        totalPoints += playerPointsMap[playerId] || 0;
      }

      // Update or insert userPoints for this match
      await ctx.db.insert("userPoints", {
        userId: fantasyTeam.userId,
        matchId,
        points: totalPoints,
      });
    }

    return { success: true, message: "User points updated successfully" };
  },
});

export const fetchPastMatchesUserPoints = query({
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

    // Fetch all past matches
    const pastMatches = await ctx.db
      .query("matches")
      .filter((q) => q.lt(q.field("datetimeUtc"), now))
      .order("desc")
      .collect();

    if (!pastMatches.length) {
      return {
        user: {
          userId,
          name: user.name || "Unknown",
          email: user.email || "",
          image: user.image || "",
        },
        totalPoints: 0,
        matches: [],
      };
    }

    // Fetch **all fantasy selections** for the user across past matches
    const allFantasySelections = await ctx.db
      .query("fantasyUsers")
      .filter((q) => q.eq(q.field("userId"), userId))
      .collect();

    // Convert fantasy selections to a lookup map (matchId -> selection)
    const fantasySelectionMap = new Map(
      allFantasySelections.map((selection) => [selection.matchId, selection])
    );

    // Fetch **all match player points** for past matches
    const allMatchPlayerPoints = await ctx.db
      .query("matchPlayersData")
      .collect();

    // Convert match player points to a lookup map (matchId -> { playerId -> points })
    const matchPlayerPointsMap = new Map();
    allMatchPlayerPoints.forEach((p) => {
      if (!matchPlayerPointsMap.has(p.matchId)) {
        matchPlayerPointsMap.set(p.matchId, new Map());
      }
      matchPlayerPointsMap.get(p.matchId).set(p.playerId, p.playerPoints || 0);
    });

    // Compute per-match fantasy points for the user
    let totalPoints = 0;
    const matches = await Promise.all(
      pastMatches.map(async (match) => {
        const homeTeam = await ctx.db.get(match.homeTeamId as Id<"teams">);
        const awayTeam = await ctx.db.get(match.oppTeamId as Id<"teams">);

        // Get the user's fantasy selection for this match
        const fantasySelection = fantasySelectionMap.get(match._id);

        // If user did not participate in this match, return empty selection
        if (!fantasySelection) {
          return {
            matchId: match._id,
            homeTeamName: homeTeam?.shortForm || "Unknown",
            awayTeamName: awayTeam?.shortForm || "Unknown",
            selectedTeamName: null,
            selectedPlayers: [],
            teamPoints: 0,
            matchPoints: 0,
          };
        }

        // Fetch selected players' points
        const selectedPlayersWithPoints = await Promise.all(
          fantasySelection.selectedPlayers.map(async (playerId) => {
            const playerDetails = await ctx.db.get(playerId);
            const playerPoints =
              matchPlayerPointsMap.get(match._id)?.get(playerId) || 0;
            return {
              playerId,
              playerName: playerDetails?.name || "Unknown Player",
              playerPoints,
            };
          })
        );

        // Calculate total fantasy points for this match
        const playerTotalPoints = selectedPlayersWithPoints.reduce(
          (acc, p) => acc + p.playerPoints,
          0
        );

        // Check if user's selected team won (10 team points bonus)
        const teamPoints =
          fantasySelection.selectedTeam === match.winner ? 10 : 0;

        // Match points = Team points + Player points
        const matchPoints = teamPoints + playerTotalPoints;

        totalPoints += matchPoints;

        return {
          matchId: match._id,
          homeTeamName: homeTeam?.shortForm || "Unknown",
          awayTeamName: awayTeam?.shortForm || "Unknown",
          selectedTeamName:
            homeTeam?._id === fantasySelection.selectedTeam
              ? homeTeam?.shortForm
              : awayTeam?.shortForm,
          selectedPlayers: selectedPlayersWithPoints,
          teamPoints,
          matchPoints,
        };
      })
    );

    return {
      user: {
        userId,
        name: user.name || "Unknown",
        email: user.email || "",
        image: user.image || "",
      },
      totalPoints,
      matches,
    };
  },
});

export const updateUserPoints = internalMutation({
  args: { matchId: v.id("matches") },
  handler: async (ctx, { matchId }) => {
    // Fetch all matchTeamData
    const allMatchTeamData = await ctx.db
      .query("matchTeamData")
      .withIndex("matchId", (q) => q.eq("matchId", matchId))
      .collect();

    // Fetch all PlayerData
    const allPlayersData = await ctx.db
      .query("matchPlayersData")
      .withIndex("matchId", (q) => q.eq("matchId", matchId))
      .collect();

    // Fetch all fantasyUsers
    const fantasyUsers = await ctx.db
      .query("fantasyUsers")
      .withIndex("matchId", (q) => q.eq("matchId", matchId))
      .collect();

    // Process each user's fantasy team
    for (const user of fantasyUsers) {
      const selectedTeam = user.selectedTeam;
      const selectedPlayers = user.selectedPlayers;
      const captain = user.captain;

      // Fetch team points
      const teamPoints =
        allMatchTeamData.find((t) => t.teamId === selectedTeam)?.teamPoints ||
        0;

      // Fetch selected player points
      let totalPlayerPoints = 0;

      for (const playerId of selectedPlayers) {
        const playerData = allPlayersData.find((p) => p.playerId === playerId);
        const playerPoints = playerData?.playerPoints || 0;

        // Captain gets **2x** points
        totalPlayerPoints +=
          playerId === captain ? playerPoints * 2 : playerPoints;
      }

      // Calculate total user points
      const totalPoints = teamPoints + totalPlayerPoints;

      // Check if entry already exists in `userPoints`
      const existingUserPoints = await ctx.db
        .query("userPoints")
        .withIndex("userId_matchId", (q) =>
          q.eq("userId", user.userId).eq("matchId", matchId)
        )
        .first();

      if (existingUserPoints) {
        // Update existing record
        await ctx.db.patch(existingUserPoints._id, {
          points: totalPoints,
        });
      } else {
        // Insert new record
        await ctx.db.insert("userPoints", {
          userId: user.userId,
          matchId,
          points: totalPoints,
        });
      }
    }
  },
});
