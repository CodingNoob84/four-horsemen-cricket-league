import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { query } from "./_generated/server";

export const getPlayerById = query({
  args: { playerId: v.id("players") },
  handler: async (ctx, { playerId }) => {
    // Fetch the player details from the database
    const player = await ctx.db.get(playerId);
    if (!player) {
      return null;
    }

    const team = await ctx.db.get(player.teamId as Id<"teams">);
    // Get the current time
    const now = new Date().toISOString();
    console.log("teamId", player.teamId);
    // Fetch all matches before the current time (ordered by date)
    const matches = await ctx.db
      .query("matches")
      .withIndex("by_datetime", (q) => q.lt("datetimeUtc", now))
      .order("desc")
      .collect();

    console.log("matches", matches);

    const playerMatches = matches.filter((match) => {
      return (
        match.homeTeamId === player.teamId || match.oppTeamId === player.teamId
      );
    });
    console.log("matches", playerMatches);
    //filter matches with player.teamId with homeTeamId or oppTeamId

    // Fetch all player performance data associated with this playerId
    const playerPerformance = await ctx.db
      .query("matchPlayersData")
      .withIndex("player", (q) => q.eq("playerId", playerId))
      .collect(); // Collect all the performance data for this player

    // Initialize variables for total points and total matches played
    let totalPoints = 0;
    let totalMatchesPlayed = 0;

    // For each match, attach the corresponding performance data to the match data
    const matchesWithStats = await Promise.all(
      playerMatches.map(async (match) => {
        // Find the performance stats for the player in this match
        const performanceForMatch = playerPerformance.find(
          (performance) => performance.matchId === match._id
        );

        // Get opponent teams
        const homeTeam = await ctx.db.get(match.homeTeamId as Id<"teams">);
        const awayTeam = await ctx.db.get(match.oppTeamId as Id<"teams">);

        const opponentTeam =
          match.homeTeamId === player.teamId ? awayTeam : homeTeam;

        // If performance data exists, return it, otherwise default to zero values
        const matchStats = {
          ...match, // Include match details
          isPlayed: performanceForMatch ? true : false, // Check if player played in this match
          runs: performanceForMatch ? performanceForMatch.runs : 0,
          wickets: performanceForMatch ? performanceForMatch.wickets : 0,
          catches: performanceForMatch ? performanceForMatch.catches : 0,
          stumpings: performanceForMatch ? performanceForMatch.stumpings : 0,
          runouts: performanceForMatch ? performanceForMatch.runouts : 0,
          playerPoints: performanceForMatch
            ? performanceForMatch.playerPoints
            : 0,
          oppTeam: opponentTeam ? opponentTeam.shortForm : "", // Add the opponent team information
        };

        // Accumulate total points and count matches where the player played
        if (matchStats.isPlayed) {
          totalMatchesPlayed++;
          totalPoints += matchStats.playerPoints;
        }

        return matchStats;
      })
    );

    return {
      player,
      team,
      matches: matchesWithStats, // Return matches with detailed player stats and opponent team info
      totalPoints, // Total points accumulated
      totalMatchesPlayed, // Total matches the player played
    };
  },
});
