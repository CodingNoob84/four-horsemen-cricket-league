import { v } from "convex/values";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { internalMutation } from "./_generated/server";

export const updateFantasyUsersByMatchId = internalMutation({
  args: {
    matchId: v.id("matches"),
  },
  handler: async (ctx, { matchId }) => {
    // Fetch match details
    const match = await ctx.db.get(matchId);
    if (!match) throw new Error("Match not found");

    const { homeTeamId, oppTeamId } = match;

    // Fetch all user teams setup
    const userTeamsSetup = await ctx.db.query("userTeamsSetup").collect();

    // Fetch all user players setup in a single query
    const allUserPlayersSetup = await ctx.db
      .query("userPlayersSetup")
      .collect();

    // Iterate over all users
    for (const userSetup of userTeamsSetup) {
      const { userId, teams } = userSetup;

      // Determine selected team (which has the lower index in `teams` array)
      const homeIndex = teams.indexOf(homeTeamId as Id<"teams">);
      const awayIndex = teams.indexOf(oppTeamId as Id<"teams">);

      let selectedTeam: Id<"teams"> | null = null;
      if (homeIndex !== -1 && awayIndex !== -1) {
        selectedTeam =
          homeIndex < awayIndex
            ? (homeTeamId as Id<"teams">)
            : (oppTeamId as Id<"teams">);
      } else if (homeIndex !== -1) {
        selectedTeam = homeTeamId as Id<"teams">;
      } else if (awayIndex !== -1) {
        selectedTeam = oppTeamId as Id<"teams">;
      } else {
        continue; // Skip if the user doesn't have either team
      }

      // Fetch user players setup from the pre-fetched data
      const homePlayersSetup = allUserPlayersSetup.find(
        (p) => p.userId === userId && p.teamId === homeTeamId
      );
      const awayPlayersSetup = allUserPlayersSetup.find(
        (p) => p.userId === userId && p.teamId === oppTeamId
      );

      // Merge selected players from both teams
      const selectedPlayers = [
        ...(homePlayersSetup?.players || []),
        ...(awayPlayersSetup?.players || []),
      ];

      if (selectedPlayers.length === 0) continue; // Skip if no players are selected

      // Select a random player as captain
      const captainPlayer =
        selectedPlayers[Math.floor(Math.random() * selectedPlayers.length)];

      // Check if a fantasy entry already exists
      const existingFantasyUser = await ctx.db
        .query("fantasyUsers")
        .withIndex("userId_matchId", (q) =>
          q.eq("userId", userId).eq("matchId", matchId)
        )
        .first();

      if (!existingFantasyUser) {
        await ctx.db.insert("fantasyUsers", {
          userId,
          matchId,
          selectedTeam,
          selectedPlayers,
          captain: captainPlayer,
          byUser: false,
        });
      }
    }

    return { success: true, message: "Fantasy users updated successfully" };
  },
});

export const updateMatchStatus = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = new Date();

    // Calculate a 5-minute buffer for match start
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000)
      .toISOString()
      .slice(0, 16);
    const fiveMinutesAhead = new Date(now.getTime() + 5 * 60 * 1000)
      .toISOString()
      .slice(0, 16);

    console.log(
      `🔍 Checking for matches scheduled between ${fiveMinutesAgo} and ${fiveMinutesAhead}`
    );

    // Fetch the match that is scheduled within the 5-minute window
    const matchToUpdate = await ctx.db
      .query("matches")
      .withIndex("by_datetime", (q) =>
        q
          .gte("datetimeUtc", fiveMinutesAgo + ":00Z")
          .lte("datetimeUtc", fiveMinutesAhead + ":59Z")
      )
      .first();

    if (!matchToUpdate) {
      console.log(`✅ No match found within the time window.`);
      return;
    }

    // Update the match status
    await ctx.db.patch(matchToUpdate._id, { canSubmit: false });

    // Update fantasy users setup
    await ctx.runMutation(internal.common.updateFantasyUsersByMatchId, {
      matchId: matchToUpdate._id,
    });

    console.log(`⚡ Match ${matchToUpdate._id} marked as played.`);
    console.log(`✅ Match update process completed.`);
  },
});
