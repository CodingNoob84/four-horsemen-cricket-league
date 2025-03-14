import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { internalMutation, mutation, query } from "./_generated/server";

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
            datetimeUtc: match.datetimeUtc,
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
          datetimeUtc: match.datetimeUtc,
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

export const updateUserPointsI = internalMutation({
  args: { matchId: v.id("matches") },
  handler: async (ctx, { matchId }) => {
    // Fetch all matchTeamData (Convert to Map for quick lookups)
    const allMatchTeamData = await ctx.db
      .query("matchTeamData")
      .withIndex("matchId", (q) => q.eq("matchId", matchId))
      .collect();
    const teamPointsMap = new Map(
      allMatchTeamData.map((team) => [team.teamId, team.teamPoints || 0])
    );

    // Fetch all PlayerData (Convert to Map for quick lookups)
    const allPlayersData = await ctx.db
      .query("matchPlayersData")
      .withIndex("matchId", (q) => q.eq("matchId", matchId))
      .collect();
    const playerPointsMap = new Map(
      allPlayersData.map((player) => [
        player.playerId,
        player.playerPoints || 0,
      ])
    );

    // Fetch all fantasyUsers
    const fantasyUsers = await ctx.db
      .query("fantasyUsers")
      .withIndex("matchId", (q) => q.eq("matchId", matchId))
      .collect();

    // Prepare bulk updates
    const userPointsUpdates = [];

    for (const user of fantasyUsers) {
      const selectedTeam = user.selectedTeam;
      const selectedPlayers = user.selectedPlayers;
      const captain = user.captain;

      // Get team points from Map
      const teamPoints = teamPointsMap.get(selectedTeam) || 0;

      // Calculate total player points
      let totalPlayerPoints = 0;
      for (const playerId of selectedPlayers) {
        const playerPoints = playerPointsMap.get(playerId) || 0;
        totalPlayerPoints +=
          playerId === captain ? playerPoints * 2 : playerPoints;
      }

      // Total user points
      const totalPoints = teamPoints + totalPlayerPoints;

      // Check if userPoints already exist
      const existingUserPoints = await ctx.db
        .query("userMatchPoints")
        .withIndex("userId_matchId", (q) =>
          q.eq("userId", user.userId).eq("matchId", matchId)
        )
        .first();

      if (existingUserPoints) {
        userPointsUpdates.push(
          ctx.db.patch(existingUserPoints._id, { points: totalPoints })
        );
      } else {
        userPointsUpdates.push(
          ctx.db.insert("userMatchPoints", {
            userId: user.userId,
            matchId,
            points: totalPoints,
          })
        );
      }
    }

    // Perform all database operations in parallel
    await Promise.all(userPointsUpdates);

    // Set hasSubmitted flag for the match **only once**
    await ctx.db.patch(matchId, { hasSubmitted: true });

    return { success: true, message: "User points updated successfully" };
  },
});

export const updateUserPoints = mutation({
  args: { matchId: v.id("matches") },
  handler: async (ctx, { matchId }) => {
    // Fetch all matchTeamData (Convert to Map for quick lookups)
    const allMatchTeamData = await ctx.db
      .query("matchTeamData")
      .withIndex("matchId", (q) => q.eq("matchId", matchId))
      .collect();
    const teamPointsMap = new Map(
      allMatchTeamData.map((team) => [team.teamId, team.teamPoints || 0])
    );

    // Fetch all PlayerData (Convert to Map for quick lookups)
    const allPlayersData = await ctx.db
      .query("matchPlayersData")
      .withIndex("matchId", (q) => q.eq("matchId", matchId))
      .collect();
    const playerPointsMap = new Map(
      allPlayersData.map((player) => [
        player.playerId,
        player.playerPoints || 0,
      ])
    );

    // Fetch all fantasyUsers
    const fantasyUsers = await ctx.db
      .query("fantasyUsers")
      .withIndex("matchId", (q) => q.eq("matchId", matchId))
      .collect();

    // Prepare bulk updates
    const userPointsUpdates = [];

    for (const user of fantasyUsers) {
      const selectedTeam = user.selectedTeam;
      const selectedPlayers = user.selectedPlayers;
      const captain = user.captain;

      // Get team points from Map
      const teamPoints = teamPointsMap.get(selectedTeam) || 0;

      // Calculate total player points
      let totalPlayerPoints = 0;
      for (const playerId of selectedPlayers) {
        const playerPoints = playerPointsMap.get(playerId) || 0;
        totalPlayerPoints +=
          playerId === captain ? playerPoints * 2 : playerPoints;
      }

      // Total user points
      const totalPoints = teamPoints + totalPlayerPoints;

      // Check if userPoints already exist
      const existingUserPoints = await ctx.db
        .query("userMatchPoints")
        .withIndex("userId_matchId", (q) =>
          q.eq("userId", user.userId).eq("matchId", matchId)
        )
        .first();

      if (existingUserPoints) {
        userPointsUpdates.push(
          ctx.db.patch(existingUserPoints._id, { points: totalPoints })
        );
      } else {
        userPointsUpdates.push(
          ctx.db.insert("userMatchPoints", {
            userId: user.userId,
            matchId,
            points: totalPoints,
          })
        );
      }

      // Schedule an internal mutation to update total points for this user

      await ctx.scheduler.runAfter(
        1000,
        internal.userspoints.updateUserTotalPoints,
        {
          userId: user.userId,
        }
      );
    }

    // Perform all database operations in parallel
    await Promise.all(userPointsUpdates);

    // Set hasSubmitted flag for the match **only once**
    await ctx.db.patch(matchId, { hasSubmitted: true });

    return { success: true, message: "User points updated successfully" };
  },
});

export const updateUserTotalPoints = internalMutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Fetch all points for the user
    const userPoints = await ctx.db
      .query("userMatchPoints")
      .withIndex("userId", (q) => q.eq("userId", args.userId))
      .collect();

    // Calculate total points and collect match IDs
    let totalPoints = 0;
    const matchIds: Id<"matches">[] = [];
    for (const entry of userPoints) {
      totalPoints += entry.points;
      if (!matchIds.includes(entry.matchId)) {
        matchIds.push(entry.matchId);
      }
    }

    // Update or insert the total points and match IDs in the userTotalPoints table
    const existingEntry = await ctx.db
      .query("userTotalPoints")
      .withIndex("userId", (q) => q.eq("userId", args.userId))
      .unique();

    if (existingEntry) {
      await ctx.db.patch(existingEntry._id, {
        totalPoints,
        matches: matchIds,
      });
    } else {
      await ctx.db.insert("userTotalPoints", {
        userId: args.userId,
        totalPoints,
        matches: matchIds,
      });
    }
  },
});

export const recentMatchPoints = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }

    const now = new Date().toISOString();

    // Fetch the most recent past match
    const recentMatch = await ctx.db
      .query("matches")
      .withIndex("by_datetime", (q) => q.lt("datetimeUtc", now))
      .order("desc") // Get the latest past match
      .first();

    if (!recentMatch) {
      throw new Error("No recent match available");
    }

    // Fetch home and away team details
    const homeTeam = await ctx.db.get(recentMatch.homeTeamId as Id<"teams">);
    const awayTeam = await ctx.db.get(recentMatch.oppTeamId as Id<"teams">);

    if (!homeTeam || !awayTeam) {
      throw new Error("Team details not found");
    }

    // Check if the match is live (within the last 4 hours)
    const matchTime = new Date(recentMatch.datetimeUtc).getTime();
    const currentTime = new Date().getTime();
    const timeDifferenceInHours = (currentTime - matchTime) / (1000 * 60 * 60); // Convert milliseconds to hours
    const hasMatchLive = timeDifferenceInHours <= 4; // Match is live if within 4 hours

    // Get user's fantasy team selection for this match
    const fantasySelection = await ctx.db
      .query("fantasyUsers")
      .withIndex("userId_matchId", (q) =>
        q.eq("userId", userId).eq("matchId", recentMatch._id)
      )
      .first();

    if (!fantasySelection) {
      return {
        hasMatch: false,
        hasMatchLive,
        matchId: recentMatch._id,
        datetimeUtc: recentMatch.datetimeUtc,
        homeTeamName: homeTeam.teamName,
        homeTeamShortForm: homeTeam.shortForm,
        awayTeamName: awayTeam.teamName,
        awayTeamShortForm: awayTeam.shortForm,
        team: null,
        players: [],
        matchPoints: 0,
        teamPoints: 0,
      };
    }

    // Fetch match player data for this match
    const allMatchPlayerPoints = await ctx.db
      .query("matchPlayersData")
      .withIndex("matchId", (q) => q.eq("matchId", recentMatch._id))
      .collect();

    // Create a map for quick lookup of player points
    const playerPointsMap = new Map(
      allMatchPlayerPoints.map((p) => [p.playerId, p.playerPoints || 0])
    );

    // Fetch all player details in parallel
    const playersWithPoints = await Promise.all(
      fantasySelection.selectedPlayers.map(async (playerId) => {
        const isCaptain = fantasySelection.captain === playerId; // Check if the player is captain
        const playerDetails = await ctx.db.get(playerId);
        let playerPoints = playerPointsMap.get(playerId) || 0; // Assign 0 if player data is missing

        if (isCaptain) {
          playerPoints *= 2; // Double the points for the captain
        }

        return {
          playerId,
          playerName: playerDetails?.name || "Unknown Player",
          playerPoints, // Updated points with captain bonus
          isCaptain, // Include captain flag for UI display if needed
        };
      })
    );

    // Fetch match team data for user's selected team
    const matchTeamData = await ctx.db
      .query("matchTeamData")
      .withIndex("matchId_teamId", (q) =>
        q
          .eq("matchId", recentMatch._id)
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

    // Return structured data
    return {
      hasMatch: true,
      hasMatchLive,
      matchId: recentMatch._id,
      datetimeUtc: recentMatch.datetimeUtc,
      homeTeamName: homeTeam.teamName,
      homeTeamShortForm: homeTeam.shortForm,
      awayTeamName: awayTeam.teamName,
      awayTeamShortForm: awayTeam.shortForm,
      team: {
        teamId: fantasySelection.selectedTeam,
        teamName: homeTeam.teamName, // Assuming selected team is home team
        teamPoints,
      },
      players: playersWithPoints,
      matchPoints,
    };
  },
});

export const globalLeaderBoard = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }

    // Fetch all userTotalPoints entries, sorted by totalPoints in descending order
    let leaderboardEntries = await ctx.db
      .query("userTotalPoints")
      .withIndex("by_totalPoints", (q) => q) // Use the index for sorting
      .order("desc") // Sort by totalPoints in descending order
      .collect(); // Get all users to determine ranking

    leaderboardEntries = leaderboardEntries.sort(
      (a, b) => b.totalPoints - a.totalPoints
    );

    let currentUserEntry = null;
    let currentUserRank = null;

    // Map user data & find current user's rank
    const leaderboard = await Promise.all(
      leaderboardEntries.map(async (entry, index) => {
        const user = await ctx.db.get(entry.userId);
        if (!user) return null; // Skip if user not found

        const userRank = index + 1; // Assign rank (1-based index)

        // If this is the current user, store their rank & entry
        if (user._id === userId) {
          currentUserRank = userRank;
          currentUserEntry = {
            rank: userRank,
            userId: user._id,
            name: user.name || "Unknown",
            email: user.email || "",
            image: user.image || "",
            totalPoints: entry.totalPoints,
            isCurrentUser: true,
          };
        }

        return {
          rank: userRank,
          userId: user._id,
          name: user.name || "Unknown",
          email: user.email || "",
          image: user.image || "",
          totalPoints: entry.totalPoints,
          isCurrentUser: user._id === userId,
        };
      })
    );

    // Remove null users & take the top 10
    const top10 = leaderboard.filter((entry) => entry !== null).slice(0, 10);

    // If current user is **not** in the top 10, add them separately
    if (currentUserEntry && !top10.some((u) => u.userId === userId)) {
      top10.push(currentUserEntry);
    }

    return {
      usertable: top10,
      currentUserRank,
    };
  },
});

export const recentMatchLeaderboard = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }

    const now = new Date().toISOString();

    // Fetch the most recent past match
    const recentMatch = await ctx.db
      .query("matches")
      .withIndex("by_datetime", (q) => q.lt("datetimeUtc", now))
      .order("desc") // Get the latest past match
      .first();

    if (!recentMatch) {
      return {
        matchId: null,
        match: "",
        datetimeUtc: "",
        usertable: [],
        currentUserRank: null,
      };
    }

    // Fetch home and away team details
    const homeTeam = await ctx.db.get(recentMatch.homeTeamId as Id<"teams">);
    const awayTeam = await ctx.db.get(recentMatch.oppTeamId as Id<"teams">);

    if (!homeTeam || !awayTeam) {
      throw new Error("Team details not found");
    }

    // Fetch user match points for this match
    let matchLeaderboardEntries = await ctx.db
      .query("userMatchPoints")
      .withIndex("matchId", (q) => q.eq("matchId", recentMatch._id))
      .collect(); // Get all users (to ensure we can determine ranking)

    //order by matchLeaderboardEntries.points from highest to lowest
    matchLeaderboardEntries = matchLeaderboardEntries.sort(
      (a, b) => b.points - a.points
    );
    let currentUserEntry = null;
    let currentUserRank = null;

    // Map user data & find current user's rank
    const leaderboard = await Promise.all(
      matchLeaderboardEntries.map(async (entry, index) => {
        const user = await ctx.db.get(entry.userId);
        if (!user) return null; // Skip if user not found

        const userRank = index + 1; // Assign rank (1-based index)

        // If this is the current user, store their rank & entry
        if (user._id === userId) {
          currentUserRank = userRank;
          currentUserEntry = {
            rank: userRank,
            userId: user._id,
            name: user.name || "Unknown",
            email: user.email || "",
            image: user.image || "",
            matchPoints: entry.points,
            isCurrentUser: true,
          };
        }

        return {
          rank: userRank,
          userId: user._id,
          name: user.name || "Unknown",
          email: user.email || "",
          image: user.image || "",
          matchPoints: entry.points,
          isCurrentUser: user._id === userId,
        };
      })
    );

    // Remove null users & take the top 10
    const top10 = leaderboard.filter((entry) => entry !== null).slice(0, 10);

    // If current user is **not** in top 10, add them separately
    if (currentUserEntry && !top10.some((u) => u.userId === userId)) {
      top10.push(currentUserEntry);
    }

    return {
      matchId: recentMatch._id,
      match: `${homeTeam.shortForm} vs ${awayTeam.shortForm}`,
      datetimeUtc: recentMatch.datetimeUtc,
      usertable: top10,
      currentUserRank,
    };
  },
});

export const searchUserWithPoints = query({
  args: { searchTerm: v.string() },
  handler: async (ctx, { searchTerm }) => {
    if (!searchTerm.trim()) {
      throw new Error("Search term cannot be empty.");
    }

    // Fetch users matching the search term (by name or email)
    const matchingUsers = await ctx.db
      .query("users")
      .withSearchIndex("search", (q) => q.search("name", searchTerm))
      .take(10);

    if (matchingUsers.length === 0) {
      return [];
    }

    // Fetch total points for each matched user (individually since `.in()` is not supported)
    const leaderboard = await Promise.all(
      matchingUsers.map(async (user) => {
        const userPointsEntry = await ctx.db
          .query("userTotalPoints")
          .filter((q) => q.eq(q.field("userId"), user._id))
          .first();

        return {
          userId: user._id,
          name: user.name || "Unknown",
          email: user.email || "",
          image: user.image || "", // Assuming `users` table has an `image` field
          totalPoints: userPointsEntry ? userPointsEntry.totalPoints : 0, // Default to 0 if no points found
        };
      })
    );

    return leaderboard;
  },
});

export const fetchUserPointsById = query({
  args: { userId: v.id("users") }, // Takes userId as an argument
  handler: async (ctx, { userId }) => {
    // Ensure user exists
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

    // Fetch user's fantasy selections
    const userFantasySelections = await ctx.db
      .query("fantasyUsers")
      .filter((q) => q.eq(q.field("userId"), userId))
      .collect();

    // Convert selections into a map (matchId -> selection)
    const fantasySelectionMap = new Map(
      userFantasySelections.map((selection) => [selection.matchId, selection])
    );

    // Fetch all match player points for past matches
    const allMatchPlayerPoints = await ctx.db
      .query("matchPlayersData")
      .collect();

    // Convert match player points into a lookup map
    const matchPlayerPointsMap = new Map();
    allMatchPlayerPoints.forEach((p) => {
      if (!matchPlayerPointsMap.has(p.matchId)) {
        matchPlayerPointsMap.set(p.matchId, new Map());
      }
      matchPlayerPointsMap.get(p.matchId).set(p.playerId, p.playerPoints || 0);
    });

    // Compute total points & match-wise points for the user
    let totalPoints = 0;
    const matches = await Promise.all(
      pastMatches.map(async (match) => {
        const homeTeam = await ctx.db.get(match.homeTeamId as Id<"teams">);
        const awayTeam = await ctx.db.get(match.oppTeamId as Id<"teams">);

        // Get user's fantasy selection for this match
        const fantasySelection = fantasySelectionMap.get(match._id);

        // If no selection, return default data
        if (!fantasySelection) {
          return {
            matchId: match._id,
            datetimeUtc: match.datetimeUtc,
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
          datetimeUtc: match.datetimeUtc,
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
