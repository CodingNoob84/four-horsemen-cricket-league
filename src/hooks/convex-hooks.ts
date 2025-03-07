import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

import { Id } from "../../convex/_generated/dataModel";

export const useUser = () => {
  const user = useQuery(api.users.currentUser);
  return {
    loading: user === undefined,
    user: user ?? null,
  };
};

export const useTeams = () => {
  const teams = useQuery(api.teams.getIPLTeams);
  return {
    loading: teams === undefined,
    teams: teams ?? [],
  };
};

export const useUserTeams = () => {
  const userTeams = useQuery(api.teams.getUserOrderedTeams);
  return {
    loading: userTeams === undefined,
    userTeams: userTeams ?? { orderedTeams: [], hasUserSetup: false },
  };
};

export const useUserTeamPlayers = () => {
  const userTeamPlayers = useQuery(api.teams.getUserTeamPlayers);
  return {
    loading: userTeamPlayers === undefined,
    userTeams: userTeamPlayers ?? {
      teams: [],
      userTeamPlayers: [],
      hasUserSetup: false,
    },
  };
};

export const useAutoSetup = () => {
  const userAutoSetup = useQuery(api.teams.getUserAutoSetup);
  return {
    loading: userAutoSetup === undefined,
    userAutoSetup: userAutoSetup,
  };
};

export const useAllPlayersByTeamId = ({ teamId }: { teamId: Id<"teams"> }) => {
  const allPlayers = useQuery(api.teams.getAllPlayersByTeamId, { teamId });

  return {
    loading: teamId ? allPlayers === undefined : false,
    allPlayers: teamId ? (allPlayers ?? []) : [],
  };
};

export const useUpcomingMatchesByUser = () => {
  const matches = useQuery(api.matches.upcomingMatchesByUser);
  return {
    loading: matches === undefined,
    matches: matches ?? [],
  };
};

export const useAllMatches = () => {
  const matches = useQuery(api.matches.allMatches);
  return {
    loading: matches === undefined,
    matches: matches ?? [],
  };
};

export const useMatchById = (matchId: Id<"matches">) => {
  const match = useQuery(api.matches.getMatchById, { matchId });
  return {
    loading: match === undefined,
    match: match,
  };
};

export const useMatchPlayersDataById = (matchId: Id<"matches">) => {
  const matchplayerdata = useQuery(api.matches.getMatchPlayersData, {
    matchId,
  });
  return {
    loading: matchplayerdata === undefined,
    matchPlayerData: matchplayerdata,
  };
};

export const useUpcomingMatches = () => {
  const matches = useQuery(api.matches.UpcomingMatches);
  return {
    loading: matches === undefined,
    matches: matches ?? [],
  };
};

export const usePastMatches = () => {
  const matches = useQuery(api.matches.PastMatches);
  return {
    loading: matches === undefined,
    matches: matches ?? [],
  };
};
