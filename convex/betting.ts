import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { internalMutation, mutation, query } from "./_generated/server";
import { Team } from "./matches";

export const userwithCoins = query({
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

    return {
      ...user,
    };
  },
});

export const updateBet = mutation({
  args: { matchId: v.id("matches"), teamId: v.id("teams"), bet: v.number() },
  handler: async (ctx, { matchId, teamId, bet }) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      return { success: false, message: "User is not authenticated." };
    }

    // Fetch user data to check available coins
    const user = await ctx.db.get(userId);
    if (!user) {
      return { success: false, message: "User is not authenticated." };
    }

    const UserCoins = user?.coins || 0;

    if (UserCoins === 0) {
      return { success: false, message: "No coins available." };
    }

    // Check if the user has enough coins to place the bet
    if (bet > UserCoins) {
      return {
        success: false,
        message: "Insufficient coins to place the bet.",
      };
    }

    // Check if the user has already placed a bet on the given match
    const existingBet = await ctx.db
      .query("bettingMatch")
      .withIndex("matchId_userId", (q) =>
        q.eq("userId", userId).eq("matchId", matchId)
      )
      .first(); // Fetch the first matching record

    if (existingBet) {
      // Update the existing bet and deduct the bet amount from the user's coins
      await ctx.db.patch(user._id, {
        coins: UserCoins + existingBet.bet - bet, // Subtract the bet from the user's available coins
      });

      // Update the existing betting match with the new bet and team
      await ctx.db.patch(existingBet._id, {
        bet,
        team: teamId,
      });

      return { success: true, message: "Bet updated successfully." };
    } else {
      // If no existing bet, deduct coins and create a new betting match
      await ctx.db.patch(user._id, {
        coins: UserCoins - bet, // Deduct the bet amount from the user's coins
      });

      // Insert a new bet record into the "bettingMatch" table
      await ctx.db.insert("bettingMatch", {
        userId,
        matchId,
        team: teamId,
        bet,
        earning: 0, // Earnings can be calculated later
      });

      return { success: true, message: "Bet placed successfully." };
    }
  },
});

export const placeBet = mutation({
  args: { matchId: v.id("matches"), teamId: v.id("teams"), bet: v.number() },
  handler: async (ctx, { matchId, teamId, bet }) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      return { success: false, message: "User is not authenticated." };
    }

    const user = await ctx.db.get(userId);

    // Fetch the most recent betting user history to get total coins
    const userHistory = await ctx.db
      .query("bettingUserHistory")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .order("desc")
      .first();

    const UserTotalCoins = user?.coins || 0;

    if (UserTotalCoins === 0) {
      return { success: false, message: "No coins available." };
    }

    // Check if the user has enough coins to place the bet
    if (bet > UserTotalCoins) {
      return {
        success: false,
        message: "Insufficient coins to place the bet.",
      };
    }

    // Insert the bet into the bettingMatch table
    const insertBet = await ctx.db.insert("bettingMatch", {
      userId,
      matchId,
      team: teamId,
      bet,
      earning: 0, // Earning is initially set to 0
    });
    //console.log("betId", insertBet);

    // Update the user's betting history with the new bet
    const updatedTotalCoins = UserTotalCoins - bet;
    if (insertBet) {
      await ctx.db.insert("bettingUserHistory", {
        userId,
        type: "bet", // The type of transaction is a bet
        coins: -bet, // Deduct the bet amount from the user's coins
        betId: insertBet,
        matchId: matchId,
      });
    }

    await ctx.db.patch(userId, {
      coins: updatedTotalCoins,
    });

    return { success: true, message: "Bet placed successfully." };
  },
});

export const deleteBet = mutation({
  args: { betId: v.id("bettingMatch") },
  handler: async (ctx, { betId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("User is not authenticated.");

    const existingBet = await ctx.db.get(betId);
    if (!existingBet) {
      return { success: false, message: "No bet found to delete." };
    }

    const betAmount = existingBet.bet || 0;

    // Delete the bet record
    await ctx.db.delete(betId);

    // Find and delete the first betting history record related to this bet
    const betHistory = await ctx.db
      .query("bettingUserHistory")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("betId"), betId))
      .first();

    if (betHistory) {
      await ctx.db.delete(betHistory._id);
    }

    // Retrieve user record
    const userRecord = await ctx.db.get(userId);
    const coins = userRecord?.coins ?? 0;

    if (userRecord) {
      await ctx.db.patch(userRecord._id, {
        coins: coins + betAmount,
      });
    }

    return {
      success: true,
      message: "Bet deleted successfully and coins refunded.",
    };
  },
});

export const getMatchById = query({
  args: { matchId: v.id("matches") },
  handler: async (ctx, { matchId }) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      return null;
    }
    const user = await ctx.db.get(userId);
    // Fetch match details by matchId
    const match = await ctx.db.get(matchId);
    if (!match) {
      throw new Error("Match not found");
    }

    // Fetch home team and away team details directly
    const homeTeam = await ctx.db.get(match.homeTeamId as Id<"teams">);
    const awayTeam = await ctx.db.get(match.oppTeamId as Id<"teams">);

    const allMatchBets = await ctx.db
      .query("bettingMatch")
      .withIndex("matchId", (q) => q.eq("matchId", matchId))
      .collect();

    const homeTeamTotalCoins = allMatchBets
      .filter((bet) => bet.team === homeTeam?._id)
      .reduce((total, bet) => total + bet.bet, 0);

    const awayTeamTotalCoins = allMatchBets
      .filter((bet) => bet.team === awayTeam?._id)
      .reduce((total, bet) => total + bet.bet, 0);

    const homeTeamOdd = awayTeamTotalCoins / homeTeamTotalCoins;
    const awayTeamOdd = homeTeamTotalCoins / awayTeamTotalCoins;

    const matchUserBet = await ctx.db
      .query("bettingMatch")
      .withIndex("matchId_userId", (q) =>
        q.eq("userId", userId).eq("matchId", matchId)
      )
      .collect();

    return {
      ...match,
      homeTeam: homeTeam,
      awayTeam: awayTeam,
      homeTeamOdd,
      awayTeamOdd,
      hasBet: matchUserBet.length > 0 ? true : false,
      matchBets: matchUserBet,
      maxLimit: user?.coins || 0,
    };
  },
});

export const setBots = mutation({
  args: {},
  handler: async (ctx) => {
    const now = new Date().toISOString(); // Get the current date in ISO format

    // 1. Get all upcoming matches
    const upcomingMatches = await ctx.db
      .query("matches")
      .filter((q) => q.gte(q.field("datetimeUtc"), now)) // Get matches with datetimeUtc >= now
      .collect();

    // 2. Get all bots
    const bots = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), "bot"))
      .collect();

    // 3. Set homeTeamSupporter and AwayTeamSupporter bets for each bot
    for (const match of upcomingMatches) {
      // Loop through all bots to place bets
      for (const bot of bots) {
        // Randomly choose a team (home or away) for the bot to bet on
        const randomTeam =
          Math.random() > 0.5
            ? (match.homeTeamId as Id<"teams">)
            : (match.oppTeamId as Id<"teams">);

        // Insert the bet into the bettingMatch table
        await ctx.db.insert("bettingMatch", {
          matchId: match._id,
          userId: bot._id, // Bot's userId
          team: randomTeam, // Team that the bot supports
          bet: 100, // Amount bet by the bot
          earning: 0, // Earning initially set to 0
        });
      }
    }

    return {
      success: true,
      message: "Bots have been assigned to upcoming matches with 100 bet.",
    };
  },
});

export const dailySetBots = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = new Date().toISOString();

    const matches = await ctx.db
      .query("matches")
      .withIndex("by_datetime", (q) => q.gt("datetimeUtc", now))
      .order("asc") // Sort in ascending order to get the nearest match first
      .collect();

    if (matches.length === 0) {
      return []; // No upcoming matches, return empty array
    }

    // Extract match date (YYYY-MM-DD) of the nearest match
    const nearestMatchDate = matches[0].datetimeUtc.split("T")[0];

    // Filter matches that happen on the same nearest date
    const matchesOnNearestDate = matches.filter(
      (match) => match.datetimeUtc.split("T")[0] === nearestMatchDate
    );

    // Limit to a maximum of 2 matches
    const todayMatches = matchesOnNearestDate.slice(0, 2);

    const bots = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), "bot"))
      .collect();

    // Loop through all upcoming matches and assign random bets for each bot
    for (const match of todayMatches) {
      // Loop through all bots to place bets
      for (const bot of bots) {
        // Check if the bot has already placed a bet for the current match
        const existingBet = await ctx.db
          .query("bettingMatch")
          .withIndex("matchId_userId", (q) =>
            q.eq("userId", bot._id).eq("matchId", match._id)
          )
          .first();

        // Skip placing a bet if the bot has already placed a bet for this match
        if (existingBet) {
          continue; // Skip if the bot has already placed a bet
        }

        // Fetch the bot's current total coins from the bettingUserHistory
        const botHistory = await ctx.db
          .query("bettingUserHistory")
          .withIndex("userId", (q) => q.eq("userId", bot._id))
          .collect();

        const totalCoins = botHistory.reduce(
          (sum, record) => sum + (record.coins || 0),
          0
        );

        // Check if bot has enough coins to place a bet (assuming bet range is 100-1000)
        if (totalCoins < 100) {
          continue; // Skip placing a bet if the bot does not have enough coins
        }

        // Randomly choose a team (home or away) for the bot to bet on
        const randomTeam =
          Math.random() > 0.5
            ? (match.homeTeamId as Id<"teams">)
            : (match.oppTeamId as Id<"teams">);

        // Random bet amount between 100 and 1000
        let randomBetAmount =
          Math.floor(Math.random() * (1000 - 100 + 1)) + 100;

        // Option 2: Cap the bet to the available coins if the random bet exceeds total coins
        if (randomBetAmount > totalCoins) {
          randomBetAmount = totalCoins; // Cap the bet amount to total coins available
        }

        // Insert the bet into the bettingMatch table
        const bet = await ctx.db.insert("bettingMatch", {
          matchId: match._id,
          userId: bot._id, // Bot's userId
          team: randomTeam, // Team that the bot supports
          bet: randomBetAmount, // Random bet amount
          earning: 0,
        });

        // Update the bot's total coins after the bet
        const updatedTotalCoins = totalCoins - randomBetAmount;

        // Insert the bot's bet into the bettingUserHistory with updated totalCoins
        await ctx.db.insert("bettingUserHistory", {
          userId: bot._id,
          type: "bet", // Type of transaction is a bet
          coins: -randomBetAmount, // Subtract the bet amount
          betId: bet,
        });

        await ctx.db.patch(bot._id, {
          coins: updatedTotalCoins,
        });
      }
    }

    return {
      success: true,
      message:
        "Bots have been assigned to matches within the next 24 hours with random bets and history updated.",
    };
  },
});

export const getBetsByMatchId = query({
  args: { matchId: v.id("matches") },
  handler: async (ctx, { matchId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return { success: false, message: "User is not authenticated." };
    }

    const teams = await ctx.db.query("teams").collect();

    // 1. Get all bets for the match
    const allBets = await ctx.db
      .query("bettingMatch")
      .withIndex("matchId", (q) => q.eq("matchId", matchId))
      .collect();

    // 2. Fetch user data for each bet
    const allBetsWithUserData = await Promise.all(
      allBets.map(async (bet) => {
        const user = await ctx.db.get(bet.userId as Id<"users">); // Get user data by userId
        const team = teams.find((t) => t._id === bet.team);
        if (user) {
          // Add the `isCurrentUser` flag and user details to the bet object
          return {
            ...bet,
            teamName: team?.shortForm,
            userName: user.name,
            userEmail: user.email,
            userImage: user?.image,
            isCurrentUser: bet.userId === userId, // Flag for current user
          };
        }
        return null;
      })
    );

    // 3. Remove any null values (in case any user data was not found)
    const filteredBets = allBetsWithUserData.filter((bet) => bet !== null);

    // 4. Sort the bets by bet amount in descending order
    const sortedBets = filteredBets.sort((a, b) => b.bet - a.bet);

    return {
      success: true,
      bets: sortedBets, // Return sorted bets with user info and `isCurrentUser` flag
    };
  },
});

export const upcomingMatches = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }

    const now = new Date().toISOString();

    // Fetch upcoming matches sorted by `datetimeUtc`
    const matches = await ctx.db
      .query("matches")
      .withIndex("by_datetime", (q) => q.gt("datetimeUtc", now))
      .order("asc") // Sort in ascending order to get the nearest match first
      .collect();

    if (matches.length === 0) {
      return []; // No upcoming matches, return empty array
    }

    // Extract match date (YYYY-MM-DD) of the nearest match
    const nearestMatchDate = matches[0].datetimeUtc.split("T")[0];

    // Filter matches that happen on the same nearest date
    const matchesOnNearestDate = matches.filter(
      (match) => match.datetimeUtc.split("T")[0] === nearestMatchDate
    );

    // Limit to a maximum of 2 matches
    const selectedMatches = matchesOnNearestDate.slice(0, 2);

    // Create a set of matchIds for the selected matches
    const matchIds = new Set(
      selectedMatches.map((match) => match._id as Id<"matches">)
    );

    // Create an empty set to track matches where the user has placed a bet
    const submittedMatchIds = new Set<Id<"matches">>();

    // Loop through the selected matches and check if the user has placed a bet
    for (const matchId of matchIds) {
      const matchBet = await ctx.db
        .query("bettingMatch")
        .withIndex("matchId_userId", (q) =>
          q.eq("userId", userId).eq("matchId", matchId)
        )
        .first();

      if (matchBet) {
        submittedMatchIds.add(matchId); // Add to the set if the bet was submitted
      }
    }

    // Fetch all teams
    const teams = await ctx.db.query("teams").collect();

    // Create a lookup map for teams
    const teamMap: Record<Id<"teams">, Team> = teams.reduce(
      (acc, team) => {
        acc[team._id as Id<"teams">] = {
          _id: team._id,
          _creationTime: team._creationTime,
          teamName: team.teamName,
          image: team.image,
          shortForm: team.shortForm,
        };
        return acc;
      },
      {} as Record<Id<"teams">, Team>
    );

    // Map over selected matches to enrich with team details and submission status
    const enrichedMatches = selectedMatches.map((match) => ({
      ...match,
      homeTeam: teamMap[match.homeTeamId as Id<"teams">] || {
        teamName: "Unknown Team",
        image: "",
        shortForm: "",
      },
      awayTeam: teamMap[match.oppTeamId as Id<"teams">] || {
        teamName: "Unknown Team",
        image: "",
        shortForm: "",
      },
      submittedStatus: submittedMatchIds.has(match._id as Id<"matches">), // Check if matchId exists in submitted list
    }));

    return enrichedMatches;
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
    //console.log("recent", recentMatch);

    if (!recentMatch) {
      return {
        hasMatch: false,
        hasMatchLive: false,
        matchId: null,
        datetimeUtc: null,
        homeTeamName: null,
        homeTeamShortForm: null,
        awayTeamName: null,
        awayTeamShortForm: null,
        team: null,
        players: [],
        matchPoints: 0,
        teamPoints: 0,
      };
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

    // Fetch the total coins for home and away teams based on betting data
    const bettingTeams = await ctx.db
      .query("bettingTeam")
      .withIndex("matchId", (q) => q.eq("matchId", recentMatch._id))
      .collect();

    const homeTeamBets = bettingTeams.find(
      (betting) => betting.teamId === recentMatch.homeTeamId
    );
    const awayTeamBets = bettingTeams.find(
      (betting) => betting.teamId === recentMatch.oppTeamId
    );

    const homeTeamTotalCoins = homeTeamBets?.totalCoins;
    const awayTeamTotalCoins = awayTeamBets?.totalCoins;

    const bettingMatch = await ctx.db
      .query("bettingMatch")
      .withIndex("matchId_userId", (q) =>
        q.eq("userId", userId).eq("matchId", recentMatch._id)
      )
      .first();

    // Calculate the match points based on the total coins of the teams
    //const earnings = bettingMatch?.bet + bettingMatch?.bet *();

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
      homeTeamTotalCoins,
      awayTeamTotalCoins,
    };
  },
});

export const updateBettingTeams = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = new Date().toISOString();

    // Fetch the most recent past match
    const recentMatch = await ctx.db
      .query("matches")
      .withIndex("by_datetime", (q) => q.lt("datetimeUtc", now))
      .order("desc") // Get the latest past match
      .first();

    if (!recentMatch) {
      return { success: false, message: "No past match found" };
    }

    const homeTeam = await ctx.db.get(recentMatch.homeTeamId as Id<"teams">);
    const awayTeam = await ctx.db.get(recentMatch.oppTeamId as Id<"teams">);

    if (!homeTeam || !awayTeam) {
      throw new Error("Team details not found");
    }

    // Fetch all betting match data for the recent match
    const matchBettings = await ctx.db
      .query("bettingMatch")
      .withIndex("matchId", (q) => q.eq("matchId", recentMatch._id))
      .collect();

    // Calculate total coins for home and away teams
    const homeTeamTotalCoins = matchBettings
      .filter((bet) => bet.team === recentMatch.homeTeamId)
      .reduce((total, bet) => total + bet.bet, 0);

    const awayTeamTotalCoins = matchBettings
      .filter((bet) => bet.team === recentMatch.oppTeamId)
      .reduce((total, bet) => total + bet.bet, 0);

    // Calculate total unique users for home and away teams
    const homeTeamTotalUsers = new Set(
      matchBettings
        .filter((bet) => bet.team === recentMatch.homeTeamId)
        .map((bet) => bet.userId)
    ).size;

    const awayTeamTotalUsers = new Set(
      matchBettings
        .filter((bet) => bet.team === recentMatch.oppTeamId)
        .map((bet) => bet.userId)
    ).size;

    // Insert the betting data for home team
    await ctx.db.insert("bettingTeam", {
      matchId: recentMatch._id, // Store the match ID
      teamId: recentMatch.homeTeamId as Id<"teams">, // Store the home team ID
      totalCoins: homeTeamTotalCoins,
      usersCount: homeTeamTotalUsers,
    });

    // Insert the betting data for away team
    await ctx.db.insert("bettingTeam", {
      matchId: recentMatch._id, // Store the match ID
      teamId: recentMatch.oppTeamId as Id<"teams">, // Store the away team ID
      totalCoins: awayTeamTotalCoins,
      usersCount: awayTeamTotalUsers,
    });

    // Return success message and betting data
    return {
      success: true,
      message: "Betting teams updated successfully",
    };
  },
});

export const updateEarnings = mutation({
  args: {
    matchId: v.id("matches"),
    winnerTeamId: v.id("teams"),
    noResult: v.boolean(),
  },
  handler: async (ctx, { matchId, winnerTeamId, noResult }) => {
    const match = await ctx.db.get(matchId);
    if (!match) {
      return { success: false, message: "Match not found." };
    }

    // Fetch all user bets for this match
    const allUserBets = await ctx.db
      .query("bettingMatch")
      .withIndex("matchId", (q) => q.eq("matchId", matchId))
      .collect();

    const homeTeamTotalCoins = allUserBets
      .filter((bet) => bet.team === match.homeTeamId)
      .reduce((total, bet) => total + bet.bet, 0);

    const awayTeamTotalCoins = allUserBets
      .filter((bet) => bet.team === match.oppTeamId)
      .reduce((total, bet) => total + bet.bet, 0);

    // If the result is noResult, return bets to users
    if (noResult) {
      const updates = allUserBets.map(async (userBet) => {
        await ctx.db.patch(userBet._id, { earning: userBet.bet });
        await ctx.db.insert("bettingUserHistory", {
          userId: userBet.userId,
          matchId: matchId as Id<"matches">,
          betId: userBet._id,
          type: "earn",
          message: "",
          coins: userBet.bet,
        });
        const user = await ctx.db.get(userBet.userId);
        await ctx.db.patch(userBet.userId, {
          coins: (user?.coins || 0) + userBet.bet,
        });
      });

      await Promise.all(updates);
      return { success: true, message: "No result. Bets returned to users." };
    }

    // Prevent division by zero
    if (homeTeamTotalCoins === 0 || awayTeamTotalCoins === 0) {
      return {
        success: false,
        message: "One team has no bets. Cannot calculate earnings.",
      };
    }

    // Batch updates
    const earningsUpdates = allUserBets.map(async (userBet) => {
      let earnings = 0;

      if (userBet.team === winnerTeamId) {
        const ratio =
          userBet.team === match.homeTeamId
            ? 1 + awayTeamTotalCoins / homeTeamTotalCoins
            : 1 + homeTeamTotalCoins / awayTeamTotalCoins;

        earnings = Math.floor(userBet.bet * ratio);
      }

      // Apply updates
      await ctx.db.patch(userBet._id, { earning: earnings });
      await ctx.db.insert("bettingUserHistory", {
        userId: userBet.userId,
        matchId: matchId as Id<"matches">,
        betId: userBet._id,
        type: "earn",
        message: "",
        coins: earnings,
      });
      const user = await ctx.db.get(userBet.userId);
      await ctx.db.patch(userBet.userId, {
        coins: (user?.coins || 0) + earnings, // Add earnings to user's total coins
      });
    });

    await Promise.all(earningsUpdates);

    return {
      success: true,
      message: "Earnings have been updated successfully.",
    };
  },
});

export const giveAwayCoins = mutation({
  args: {
    coins: v.number(),
    message: v.string(),
  },
  handler: async (ctx, { coins, message }) => {
    // Fetch all users
    const users = await ctx.db.query("users").collect();

    for (const user of users) {
      // Fetch the total coins of the user from their history or other records
      const userHistory = await ctx.db
        .query("bettingUserHistory")
        .withIndex("userId", (q) => q.eq("userId", user._id))
        .collect();

      const totalCoins = userHistory.reduce(
        (sum, record) => sum + (record.coins || 0),
        0
      );

      // Insert initial coins (5000) into the bettingUserHistory for each user
      await ctx.db.insert("bettingUserHistory", {
        userId: user._id,
        type: "give",
        coins: coins,
        message: message,
      });

      await ctx.db.patch(user._id, {
        coins: totalCoins + coins,
      });
    }

    return { success: true, message: "Coins distributed successfully." };
  },
});

export const initialGiveAwayCoins = mutation({
  args: {},
  handler: async (ctx) => {
    // Fetch all users
    const users = await ctx.db.query("users").collect();

    for (const user of users) {
      // Check if the user already has history
      const existingHistory = await ctx.db
        .query("bettingUserHistory")
        .withIndex("userId", (q) => q.eq("userId", user._id))
        .collect();

      // Skip the user if they already have a history entry
      if (existingHistory.length > 0) {
        continue; // Skip this user as they already have betting history
      }

      // Fetch the total coins of the user from their history or other records
      const totalCoins: number = 5000; // No history, so their total coins would be 0

      // Insert initial coins (5000) into the bettingUserHistory for each user
      await ctx.db.insert("bettingUserHistory", {
        userId: user._id,
        type: "initial",
        coins: 5000,
        message: "welcome bonus",
      });

      await ctx.db.patch(user._id, {
        coins: 5000,
      });
    }

    return { success: true, message: "Coins distributed successfully." };
  },
});

export const giveAwayCoinsToBots = mutation({
  args: {
    coins: v.number(),
    message: v.string(),
  },
  handler: async (ctx, { coins, message }) => {
    // Fetch all users
    const bots = await ctx.db
      .query("users")
      .withIndex("role", (q) => q.eq("role", "bot"))
      .collect();

    for (const user of bots) {
      // Fetch the total coins of the user from their history or other records
      const userHistory = await ctx.db
        .query("bettingUserHistory")
        .withIndex("userId", (q) => q.eq("userId", user._id))
        .collect();

      const totalCoins = userHistory.reduce(
        (sum, record) => sum + (record.coins || 0),
        0
      );

      // Insert initial coins (5000) into the bettingUserHistory for each user
      await ctx.db.insert("bettingUserHistory", {
        userId: user._id,
        type: "give",
        coins: coins,
        message: message,
      });

      await ctx.db.patch(user._id, {
        coins: totalCoins + coins,
      });
    }

    return { success: true, message: "Coins distributed successfully." };
  },
});

export const getMatchHistory = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return { success: false, message: "User not authenticated." };
    }
    const user = await ctx.db.get(userId);

    const now = new Date().toISOString();

    // Fetch past matches
    const pastMatches = await ctx.db
      .query("matches")
      .filter((q) => q.lt(q.field("datetimeUtc"), now))
      .order("desc")
      .collect();

    if (pastMatches.length === 0) {
      return { success: true, matches: [], message: "No past matches found." };
    }

    // Fetch user's bets on past matches
    const pastBets = await ctx.db
      .query("bettingMatch")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .collect();

    // Fetch all teams to map them by ID
    const teams = await ctx.db.query("teams").collect();
    const teamMap = Object.fromEntries(teams.map((team) => [team._id, team]));

    // Merge bets with match data
    const matchHistory = pastMatches.map((match) => {
      const userBet = pastBets.filter((bet) => bet.matchId === match._id);
      const allbets = userBet.map((b) => {
        return {
          bet: b.bet,
          earning: b.earning,
          teamName: teamMap[b.team],
        };
      });

      return {
        user: user,
        matchId: match._id,
        datetimeUtc: match.datetimeUtc,
        venue: match.venue,
        homeTeam: teamMap[match.homeTeamId] || null,
        awayTeam: teamMap[match.oppTeamId] || null,
        winner: match.winner ? teamMap[match.winner] || null : null,
        userBet: allbets,
      };
    });

    return { success: true, matches: matchHistory };
  },
});
