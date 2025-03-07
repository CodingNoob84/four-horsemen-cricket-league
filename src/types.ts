import { Id } from "../convex/_generated/dataModel";

export interface UserTeams {
  orderedTeams: Team[];
  hasUserSetup: boolean;
}

export interface Team {
  _id: Id<"teams">;
  _creationTime: number;
  image: string;
  shortForm: string;
  teamName: string;
}

export interface TeamFavPlayers {
  _id: Id<"userPlayersSetup">;
  _creationTime: number;
  players: Id<"players">[];
  teamId: Id<"teams">;
  userId: Id<"users">;
}

export interface UpcomingMatch {
  _id: Id<"matches">;
  datetimeUtc: string;
  homeTeam: Team;
  awayTeam: Team;
  venue: string;
  time?: string;
}

export interface UpcomingMatchByUser {
  _id: Id<"matches">;
  datetimeUtc: string;
  homeTeam: Team;
  awayTeam: Team;
  venue: string;
  submittedStatus?: boolean;
  time?: string;
  hasPlayed?: boolean;
  hasResult?: boolean;
  winner?: Id<"teams">;
  hasSubmitted?: boolean;
  submittedBy?: Id<"users">;
  submittedAt?: string;
  matchPoints?: number;
}

export type GroupedMatch = {
  date: string;
  matches: UpcomingMatchByUser[];
};

export interface Match {
  _id: Id<"matches">;
  datetimeUtc: string;
  homeTeam: Team;
  awayTeam: Team;
  venue: string;
}

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

export interface User {
  userId: string;
  name: string;
  email: string;
  image: string;
}
