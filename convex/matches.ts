import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel"; // Ensure you import Id type
import { mutation, query } from "./_generated/server";

export interface Team {
  _id: Id<"teams">;
  _creationTime: number;
  image: string;
  shortForm: string;
  teamName: string;
}

export const upcomingMatchesByUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    const now = new Date().toISOString();
    console.log("now", now);

    // Fetch upcoming matches
    const matches = await ctx.db
      .query("matches")
      .withIndex("by_datetime", (q) => q.gt("datetimeUtc", now))
      .collect();

    // Extract matchIds from upcoming matches
    const matchIds = new Set(
      matches.map((match) => match._id as Id<"matches">)
    );

    if (matchIds.size === 0) {
      return []; // No upcoming matches, return empty array
    }

    // Fetch all fantasy teams for this user
    const fantasyUserWithAllMatches = await ctx.db
      .query("fantasyUsers")
      .withIndex("userId", (q) => q.eq("userId", userId!))
      .collect();

    // Filter only fantasy teams that match upcoming matches
    const submittedMatchIds = new Set(
      fantasyUserWithAllMatches
        .filter((entry) => matchIds.has(entry.matchId))
        .map((entry) => entry.matchId)
    );

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

    // Map over matches to enrich with team details and submission status
    const enrichedMatches = matches.map((match) => ({
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

export const upcomingMatchesForHome = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }

    const now = new Date().toISOString();
    console.log("Current Time:", now);

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

    // Extract matchIds from selected matches
    const matchIds = new Set(
      selectedMatches.map((match) => match._id as Id<"matches">)
    );

    // Fetch all fantasy teams for this user
    const fantasyUserWithAllMatches = await ctx.db
      .query("fantasyUsers")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .collect();

    // Filter only fantasy teams that match upcoming matches
    const submittedMatchIds = new Set(
      fantasyUserWithAllMatches
        .filter((entry) => matchIds.has(entry.matchId))
        .map((entry) => entry.matchId)
    );

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

export const pastMatchesByUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    const now = new Date().toISOString();
    console.log("now", now);

    // Fetch upcoming matches
    const matches = await ctx.db
      .query("matches")
      .withIndex("by_datetime", (q) => q.gt("datetimeUtc", now))
      .collect();

    // Extract matchIds from upcoming matches
    const matchIds = new Set(
      matches.map((match) => match._id as Id<"matches">)
    );

    if (matchIds.size === 0) {
      return []; // No upcoming matches, return empty array
    }

    // Fetch all fantasy teams for this user
    const fantasyUserWithAllMatches = await ctx.db
      .query("fantasyUsers")
      .withIndex("userId", (q) => q.eq("userId", userId!))
      .collect();

    // Filter only fantasy teams that match upcoming matches
    const submittedMatchIds = new Set(
      fantasyUserWithAllMatches
        .filter((entry) => matchIds.has(entry.matchId))
        .map((entry) => entry.matchId)
    );

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

    // Map over matches to enrich with team details and submission status
    const enrichedMatches = matches.map((match) => ({
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

export const allMatches = query({
  args: {},
  handler: async (ctx) => {
    const matches = await ctx.db.query("matches").collect();
    return matches;
  },
});

export const getMatchById = query({
  args: { matchId: v.id("matches") },
  handler: async (ctx, { matchId }) => {
    const userId = await getAuthUserId(ctx);

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

    // Check if the user has a fantasy team for this match
    const fantasyTeam = await ctx.db
      .query("fantasyUsers")
      .filter((q) => q.eq(q.field("userId"), userId))
      .filter((q) => q.eq(q.field("matchId"), matchId))
      .first();

    return {
      matchDetail: {
        ...match,
        homeTeam: homeTeam, // Assign fetched home team details
        awayTeam: awayTeam, // Assign fetched away team details
      },
      homeTeamPlayers,
      awayTeamPlayers,
      fantasySelection: fantasyTeam || null, // Return fantasy selection if available
    };
  },
});

export const submitFantasyData = mutation({
  args: {
    matchId: v.id("matches"),
    selectedTeam: v.id("teams"),
    selectedPlayers: v.array(v.id("players")),
    captain: v.id("players"),
  },
  handler: async (ctx, { matchId, selectedTeam, selectedPlayers, captain }) => {
    const userId = await getAuthUserId(ctx); // Get authenticated user

    if (!userId) {
      throw new Error("User authentication required.");
    }
    console.log("length", selectedPlayers.length);
    if (selectedPlayers.length != 4) {
      throw new Error("At least four players must be selected.");
    }

    if (!selectedPlayers.includes(captain)) {
      throw new Error("Captain must be one of the selected players.");
    }

    // Check if the user has already submitted a fantasy team for this match
    const existingFantasyTeam = await ctx.db
      .query("fantasyUsers")
      .filter((q) => q.eq(q.field("userId"), userId))
      .filter((q) => q.eq(q.field("matchId"), matchId))
      .first();

    if (existingFantasyTeam) {
      // Update existing fantasy team
      await ctx.db.replace(existingFantasyTeam._id, {
        userId,
        matchId,
        selectedTeam,
        selectedPlayers,
        captain,
        byUser: true,
      });

      return { message: "Fantasy team updated successfully.", updated: true };
    } else {
      // Insert new fantasy team entry
      await ctx.db.insert("fantasyUsers", {
        userId,
        matchId,
        selectedTeam,
        selectedPlayers,
        captain,
        byUser: true,
      });

      return { message: "Fantasy team submitted successfully.", created: true };
    }
  },
});
export interface Player {
  _id: Id<"players">;
  name: string;
  profileImage: string;
  role: string;
  isIndian: boolean;
}

export interface PlayerData extends Player {
  isPlayed: boolean;
  runs: number;
  wickets: number;
  catches: number;
  stumpings: number;
  runouts: number;
  playerPoints: number;
}

export const getMatchPlayersData = query({
  args: { matchId: v.id("matches") },
  handler: async (ctx, { matchId }) => {
    const match = await ctx.db.get(matchId);
    if (!match) {
      throw new Error("Match not found");
    }

    // Fetch home team and away team details
    const homeTeam = await ctx.db.get(match.homeTeamId as Id<"teams">);
    const awayTeam = await ctx.db.get(match.oppTeamId as Id<"teams">);

    // Fetch players for home and away teams
    const homeTeamPlayers: Player[] = await ctx.db
      .query("players")
      .filter((q) => q.eq(q.field("teamId"), match.homeTeamId))
      .collect();

    const awayTeamPlayers: Player[] = await ctx.db
      .query("players")
      .filter((q) => q.eq(q.field("teamId"), match.oppTeamId))
      .collect();

    // Fetch player performance data for the match
    const matchPlayerStats = await ctx.db
      .query("matchPlayersData")
      .filter((q) => q.eq(q.field("matchId"), matchId))
      .collect();

    // Create a lookup map for player statistics
    const playerStatsMap: Record<
      Id<"players">,
      PlayerData
    > = matchPlayerStats.reduce(
      (acc, stat) => {
        acc[stat.playerId as Id<"players">] = {
          _id: stat.playerId as Id<"players">,
          name: "",
          profileImage: "",
          role: "",
          isIndian: false,
          isPlayed: stat.isPlayed,
          runs: stat.runs,
          wickets: stat.wickets,
          catches: stat.catches,
          stumpings: stat.stumpings,
          runouts: stat.runouts,
          playerPoints: stat.playerPoints,
        };
        return acc;
      },
      {} as Record<Id<"players">, PlayerData>
    );

    // Attach performance data to players
    const enhancePlayersWithStats = (players: Player[]): PlayerData[] =>
      players.map((player) => ({
        ...player,
        isPlayed: playerStatsMap[player._id]?.isPlayed ?? false,
        runs: playerStatsMap[player._id]?.runs ?? 0,
        wickets: playerStatsMap[player._id]?.wickets ?? 0,
        catches: playerStatsMap[player._id]?.catches ?? 0,
        stumpings: playerStatsMap[player._id]?.stumpings ?? 0,
        runouts: playerStatsMap[player._id]?.runouts ?? 0,
        playerPoints: playerStatsMap[player._id]?.playerPoints ?? 0,
      }));

    return {
      matchDetail: {
        ...match,
        homeTeam: homeTeam || null,
        awayTeam: awayTeam || null,
      },
      homeTeamPlayers: enhancePlayersWithStats(homeTeamPlayers),
      awayTeamPlayers: enhancePlayersWithStats(awayTeamPlayers),
    };
  },
});

export const updateAllMatchesStatus = mutation({
  args: {},
  handler: async (ctx) => {
    // Fetch all matches
    const matches = await ctx.db.query("matches").collect();

    // Iterate and update each match
    for (const match of matches) {
      await ctx.db.patch(match._id, {
        canSubmit: true,
      });
    }

    return { success: true, message: "All matches updated successfully!" };
  },
});

export const UpcomingMatches = query({
  args: {},
  handler: async (ctx) => {
    const now = new Date().toISOString();
    const matches = await ctx.db
      .query("matches")
      .filter((q) => q.gt(q.field("datetimeUtc"), now))
      .collect();

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

    // Map over matches to enrich with team details and submission status
    const enrichedMatches = matches.map((match) => ({
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
    }));

    return enrichedMatches;
  },
});

export const PastMatches = query({
  args: {},
  handler: async (ctx) => {
    const now = new Date().toISOString();
    const matches = await ctx.db
      .query("matches")
      .filter((q) => q.lt(q.field("datetimeUtc"), now))
      .collect();

    matches.sort(
      (a, b) =>
        new Date(b.datetimeUtc).getTime() - new Date(a.datetimeUtc).getTime()
    );
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

    // Map over matches to enrich with team details and submission status
    const enrichedMatches = matches.map((match) => ({
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
    }));

    return enrichedMatches;
  },
});

export const PastMatchesByUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx); // Get logged-in user ID
    const now = new Date().toISOString();

    // Fetch past matches
    const matches = await ctx.db
      .query("matches")
      .filter((q) => q.lt(q.field("datetimeUtc"), now))
      .collect();

    // Sort by datetimeUtc in descending order (newest first)
    matches.sort(
      (a, b) =>
        new Date(b.datetimeUtc).getTime() - new Date(a.datetimeUtc).getTime()
    );

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

    // Fetch fantasy teams where the user has submitted data
    const userPoints = await ctx.db
      .query("userPoints")
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    // Map over matches to enrich with team details and submission status
    const enrichedMatches = matches.map((match) => ({
      ...match,
      homeTeam: teamMap[match.homeTeamId as Id<"teams">] || {
        _id: match.homeTeamId,
        teamName: "Unknown Team",
        image: "",
        shortForm: "",
      },
      awayTeam: teamMap[match.oppTeamId as Id<"teams">] || {
        _id: match.oppTeamId,
        teamName: "Unknown Team",
        image: "",
        shortForm: "",
      },
      matchPoints: userPoints?.points || 0,
    }));

    return enrichedMatches;
  },
});
