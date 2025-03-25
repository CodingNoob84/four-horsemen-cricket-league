import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const schema = defineSchema({
  ...authTables,
  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.float64()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.float64()),
    isAnonymous: v.optional(v.boolean()),
    role: v.optional(v.union(v.literal("user"), v.literal("admin"))),
    isAutoSetupDone: v.optional(v.boolean()),
  })
    .index("email", ["email"])
    .index("phone", ["phone"])
    .searchIndex("search", { searchField: "name" }),
  matches: defineTable({
    datetimeUtc: v.string(),
    homeTeamId: v.string(),
    isLeague: v.boolean(),
    matchNumber: v.float64(),
    oppTeamId: v.string(),
    venue: v.string(),
    hasPlayed: v.optional(v.boolean()),
    hasResult: v.optional(v.boolean()),
    winner: v.optional(v.id("teams")),
    hasSubmitted: v.optional(v.boolean()),
    submittedBy: v.optional(v.id("users")),
    submittedAt: v.optional(v.string()),
    canSubmit: v.boolean(),
    cricbuzzId: v.optional(v.string()),
  }).index("by_datetime", ["datetimeUtc"]),
  players: defineTable({
    isIndian: v.boolean(),
    name: v.string(),
    profileImage: v.string(),
    role: v.string(),
    teamId: v.id("teams"),
  }).index("by_team", ["teamId"]),
  teams: defineTable({
    image: v.string(),
    shortForm: v.string(),
    teamName: v.string(),
  }),
  userTeamsSetup: defineTable({
    userId: v.id("users"),
    teams: v.array(v.id("teams")),
  }).index("user_setup", ["userId"]),
  userPlayersSetup: defineTable({
    userId: v.id("users"),
    teamId: v.id("teams"),
    players: v.array(v.id("players")),
  }).index("user_team_players", ["userId", "teamId"]),
  fantasyUsers: defineTable({
    userId: v.id("users"),
    matchId: v.id("matches"),
    selectedTeam: v.id("teams"),
    selectedPlayers: v.array(v.id("players")),
    captain: v.id("players"),
    byUser: v.boolean(),
  })
    .index("userId_matchId", ["userId", "matchId"])
    .index("matchId", ["matchId"])
    .index("userId", ["userId"]),
  matchPlayersData: defineTable({
    matchId: v.id("matches"),
    playerId: v.id("players"),
    isPlayed: v.boolean(),
    runs: v.number(),
    wickets: v.number(),
    catches: v.number(),
    stumpings: v.number(),
    runouts: v.number(),
    playerPoints: v.number(),
  })
    .index("matchId", ["matchId"])
    .index("player", ["playerId"])
    .index("matchId_player", ["matchId", "playerId"]),
  matchTeamData: defineTable({
    matchId: v.id("matches"),
    teamId: v.id("teams"),
    teamPoints: v.number(),
  })
    .index("matchId", ["matchId"])
    .index("matchId_teamId", ["matchId", "teamId"]),
  userMatchPoints: defineTable({
    userId: v.id("users"),
    matchId: v.id("matches"),
    points: v.number(),
  })
    .index("userId", ["userId"])
    .index("matchId", ["matchId"])
    .index("userId_matchId", ["userId", "matchId"]),
  userTotalPoints: defineTable({
    userId: v.id("users"),
    matches: v.array(v.id("matches")),
    totalPoints: v.number(),
  })
    .index("userId", ["userId"])
    .index("by_totalPoints", ["totalPoints"]),
  groups: defineTable({
    name: v.string(),
    code: v.string(),
    createdBy: v.id("users"),
  })
    .index("by_code", ["code"])
    .index("by_createdBy", ["createdBy"]),
  user_groups: defineTable({
    userId: v.id("users"),
    groupId: v.id("groups"),
  })
    .index("by_userId", ["userId"])
    .index("by_groupId", ["groupId"]),
  adminRequests: defineTable({
    userId: v.id("users"),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected")
    ),
    requestedAt: v.float64(),
    processedAt: v.optional(v.float64()),
    processedBy: v.optional(v.id("users")),
  })
    .index("by_userId", ["userId"]) // Index for fetching requests by user
    .index("by_status", ["status"]),
});

export default schema;
